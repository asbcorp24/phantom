import { Injectable,NotFoundException } from '@nestjs/common';
import { NotificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class NotificationsService {
 constructor(private prisma:PrismaService){}
 list(organizationId:string,userId:string){return this.prisma.notification.findMany({where:{organizationId,userId},orderBy:{createdAt:'desc'},take:100});}
 unread(organizationId:string,userId:string){return this.prisma.notification.count({where:{organizationId,userId,readAt:null}});}
 async read(organizationId:string,userId:string,id:string){
  const n=await this.prisma.notification.findFirst({where:{id,organizationId,userId}});
  if(!n)throw new NotFoundException();
  return this.prisma.notification.update({where:{id},data:{readAt:new Date(),status:NotificationStatus.READ}});
 }
 create(organizationId:string,userId:string,type:string,title:string,body:string,dedupeKey?:string,metadata?:any){
  return this.prisma.notification.create({data:{organizationId,userId,type,title,body,status:NotificationStatus.SENT,sentAt:new Date(),dedupeKey,metadata}});
 }
 async processDeadlines(){
  const now=new Date();
  const max=new Date(now.getTime()+8*86400000);
  const assignments=await this.prisma.assignment.findMany({where:{dueAt:{not:null,lte:max},status:{in:['ASSIGNED','IN_PROGRESS']}},include:{course:true}});
  let created=0;
  for(const a of assignments){
   if(!a.dueAt)continue;
   const days=Math.ceil((a.dueAt.getTime()-now.getTime())/86400000);
   if(days<0){
    await this.prisma.assignment.update({where:{id:a.id},data:{status:'OVERDUE'}});
    const key='overdue:'+a.id;
    try{await this.create(a.organizationId,a.userId,'OVERDUE','Срок обучения истёк',a.course.title,key,{assignmentId:a.id});created++;}catch{}
   } else if([7,3,1].includes(days)){
    const key='deadline:'+a.id+':'+days;
    try{await this.create(a.organizationId,a.userId,'DEADLINE','До окончания обучения '+days+' дн.',a.course.title,key,{assignmentId:a.id,days});created++;}catch{}
   }
  }
  return {checked:assignments.length,created};
 }
}
