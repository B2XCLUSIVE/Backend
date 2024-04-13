import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CloudinaryService, PrismaService } from 'src/common';
import { UsersService } from 'src/auth/users/users.service';
import { Image, Prisma } from '@prisma/client';

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

      const { title, description, categories, tags, subtitle } = createPostDto;

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
          subtitle,
          description,
          categories,
          tags,
          author: { connect: { id: user.id } },
          image: {
            connect: createdImages?.length
              ? createdImages?.map((image) => ({
                  id: image?.id,
                }))
              : [],
          },
        },
        include: { image: true },
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
        // where: { authorId: user.id },
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

  public async update(
    userId: number,
    id: number,
    updatePostDto: UpdatePostDto,
    files: Array<Express.Multer.File>,
  ) {
    try {
      const user = await this.usersService.getUserById(userId);

      if (!Object.keys(updatePostDto).length) {
        return {
          status: 'No Updates',
          data: [],
        };
      }

      const existingPost = await this.prismaService.post.findUnique({
        where: { id },
        include: { image: true },
      });

      if (!existingPost) {
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
      }

      let existingImages: Image[] = [];
      if (existingPost.image) {
        existingImages = Array.isArray(existingPost.image)
          ? existingPost.image
          : [existingPost.image];
      }

      let imagesLinks = null;
      let createdImages: Image[] = [];

      if (files) {
        imagesLinks = await this.cloudinaryService
          .uploadMedias(files, 'image')
          .catch((error) => {
            throw new HttpException(error, HttpStatus.BAD_REQUEST);
          });

        // Delete the previous images if they exist
        let imageExist;
        for (const existingImage of existingImages) {
          await this.cloudinaryService.deleteResource(existingImage.publicId);

          // Check if image exists in the database
          imageExist = await this.prismaService.image.findMany({
            where: { id: existingImage.id },
          });
        }

        // Create or update the new images
        createdImages = await Promise.all(
          imagesLinks.map(async (file) => {
            if (imageExist) {
              return await this.prismaService.image.update({
                where: { id: imageExist[0].id },
                data: {
                  publicId: file.public_id,
                  url: file.url,
                },
              });
            } else {
              return await this.prismaService.image.create({
                data: {
                  publicId: file.public_id,
                  url: file.url,
                },
              });
            }
          }),
        );
      }

      const updatedPost = await this.prismaService.post.update({
        where: { id },
        data: {
          title: updatePostDto.title,
          subtitle: updatePostDto.subtitle,
          description: updatePostDto.description,
          categories: updatePostDto.categories,
          tags: updatePostDto.tags,
          image: {
            connect: createdImages?.length
              ? createdImages?.map((image) => ({
                  id: image?.id,
                }))
              : [],
          },
        },
        include: { image: true },
      });

      return {
        status: 'Success',
        message: 'Post updated successfully',
        data: updatedPost,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'Validation error occurred while updating post',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'An error occurred while updating post',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
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
