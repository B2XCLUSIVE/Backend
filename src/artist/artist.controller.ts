import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UploadedFile,
  ParseFilePipeBuilder,
  UseInterceptors,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ArtistService } from './artist.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';
import { CurrentUser, JwtGuard } from 'src/common';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('artist')
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  /************************ CREATE POST *****************************/
  @UseGuards(JwtGuard)
  //@Roles('ADMIN', 'EMPLOYEE')
  @UseInterceptors(FileInterceptor('file'))
  @Put('post')
  createPost(
    @CurrentUser() user: User,
    @Body() createArtistDto: CreateArtistDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 5000000,
        })
        .build({
          fileIsRequired: false,
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.artistService.create(user.id, createArtistDto, file);
  }

  /************************ GET ARTISTS *****************************/
  @UseGuards(JwtGuard)
  @Get('posts')
  findAll(@CurrentUser() user: User) {
    return this.artistService.findAll(user.id);
  }

  /************************ GET ARTIST BY ID *****************************/
  @UseGuards(JwtGuard)
  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.artistService.findOne(user.id, +id);
  }

  /************************ UPDATE ARTIST *****************************/
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArtistDto: UpdateArtistDto) {
    return this.artistService.update(+id, updateArtistDto);
  }

  /************************ DELETE ARTIST *****************************/
  @Delete('delete/:id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.artistService.remove(user.id, +id);
  }
}
