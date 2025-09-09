import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(
    name: string,
    email: string,
    password: string,
    tel: string,
    roleId: number,
  ) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new HttpException(`Email already exists`, HttpStatus.CONFLICT);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.prisma.safeExecute(
      this.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          tel,
          roleId,
        },
      }),
    );
    return this.prisma.successResponse(newUser);
  }

  async findAll() {
    const users = await this.prisma.safeExecute(
      this.prisma.user.findMany({
        include: { role: true },
      }),
    );
    return this.prisma.successResponse(users);
  }

  async findOne(id: number) {
    const user = await this.prisma.safeExecute(
      this.prisma.user.findUniqueOrThrow({ where: { id } }),
    );
    console;
    return this.prisma.successResponse(user);
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async validatePassword(
    newPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(newPassword, hashedPassword);
  }

  /*   async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.safeExecute(
       // If email is unchanged, remove it from the update object
   this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      }),
    );
    return this.prisma.successResponse(user);
  } */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    //Password handling
    if (updateUserDto.password == '') {
      delete updateUserDto.password;
    } else {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    // If email is unchanged, remove it from the update object
    if (updateUserDto.email === existingUser.email) {
      delete updateUserDto.email;
    }

    const user = await this.prisma.safeExecute(
      this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      }),
    );

    return this.prisma.successResponse(user);
  }

  async remove(id: number) {
    await this.prisma.safeExecute(this.prisma.user.delete({ where: { id } }));
    return this.prisma.successResponse({ message: 'user deleted' });
  }
}
