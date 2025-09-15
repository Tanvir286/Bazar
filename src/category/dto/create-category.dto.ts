import { IsNotEmpty, IsString } from "class-validator";

export class CreateCategoryDto {

    @IsNotEmpty()
    @IsString()
    categoryname: string;

    @IsNotEmpty()
    @IsString()
    categorydescription: string;
}
