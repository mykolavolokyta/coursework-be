import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import * as fs from 'fs';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';

const cert = fs.readFileSync(`${__dirname}/../../dev-tt5gpr645vrwql87.pem`);
@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({
      secret: cert,
    }),
  ],
  providers: [JwtStrategy, AuthService],
  exports: [PassportModule, AuthService],
})
export class AuthModule {}
