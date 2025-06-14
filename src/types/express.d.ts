import { UserExtract } from '../auth/decorators/auth.decorators';

declare global {
  namespace Express {
    interface Request {
      user?: UserExtract;
    }
  }
}
