import { PartialType } from '@nestjs/mapped-types';
import { UserRegisterDTO } from 'src/auth/dtos/user-register.dto';

export class UpdateUserDto extends PartialType(UserRegisterDTO) {}
