import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || '',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || '',
      callbackURL: configService.get<string>('FRONTEND_URL') || '',
      profileFields: ['id', 'emails', 'name', 'photos'],
      scope: ['email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    try {
      const { emails, photos, name } = profile;
      const user = {
        email: emails?.[0]?.value || '',
        name: `${name?.givenName || ''} ${name?.familyName || ''}`,
        image: photos?.[0]?.value || '',
        facebookAccessToken: accessToken,
      };

      const result = await this.authService.validateFacebookUser(user);
      done(null, result);
    } catch (error) {
      done(error, null);
    }
  }
}
