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
  createVideo(
    @CurrentUser() user: User,
    @Body() createTrackDto: CreateTrackDto,
    @UploadedFiles(
      new ParseFilePipe({
        //validators: [new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    files: {
      videos?: Express.Multer.File[];
      thumbnail?: Express.Multer.File;
    },
  ) {
    const { videos, thumbnail } = files;

    return this.trackService.createVideo(
      user.id,
      createTrackDto,
      videos,
      thumbnail[0],
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
  createAudio(
    @CurrentUser() user: User,
    @Body() createTrackDto: CreateTrackDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          //new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          //new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
        fileIsRequired: true,
      }),
    )
    files: {
      audios?: Express.Multer.File[];
      thumbnail?: Express.Multer.File;
    },
  ) {
    const { audios, thumbnail } = files;

    return this.trackService.createAudio(
      user.id,
      createTrackDto,
      audios,
      thumbnail[0],
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
    return this.trackService.findVideo(+id);
  }

  /************************ DELETE Video *****************************/
  @UseGuards(JwtGuard)
  @Delete('video/delete/:id')
  removeVid(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trackService.removeVid(user.id, +id);
  }

  /************************ GET AUDIO *****************************/
  // @UseGuards(JwtGuard)
  @Get('audio/:id')
  findOne(@Param('id') id: string) {
    return this.trackService.findAudio(+id);
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
  updateAudio(
    @CurrentUser() user: User,
    @Body() updateTrackDto: UpdateTrackDto,
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          //new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          //new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
        fileIsRequired: false,
      }),
    )
    files: {
      audios?: Express.Multer.File[];
      thumbnail?: Express.Multer.File;
    },
  ) {
    const { audios, thumbnail } = files;

    return this.trackService.updateAudio(
      user.id,
      +id,
      updateTrackDto,
      audios,
      thumbnail[0],
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
  updateVideo(
    @CurrentUser() user: User,
    @Body() updateTrackDto: UpdateTrackDto,
    @Param('id') id: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          //new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          //new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
        fileIsRequired: false,
      }),
    )
    files: {
      videos?: Express.Multer.File[];
      thumbnail?: Express.Multer.File;
    },
  ) {
    const { videos, thumbnail } = files;

    return this.trackService.updateVideo(
      user.id,
      +id,
      updateTrackDto,
      videos,
      thumbnail[0],
    );
  }
}
