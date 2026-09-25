import { Injectable,UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AuthService {
 constructor(private prisma:PrismaService,private jwt:JwtService){}
 async login(email:string,password:string){
  const user=await this.prisma.user.findUnique({where:{email:email.toLowerCase()}});
  if(!user||user.status!=='ACTIVE'||!(await bcrypt.compare(password,user.passwordHash))) throw new UnauthorizedException('Неверный логин или пароль');
  return {accessToken:await this.jwt.signAsync({sub:user.id,role:user.role,organizationId:user.organizationId}),user:{id:user.id,email:user.email,firstName:user.firstName,lastName:user.lastName,role:user.role,organizationId:user.organizationId}};
 }
}
