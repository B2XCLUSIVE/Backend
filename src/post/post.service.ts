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

  public async findAll(): Promise<any> {
    try {
      // const user = await this.usersService.getUserById(userId);

      const post = await this.prismaService.post.findMany({
        // where: { authorId: user.id },
        include: {
          image: true,
          views: true,
          comment: true,
          likes: true,
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

  public async findOne(id: number): Promise<any> {
    try {
      //const user = await this.usersService.getUserById(userId);

      const post = await this.prismaService.post.findUnique({
        where: { id },
        include: {
          image: true,
          views: true,
          comment: true,
          likes: true,
          author: { include: { image: true } },
        },
      });

      if (!post) {
        throw new HttpException(
          `Post with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prismaService.postViews.create({
        data: {
          user: { connect: { id: post.author.id } },
          post: { connect: { id: id } },
        },
      });
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

  async stats(userId: number, numofDays: number = 28): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

      const currentDate = new Date();

      const startDate = new Date();

      startDate.setDate(startDate.getDate() - (numofDays || 28));

      const totalPosts = await this.prismaService.post.count({
        where: {
          authorId: user.id,
          createdAt: { gte: startDate, lte: currentDate },
        },
      });

      const totalVideos = await this.prismaService.video.count({
        where: {
          userId: user.id,
          createdAt: { gte: startDate, lte: currentDate },
        },
      });

      const totalAudios = await this.prismaService.track.count({
        where: {
          userId: user.id,
          createdAt: { gte: startDate, lte: currentDate },
        },
      });

      const totalPostViews = await this.prismaService.postViews.count({
        where: {
          user: { id: user.id },
          createdAt: { gte: startDate, lte: currentDate },
        },
      });

      const totalVideoViews = await this.prismaService.videoViews.count({
        where: {
          user: { id: user.id },
          createdAt: { gte: startDate, lte: currentDate },
        },
      });

      const totalAudioViews = await this.prismaService.audioTrackViews.count({
        where: {
          user: { id: user.id },
          createdAt: { gte: startDate, lte: currentDate },
        },
      });

      return {
        status: true,
        message: 'Successfully retrieved stats',
        totalPosts,
        totalVideos,
        totalAudios,
        totalPostViews,
        totalVideoViews,
        totalAudioViews,
      };
    } catch (error) {
      console.error('Error retrieving stats:', error);
      throw new Error('Failed to retrieve stats');
    }
  }

  async commentPost(userId: number, id: number, updatePostDto: UpdatePostDto) {
    try {
      if (!id) {
        throw new HttpException(`Post id required`, HttpStatus.BAD_REQUEST);
      }
      const user = await this.usersService.getUserById(userId);
      const post = await this.prismaService.post.findUnique({
        where: { id },
        include: {
          image: true,
          views: true,
          comment: true,
          likes: true,
          author: { include: { image: true } },
        },
      });

      if (!post) {
        throw new HttpException(
          `Post with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const comments = await this.prismaService.comment.create({
        data: {
          content: updatePostDto.comment,
          postId: post.id,
          userId: user.id,
        },
      });

      if (!comments) {
        throw new HttpException(
          `Error creating comment`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return {
        status: 'Success',
        message: 'Comment published successfully',
        data: comments,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while creating comment',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  async likeOrUnlikePost(id: number, userId: number) {
    try {
      const user = await this.usersService.getUserById(userId);

      const post = await this.prismaService.post.findUnique({
        where: { id },
        include: {
          likes: true,
          author: { include: { image: true } },
        },
      });

      if (!post) {
        throw new HttpException(
          `Post with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const userLikedPost = post.likes.some((like) => like.userId === user.id);

      if (userLikedPost) {
        await this.prismaService.like.deleteMany({
          where: { postId: post.id, userId },
        });
        return {
          status: 'Success',
          message: 'Post Unliked',
        };
      } else {
        await this.prismaService.like.create({
          data: {
            postId: post.id,
            userId,
          },
        });
        return {
          status: 'Success',
          message: 'Post Liked',
        };
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while liking post',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }
}
