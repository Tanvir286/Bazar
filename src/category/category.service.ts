import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoryService {

  constructor(private readonly prisma: PrismaService) {}


  // create category
  async create(createCategoryDto: CreateCategoryDto, userId: number) {

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const { categoryname, categorydescription } = createCategoryDto;

    const existingCategory = await this.prisma.category.findFirst({
      where: { categoryname },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this title already exists');
    }

    const newCategory = await this.prisma.category.create({
      data: {
        categoryname,
        categorydescription,
        user: {
          connect: { id: userId }, 
        },
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return {
      success: true,
      message: 'Create success full category',
      data: {
        id: newCategory.id,
        categoryname: newCategory.categoryname,
        createCategoryOnwer: newCategory.user.name,
      },
    };
  }

  // get all category
  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: {
        user: { select: { name: true} },
      },
    });

    return categories.map(category => ({
      "message": "Category found successfully",
      "data": {
        id: category.id,
        categoryname: category.categoryname,
        createCategoryOnwer: category.user.name,
      },
    }));
  }

  // get single category
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        user: { select: { name: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return {
      "message": "Category found successfully",
      "data": {
        id: category.id,
        categoryname: category.categoryname,
        createCategoryOnwer: category.user.name,
      },
    };
  }

  // update category
  async update(id: number, 
               updateCategoryDto: UpdateCategoryDto,
               userId: number) {
                 
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    console.log('Category to be updated:', category);

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.userId !== userId) {
      throw new BadRequestException('You are not the owner to update this category');
    }

    if (updateCategoryDto.categoryname) {
      const existingCategory = await this.prisma.category.findFirst({
        where: { 
          categoryname: updateCategoryDto.categoryname,
          NOT: { id } 
        },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {  user: { select: { name: true } } },
    });

    return {
      'message': 'Category updated successfully',
      'data': {
        id: updatedCategory.id,
        categoryname: updatedCategory.categoryname,
        categorydescription: updatedCategory.categorydescription,
        createCategoryOnwer: updatedCategory.user.name,
      },
    };
  }

  // delete category
  async remove(id: number, userId: number) {

    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    if (category.userId !== userId) {
      throw new BadRequestException('You are not the owner to delete this category');
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      "message": "Category deleted successfully",
      "data": {
        id: category.id,
        categoryname: category.categoryname,
      },
    };
  }


}
