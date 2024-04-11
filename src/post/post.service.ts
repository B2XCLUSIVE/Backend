import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CloudinaryService, PrismaService } from 'src/common';
import { UsersService } from 'src/auth/users/users.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: Logger,
  ) {}

  async create(
    userId: number,
    createPostDto: CreatePostDto,
    files: Array<Express.Multer.File>,
  ): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

      const { title, description } = createPostDto;

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
      const post = await this.prismaService.post.create({
        data: {
          title,
          description,
          author: { connect: { id: user.id } },
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
        data: post,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'Validation error occurred while creating post',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'An error occurred while creating post',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async findAll(userId: number): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

      const post = await this.prismaService.post.findMany({
        where: { authorId: user.id },
        include: {
          image: true,
          author: { include: { image: true } },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        status: 'Success',
        message: 'posts retrieved successfully',
        data: post,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while fetching posts',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  public async findOne(userId: number, id: number): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

      const post = await this.prismaService.post.findUnique({
        where: { id, authorId: user.id },
        include: {
          image: true,
          author: { include: { image: true } },
        },
      });

      if (!post) {
        throw new HttpException(
          `Post with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        status: 'Success',
        message: 'Post retrieved successfully',
        data: post,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while fetching post',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  async remove(userId: number, id: number) {
    try {
      const user = await this.usersService.getUserById(userId);

      const post = await this.prismaService.post.findUnique({
        where: { id, authorId: userId },
        include: { image: true },
      });

      if (!post) {
        throw new HttpException('post not found', HttpStatus.NOT_FOUND);
      }

      await this.prismaService.post.delete({
        where: {
          id,
          authorId: user.id,
        },
      });

      return {
        status: 'Success',
        message: 'Post deleted successfully',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while deleting post',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }
}
