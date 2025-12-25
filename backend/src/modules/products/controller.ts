import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { ProductService } from './service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, ToggleProductDto } from './dto';
import { sendSuccess, sendCreated } from '../../utils/response';

export class ProductController {
  private service: ProductService;

  constructor() {
    this.service = new ProductService();
  }

  /**
   * GET /api/products
   * Get all products (public endpoint)
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query as unknown as ProductQueryDto;
      const products = await this.service.getAllProducts(query);
      sendSuccess(res, products);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/products/:id
   * Get a product by ID (public endpoint)
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const product = await this.service.getProductById(id);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/products
   * Create a new product (auth required)
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body as CreateProductDto;
      const product = await this.service.createProduct(data);
      sendCreated(res, product, 'Product created successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/products/:id
   * Update a product (auth required)
   */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as UpdateProductDto;
      const product = await this.service.updateProduct(id, data);
      sendSuccess(res, product, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/products/:id/toggle
   * Toggle product enabled/disabled status (auth required)
   */
  toggle = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = req.body as ToggleProductDto;
      const product = await this.service.toggleProduct(id, data);
      sendSuccess(
        res,
        product,
        `Product ${data.isEnabled ? 'enabled' : 'disabled'} successfully`
      );
    } catch (error) {
      next(error);
    }
  };
}

