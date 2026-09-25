import { BadRequestException,Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class GroupsService {
 constructor(private prisma:PrismaService){}
 list(organizationId:string){return this.prisma.group.findMany({where:{organizationId},include:{department:{select:{name:true}},members:{include:{user:{select:{id:true,firstName:true,lastName:true,email:true}}}}},orderBy:{name:'asc'}});}
 async create(organizationId:string,name:string,departmentId?:string){
  if(departmentId&&!await this.prisma.department.findFirst({where:{id:departmentId,organizationId}}))throw new BadRequestException('Подразделение не принадлежит организации');
  return this.prisma.group.create({data:{organizationId,name,departmentId}});
 }
 async addMember(organizationId:string,groupId:string,userId:string){
  const group=await this.prisma.group.findFirst({where:{id:groupId,organizationId}});
  const user=await this.prisma.user.findFirst({where:{id:userId,organizationId}});
  if(!group||!user)throw new NotFoundException('Группа или сотрудник не найдены');
  return this.prisma.groupMember.upsert({where:{groupId_userId:{groupId,userId}},create:{groupId,userId},update:{}});
 }
 removeMember(organizationId:string,groupId:string,userId:string){
  return this.prisma.groupMember.deleteMany({where:{groupId,userId,group:{organizationId},user:{organizationId}}});
 }
}
