import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

  findOne(id: number) {
    return `This action returns a #${id} review`;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}
