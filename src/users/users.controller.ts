import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('name') name: string,
    @Query('email') email: string,
    @Query('role') role: string,
  ) {
    return this.userService.findAll(page, limit, name, email, role);
  }

  @Patch(':id')
  update(@Body() updateUserDto: UpdateUserDto, @Param('id') id: string) {
    return this.userService.update(+id, updateUserDto);
  }

  @Get('role/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAllByRole(@Param('id') id: number) {
    return this.userService.findAllByRole(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
