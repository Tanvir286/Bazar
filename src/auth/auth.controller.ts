import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';

// 👇 এখানে শুধু type হিসেবে ব্যবহার করা হচ্ছে

import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { RolesGuard } from 'src/utility/guards/roles.guard';
import { Roles } from 'src/utility/decorators/roles.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  
  @Get('all-users')
  findAll() {
    return this.authService.findAll();
  }

  
  @Get('single-user/:id')
  findOne(@Param('id') id: string , @Req() req: any) {
    return this.authService.findOne(+id);
  }

  
  @UseGuards(AuthenticationGuard)
  @Get('current-user')
  getProfile(@CurrentUser() currentUser: any) {
    return currentUser;
  }


}
