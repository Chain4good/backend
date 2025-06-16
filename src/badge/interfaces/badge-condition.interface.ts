import { BadgeType } from '../enum/badge-type.enum';

export interface BadgeCondition {
  type: BadgeType;
  check: (data: any) => Promise<boolean>;
  badgeId: number;
}
