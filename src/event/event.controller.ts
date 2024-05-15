import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  UseInterceptors,
  UploadedFiles,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto, OrganisersDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUser, JwtGuard } from 'src/common';
import { User } from '@prisma/client';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /************************ CREATE EVENT *****************************/
  @UseGuards(JwtGuard)
  // @Roles('ADMIN', 'EMPLOYEE')
  @Put('create')
  @UseInterceptors(FilesInterceptor('files', 1))
  create(
    @CurrentUser() user: User,
    @Body() createEventDto: CreateEventDto,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          //new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
        fileIsRequired: false,
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return this.eventService.create(user.id, createEventDto, files);
  }

  /************************ CREATE ORGANISER *****************************/
  @UseGuards(JwtGuard)
  // @Roles('ADMIN', 'EMPLOYEE')
  @Put('organiser/create')
  @UseInterceptors(FileInterceptor('file'))
  organiser(
    @CurrentUser() user: User,
    @Body() organisersDto: OrganisersDto,
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
    return this.eventService.organiser(user.id, organisersDto, file);
  }

  /************************ GET EVENTS *****************************/
  @Get('events')
  findAll() {
    return this.eventService.findAll();
  }

  /************************ GET ORGANISERS *****************************/
  @Get('organisers')
  findAllOrganisers() {
    return this.eventService.findAllOrganisers();
  }

  /************************ GET EVENT BY ID *****************************/
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  /************************ UPDATE EVENT *****************************/
  @UseGuards(JwtGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(id, updateEventDto);
  }

  /************************ DELETE EVENT *****************************/
  @UseGuards(JwtGuard)
  @Delete('delete/:id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.eventService.remove(user.id, id);
  }
}
