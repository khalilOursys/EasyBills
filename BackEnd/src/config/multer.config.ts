import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads';

      // Check if the uploads directory exists, if not create it
      fs.access(uploadPath, fs.constants.F_OK, (err) => {
        if (err) {
          fs.mkdir(uploadPath, { recursive: true }, (mkdirErr) => {
            if (mkdirErr) {
              return cb(mkdirErr, uploadPath); // Handle error
            }
            cb(null, uploadPath); // Directory created successfully
          });
        } else {
          cb(null, uploadPath); // Directory exists
        }
      });
    },
    filename: (req, file, cb) => {
      const uniqueSuffix =
        Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      cb(null, uniqueSuffix + extname(file.originalname)); // Use original extension
    },
  }),
};
