import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Body,
  Param,
  ParseIntPipe,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { HomeService } from './home.service';
import { CreateHomeDto, HomeResponseDto, InquireDto, ModifyHomeDto } from './dto/home.dto';
import { UserType, propertyType } from '@prisma/client';
import { User } from 'src/user/decorators/user.decorator';
import { tokenData } from 'src/user/auth/dto/auth.dto';
import { UseGuards } from '@nestjs/common/decorators/core';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/user/decorators/roles.decorator';

@Controller('home')
export class HomeController {
  constructor(private homeService: HomeService) {}
  @Get()
  getAllHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('type') type?: propertyType,
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;
    const filter = {
      ...(city && { city }),
      ...(price && { price }),
      ...(type && { type }),
    };
    if(filter.type){
      if(filter.type.includes("HOUSE")||filter.type.includes("APARTAMENT")){
      console.log(1);
      }else{
        throw new NotFoundException();
      }
      
    }
    return this.homeService.getAllHomes(filter);
  }
  @Get(':id')
  getHomeById(@Param('id', ParseIntPipe) id: number) {
    return this.homeService.getHomeById(id);
  }
  @Roles(UserType.RELTOR)
  @Get('/:id/messages')
  getHomeMessages(
    @Param('id', ParseIntPipe) homeId: number, @User() user: tokenData
  ){
    return this.homeService.getMessagesByHomeId(homeId,user);
  }

  @Roles(UserType.RELTOR)
  @UseGuards(AuthGuard)
  @Post()
  createHome(@Body() body: CreateHomeDto, @User() user: tokenData) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.homeService.createHome(body, user.id);
    // return "Home Created";
  }
  @Roles(UserType.BUYER)
  @Post('/:id/inquire')
  inquireHome(@Param('id', ParseIntPipe) homeId: number, @User() user: tokenData,@Body() body:InquireDto) {
    return this.homeService.inquire(user, homeId, body);
  }
  @Roles(UserType.RELTOR)
  @UseGuards(AuthGuard)
  @Patch(':id')
  async modifyHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ModifyHomeDto,
    @User() user: tokenData,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }
    const realtor = await this.homeService.getReltorByHomeId(id);
    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }
    return this.homeService.modifyHome(body, id);
  }
  @Roles(UserType.RELTOR)
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteHome(
    @Param('id', ParseIntPipe) id: number,
    @User() user: tokenData,
  ) {
    if (!user) {
      throw new UnauthorizedException();
    }
    const realtor = await this.homeService.getReltorByHomeId(id);
    if (realtor.id !== user.id) {
      throw new UnauthorizedException();
    }
    return this.homeService.deleteHome(id);
  }
  
}
