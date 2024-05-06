import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CloudinaryService, PrismaService } from 'src/common';
import { UsersService } from 'src/auth/users/users.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TrackService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly logger: Logger,
  ) {}

  async createAudio(
    userId: number,
    createTrackDto: CreateTrackDto,
    audios: Array<Express.Multer.File>,
  ): Promise<any> {
    try {
      const { title, description, duration, artistId, subTitle } =
        createTrackDto;
      const user = await this.usersService.getUserById(userId);
      const artist = await this.prismaService.artist.findUnique({
        where: { id: artistId },
      });

      if (!artist) {
        throw new HttpException('Artist not found', HttpStatus.NOT_FOUND);
      }

      const audioTitle = await this.prismaService.track.findFirst({
        where: { title, artistId },
      });

      if (audioTitle) {
        throw new HttpException(
          'Audio with title already exist',
          HttpStatus.CONFLICT,
        );
      }

      let audioUrls: string[] = [];
      let publicIds: string[] = [];

      if (audios && audios.length > 0) {
        const uploadedAudios = await Promise.all(
          audios.map(async (audio) => {
            const result = await this.cloudinaryService.uploadMedia(
              audio,
              'auto',
            );
            publicIds.push(result.public_id);
            return result.url;
          }),
        );
        audioUrls = uploadedAudios;
      }

      const tracks = await Promise.all(
        audioUrls.map(async (audioUrl, index) => {
          return await this.prismaService.track.create({
            data: {
              title: `${title}`,
              subTitle,
              duration,
              description,
              audioUrl,
              publicId: publicIds[index],
              artist: { connect: { id: artist.id } },
              user: { connect: { id: user.id } },
            },
            include: { artist: true },
          });
        }),
      );

      return {
        status: true,
        message: 'Successfully created tracks',
        data: tracks,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'An error occurred while creating tracks',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  public async findAllAudios(): Promise<any> {
    try {
      //const user = await this.usersService.getUserById(userId);

      const audios = await this.prismaService.track.findMany({
        // where: { authorId: user.id },
        include: {
          artist: { include: { image: true } },
          user: { include: { image: true } },
          //comments: true,
          likes: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        status: 'Success',
        message: 'tracks retrieved successfully',
        data: audios,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while fetching tracks',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  public async findAudio(id: number): Promise<any> {
    try {
      // const user = await this.usersService.getUserById(userId);

      const audio = await this.prismaService.track.findUnique({
        where: { id },
        include: {
          artist: true,
          user: { include: { image: true } },
        },
      });

      if (!audio) {
        throw new HttpException(
          `audio with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prismaService.audioTrackViews.create({
        data: {
          user: { connect: { id: audio.user.id } },
          audio: { connect: { id: id } },
        },
      });

      return {
        status: 'Success',
        message: 'Audio track retrieved successfully',
        data: audio,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while fetching audio',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  async commentAudio(userId: number, id: number, comment: string) {
    try {
      const user = await this.usersService.getUserById(userId);
      if (!comment) {
        throw new HttpException('Comment is required.', HttpStatus.BAD_REQUEST);
      }

      const track = await this.prismaService.track.findUnique({
        where: { id },
      });

      if (!track) {
        throw new HttpException(
          `Track with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const comments = await this.prismaService.comment.create({
        data: {
          content: comment,
          audioId: track.id,
          userId: user.id,
        },
      });

      return {
        status: 'Success',
        message: 'Comment published successfully',
        data: comments,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while creating comment',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  public async updateAudio(
    userId: number,
    trackId: number,
    updateTrackDto: UpdateTrackDto,
    audios?: Array<Express.Multer.File>,
  ): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Get the existing track
      const existingTrack = await this.prismaService.track.findUnique({
        where: { id: trackId },
        include: { artist: true },
      });

      if (!existingTrack) {
        throw new HttpException('Track not found', HttpStatus.NOT_FOUND);
      }

      let audioUrl: string | undefined;
      let publicId: string | undefined;

      if (audios && audios.length > 0) {
        // Delete existing audio if a new one is being uploaded
        if (existingTrack.publicId) {
          await this.cloudinaryService.deleteResource(existingTrack.publicId);
        }

        // Upload new audio files to Cloudinary
        const uploadedAudios = await Promise.all(
          audios.map(async (audio) => {
            const result = await this.cloudinaryService.uploadMedia(
              audio,
              'auto',
            );
            return {
              publicId: result.public_id,
              audioUrl: result.url,
            };
          }),
        );

        // Get the first uploaded audio
        audioUrl = uploadedAudios[0].audioUrl;
        publicId = uploadedAudios[0].publicId;
      }

      // Prepare data for update
      const updateData = {
        ...updateTrackDto,
        audioUrl: audioUrl ?? existingTrack.audioUrl,
        publicId: publicId ?? existingTrack.publicId,
      };

      // Update the track in the database
      const updatedTrack = await this.prismaService.track.update({
        where: { id: trackId },
        data: updateData,
        include: { artist: true },
      });

      return {
        status: 'Success',
        message: 'Audio track updated successfully',
        data: updatedTrack,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'Validation error occurred while updating track',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'An error occurred while updating track',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async removeAudio(userId: number, id: number) {
    try {
      const user = await this.usersService.getUserById(userId);

      const audio = await this.prismaService.track.findUnique({
        where: { id },
      });

      if (!audio) {
        throw new HttpException('audio not found', HttpStatus.NOT_FOUND);
      }

      await this.prismaService.track.delete({
        where: {
          id,
        },
      });

      return {
        status: 'Success',
        message: 'audio deleted successfully',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while deleting audio',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  /***************************************  VIDEO STARTS *****************************************/

  async createVideo(
    userId: number,
    createTrackDto: CreateTrackDto,
    videos: Array<Express.Multer.File>,
    thumbnail?: Express.Multer.File,
  ): Promise<any> {
    try {
      const {
        title,
        description,
        duration,
        artistId,
        categories,
        tags,
        subTitle,
      } = createTrackDto;
      const user = await this.usersService.getUserById(userId);
      const artist = await this.prismaService.artist.findUnique({
        where: { id: artistId },
      });

      if (!artist) {
        throw new HttpException('Artist not found', HttpStatus.NOT_FOUND);
      }

      const vidTitle = await this.prismaService.video.findFirst({
        where: { title, artistId },
      });

      if (vidTitle) {
        throw new HttpException(
          'Video with title already exist',
          HttpStatus.CONFLICT,
        );
      }

      let videoUrls: string[] = [];
      let publicIds: string[] = [];

      if (videos && videos.length > 0) {
        console.log('Yes video');
        const uploadedAudios = await Promise.all(
          videos.map(async (video) => {
            const result = await this.cloudinaryService.uploadMedia(
              video,
              'video',
            );
            publicIds.push(result.public_id);
            return result.url;
          }),
        );
        videoUrls = uploadedAudios;
      }

      let image = null;
      if (thumbnail) {
        console.log('Yes Thubnail');
        const imagesLink = await this.cloudinaryService
          .uploadImage(thumbnail)
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

      const vid = await Promise.all(
        videoUrls.map(async (videoUrl, index) => {
          return await this.prismaService.video.create({
            data: {
              title: `${title}`,
              subTitle,
              duration,
              description,
              categories,
              tags,
              videoUrl,
              thumbnail: image?.id,
              publicId: publicIds[index],
              artist: { connect: { id: artist.id } },
              user: { connect: { id: user.id } },
            },
            include: { artist: true, thumbnail: true },
          });
        }),
      );

      return {
        status: true,
        message: 'Successfully created video',
        data: vid,
      };
    } catch (error) {
      console.log(error);
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          'An error occurred while creating videos',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // Helper function to create thumbnail in the database
  private async createThumbnail(thumbnailData: {
    publicId: string;
    url: string;
  }) {
    const thumbnail = await this.prismaService.image.create({
      data: {
        publicId: thumbnailData.publicId,
        url: thumbnailData.url,
      },
    });
    return thumbnail.id;
  }

  public async findAllVideos(): Promise<any> {
    try {
      // const user = await this.usersService.getUserById(userId);

      const videos = await this.prismaService.video.findMany({
        // where: { authorId: user.id },
        include: {
          artist: { include: { image: true } },
          user: { include: { image: true } },
          comments: true,
          likes: true,
          views: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        status: 'Success',
        message: 'tracks retrieved successfully',
        data: videos,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while fetching videos',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  public async findVideo(id: number): Promise<any> {
    try {
      //const user = await this.usersService.getUserById(userId);

      const video = await this.prismaService.video.findUnique({
        where: { id },
        include: {
          artist: true,
          comments: true,
          likes: true,
          views: true,
          user: { include: { image: true } },
        },
      });

      if (!video) {
        throw new HttpException(
          `video with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prismaService.videoViews.create({
        data: {
          user: { connect: { id: video.user.id } },
          video: { connect: { id: id } },
        },
      });
      return {
        status: 'Success',
        message: 'Video retrieved successfully',
        data: video,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while fetching video',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  async commentVideo(userId: number, id: number, comment: string) {
    try {
      const user = await this.usersService.getUserById(userId);
      if (!comment) {
        throw new HttpException('Comment is required.', HttpStatus.BAD_REQUEST);
      }

      const video = await this.prismaService.video.findUnique({
        where: { id },
      });

      if (!video) {
        throw new HttpException(
          `Video with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const comments = await this.prismaService.comment.create({
        data: {
          content: comment,
          videoId: video.id,
          userId: user.id,
        },
      });

      return {
        status: 'Success',
        message: 'Comment published successfully',
        data: comments,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while creating comment',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  async likeOrUnlikeVideo(id: number, userId: number) {
    try {
      const user = await this.usersService.getUserById(userId);

      const video = await this.prismaService.video.findUnique({
        where: { id },
        include: {
          likes: true,
        },
      });

      if (!video) {
        throw new HttpException(
          `video with id ${id} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const userLikedvideo = video.likes.some(
        (like) => like.userId === user.id,
      );

      if (userLikedvideo) {
        await this.prismaService.like.deleteMany({
          where: { videoId: video.id, userId },
        });
        return {
          status: 'Success',
          message: 'Video Unliked',
        };
      } else {
        await this.prismaService.like.create({
          data: {
            videoId: video.id,
            userId,
          },
        });
        return {
          status: 'Success',
          message: 'Video Liked',
        };
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while liking video',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  async removeVid(userId: number, id: number) {
    try {
      const user = await this.usersService.getUserById(userId);

      const video = await this.prismaService.video.findUnique({
        where: { id },
      });

      if (!video) {
        throw new HttpException('video not found', HttpStatus.NOT_FOUND);
      }

      await this.prismaService.video.delete({
        where: {
          id,
        },
      });

      return {
        status: 'Success',
        message: 'video deleted successfully',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'An error occurred while deleting video',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  public async updateVideo(
    userId: number,
    id: number,
    updateTrackDto: UpdateTrackDto,
    videos?: Array<Express.Multer.File>,
    thumbnail?: Express.Multer.File,
  ) {
    try {
      const user = await this.usersService.getUserById(userId);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const existingVideo = await this.prismaService.video.findUnique({
        where: { id },
        include: { thumbnail: true },
      });

      if (!existingVideo) {
        throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
      }

      let newVideoUrl: string | undefined;
      let newPublicId: string | undefined;

      if (videos && videos.length > 0) {
        // Delete the existing video if updating with new ones
        if (existingVideo.publicId) {
          await this.cloudinaryService.deleteResource(existingVideo.publicId);
        }

        const uploadedVideos = await Promise.all(
          videos.map(async (video) => {
            const result = await this.cloudinaryService.uploadMedia(
              video,
              'video',
            );
            return {
              publicId: result.public_id,
              videoUrl: result.url,
            };
          }),
        );

        newVideoUrl = uploadedVideos[0].videoUrl;
        newPublicId = uploadedVideos[0].publicId;
      }

      // Handle thumbnail update
      let image = existingVideo.thumbnail;

      if (thumbnail) {
        if (existingVideo.thumbnail) {
          await this.cloudinaryService.deleteResource(
            existingVideo.thumbnail.publicId,
          );
        }

        const imagesLink = await this.cloudinaryService.uploadImage(thumbnail);
        if (existingVideo.thumbnail) {
          image = await this.prismaService.image.update({
            where: { id: existingVideo.thumbnail.id },
            data: {
              publicId: imagesLink.public_id,
              url: imagesLink.url,
            },
          });
        } else {
          image = await this.prismaService.image.create({
            data: {
              publicId: imagesLink.public_id,
              url: imagesLink.url,
            },
          });
        }
      }

      // Update data object with correct field names
      const updateData = {
        ...updateTrackDto,
        videoUrl: newVideoUrl,
        publicId: newPublicId,
        imageId: image?.id,
      };

      const updatedVideo = await this.prismaService.video.update({
        where: { id },
        data: updateData,
        include: { thumbnail: true },
      });

      return {
        status: 'Success',
        message: 'Video updated successfully',
        data: updatedVideo,
      };
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else if (error instanceof Prisma.PrismaClientValidationError) {
        throw new HttpException(
          'Validation error occurred while updating video',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'An error occurred while updating video',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
