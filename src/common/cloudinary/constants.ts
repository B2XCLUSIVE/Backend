export const CLOUDINARY = 'Cloudinary';
export const imageFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error, acceptFile: boolean) => void,
) => {
  if (!Boolean(file.mimetype.match(/(jpg|jpeg|png|gif)/)))
    callback(null, false);
  callback(null, true);
};
