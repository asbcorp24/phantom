import { Injectable,UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
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
  if((user.role==='COMPANY_ADMIN'||user.role==='PLATFORM_OWNER')&&user.twoFactorEnabled){
   return {requiresTwoFactor:true,challengeToken:await this.jwt.signAsync({sub:user.id,purpose:'2fa'},{expiresIn:'5m'})};
  }
  await this.audit.write(user.id,user.organizationId,'LOGIN','User',user.id);
  return {accessToken:await this.jwt.signAsync({sub:user.id,role:user.role,organizationId:user.organizationId}),user:{id:user.id,email:user.email,firstName:user.firstName,lastName:user.lastName,role:user.role,organizationId:user.organizationId}};
 }
 async setupTwoFactor(userId:string){
  const user=await this.prisma.user.findUnique({where:{id:userId}});
  if(!user)throw new UnauthorizedException();
  const secret=authenticator.generateSecret();
  await this.prisma.user.update({where:{id:userId},data:{twoFactorPendingSecret:secret}});
  return {secret,otpauth:authenticator.keyuri(user.email,'PHANTOM',secret)};
 }
 async enableTwoFactor(userId:string,code:string){
  const user=await this.prisma.user.findUnique({where:{id:userId}});
  if(!user?.twoFactorPendingSecret||!authenticator.check(code,user.twoFactorPendingSecret))throw new UnauthorizedException('Неверный код подтверждения');
  await this.prisma.user.update({where:{id:userId},data:{twoFactorSecret:user.twoFactorPendingSecret,twoFactorPendingSecret:null,twoFactorEnabled:true}});
  await this.audit.write(user.id,user.organizationId,'2FA_ENABLED','User',user.id);
  return {enabled:true};
 }

 async verifyTwoFactor(challengeToken:string,code:string){
  let payload:any;
  try{payload=await this.jwt.verifyAsync(challengeToken);}catch{throw new UnauthorizedException('Сессия подтверждения истекла');}
  if(payload.purpose!=='2fa')throw new UnauthorizedException();
  const user=await this.prisma.user.findUnique({where:{id:payload.sub}});
  if(!user?.twoFactorEnabled||!user.twoFactorSecret||!authenticator.check(code,user.twoFactorSecret))throw new UnauthorizedException('Неверный код');
  await this.audit.write(user.id,user.organizationId,'LOGIN_2FA','User',user.id);
  return {accessToken:await this.jwt.signAsync({sub:user.id,role:user.role,organizationId:user.organizationId}),user:{id:user.id,email:user.email,firstName:user.firstName,lastName:user.lastName,role:user.role,organizationId:user.organizationId}};
 }

}
