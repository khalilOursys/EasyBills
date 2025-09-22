import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('register')
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('tel') tel: string,
    @Body('roleId') roleId: number, // Add role here
  ) {
    const user = await this.userService.create(
      name,
      email,
      password,
      tel,
      roleId,
    );
    return this.authService.login(user); // Return JWT after successful registration
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user); // Return JWT after successful login
  }
}
