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
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { CurrentUser, JwtGuard } from 'src/common';
import { User } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  /************************ CREATE EVENT *****************************/
  @UseGuards(JwtGuard)
  // @Roles('ADMIN', 'EMPLOYEE')
  @Put('create')
  @UseInterceptors(FilesInterceptor('files'))
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

  /************************ GET EVENTS *****************************/
  @Get('events')
  findAll() {
    return this.eventService.findAll();
  }

  /************************ GET EVENT BY ID *****************************/
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }

  /************************ UPDATE ARTIST *****************************/
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(+id, updateEventDto);
  }

  /************************ DELETE ARTIST *****************************/
  @Delete('delete/:id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.eventService.remove(user.id, +id);
  }
}
