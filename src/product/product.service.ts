import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductService {

  constructor(private readonly prisma: PrismaService) {}

  // create product
  async create(createProductDto: CreateProductDto, userId: number) {
  const {
    producttitle,
    productdescription,
    productprice,
    productstock,
    productcategory,
  } = createProductDto;

  // ক্যাটাগরি আগে আছে কিনা চেক
  const category = await this.prisma.category.findUnique({
    where: { id: productcategory },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  // এখানে product ছোটহাতের হতে হবে
  const Products = await this.prisma.product.create({
    data: {
      producttitle: producttitle,
      productdescription: productdescription,
      productprice: productprice,
      productstock: productstock,
      category: {
        connect: { id: productcategory },
      },
      user: {
        connect: { id: userId },
      },
    },
    include: {
      category: true,
      user: true,
    },
  });

  return {
    success: true,
    message: 'Product created successfully',
    data: {
      id: Products.id,
      title: Products.producttitle,
      description: Products.productdescription,
      price: Products.productprice,
      stock: Products.productstock,
      category: Products.category.categoryname,
      createProductOwner: Products.user.name,
    },
  };
}


  findAll() {
    return `This action returns all product`;
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
