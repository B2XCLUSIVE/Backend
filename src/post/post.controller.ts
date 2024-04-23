import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  Put,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CurrentUser, JwtGuard } from 'src/common';
import { User } from '@prisma/client';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  /************************ CREATE POST *****************************/
  @UseGuards(JwtGuard)
  // @Roles('ADMIN', 'EMPLOYEE')
  @Put('create')
  @UseInterceptors(FilesInterceptor('files'))
  create(
    @CurrentUser() user: User,
    @Body() createPostDto: CreatePostDto,
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
    return this.postService.create(user.id, createPostDto, files);
  }

  /************************ GET POSTS *****************************/
  //@UseGuards(JwtGuard)
  @Get('posts')
  findAll(@CurrentUser() user: User) {
    return this.postService.findAll(user.id);
  }

  /************************ COMMENT POST *****************************/
  @UseGuards(JwtGuard)
  @Put('comment/:postId')
  commentPost(
    @CurrentUser() user: User,
    @Param('postId') postId: number,
    @Body() comment: UpdatePostDto,
  ) {
    return this.postService.commentPost(user.id, postId, comment);
  }

  /************************ LIKE POST *****************************/
  @UseGuards(JwtGuard)
  @Put(':postId/like')
  likeOrUnlikePost(@CurrentUser() user: User, @Param('postId') postId: number) {
    return this.postService.likeOrUnlikePost(postId, user.id);
  }

  /************************ GET STATS *****************************/
  @UseGuards(JwtGuard)
  @Get('stats')
  async stats(
    @CurrentUser() user: User,
    @Query('numofDays') numofDays?: string,
  ) {
    try {
      const days = numofDays ? parseInt(numofDays) : 28;

      return this.postService.stats(user.id, days);
    } catch (error) {
      console.error('Error retrieving stats:', error);
      throw new Error('Failed to retrieve stats');
    }
  }

  /************************ GET POST BY ID *****************************/
  //@UseGuards(JwtGuard)
  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.postService.findOne(user.id, +id);
  }

  /************************ UPDATE post *****************************/
  @UseGuards(JwtGuard)
  @Patch('update/:id')
  @UseInterceptors(FilesInterceptor('files'))
  update(
    @CurrentUser() user: User,
    @Body() updatePostDto: UpdatePostDto,
    @Param('id') id: string,
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
    return this.postService.update(user.id, +id, updatePostDto, files);
  }

  /************************ DELETE POST *****************************/
  @UseGuards(JwtGuard)
  @Delete('delete/:id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.postService.remove(user.id, +id);
  }
}
