import { ForbiddenException,Injectable,NotFoundException } from '@nestjs/common';
import { RequestStatus,UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AuditService } from '../audit/audit.service';
@Injectable()
export class RequestsService {
 constructor(private prisma:PrismaService,private notifications:NotificationsService,private audit:AuditService){}
 create(organizationId:string,authorId:string,subject:string,message:string){
  return this.prisma.supportRequest.create({data:{organizationId,authorId,subject,messages:{create:{senderId:authorId,text:message}}},include:{messages:true}});
 }
 list(organizationId:string,user:any){
  const where:any={organizationId};
  if(user.role===UserRole.EMPLOYEE)where.authorId=user.id;
  else if(user.role===UserRole.CURATOR)where.OR=[{curatorId:user.id},{curatorId:null}];
  return this.prisma.supportRequest.findMany({where,include:{author:{select:{id:true,firstName:true,lastName:true}},curator:{select:{id:true,firstName:true,lastName:true}},_count:{select:{messages:true}}},orderBy:{updatedAt:'desc'}});
 }
 async get(organizationId:string,user:any,id:string){
  const r=await this.prisma.supportRequest.findFirst({where:{id,organizationId},include:{author:{select:{id:true,firstName:true,lastName:true}},curator:{select:{id:true,firstName:true,lastName:true}},messages:{include:{sender:{select:{id:true,firstName:true,lastName:true,role:true}}},orderBy:{createdAt:'asc'}}}});
  if(!r)throw new NotFoundException();
  if(user.role===UserRole.EMPLOYEE&&r.authorId!==user.id)throw new ForbiddenException();
  if(user.role===UserRole.CURATOR&&r.curatorId&&r.curatorId!==user.id)throw new ForbiddenException();
  return r;
 }
 async message(organizationId:string,user:any,id:string,text:string,clientMessageId?:string){
  const r=await this.get(organizationId,user,id);
  if(user.role===UserRole.CURATOR&&!r.curatorId)await this.prisma.supportRequest.update({where:{id},data:{curatorId:user.id,status:RequestStatus.IN_PROGRESS}});
  else if(r.status===RequestStatus.CLOSED)await this.prisma.supportRequest.update({where:{id},data:{status:RequestStatus.IN_PROGRESS}});
  if(clientMessageId&&await this.prisma.requestMessage.findFirst({where:{requestId:id,senderId:user.id,clientMessageId}}))return this.get(organizationId,user,id);
  await this.prisma.requestMessage.create({data:{requestId:id,senderId:user.id,text,clientMessageId}});
  if(user.id!==r.authorId)await this.notifications.create(organizationId,r.authorId,'MESSAGE','Новый ответ по обращению',r.subject,undefined,{requestId:id});
  else if(r.curatorId)await this.notifications.create(organizationId,r.curatorId,'MESSAGE','Новое сообщение в обращении',r.subject,undefined,{requestId:id});
  return this.get(organizationId,user,id);
 }
 async close(organizationId:string,user:any,id:string){
  await this.get(organizationId,user,id);
  if(user.role===UserRole.EMPLOYEE)throw new ForbiddenException();
  const updated=await this.prisma.supportRequest.update({where:{id},data:{status:RequestStatus.CLOSED}});
  await this.audit.write(user.id,organizationId,'REQUEST_CLOSED','SupportRequest',id);
  return updated;
 }
 async reassign(organizationId:string,user:any,id:string,curatorId:string){
  if(user.role!==UserRole.COMPANY_ADMIN)throw new ForbiddenException();
  await this.get(organizationId,user,id);
  const curator=await this.prisma.user.findFirst({where:{id:curatorId,organizationId,role:UserRole.CURATOR,status:'ACTIVE'}});
  if(!curator)throw new NotFoundException('Куратор не найден');
  const updated=await this.prisma.supportRequest.update({where:{id},data:{curatorId,status:RequestStatus.IN_PROGRESS}});
  await this.audit.write(user.id,organizationId,'REQUEST_REASSIGNED','SupportRequest',id,'SUCCESS',{curatorId});
  return updated;
 }

}
