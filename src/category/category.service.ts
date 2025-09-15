import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
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
        categoryname: newCategory.categoryname,
        createCategoryOnwer: newCategory.user.name,
      },
    };
  }

  findAll() {
    return `This action returns all category`;
  }

  findOne(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }


}
