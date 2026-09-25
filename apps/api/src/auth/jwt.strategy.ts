import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt,Strategy } from 'passport-jwt';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
 constructor(){
  const secret=process.env.JWT_SECRET;
  if(!secret||secret.length<32) throw new Error('JWT_SECRET must be set and contain at least 32 characters');
  super({jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),ignoreExpiration:false,secretOrKey:secret});
 }
 validate(payload:any){return {id:payload.sub,role:payload.role,organizationId:payload.organizationId};}
}
