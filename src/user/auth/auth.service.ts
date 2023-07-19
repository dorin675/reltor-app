import { Injectable, ConflictException, HttpException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SinginDto, SingupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';
import 'dotenv/config';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  async signup({ email, password, phone, name }: SingupDto, userType:UserType) {
    const foundUser = await this.prismaService.user.findFirst({
      where: {
        email,
      },
    });
    if (foundUser) {
      throw new ConflictException("User already is signed up");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log({ hashedPassword });
    const user = await this.prismaService.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        userType,
      },
    });

    return this.generateJWT(name, user.id);
  }

  async signin({ email, password }: SinginDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      throw new HttpException('Invalid email', 400);
    }
    const hashedPassword = user.password;
    const isValid = await bcrypt.compare(password, hashedPassword);
    if (!isValid) {
      throw new HttpException('Invalid password', 400);
    }
    console.log(user);
    return await this.generateJWT(user.name, user.id);
  }

  private async generateJWT(name: string, id: number) {
    const TOKEN_KEY :string = process.env.JWT_KEY!;
    return await jwt.sign(
      {
        name,
        id,
      },
      TOKEN_KEY,
      { expiresIn: '1h' },
    );
  }

  async generateProductKey(email: string, userType: UserType) {
    const str=`${email}-${userType}-${process.env.PRODUCT_KEY}`

    return await bcrypt.hash(str,10);
  }
}
