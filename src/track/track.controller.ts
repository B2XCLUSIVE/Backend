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
} from '@nestjs/common';
import { TrackService } from './track.service';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { CurrentUser, JwtGuard } from 'src/common';
import { User } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('track')
export class TrackController {
  constructor(private readonly trackService: TrackService) {}

  /************************ CREATE AUDIO *****************************/
  @UseGuards(JwtGuard)
  // @Roles('ADMIN', 'EMPLOYEE')
  @Put('createVideo')
  @UseInterceptors(FilesInterceptor('videos'))
  createVideo(
    @CurrentUser() user: User,
    @Body() createTrackDto: CreateTrackDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          //new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
        fileIsRequired: true,
      }),
    )
    videos: Array<Express.Multer.File>,
  ) {
    return this.trackService.createVideo(user.id, createTrackDto, videos);
  }

  /************************ CREATE AUDIO *****************************/
  @UseGuards(JwtGuard)
  // @Roles('ADMIN', 'EMPLOYEE')
  @Put('createAudio')
  @UseInterceptors(FilesInterceptor('audios'))
  createAudio(
    @CurrentUser() user: User,
    @Body() createTrackDto: CreateTrackDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }),
          //new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
        fileIsRequired: false,
      }),
    )
    audios: Array<Express.Multer.File>,
  ) {
    return this.trackService.createAudio(user.id, createTrackDto, audios);
  }

  /************************ GET AUDIOS *****************************/
  @UseGuards(JwtGuard)
  @Get('audios')
  findAllAudios(@CurrentUser() user: User) {
    return this.trackService.findAllAudios(user.id);
  }

  /************************ GET VIDEOS *****************************/
  @UseGuards(JwtGuard)
  @Get('videos')
  findAllVideos(@CurrentUser() user: User) {
    return this.trackService.findAllVideos(user.id);
  }

  /************************ GET VIDEO *****************************/
  @UseGuards(JwtGuard)
  @Get('video/:id')
  findVideo(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trackService.findVideo(user.id, +id);
  }

  /************************ GET AUDIO *****************************/
  @UseGuards(JwtGuard)
  @Get('audio/:id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.trackService.findAudio(user.id, +id);
  }

  /************************ UPDATE AUDIO *****************************/
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTrackDto: UpdateTrackDto) {
    return this.trackService.update(+id, updateTrackDto);
  }

  /************************ DELETE AUDIO *****************************/
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.trackService.remove(+id);
  }
}
