import { Request } from 'express';
import { User } from 'src/user/entities/user.entity/user.entity'; // Assuming this is the correct path to your User entity

export interface CustomRequest extends Request {
  user: User;
}
