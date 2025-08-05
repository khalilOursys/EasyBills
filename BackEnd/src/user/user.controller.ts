import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  UnauthorizedException,
  Delete,
  Param,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CustomRequest } from 'src/types/expressRequest.interface';
import { RoleService } from 'src/role/role.service';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
  ) {}

  @Post('create')
  async createUser(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('phoneNumber') tel: string,
    @Body('role') roleId: number,
  ) {
    // Validate roleId and other fields if necessary
    return this.userService.createUser(name, email, password, tel, roleId);
  }

  @Get('profile')
  async profile(@Req() req: CustomRequest) {
    const userId = req.user.id;

    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  @Put('update/:userId') // Update user profile
  async updateUser(@Param('userId') userId: number, @Body() body: any) {
    const { name, email, phoneNumber, password, role: roleId } = body;

    if (!name || !email || !phoneNumber) {
      throw new BadRequestException('Missing required fields');
    }
    console.log(roleId);

    // Find the role by roleId
    const role = await this.roleService.findById(roleId);
    if (!role) {
      throw new BadRequestException('Invalid role ID');
    }

    return this.userService.updateUser(userId, {
      name,
      email,
      tel: phoneNumber,
      password,
      role,
    });
  }

  @Get('getAllUser')
  async findAll(@Req() req: CustomRequest) {
    return this.userService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
