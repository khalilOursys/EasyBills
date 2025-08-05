import { Controller, Get } from '@nestjs/common';
import { RoleService } from './role.service';
import { Role } from './entities/role.entity';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Get('getAllRoles')
  async getAllRoles(): Promise<Role[]> {
    return this.roleService.findAll();
  }
}
