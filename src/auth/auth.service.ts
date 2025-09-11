import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}


  // create a new user
  async register(createAuthDto: CreateAuthDto) {

    const { email, password, name, role } = createAuthDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

     if (existingUser) {
      throw new ConflictException('User with this email already exists'); 
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });
   
    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: { id: user.id,
         email: user.email,
         name: user.name,
         role: user.role },
    };
  }

  // login a user
  async login(loginAuthDto: LoginAuthDto) {

    const { email, password } = loginAuthDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });


    if (!user) {
      throw new ConflictException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ConflictException('Invalid credentials');
    }

    const payload = { 
      sub: user.id, 
      email: user.email, 
      role: user.role 
    };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),  
      user: { id: user.id,
         email: user.email,
         name: user.name,
          role: user.role },
    };
  }
  



}
