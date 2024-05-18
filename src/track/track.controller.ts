import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  Put,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFiles,
  UploadedFile,
  FileTypeValidator,
} from '@nestjs/common';
import { TrackService } from './track.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CurrentUser, JwtGuard } from 'src/common';
import { User } from '@prisma/client';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  /************************ CREATE VIDEO *****************************/
  @UseGuards(JwtGuard)
  // @Roles('ADMIN', 'EMPLOYEE')
  @Put('createVideo')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'videos', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async createVideo(
    @CurrentUser() user: User,
    @Body() createTrackDto: CreateTrackDto,
    @UploadedFiles()
    files: {
      videos?: Express.Multer.File[];
      thumbnail?: Express.Multer.File;
    },
  ) {
    const { videos, thumbnail } = files;

    // Validating 'videos' file if it exists
    if (videos && videos.length > 0) {
      const videoFile = videos[0];

      const videoValidationPipe = new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 15 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /video\/.*/ }),
        ],
        fileIsRequired: true,
      });

      await videoValidationPipe.transform(videoFile);
    }

    if (thumbnail) {
      const thumbnailFile = thumbnail[0];
      const thumbnailValidationPipe = new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
          new FileTypeValidator({
            fileType: /(image\/jpeg|image\/png|image\/jpg|image\/gif)/,
          }),
        ],
        fileIsRequired: true,
      });
      await thumbnailValidationPipe.transform(thumbnailFile);
    }

    return this.trackService.createVideo(
      user.id,
      createTrackDto,
      videos,
      thumbnail ? thumbnail[0] : null,
    );
  }

  /************************ CREATE AUDIO *****************************/
  @UseGuards(JwtGuard)
  // @Roles('ADMIN', 'EMPLOYEE')
  @Put('createAudio')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audios', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async createAudio(
    @CurrentUser() user: User,
    @Body() createTrackDto: CreateTrackDto,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: true,
      }),
    )
    files: {
      audios?: Express.Multer.File[];
      thumbnail?: Express.Multer.File;
    },
  ) {
    const { audios, thumbnail } = files;

    if (audios && audios.length > 0) {
      const videoFile = audios[0];

      const videoValidationPipe = new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 15 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /audio\/.*/ }),
        ],
        fileIsRequired: true,
      });

      await videoValidationPipe.transform(videoFile);
    }

    if (thumbnail) {
      const thumbnailFile = thumbnail[0];
      const thumbnailValidationPipe = new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
          new FileTypeValidator({
            fileType: /(image\/jpeg|image\/png|image\/jpg|image\/gif)/,
          }),
        ],
        fileIsRequired: false,
      });
      await thumbnailValidationPipe.transform(thumbnailFile);
    }

    return this.trackService.createAudio(
      user.id,
      createTrackDto,
      audios,
      thumbnail ? thumbnail[0] : null,
    );
  }

  /************************ GET AUDIOS *****************************/
  //@UseGuards(JwtGuard)
  @Get('audios')
  findAllAudios() {
    return this.trackService.findAllAudios();
  }

  /************************ GET VIDEOS *****************************/

  @Get('videos')
  findAllVideos() {
    return this.trackService.findAllVideos();
  }

  /************************ GET VIDEO *****************************/
  // @UseGuards(JwtGuard)
  @Get('video/:id')
  findVideo(@Param('id') id: string) {
    console.log(id);
    return this.trackService.findVideo(id);
  }

  /************************ DELETE Video *****************************/
  @UseGuards(JwtGuard)
  @Delete('video/delete/:id')
  removeVid(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trackService.removeVid(user.id, id);
  }

  /************************ GET AUDIO *****************************/
  // @UseGuards(JwtGuard)
  @Get('audio/:id')
  findOne(@Param('id') id: string) {
    console.log(id);
    return this.trackService.findAudio(id);
  }

  /************************ UPDATE AUDIO *****************************/

  @UseGuards(JwtGuard)
  @Patch('audio/update/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audios', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async updateAudio(
    @CurrentUser() user: User,
    @Body() updateTrackDto: UpdateTrackDto,
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    files: {
      audios?: Express.Multer.File[];
      thumbnail?: Express.Multer.File;
    },
  ) {
    const { audios, thumbnail } = files;

    if (audios && audios.length > 0) {
      const videoFile = audios[0];

      const videoValidationPipe = new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 15 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /audio\/.*/ }),
        ],
      });

      await videoValidationPipe.transform(videoFile);
    }

    if (thumbnail) {
      const thumbnailFile = thumbnail[0];
      const thumbnailValidationPipe = new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
          new FileTypeValidator({
            fileType: /(image\/jpeg|image\/png|image\/jpg|image\/gif)/,
          }),
        ],
      });
      await thumbnailValidationPipe.transform(thumbnailFile);
    }

    return this.trackService.updateAudio(
      user.id,
      +id,
      updateTrackDto,
      audios ? audios : null,
      thumbnail ? thumbnail[0] : null,
    );
  }

  /************************ DELETE AUDIO *****************************/
  @UseGuards(JwtGuard)
  @Delete('audio/delete/:id')
  removeAudio(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trackService.removeAudio(user.id, +id);
  }

  /************************ COMMENT VIDEO *****************************/
  @UseGuards(JwtGuard)
  @Put('video/:videoId/comment')
  commentPost(
    @CurrentUser() user: User,
    @Param('videoId') videoId: number,
    @Body('comment') comment: string,
  ) {
    return this.trackService.commentVideo(user.id, videoId, comment);
  }

  /************************ LIKE VIDEO *****************************/
  @UseGuards(JwtGuard)
  @Put('video/:videoId/like')
  likeOrUnlikePost(
    @CurrentUser() user: User,
    @Param('videoId') videoId: number,
  ) {
    return this.trackService.likeOrUnlikeVideo(videoId, user.id);
  }

  /************************ COMMENT AUDIO *****************************/
  @UseGuards(JwtGuard)
  @Get('audio/comment')
  commentAudio(
    @CurrentUser() user: User,
    @Param('audioId') audioId: number,
    comment: string,
  ) {
    return this.trackService.commentAudio(user.id, audioId, comment);
  }

  /************************ UPDATE VIDEO *****************************/
  @UseGuards(JwtGuard)
  @Patch('video/update/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'videos', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
    ]),
  )
  async updateVideo(
    @CurrentUser() user: User,
    @Body() updateTrackDto: UpdateTrackDto,
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    files: {
      videos?: Express.Multer.File[];
      thumbnail?: Express.Multer.File;
    },
  ) {
    const { videos, thumbnail } = files;
    // Validating 'videos' file if it exists
    if (videos && videos.length > 0) {
      const videoFile = videos[0];

      const videoValidationPipe = new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 15 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /video\/.*/ }),
        ],
      });

      await videoValidationPipe.transform(videoFile);
    }

    if (thumbnail) {
      const thumbnailFile = thumbnail[0];
      const thumbnailValidationPipe = new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5 MB
          new FileTypeValidator({
            fileType: /(image\/jpeg|image\/png|image\/jpg|image\/gif)/,
          }),
        ],
      });
      await thumbnailValidationPipe.transform(thumbnailFile);
    }

    return this.trackService.updateVideo(
      user.id,
      id,
      updateTrackDto,
      videos ? videos : null,
      thumbnail ? thumbnail[0] : null,
    );
  }
}
