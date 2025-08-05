import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RoleService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async onModuleInit() {
    const roles = await this.roleRepository.find();
    if (roles.length === 0) {
      await this.roleRepository.save([
        { id: 1, name: 'Admin' },
        { id: 2, name: 'User' },
      ]);
    }
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find();
  }

  async findById(roleId: number): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }
    return role;
  }
}
