import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { RolesGuard } from 'src/utility/guards/roles.guard';
import { Roles } from 'src/utility/decorators/roles.decorator';

@Controller('product')
export class ProductController {

  constructor(private readonly productService: ProductService) {}

  // create product
  @UseGuards(JwtAuthGuard, AuthenticationGuard,RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createProductDto: CreateProductDto,
         @Req() req: any) {
  const userId = req.user.userId;
  return this.productService.create(createProductDto, userId);
  }

  // get all product
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
