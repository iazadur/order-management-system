import { Prisma, Order, OrderItem } from '@prisma/client';
import prisma from '../../config/database';

export type OrderWithRelations = Order & {
    items: (OrderItem & {
        product: Prisma.ProductGetPayload<{}>;
    })[];
    promotion?: Prisma.PromotionGetPayload<{ include: { slabs: true } }> | null;
    user?: {
        id: string;
        email: string;
    };
};

export class OrderRepository {
    /**
     * Create a new order with items in a transaction
     */
    async create(
        orderData: {
            userId: string;
            promotionId?: string | null;
            subtotal: number;
            discount: number;
            total: number;
            status: string;
            notes?: string;
        },
        items: Array<{
            productId: string;
            quantity: number;
            unitPrice: number;
            discount: number;
            total: number;
            productName: string;
            productSku: string;
        }>
    ): Promise<OrderWithRelations> {
        return prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId: orderData.userId,
                    promotionId: orderData.promotionId,
                    subtotal: orderData.subtotal,
                    discount: orderData.discount,
                    total: orderData.total,
                    status: orderData.status as any,
                    notes: orderData.notes,
                    items: {
                        create: items,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    promotion: {
                        include: {
                            slabs: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            });

            return order as OrderWithRelations;
        });
    }

    /**
     * Find order by ID
     */
    async findById(id: string): Promise<OrderWithRelations | null> {
        return prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                promotion: {
                    include: {
                        slabs: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        }) as Promise<OrderWithRelations | null>;
    }

    /**
     * Find orders by user ID
     */
    async findByUserId(userId: string): Promise<OrderWithRelations[]> {
        return prisma.order.findMany({
            where: {
                userId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                promotion: {
                    include: {
                        slabs: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        }) as Promise<OrderWithRelations[]>;
    }

    /**
     * Find all orders (admin)
     */
    async findAll(): Promise<OrderWithRelations[]> {
        return prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
                promotion: {
                    include: {
                        slabs: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        }) as Promise<OrderWithRelations[]>;
    }
}
