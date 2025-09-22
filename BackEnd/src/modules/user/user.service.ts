import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { PaginationSearchDto } from 'src/common/dto/pagination-search.dto';
import { findAllWithSearchAndCriteria ,findAll} from 'src/common/helpers/find-all.helper';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(
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

  async findAll(dto :PaginationSearchDto) {
    const users = await this.prisma.safeExecute(
      findAll('user',dto)
    );
    return this.prisma.successResponse(users);
  }

  async findAllWithPaginationAndSearch(dto: PaginationSearchDto) {
    const users = await this.prisma.safeExecute(
      findAllWithSearchAndCriteria('user', dto, ['name', 'email']),
    );

    return this.prisma.successResponse(users);
  }

  async findById(id: number) {
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

   //Soft delete
  async remove(id: number) {
    await this.prisma.safeExecute(
      this.prisma.user.update({
        where: { id },
        data: { isDeleted: true },
      }),
    );
    return this.prisma.successResponse({ message: 'Role soft deleted' });
  }

  //Restore soft deleted company
  async restore(id: number) {
    await this.prisma.safeExecute(
      this.prisma.user.update({
        where: { id },
        data: { isDeleted: false },
      }),
    );
    return this.prisma.successResponse({ message: 'Role restored' });
  }
}
