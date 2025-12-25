import { OrderRepository } from '../orders/repository';
import { ProductRepository } from '../products/repository';
import { PromotionRepository } from '../promotions/repository';

export interface DashboardStats {
    orders: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
        totalRevenue: number;
        todayRevenue: number;
        thisWeekRevenue: number;
        thisMonthRevenue: number;
        averageOrderValue: number;
    };
    products: {
        total: number;
        active: number;
        inactive: number;
    };
    promotions: {
        total: number;
        active: number;
        inactive: number;
    };
    revenue: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        allTime: number;
    };
}

export class AnalyticsService {
    private orderRepository: OrderRepository;
    private productRepository: ProductRepository;
    private promotionRepository: PromotionRepository;

    constructor() {
        this.orderRepository = new OrderRepository();
        this.productRepository = new ProductRepository();
        this.promotionRepository = new PromotionRepository();
    }

    /**
     * Get comprehensive dashboard statistics
     */
    async getDashboardStats(): Promise<DashboardStats> {
        // Get all orders
        const orders = await this.orderRepository.findAll();

        // Get all products
        const allProducts = await this.productRepository.findAll(true); // include disabled
        const activeProducts = await this.productRepository.findAll(false); // only active

        // Get all promotions
        const allPromotions = await this.promotionRepository.findAllWithSlabs();
        const activePromotions = await this.promotionRepository.findActive();

        // Calculate date ranges
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);

        const thisMonth = new Date(today);
        thisMonth.setMonth(thisMonth.getMonth() - 1);

        // Filter orders by date ranges
        const todayOrders = orders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= today && orderDate < tomorrow;
        });

        const weekOrders = orders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= thisWeek;
        });

        const monthOrders = orders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= thisMonth;
        });

        // Calculate revenue
        const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
        const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);
        const weekRevenue = weekOrders.reduce((sum, order) => sum + Number(order.total), 0);
        const monthRevenue = monthOrders.reduce((sum, order) => sum + Number(order.total), 0);

        // Calculate average order value
        const averageOrderValue = orders.length > 0
            ? totalRevenue / orders.length
            : 0;

        return {
            orders: {
                total: orders.length,
                today: todayOrders.length,
                thisWeek: weekOrders.length,
                thisMonth: monthOrders.length,
                totalRevenue,
                todayRevenue,
                thisWeekRevenue: weekRevenue,
                thisMonthRevenue: monthRevenue,
                averageOrderValue,
            },
            products: {
                total: allProducts.length,
                active: activeProducts.length,
                inactive: allProducts.length - activeProducts.length,
            },
            promotions: {
                total: allPromotions.length,
                active: activePromotions.length,
                inactive: allPromotions.length - activePromotions.length,
            },
            revenue: {
                today: todayRevenue,
                thisWeek: weekRevenue,
                thisMonth: monthRevenue,
                allTime: totalRevenue,
            },
        };
    }
}

