import { OrderRepository, OrderWithRelations } from './repository';
import { CreateOrderDto } from './dto';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { Product, Promotion, PromotionSlab } from '@prisma/client';
import prisma from '../../config/database';
import { PromotionService } from '../promotions/service';
import { calculateProductDiscount, PromotionWithSlabs } from '../promotions/discountEngine';

type ProductWithWeight = Product & {
  weight: number; // Weight in grams (default to 0 if not in schema)
};

type AppliedPromotion = {
  title: string;
  type: string;
  discount: number;
};

type OrderItemBreakdown = {
  product: Product;
  quantity: number;
  price: number;
  appliedPromotions: AppliedPromotion[];
  itemDiscount: number;
  itemTotal: number;
};

type OrderResponse = {
  id: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
  };
  items: OrderItemBreakdown[];
  subtotal: number;
  totalDiscount: number;
  grandTotal: number;
  createdAt: Date;
  promotion?: Promotion | null;
};

export class OrderService {
  private repository: OrderRepository;
  private promotionService: PromotionService;

  constructor() {
    this.repository = new OrderRepository();
    this.promotionService = new PromotionService();
  }

  /**
   * Create a new order with promotion calculation
   */
  async createOrder(
    userId: string,
    data: CreateOrderDto
  ): Promise<OrderResponse> {
    // 1. Validate products exist and are enabled
    const productIds = data.items.map((item) => item.productId);
    const uniqueProductIds = [...new Set(productIds)]; // remove duplicates

    const products = await prisma.product.findMany({
      where: {
        id: { in: uniqueProductIds },
        isActive: true,
      },
    });

    if (products.length !== uniqueProductIds.length) {
      const foundIds = products.map((p) => p.id);
      const missingIds = uniqueProductIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestError(
        `One or more products not found or disabled: ${missingIds.join(', ')}`
      );
    }

    // Check for duplicate product IDs in items
    const productIdCounts = productIds.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const duplicates = Object.entries(productIdCounts).filter(
      ([, count]) => count > 1
    );
    if (duplicates.length > 0) {
      throw new BadRequestError(
        `Duplicate products in order: ${duplicates.map(([id]) => id).join(', ')}`
      );
    }

    // 2. Fetch active promotions
    const activePromotions = await this.promotionService.getActivePromotions();
    // console.log('Active promotions:', activePromotions.length); // debug

    // 3. Calculate discounts for each item
    const itemBreakdowns: OrderItemBreakdown[] = [];
    let totalDiscount = 0;
    let subtotal = 0;

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)!;
      
      // Product now has weight field in schema
      const productWithWeight: ProductWithWeight = {
        ...product,
        weight: product.weight || 0,
      };

      const unitPrice = Number(product.price);
      const itemSubtotal = unitPrice * item.quantity;
      subtotal += itemSubtotal;

      // Calculate discounts from all applicable promotions
      const appliedPromotions: AppliedPromotion[] = [];
      let itemDiscount = 0;

      // If a specific promotion is provided, use only that one
      if (data.promotionId) {
        const specificPromotion = activePromotions.find(
          (p) => p.id === data.promotionId
        );
        if (specificPromotion) {
          const promotionWithType: PromotionWithSlabs = {
            ...specificPromotion,
            type: this.inferPromotionType(specificPromotion),
          };
          const discountResult = calculateProductDiscount(
            promotionWithType,
            productWithWeight,
            item.quantity
          );

          if (discountResult.applied) {
            appliedPromotions.push({
              title: specificPromotion.name,
              type: promotionWithType.type || 'UNKNOWN',
              discount: discountResult.discount,
            });
            itemDiscount += discountResult.discount;
          }
        }
      } else {
        // Apply all applicable promotions
        for (const promotion of activePromotions) {
          const promotionWithType: PromotionWithSlabs = {
            ...promotion,
            type: this.inferPromotionType(promotion),
          };
          const discountResult = calculateProductDiscount(
            promotionWithType,
            productWithWeight,
            item.quantity
          );

          if (discountResult.applied) {
            appliedPromotions.push({
              title: promotion.name,
              type: promotionWithType.type || 'UNKNOWN',
              discount: discountResult.discount,
            });
            itemDiscount += discountResult.discount;
          }
        }
      }

      // Cap item discount at item subtotal (can't be negative)
      itemDiscount = Math.min(itemDiscount, itemSubtotal);
      totalDiscount += itemDiscount;

      const itemTotal = itemSubtotal - itemDiscount;

