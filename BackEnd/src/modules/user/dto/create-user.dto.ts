import { IsString, IsEmail, IsOptional, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  tel?: string;

  @IsString()
  password: string;

  @IsInt()
  roleId: number;
}
