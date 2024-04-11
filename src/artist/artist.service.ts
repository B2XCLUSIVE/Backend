import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { CloudinaryService, PrismaService } from 'src/common';
import { UsersService } from 'src/auth/users/users.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ArtistService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: Logger,
  ) {}
  public async create(
    userId: number,
    createArtistDto: CreateArtistDto,
    file?: Express.Multer.File,
  ) {
    try {
      const user = await this.usersService.getUserById(userId);

      const { name, bio } = createArtistDto;
      const existingArtist = await this.prismaService.artist.findFirst({
        where: { name, userId: user.id },
      });
      if (existingArtist) {
        throw new HttpException(
          'Artist with this name already exists',
          HttpStatus.BAD_REQUEST,
        );
      }

      let image = null;

      if (file) {
        const imagesLink = await this.cloudinaryService
          .uploadImage(file)
          .catch((error) => {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
          });

        image = await this.prismaService.image.create({
          data: {
            publicId: imagesLink.public_id,
            url: imagesLink.url,
          },
        });
      }

      const artist = await this.prismaService.artist.create({
        data: {
          name,
          bio,
          imageId: image?.id,
          userId: user.id,
        },
      });

      return {
        status: true,
        message: 'Successfully created artist',
        data: artist,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while creating artist',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  public async findAll(userId: number): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

      const artists = await this.prismaService.artist.findMany({
        where: { userId: user.id },
        include: {
          image: true,
          user: { include: { image: true } },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        status: 'Success',
        message: 'Artists retrieved successfully',
        data: artists,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while fetching artist',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  public async findOne(userId: number, id: number): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

      const artist = await this.prismaService.artist.findUnique({
        where: { id, userId: user.id },
        include: {
          image: true,
          user: { include: { image: true } },
        },
      });

      if (!artist) {
        throw new HttpException(
          `Artist with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        status: 'Success',
        message: 'Artist retrieved successfully',
        data: artist,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while fetching artist',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  update(id: number, updateArtistDto: UpdateArtistDto) {
    return `This action updates a #${id} artist`;
  }

  async remove(userId: number, id: number) {
    try {
      const user = await this.usersService.getUserById(userId);

      const artist = await this.prismaService.artist.findUnique({
        where: { id, userId },
        include: { image: true },
      });

      if (!artist) {
        throw new HttpException('artist not found', HttpStatus.NOT_FOUND);
      }

      await this.prismaService.artist.delete({
        where: {
          id,
          userId: user.id,
        },
      });

      return {
        status: 'Success',
        message: 'Artist deleted successfully',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while deleting artist',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }
}
