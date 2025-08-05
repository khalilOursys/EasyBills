import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity/user.entity'; // Assuming you are using TypeORM and have the User entity
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import { Role } from 'src/role/entities/role.entity';
import { RoleModule } from 'src/role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]), // Import the Pet entity for TypeORM
    forwardRef(() => AuthModule),
    RoleModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Exporting UserService so that it can be used in other modules
})
export class UserModule {}
