import { BadRequestException,Injectable,NotFoundException } from '@nestjs/common';
import { PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssignmentsService {
 constructor(private prisma:PrismaService){}
 async create(organizationId:string,userId:string,courseId:string,dueAt?:string){
  const user=await this.prisma.user.findFirst({where:{id:userId,organizationId}});
  if(!user) throw new NotFoundException('Сотрудник не найден');
  const course=await this.prisma.course.findFirst({where:{id:courseId,organizationId},include:{versions:{where:{status:PublishStatus.PUBLISHED},orderBy:{version:'desc'},take:1}}});
  if(!course||!course.versions[0]) throw new BadRequestException('У курса нет опубликованной версии');
  const v=course.versions[0];
  return this.prisma.assignment.create({data:{organizationId,userId,courseId,courseVersionId:v.id,dueAt:dueAt?new Date(dueAt):undefined}});
 }
 listForUser(organizationId:string,userId:string){
  return this.prisma.assignment.findMany({where:{organizationId,userId},include:{course:true,courseVersion:{include:{materials:{orderBy:{sortOrder:'asc'}}}}},orderBy:{assignedAt:'desc'}});
 }
}
