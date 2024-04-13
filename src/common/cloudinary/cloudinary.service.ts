import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse, v2 } from 'cloudinary';
import toStream = require('buffer-to-stream');

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return this.uploadToCloudinary(file, 'image');
  }

  async uploadVideo(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return this.uploadToCloudinary(file, 'video');
  }

  async uploadauto(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return this.uploadToCloudinary(file, 'auto');
  }

  async uploadMedia(
    file: Express.Multer.File,
    resourceType: 'image' | 'video' | 'auto',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return this.uploadToCloudinary(file, resourceType);
  }

  async uploadMedias(
    files: Express.Multer.File[],
    resourceType: 'image' | 'video' | 'auto',
  ): Promise<(UploadApiResponse | UploadApiErrorResponse)[]> {
    const uploadPromises = files?.map((file) =>
      this.uploadToCloudinary(file, resourceType),
    );
    return Promise.all(uploadPromises);
  }

  async deleteResource(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(publicId, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  private uploadToCloudinary(
    file: Express.Multer.File,
    resourceType: 'image' | 'video' | 'auto',
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      console.log(resourceType);
      const uploadOptions: any = { folder: `b2xclusive/${resourceType}` };

      if (resourceType === 'image' && !file.mimetype.startsWith('image')) {
        throw new HttpException(
          'Sorry, this file is not an image, please try again',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else if (
        resourceType === 'video' &&
        !file.mimetype.startsWith('video')
      ) {
        throw new HttpException(
          'Sorry, this file is not a video, please try again',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else if (
        resourceType === 'auto' &&
        !file.mimetype.startsWith('audio')
      ) {
        throw new HttpException(
          'Sorry, this file is not an auto file, please try again',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const upload = v2.uploader.upload_stream(
        { resource_type: resourceType, ...uploadOptions },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        },
      );

      toStream(file.buffer).pipe(upload);
    });
  }
}
