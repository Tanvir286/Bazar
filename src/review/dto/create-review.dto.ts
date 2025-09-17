import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateReviewDto {

    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    @IsNumber()
    rating: number;

    @IsNotEmpty()
    comment: string;

}
