import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get('')
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
  findAllByRole(@Param('id') id: number) {
    return this.userService.findAllByRole(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(+id);
  }
}
