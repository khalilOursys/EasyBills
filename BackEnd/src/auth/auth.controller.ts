import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { log } from 'console';

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
    @Body('role') roleId: number, // Add role here
  ) {
    const user = await this.userService.createUser(
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
    console.log(email, password);

    const user = await this.authService.validateUser(email, password);
    return this.authService.login(user); // Return JWT after successful login
  }
}
