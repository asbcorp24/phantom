import { BadRequestException,Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
@Injectable()
export class GroupsService {
 constructor(private prisma:PrismaService,private audit:AuditService){}
 list(organizationId:string){return this.prisma.group.findMany({where:{organizationId},include:{department:{select:{name:true}},members:{include:{user:{select:{id:true,firstName:true,lastName:true,email:true}}}}},orderBy:{name:'asc'}});}
 async create(organizationId:string,name:string,departmentId?:string,actorId?:string){
  if(departmentId&&!await this.prisma.department.findFirst({where:{id:departmentId,organizationId}}))throw new BadRequestException('Подразделение не принадлежит организации');
  const group=await this.prisma.group.create({data:{organizationId,name,departmentId}});
  await this.audit.write(actorId??null,organizationId,'GROUP_CREATED','Group',group.id);
  return group;
 }
 async addMember(organizationId:string,groupId:string,userId:string,actorId?:string){
  const group=await this.prisma.group.findFirst({where:{id:groupId,organizationId}});
  const user=await this.prisma.user.findFirst({where:{id:userId,organizationId}});
  if(!group||!user)throw new NotFoundException('Группа или сотрудник не найдены');
  const member=await this.prisma.groupMember.upsert({where:{groupId_userId:{groupId,userId}},create:{groupId,userId},update:{}});
  await this.audit.write(actorId??null,organizationId,'GROUP_MEMBER_ADDED','Group',groupId,'SUCCESS',{userId});
  return member;
 }
 async removeMember(organizationId:string,groupId:string,userId:string,actorId?:string){
  const result=await this.prisma.groupMember.deleteMany({where:{groupId,userId,group:{organizationId},user:{organizationId}}});
  if(result.count)await this.audit.write(actorId??null,organizationId,'GROUP_MEMBER_REMOVED','Group',groupId,'SUCCESS',{userId});
  return result;
 }
}
