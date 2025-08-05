import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role } from './entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Role])], // Register Role entity here
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService], // Exporting RoleService so that it can be used in other modules
})
export class RoleModule {}
