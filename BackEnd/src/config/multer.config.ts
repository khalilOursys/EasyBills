import { diskStorage } from 'multer';
import { extname } from 'path';

export const companyLogoMulter = {
  storage: diskStorage({
    destination: './uploads/company',
    filename: (req, file, cb) => {
      const name = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, name + extname(file.originalname));
    },
  }),
};