      itemBreakdowns.push({
        product,
        quantity: item.quantity,
        price: unitPrice,
        appliedPromotions,
        itemDiscount,
        itemTotal,
      });
    }

    // 4. Calculate totals
    const grandTotal = subtotal - totalDiscount;

    // Ensure totals are non-negative
    if (grandTotal < 0) {
      throw new BadRequestError('Invalid order total calculation');
    }

    // 5. Create order with items in transaction
    const orderItems = itemBreakdowns.map((breakdown) => ({
      productId: breakdown.product.id,
      quantity: breakdown.quantity,
      unitPrice: breakdown.price,
      discount: breakdown.itemDiscount,
      total: breakdown.itemTotal,
      productName: breakdown.product.name,
      productSku: breakdown.product.sku,
    }));

    const order = await this.repository.create(
      {
        userId,
        promotionId: data.promotionId || null,
        subtotal: subtotal,
        discount: totalDiscount,
        total: grandTotal,
        status: 'PENDING',
        notes: `Customer: ${data.customerInfo.name} (${data.customerInfo.email})`,
      },
      orderItems
    );

    // 6. Transform to response format
    return this.transformOrderToResponse(order, data.customerInfo);
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string, userId?: string): Promise<OrderResponse> {
    if (!this.isValidUUID(id)) {
      throw new BadRequestError('Invalid order ID format');
    }

    const order = await this.repository.findById(id);

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // If userId provided, ensure user owns the order
    if (userId && order.userId !== userId) {
      throw new NotFoundError('Order not found');
    }

    // Extract customer info from notes (or use user email)
    const customerInfo = this.extractCustomerInfo(order);

    return this.transformOrderToResponse(order, customerInfo);
  }

  /**
   * Get orders by user ID
   */
  async getOrdersByUser(userId: string): Promise<OrderResponse[]> {
    if (!this.isValidUUID(userId)) {
      throw new BadRequestError('Invalid user ID format');
    }

    const orders = await this.repository.findByUserId(userId);

    return orders.map((order) => {
      const customerInfo = this.extractCustomerInfo(order);
      return this.transformOrderToResponse(order, customerInfo);
    });
  }

  /**
   * Get all orders (admin)
   */
  async findAll(): Promise<OrderResponse[]> {
    const orders = await this.repository.findAll();

    return orders.map((order) => {
      const customerInfo = this.extractCustomerInfo(order);
      return this.transformOrderToResponse(order, customerInfo);
    });
  }

  /**
   * Get order statistics
   */
  async getStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    todaysOrders: number;
    todaysRevenue: number;
  }> {
    const orders = await this.repository.findAll();

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today && orderDate < tomorrow;
    });

    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + Number(order.total), 0);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      todaysOrders: todaysOrders.length,
      todaysRevenue,
    };
  }

  /**
   * Transform order to response format
   */
  private transformOrderToResponse(
    order: OrderWithRelations,
    customerInfo: {
      name: string;
      email: string;
      phone?: string | null;
      address?: string | null;
    }
  ): OrderResponse {
    const items: OrderItemBreakdown[] = order.items.map((item) => {
      // Reconstruct applied promotions from order data
      // In a real system, you might store this in a separate table
      const appliedPromotions: AppliedPromotion[] = [];

      if (order.promotion && Number(item.discount) > 0) {
        const promotionType = this.inferPromotionType(order.promotion);
        appliedPromotions.push({
          title: order.promotion.name,
          type: promotionType,
          discount: Number(item.discount),
        });
      }

      return {
        product: item.product,
        quantity: item.quantity,
        price: Number(item.unitPrice),
        appliedPromotions,
        itemDiscount: Number(item.discount),
        itemTotal: Number(item.total),
      };
    });

    return {
      id: order.id,
      customerInfo,
      items,
      subtotal: Number(order.subtotal),
      totalDiscount: Number(order.discount),
      grandTotal: Number(order.total),
      createdAt: order.createdAt,
      promotion: order.promotion || undefined,
    };
  }

  /**
   * Extract customer info from order notes or user
   */
  private extractCustomerInfo(order: OrderWithRelations): {
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
  } {
    // Try to parse from notes
    if (order.notes) {
      const match = order.notes.match(/Customer: (.+) \((.+)\)/);
      if (match) {
        return {
          name: match[1],
          email: match[2],
          phone: null,
          address: null,
        };
      }
    }

    // Fallback to user email
    return {
      name: order.user?.email?.split('@')[0] || 'Customer',
      email: order.user?.email || '',
      phone: null,
      address: null,
    };
  }

  /**
   * Infer promotion type from promotion data
   */
  private inferPromotionType(
    promotion: Promotion & { slabs: PromotionSlab[] }
  ): 'PERCENTAGE' | 'FIXED' | 'WEIGHTED' {
    // Check description field for stored type
    if (promotion.description?.startsWith('TYPE:')) {
      const typeMatch = promotion.description.match(/TYPE:(\w+)/);
      if (typeMatch) {
        const type = typeMatch[1] as 'PERCENTAGE' | 'FIXED' | 'WEIGHTED';
        if (['PERCENTAGE', 'FIXED', 'WEIGHTED'].includes(type)) {
          return type;
        }
      }
    }

    // Infer from slabs
    if (promotion.slabs.length > 1) {
      return 'WEIGHTED';
    }

    if (promotion.slabs.length === 1) {
      const slab = promotion.slabs[0];
      if (slab.type === 'PERCENTAGE_DISCOUNT') {
        return 'PERCENTAGE';
      }
      if (slab.type === 'FIXED_AMOUNT_DISCOUNT') {
        // Check if it has weight range (weighted)
        if (slab.weight > 0 && slab.minOrderValue) {
          return 'WEIGHTED';
        }
        return 'FIXED';
      }
    }

    return 'PERCENTAGE'; // Default fallback
  }

  /**
   * Helper method to validate UUID format
   */
  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}
