import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';

@Controller('category')
export class CategoryController {

  constructor(private readonly categoryService: CategoryService) {}

  //create category
  @UseGuards(JwtAuthGuard, AuthenticationGuard)
  @Post('createCategory')
  create(@Body() createCategoryDto: CreateCategoryDto,
        @Req() req: any) {
  const userId = req.user.userId;
  console.log('Authenticated User ID:', userId); 
  return this.categoryService.create(createCategoryDto, userId);
  }

  // get all category
  @Get('allCategory')
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(+id);
  }
}
