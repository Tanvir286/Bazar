import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class ReviewService {

  constructor(private readonly prisma: PrismaService) {}

  // create review
  async create(createReviewDto: CreateReviewDto, userId: number) {
     
    const { productId, rating, comment } = createReviewDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if(rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const ExistingReview = await this.prisma.review.findFirst({
      where: {
        productId: productId,
        userId: userId,
      },
    });

    if (ExistingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = await this.prisma.review.create({
      data: {
        rating: rating,
        comment: comment,
        productId: productId,
        userId: userId,
      },
      include: {  
        product: true,
        user: true,
      },
    });

    console.log(review);

    return {
      success: true,
      message: 'Review created successfully',
      data: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        product: review.product.producttitle,
        reviewOwner: review.user.name,
      },
    };
  }

  // get all reviews
  async findAll() {
    
    const reviews = await this.prisma.review.findMany({
      include: {
        product: true,
        user: true,
      },
    });

    return {
      success: true,
      message: 'Reviews retrieved successfully',
      data: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        product: review.product.producttitle,
        reviewOwner: review.user.name,
      })),
    };
  }


  // get single review by id
  async findOne(id: number) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        product: true,
        user: true,
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return {
      success: true,
      message: 'Review retrieved successfully',
      data: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        product: review.product.producttitle,
        reviewOwner: review.user.name,
      },
    };
  }
  
  // update review
  async update(id: number, 
                updateReviewDto: UpdateReviewDto, 
                userId: number) {

    const existingReview = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new NotFoundException('Review not found');
    }

    if (existingReview.userId !== userId) {
      throw new ForbiddenException('You are not allowed to update this review');
    }

    if(updateReviewDto.rating && (updateReviewDto.rating < 1 || updateReviewDto.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    if(updateReviewDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: updateReviewDto.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }
    }


    if(updateReviewDto.comment !== undefined && updateReviewDto.comment.trim() === '') {
      throw new BadRequestException('Comment cannot be empty');
    }

    const updatedReview = await this.prisma.review.update({
      where: { id },
      data: updateReviewDto
    });

    return {
      success: true,
      message: 'Review updated successfully',
      data: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        productId: updatedReview.productId,
        reviewOwner: userId,
      }
    };
  }

  // delete review by id
  async remove(id: number, userId: number) {

    const existingReview = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new NotFoundException('Review not found');
    }

    if (existingReview.userId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this review');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'Review deleted successfully',
    };
  }
}
