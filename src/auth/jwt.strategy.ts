import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as fs from 'fs';
import { ExtractJwt, Strategy } from 'passport-jwt';

const cert = fs.readFileSync(`${__dirname}/../../dev-tt5gpr645vrwql87.pem`);
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: cert,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
