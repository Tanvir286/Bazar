import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

    // check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id: productcategory },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

      // create product
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

  // get all product
  async findAll() {

    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        user: true,
      }, 
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: products.map(prod => ({
          id: prod.id,
          title: prod.producttitle,
          description: prod.productdescription,
          price: prod.productprice,
          stock: prod.productstock,
          category: prod.category.categoryname,
          createProductOwner: prod.user.name,
        })),
      },
    };
  }

  // get single product by id
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        user: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      success: true,
      message: 'Product retrieved successfully',
      data: {
        id: product.id,
        title: product.producttitle,
        description: product.productdescription,
        price: product.productprice,
        stock: product.productstock,
        category: product.category.categoryname,
        createProductOwner: product.user.name,
      },
    };
  }


  // update product by id
  async update(id: number, 
               updateProductDto: UpdateProductDto, 
               userId: number) {

    // check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.userId !== userId) {
      throw new ForbiddenException('You are not allowed to update this product');
    }

    
   
    const data: any = {
      ...updateProductDto, 
    };

    
    if (updateProductDto.productcategory) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateProductDto.productcategory },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      
      delete data.productcategory;
     
      data.category = { connect: { id: updateProductDto.productcategory } };

  }

  // update product
  const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: data,
      include: {
        category: true,
        user: true,
      },
    });

    return {
      success: true,
      message: 'Product updated successfully',
      data: {
        id: updatedProduct.id,
        title: updatedProduct.producttitle,
        description: updatedProduct.productdescription,
        price: updatedProduct.productprice,
        stock: updatedProduct.productstock,
        category: updatedProduct.category.categoryname,
        createProductOwner: updatedProduct.user.name,
      },
    };
  }


  // delete product by id
  async remove(id: number, userId: number) {
    
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this product');
    }

    await this.prisma.product.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }



}
