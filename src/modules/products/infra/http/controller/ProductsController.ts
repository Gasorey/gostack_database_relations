import { Request, Response } from 'express';

import { container } from 'tsyringe';
import CreateProductService from '@modules/products/services/CreateProductService';

export default class ProductsController {
  public async create(request: Request, response: Response): Promise<void> {
    const { name, price, quantity } = request.body;

    const createProduct = container.resolve(CreateProductService);

    await createProduct.execute({
      name,
      price,
      quantity,
    });

    response.status(204).send();
  }
}
