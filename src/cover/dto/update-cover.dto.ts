import { PartialType } from '@nestjs/mapped-types';
import { CreateCoverDto } from './create-cover.dto';

export class UpdateCoverDto extends PartialType(CreateCoverDto) {}
