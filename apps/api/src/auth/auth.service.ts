import { Injectable,UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
@Injectable()
export class AuthService {
 private readonly loginAttempts=new Map<string,{count:number;blockedUntil:number}>();
 constructor(private prisma:PrismaService,private jwt:JwtService,private audit:AuditService){}
 async login(email:string,password:string){
  const key=email.trim().toLowerCase();
  const now=Date.now();
  const state=this.loginAttempts.get(key);
  if(state?.blockedUntil&&state.blockedUntil>now) throw new UnauthorizedException('Слишком много попыток. Повторите вход позже');
  const user=await this.prisma.user.findUnique({where:{email:email.toLowerCase()}});
  if(!user||user.status!=='ACTIVE'||!(await bcrypt.compare(password,user.passwordHash))){
   const next=(state?.blockedUntil&&state.blockedUntil<=now)?1:(state?.count??0)+1;
   this.loginAttempts.set(key,{count:next,blockedUntil:next>=5?now+15*60*1000:0});
   throw new UnauthorizedException('Неверный логин или пароль');
  }
  this.loginAttempts.delete(key);
  return {accessToken:await this.jwt.signAsync({sub:user.id,role:user.role,organizationId:user.organizationId}),user:{id:user.id,email:user.email,firstName:user.firstName,lastName:user.lastName,role:user.role,organizationId:user.organizationId}};
 }
}
