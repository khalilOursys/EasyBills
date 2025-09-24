import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { PaginationSearchDto } from 'src/common/dto/pagination-search.dto';

@Controller('role')
export class RoleController {
  constructor(private readonly service: RoleService) {}

  @Post('addNewRole')
  create(@Body() data: CreateRoleDto) {
    return this.service.create(data);
  }

  @Get('findAll')
  findAllWithoutPaginationAndSearch(@Query() dto: PaginationSearchDto) {
    return this.service.findAll(dto);
  }

  @Get('findAllWithPaginationAndSearch')
  findAllWithPaginationAndSearch(@Query() dto: PaginationSearchDto) {
    return this.service.findAllWithPaginationAndSearch(dto);
  }

  @Get('findById/:id')
  findById(@Param('id') id: string) {
    return this.service.findById(+id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() data: CreateRoleDto) {
    return this.service.update(+id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }

  @Patch('restore/:id')
  restore(@Param('id') id: string) {
    return this.service.restore(+id);
  }
}
