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
  @Put('create')
  create(
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
  @Get('artists')
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
  @UseGuards(JwtGuard)
  @Patch('update/:id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateArtistDto: UpdateArtistDto,
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
    return this.artistService.update(user.id, +id, updateArtistDto, file);
  }

  /************************ DELETE ARTIST *****************************/
  @UseGuards(JwtGuard)
  @Delete('delete/:id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.artistService.remove(user.id, +id);
  }
}
