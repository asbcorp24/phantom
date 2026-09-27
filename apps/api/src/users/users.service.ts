import { BadRequestException,ConflictException,Injectable } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
 constructor(private readonly prisma:PrismaService,private readonly audit:AuditService){}

 findByOrganization(organizationId:string){
  return this.prisma.user.findMany({
   where:{organizationId},
   select:{id:true,email:true,firstName:true,lastName:true,middleName:true,position:true,role:true,status:true,departmentId:true,createdAt:true},
   orderBy:[{lastName:'asc'},{firstName:'asc'}]
  });
 }

 async create(organizationId:string,dto:CreateUserDto,actorId?:string){
  if(dto.role===UserRole.PLATFORM_OWNER) throw new BadRequestException('Нельзя создать владельца платформы из админки компании');
  const exists=await this.prisma.user.findUnique({where:{email:dto.email.toLowerCase()}});
  if(exists) throw new ConflictException('Пользователь с таким e-mail уже существует');
  if(dto.departmentId){
   const department=await this.prisma.department.findFirst({where:{id:dto.departmentId,organizationId}});
   if(!department) throw new BadRequestException('Подразделение не принадлежит вашей организации');
  }
  const created=await this.prisma.user.create({
   data:{organizationId,email:dto.email.toLowerCase(),passwordHash:await bcrypt.hash(dto.password,12),firstName:dto.firstName,lastName:dto.lastName,middleName:dto.middleName,position:dto.position,departmentId:dto.departmentId,role:dto.role},
   select:{id:true,email:true,firstName:true,lastName:true,role:true,status:true,departmentId:true}
  });
  await this.audit.write(actorId??null,organizationId,'USER_CREATED','User',created.id,'SUCCESS',{role:created.role});
  return created;
 }
 async update(organizationId:string,id:string,dto:UpdateUserDto,actorId:string){
  const user=await this.prisma.user.findFirst({where:{id,organizationId}});
  if(!user)throw new BadRequestException('Пользователь не найден');
  if(dto.role===UserRole.PLATFORM_OWNER)throw new BadRequestException('Роль владельца платформы недоступна администратору компании');
  if(dto.departmentId&&!await this.prisma.department.findFirst({where:{id:dto.departmentId,organizationId}}))throw new BadRequestException('Подразделение не принадлежит вашей организации');
  const updated=await this.prisma.user.update({where:{id},data:dto,select:{id:true,email:true,firstName:true,lastName:true,role:true,status:true,departmentId:true}});
  await this.audit.write(actorId,organizationId,'USER_UPDATED','User',id,'SUCCESS',{role:updated.role,status:updated.status});
  return updated;
 }
}
