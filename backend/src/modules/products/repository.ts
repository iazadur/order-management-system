import { Prisma, Product } from '@prisma/client';
import prisma from '../../config/database';

export class ProductRepository {
    /**
     * Find all products
     * @param includeDisabled - If false, only returns enabled products (default behavior)
     */
    async findAll(includeDisabled: boolean = false): Promise<Product[]> {
        const where: Prisma.ProductWhereInput = {};

        if (!includeDisabled) {
            where.isActive = true;
        }

        return prisma.product.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find a product by ID
     */
    async findById(id: string): Promise<Product | null> {
        return prisma.product.findUnique({
            where: { id },
        });
    }

    /**
     * Find a product by slug
     */
    async findBySlug(slug: string): Promise<Product | null> {
        return prisma.product.findUnique({
            where: { slug },
        });
    }

    /**
     * Find a product by SKU
     */
    async findBySku(sku: string): Promise<Product | null> {
        return prisma.product.findUnique({
            where: { sku },
        });
    }

    /**
     * Create a new product
     */
    async create(data: Prisma.ProductCreateInput): Promise<Product> {
        return prisma.product.create({
            data,
        });
    }

    /**
     * Update a product
     */
    async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
        return prisma.product.update({
            where: { id },
            data,
        });
    }

    /**
     * Toggle product enabled/disabled status
     */
    async toggleEnabled(id: string, isEnabled: boolean): Promise<Product> {
        return prisma.product.update({
            where: { id },
            data: { isActive: isEnabled },
        });
    }
}

