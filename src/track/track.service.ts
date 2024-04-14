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
      const { title, description, duration, artistId } = createTrackDto;
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
              duration,
              description,
              audioUrl,
              publicId: publicIds[index],
              artist: { connect: { id: artistId } },
              user: { connect: { id: userId } },
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

  async createVideo(
    userId: number,
    createTrackDto: CreateTrackDto,
    videos: Array<Express.Multer.File>,
  ): Promise<any> {
    try {
      const { title, description, duration, artistId, categories, tags } =
        createTrackDto;
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

      const vid = await Promise.all(
        videoUrls.map(async (videoUrl, index) => {
          return await this.prismaService.video.create({
            data: {
              //title: `${title} ${index + 1}`,
              title: `${title}`,
              duration,
              description,
              categories,
              tags,
              videoUrl,
              publicId: publicIds[index],
              artist: { connect: { id: artistId } },
              user: { connect: { id: userId } },
            },
            include: { artist: true },
          });
        }),
      );

      return {
        status: true,
        message: 'Successfully created video',
        data: vid,
      };
    } catch (error) {
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

  public async findAllAudios(userId: number): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

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

  public async findAllVideos(userId: number): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

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

  public async findVideo(userId: number, id: number): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

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

  public async findAudio(userId: number, id: number): Promise<any> {
    try {
      const user = await this.usersService.getUserById(userId);

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

  update(id: number, updateTrackDto: UpdateTrackDto) {
    return `This action updates a #${id} track`;
  }

  remove(id: number) {
    return `This action removes a #${id} track`;
  }
}
