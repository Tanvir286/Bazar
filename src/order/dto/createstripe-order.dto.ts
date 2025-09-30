import { IsNumber, IsString, IsUrl } from 'class-validator';

export class CreateOrderStripeDto {

  @IsNumber({}, { message: 'price must be a number' })
  price: number;

  @IsString({ message: 'description must be a string' })
  description: string;

  @IsString({ message: 'user_id must be a string' })
  user_id: string;

  @IsUrl({}, { message: 'urlSuccess must be a valid URL' })
  urlSuccess: string;

  @IsUrl({}, { message: 'urlCancel must be a valid URL' })
  urlCancel: string;

  @IsString({ message: 'email must be a string' })
  email: string;


}
