import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateEventDto, OrganisersDto } from './dto/create-event.dto';
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
  public async create(
    userId: number,
    createEventDto: CreateEventDto,
    files?: Array<Express.Multer.File>,
  ): Promise<any> {
    try {
      // Validate the user
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const organiserIds = createEventDto.organisersId.map((id) =>
        parseInt(id.trim(), 10),
      );
      // Get the organizers if their IDs are provided
      let organisers = [];
      if (createEventDto.organisersId) {
        organisers = await this.prismaService.organiser.findMany({
          where: {
            id: { in: organiserIds },
          },
        });

        // Check for missing organisers
        const notFoundOrganisers = organiserIds.filter(
          (id) => !organisers.some((o) => o.id === id),
        );
        console.log(notFoundOrganisers);
        if (notFoundOrganisers.length > 0) {
          const errorMessage = `Organisers not found: ${notFoundOrganisers.join(
            ', ',
          )}`;
          throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
        }
      }

      // Handle Cloudinary image uploads
      let imagesLinks = [];
      if (files && files.length > 0) {
        imagesLinks = await this.cloudinaryService.uploadMedias(files, 'image');
      }

      let createdImages = [];
      if (imagesLinks.length > 0) {
        createdImages = await Promise.all(
          imagesLinks.map(async (file) => {
            return await this.prismaService.image.create({
              data: {
                publicId: file.public_id,
                url: file.url,
              },
            });
          }),
        );
      }

      // Create the event
      const event = await this.prismaService.event.create({
        data: {
          title: createEventDto.title,
          subTitle: createEventDto.subTitle,
          description: createEventDto.description,
          location: createEventDto.location,
          date: createEventDto.date,
          user: { connect: { id: user.id } },
          image: {
            connect: createdImages.map((image) => ({
              id: image.id,
            })),
          },
          organisers: {
            connect: organisers.map((organiser) => ({
              id: organiser.id,
            })),
          },
        },
        include: { image: true, organisers: true },
      });

      return {
        status: true,
        message: 'Successfully created event',
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

  async organiser(
    userId: number,
    organisersDto: OrganisersDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);
      const { name, bio } = organisersDto;

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

      const organiser = await this.prismaService.organiser.create({
        data: {
          name,
          bio,
          imageId: image?.id,
          userId: user.id,
        },
        include: { user: true, image: true },
      });

      return {
        status: true,
        message: 'Successfully created organiser',
        data: organiser,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'Validation error occurred while creating organiser',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'An error occurred while creating organiser',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async findAll(): Promise<any> {
    try {
      const post = await this.prismaService.event.findMany({
        include: {
          image: true,
          organisers: true,
          user: { include: { image: true } },
          comments: true,
          likes: true,
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

  public async findOne(id: number): Promise<any> {
    try {
      const event = await this.prismaService.event.findUnique({
        where: { id },
        include: {
          image: true,
          organisers: true,
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
