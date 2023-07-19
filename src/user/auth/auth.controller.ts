import {
  Body,
  Controller,
  Param,
  Post,
  ParseEnumPipe,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GenerateProductKeyDto, SinginDto, SingupDto } from './dto/auth.dto';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Roles } from '../decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('/signup/:userType')
  async singup(
    @Body() body: SingupDto,
    @Param('userType', new ParseEnumPipe(UserType)) userType: UserType,
  ) {
    if (userType !== 'BUYER') {
      if (!body.productKey) {
        throw new UnauthorizedException();
      }
      const validProductKey = `${body.email}-${userType}-${process.env.PRODUCT_KEY}`;
      const isValidProductKey = await bcrypt.compare(
        validProductKey,
        body.productKey!,
      );
      console.log(isValidProductKey);
      if(!isValidProductKey){
        throw new UnauthorizedException();
      }
    }

    return this.authService.signup(body,userType);
  }

  @Post('/signin')
  signin(@Body() body: SinginDto) {
    return this.authService.signin(body);
  }
  @Roles(UserType.ADMIN)
  @Post('/key')
  generateProductKey(@Body() { email, userType }: GenerateProductKeyDto) {
    return this.authService.generateProductKey(email, userType);
  }
}
