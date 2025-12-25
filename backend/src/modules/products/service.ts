import { ProductRepository } from './repository';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, ToggleProductDto } from './dto';
import { NotFoundError, ConflictError, BadRequestError } from '../../utils/errors';
import { Product } from '@prisma/client';

export class ProductService {
  private repository: ProductRepository;

  constructor() {
    this.repository = new ProductRepository();
  }

  /**
   * Get all products
   * By default, only returns enabled products unless includeDisabled is true
   */
  async getAllProducts(query: ProductQueryDto): Promise<Product[]> {
    const { includeDisabled } = query;
    return this.repository.findAll(includeDisabled);
  }

  /**
   * Get a product by ID
   */
  async getProductById(id: string): Promise<Product> {
    // Validate UUID format
    if (!this.isValidUUID(id)) {
      throw new BadRequestError('Invalid product ID format');
    }

    const product = await this.repository.findById(id);
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  /**
   * Create a new product
   */
  async createProduct(data: CreateProductDto): Promise<Product> {
    // Validate slug uniqueness
    const existingBySlug = await this.repository.findBySlug(data.slug);
    if (existingBySlug) {
      throw new ConflictError('Product with this slug already exists');
    }

    // Validate SKU uniqueness
    const existingBySku = await this.repository.findBySku(data.sku);
    if (existingBySku) {
      throw new ConflictError('Product with this SKU already exists');
    }

    // Validate price is reasonable (not negative, not too large)
    if (data.price < 0) {
      throw new BadRequestError('Price cannot be negative');
    }

    if (data.price > 9999999.99) {
      throw new BadRequestError('Price exceeds maximum allowed value');
    }

    return this.repository.create(data);
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    // Validate UUID format
    if (!this.isValidUUID(id)) {
      throw new BadRequestError('Invalid product ID format');
    }

    // Check if product exists
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Validate slug uniqueness if updating slug
    if (data.slug !== undefined && data.slug !== product.slug) {
      const existing = await this.repository.findBySlug(data.slug);
      if (existing) {
        throw new ConflictError('Product with this slug already exists');
      }
    }

    // Validate SKU uniqueness if updating SKU
    if (data.sku !== undefined && data.sku !== product.sku) {
      const existing = await this.repository.findBySku(data.sku);
      if (existing) {
        throw new ConflictError('Product with this SKU already exists');
      }
    }

    // Validate price if updating
    if (data.price !== undefined) {
      if (data.price < 0) {
        throw new BadRequestError('Price cannot be negative');
      }
      if (data.price > 9999999.99) {
        throw new BadRequestError('Price exceeds maximum allowed value');
      }
    }

    return this.repository.update(id, data);
  }

  /**
   * Toggle product enabled/disabled status
   */
  async toggleProduct(id: string, data: ToggleProductDto): Promise<Product> {
    // Validate UUID format
    if (!this.isValidUUID(id)) {
      throw new BadRequestError('Invalid product ID format');
    }

    // Check if product exists
    const product = await this.repository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // If already in the desired state, return early
    if (product.isActive === data.isEnabled) {
      return product;
    }

    return this.repository.toggleEnabled(id, data.isEnabled);
  }

  /**
   * Helper method to validate UUID format
   */
  private isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }
}

