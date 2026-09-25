import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [JwtModule.registerAsync({
    useFactory: () => {
      const secret = process.env.JWT_SECRET;
      if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be set and contain at least 32 characters');
      return { secret, signOptions: { expiresIn: '8h' } };
    },
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
