import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Prisma } from '@prisma/client';
import { CloudinaryService, PrismaService } from 'src/common';
import { UsersService } from 'src/auth/users/users.service';

@Injectable()
export class EventService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: Logger,
  ) {}
  async create(
    userId: number,
    createEventDto: CreateEventDto,
    files: Array<Express.Multer.File>,
  ): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

      let imagesLinks = null;

      if (files) {
        imagesLinks = await this.cloudinaryService
          .uploadMedias(files, 'image')
          .catch((error) => {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
          });
      }

      let createdImages;
      if (files) {
        createdImages = await Promise.all(
          imagesLinks?.map(async (file) => {
            return await this.prismaService.image.create({
              data: {
                publicId: file?.public_id,
                url: file?.url,
              },
            });
          }) || [],
        );
      }
      const event = await this.prismaService.event.create({
        data: {
          title: createEventDto.title,
          description: createEventDto.description,
          location: createEventDto.location,
          date: createEventDto.date,
          user: { connect: { id: user.id } },
          image: {
            connect: createdImages?.length
              ? createdImages?.map((image) => ({
                  id: image?.id,
                }))
              : [],
          },
        },
      });

      return {
        status: true,
        message: 'Successfully created post',
        data: event,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'Validation error occurred while creating event',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'An error occurred while creating event',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async findAll(userId: number): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

      const post = await this.prismaService.event.findMany({
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
        message: 'Events retrieved successfully',
        data: post,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while fetching events',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  public async findOne(userId: number, id: number): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

      const event = await this.prismaService.event.findUnique({
        where: { id, userId: user.id },
        include: {
          image: true,
          user: { include: { image: true } },
        },
      });

      if (!event) {
        throw new HttpException(
          `Event with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        status: 'Success',
        message: 'Event retrieved successfully',
        data: event,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while fetching event',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  async remove(userId: number, id: number) {
    try {
      const user = await this.usersService.getUserById(userId);

      const event = await this.prismaService.event.findUnique({
        where: { id, userId },
        include: { image: true },
      });

      if (!event) {
        throw new HttpException('event not found', HttpStatus.NOT_FOUND);
      }

      await this.prismaService.event.delete({
        where: {
          id,
          userId: user.id,
        },
      });

      return {
        status: 'Success',
        message: 'Event deleted successfully',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while deleting event',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }
}
