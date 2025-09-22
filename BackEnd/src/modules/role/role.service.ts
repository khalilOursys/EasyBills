import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  findAllWithSearchAndCriteria,
  findAll,
} from 'src/common/helpers/find-all.helper';
import { PaginationSearchDto } from 'src/common/dto/pagination-search.dto';
@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.prisma.safeExecute(
      this.prisma.role.create({ data: createRoleDto }),
    );
    return this.prisma.successResponse(role);
  }

  async findAll(dto: PaginationSearchDto) {
    const roles = await this.prisma.safeExecute(findAll('role', dto));
    return this.prisma.successResponse(roles);
  }

  async findAllWithPaginationAndSearch(dto: PaginationSearchDto) {
    const companies = await this.prisma.safeExecute(
      findAllWithSearchAndCriteria('role', dto, ['name']),
    );

    return this.prisma.successResponse(companies);
  }

  async findById(id: number) {
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

 
  //Soft delete
  async remove(id: number) {
    await this.prisma.safeExecute(
      this.prisma.role.update({
        where: { id },
        data: { isDeleted: true },
      }),
    );
    return this.prisma.successResponse({ message: 'Role soft deleted' });
  }

  //Restore soft deleted company
  async restore(id: number) {
    await this.prisma.safeExecute(
      this.prisma.role.update({
        where: { id },
        data: { isDeleted: false },
      }),
    );
    return this.prisma.successResponse({ message: 'Role restored' });
  }
}
