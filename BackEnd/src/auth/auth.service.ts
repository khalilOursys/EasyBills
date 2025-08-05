import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from 'src/user/entities/user.entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // Validate user credentials during login
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findUserByEmail(email);
    if (
      user &&
      (await this.userService.validatePassword(password, user.password))
    ) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  // Generate JWT token
  async login(user: User) {
    const payload = { email: user.email, id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      id_role: user.role.id,
    };
  }
}
