import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.prisma.safeExecute(
      this.prisma.role.create({ data: createRoleDto }),
    );
    return this.prisma.successResponse(role);
  }

  async findAll() {
    const roles = await this.prisma.safeExecute(this.prisma.role.findMany());
    return this.prisma.successResponse(roles);
  }

  async findOne(id: number) {
    const role = await this.prisma.safeExecute(
      this.prisma.role.findUniqueOrThrow({ where: { id } }),
    );
    console;
    return this.prisma.successResponse(role);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.safeExecute(
      this.prisma.role.update({
        where: { id },
        data: updateRoleDto,
      }),
    );
    return this.prisma.successResponse(role);
  }

  async remove(id: number) {
    await this.prisma.safeExecute(this.prisma.role.delete({ where: { id } }));
    return this.prisma.successResponse({ message: 'Role deleted' });
  }
}
