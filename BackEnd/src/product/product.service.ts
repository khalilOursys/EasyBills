import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
/* import { Category } from 'src/category/entities/category.entity'; */
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    /* @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>, */
  ) {}

  async create(
    createProductDto: CreateProductDto,
    imagePath: string,
  ): Promise<Product> {
    const {
      productCode,
      designation,
      name,
      purchasePriceExclVat,
      purchasePriceInclVat,
      vat,
      salePriceExclVat,
      salePriceInclVat,
      margin,
      discount,
      stock,
      safetyStock,
      packaging,
      weight,
    } = createProductDto;

    // Fetch the category from the database
    /* const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    }); 

    if (!category) {
      throw new Error('Category not found');
    }*/

    // Create a new product and assign it the category
    const newProduct = this.productRepository.create({
      productCode,
      designation,
      name,
      purchasePriceExclVat,
      purchasePriceInclVat,
      vat,
      salePriceExclVat,
      margin,
      discount,
      salePriceInclVat,
      stock,
      safetyStock,
      packaging,
      weight,
      photo: imagePath,
    });

    // Save the product to the database
    return await this.productRepository.save(newProduct);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    return this.productRepository.findOne({
      where: { id },
      /* relations: ['category'], */
    });
  }

  async updateProduct(
    id: number,
    updateProductDto: UpdateProductDto,
    imagePath?: string,
  ): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    Object.assign(product, updateProductDto);

    if (imagePath) {
      product.photo = imagePath;
    }

    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new Error('Product not found');
    }

    await this.productRepository.remove(product);
  }
}
