import { BadRequestException,Injectable,NotFoundException } from '@nestjs/common';
import { PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AssignmentsService {
 constructor(private prisma:PrismaService,private notifications:NotificationsService){}
 async create(organizationId:string,userId:string,courseId:string,dueAt?:string){
  const user=await this.prisma.user.findFirst({where:{id:userId,organizationId}});
  if(!user) throw new NotFoundException('Сотрудник не найден');
  const course=await this.prisma.course.findFirst({where:{id:courseId,organizationId},include:{versions:{where:{status:PublishStatus.PUBLISHED},orderBy:{version:'desc'},take:1}}});
  if(!course||!course.versions[0]) throw new BadRequestException('У курса нет опубликованной версии');
  const v=course.versions[0];
  const assignment=await this.prisma.assignment.create({data:{organizationId,userId,courseId,courseVersionId:v.id,dueAt:dueAt?new Date(dueAt):undefined}});
  await this.notifications.create(organizationId,userId,'ASSIGNMENT','Назначена программа обучения',course.title,'assignment:'+assignment.id,{assignmentId:assignment.id});
  return assignment;
 }
 listForUser(organizationId:string,userId:string){
  return this.prisma.assignment.findMany({where:{organizationId,userId},include:{course:true,courseVersion:{include:{materials:{orderBy:{sortOrder:'asc'}}}}},orderBy:{assignedAt:'desc'}});
 }
}
