

import { IsEmail, IsString, MinLength,  } from 'class-validator';


export class LoginAuthDto {

  @IsEmail()
  email: string;

  @IsString()
  password: string;


}
