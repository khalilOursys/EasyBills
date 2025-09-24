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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationSearchDto } from 'src/common/dto/pagination-search.dto';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Post('addNewUser')
  create(@Body() createUserDto: CreateUserDto) {
    return this.service.create(
      createUserDto.name,
      createUserDto.email,
      createUserDto.password,
      createUserDto.tel,
      createUserDto.roleId,
    );
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
  update(@Param('id') id: string, @Body() data: CreateUserDto) {
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
