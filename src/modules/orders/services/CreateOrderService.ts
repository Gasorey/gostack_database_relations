import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const checkCustomer = await this.customersRepository.findById(customer_id);

    if (!checkCustomer) {
      throw new AppError('Please you must have an account to make an order');
    }
    const getProducts = await this.productsRepository.findAllById(products);

    if (getProducts.length === 0) {
      throw new AppError('Products not found');
    }

    const orderProducts = products.map(product => {
      const oneProduct = getProducts.find(
        productDataFinded => productDataFinded.id === product.id,
      );
      if (oneProduct && oneProduct.quantity < product.quantity) {
        throw new AppError('not enough products');
      }
      return {
        product_id: product.id,
        price: oneProduct?.price || 0,
        quantity: product.quantity,
      };
    });
    const order = await this.ordersRepository.create({
      customer: checkCustomer,
      products: orderProducts,
    });

    await this.productsRepository.updateQuantity(products);
    return order;
  }
}

export default CreateOrderService;
