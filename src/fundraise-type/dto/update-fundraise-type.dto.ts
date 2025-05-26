import { PartialType } from '@nestjs/mapped-types';
import { CreateFundraiseTypeDto } from './create-fundraise-type.dto';

export class UpdateFundraiseTypeDto extends PartialType(
  CreateFundraiseTypeDto,
) {}
