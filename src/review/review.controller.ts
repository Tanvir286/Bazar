import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/utility/guards/roles.guard';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { Roles } from 'src/utility/decorators/roles.decorator';

@Controller('review')
export class ReviewController {

  constructor(private readonly reviewService: ReviewService) {}

  // create review
  @UseGuards(JwtAuthGuard, AuthenticationGuard,RolesGuard)
  @Roles('user')
  @Post('createReview')
  create(@Body() createReviewDto: CreateReviewDto,
         @Req() req: any
  ) {
  const userId = req.user.userId;
  console.log(userId,"userid");
  return this.reviewService.create(createReviewDto, userId);
  }

  // get all reviews
  @Get('allReviews')
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewService.update(+id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(+id);
  }
}
