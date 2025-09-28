import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreateProductDto {

    @IsNotEmpty()
    @IsString() 
    producttitle: string;

    @IsNotEmpty()
    @IsString()
    productdescription: string;

    @IsNotEmpty()
    @IsNumber({maxDecimalPlaces:2}, {message: 'Price must be number and can have maximum two decimal places'})
    @IsPositive()
    productprice: number;

    @IsNotEmpty()
    @IsNumber({maxDecimalPlaces:2}, {message: 'Stock must be number and can have maximum two decimal places'})
    @IsPositive()
    @Min(0, {message: 'Stock must be at least 0'})
    productstock: number;

    @IsNotEmpty()
    @IsNumber()
    productcategory: number;

    createdAt: Date;
    updatedAt: Date;

}