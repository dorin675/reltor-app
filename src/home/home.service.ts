import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateHomeDto,
  HomeFilterDto,
  HomeResponseDto,
  InquireDto,
  ModifyHomeDto,
} from './dto/home.dto';
import { tokenData } from 'src/user/auth/dto/auth.dto';
import { propertyType } from '@prisma/client';

@Injectable()
export class HomeService {
  constructor(private prismaService: PrismaService) {}
  async getHomeById(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        adress: true,
        bathroams: true,
        bedrooms: true,
        price: true,
        city: true,
        size: true,
        type: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
    });
    if (!home) {
      throw new NotFoundException();
    }
    const unstructuredHome = { ...home, image: home.images[0].url.toString() };
    return new HomeResponseDto(unstructuredHome);
  }
  async getAllHomes(filter: HomeFilterDto): Promise<HomeResponseDto[]> {
    const queryFilter: HomeFilterDto = filter;
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        adress: true,
        bathroams: true,
        bedrooms: true,
        price: true,
        city: true,
        size: true,
        type: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: queryFilter,
    });

    if (!homes.length) {
      throw new NotFoundException();
    }

    return homes.map((home) => {
      const unstructuredHome = { ...home, image: home.images[0].url };
      return new HomeResponseDto(unstructuredHome);
    });
  }
  async verifyIfIsReltorOrAdmin(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      return false;
    }
    return user.userType === 'RELTOR'
      ? true
      : user.userType === 'ADMIN'
      ? true
      : false;
  }
  async createHome(
    {
      adress,
      city,
      price,
      bedrooms,
      bathroams,
      size,
      type,
      images,
    }: CreateHomeDto,
    id: number | undefined,
  ) {
    if (!id) {
      throw new UnauthorizedException();
    }
    if (!(await this.verifyIfIsReltorOrAdmin(id))) {
      throw new UnauthorizedException();
    }
    const home = await this.prismaService.home.create({
      data: {
        adress,
        city,
        price,
        bedrooms,
        bathroams,
        size,
        type,
        realtorId: id,
      },
    });
    const homeImages = images.map((image) => {
      return { ...image, homeId: home.id };
    });
    await this.prismaService.image.createMany({ data: homeImages });
    const unstructuredHome = { ...home, image: homeImages[0].url };
    return new HomeResponseDto(unstructuredHome);
  }

  async modifyHome(data: ModifyHomeDto, id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });
    if (!home) {
      throw new NotFoundException();
    }
    const updatedHome = await this.prismaService.home.update({
      where: {
        id,
      },
      data,
    });
    return new HomeResponseDto(updatedHome);
  }

  async deleteHome(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    await this.prismaService.image.deleteMany({
      where: {
        homeId: id,
      },
    });
    return await this.prismaService.home.delete({
      where: {
        id,
      },
    });
  }

  async getReltorByHomeId(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        realtor: {
          select: {
            name: true,
            email: true,
            phone: true,
            id: true,
          },
        },
      },
    });
    if (!home) {
      throw new NotFoundException();
    }
    return home.realtor;
  }

  async inquire(user: tokenData, homeId: number, { message }: InquireDto) {
    const realtor = await this.getReltorByHomeId(homeId);
    if (!user.id) {
      throw new UnauthorizedException();
    }
    const newMessage = await this.prismaService.message.create({
      data: {
        reltorId: realtor.id,
        buyerId: user.id,
        homeId: homeId,
        message: message,
      },
    });
    return newMessage;
  }
  async getMessagesByHomeId(homeId: number, user: tokenData) {
    const realtor = await this.getReltorByHomeId(homeId);
    if (!user.id || realtor.id !== user.id) {
      throw new UnauthorizedException();
    }

    return this.prismaService.message.findMany({
      where:{
        homeId:homeId,
      },select:{
        message:true,
        buyer:{
          select:{
            name:true,
            email:true,
            phone:true
          }
        }
      }
    })
  }
}
