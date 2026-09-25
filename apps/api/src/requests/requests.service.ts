import { ForbiddenException,Injectable,NotFoundException } from '@nestjs/common';
import { RequestStatus,UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class RequestsService {
 constructor(private prisma:PrismaService){}
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
 async message(organizationId:string,user:any,id:string,text:string){
  const r=await this.get(organizationId,user,id);
  if(user.role===UserRole.CURATOR&&!r.curatorId)await this.prisma.supportRequest.update({where:{id},data:{curatorId:user.id,status:RequestStatus.IN_PROGRESS}});
  else if(r.status===RequestStatus.CLOSED)await this.prisma.supportRequest.update({where:{id},data:{status:RequestStatus.IN_PROGRESS}});
  await this.prisma.requestMessage.create({data:{requestId:id,senderId:user.id,text}});
  return this.get(organizationId,user,id);
 }
 async close(organizationId:string,user:any,id:string){
  await this.get(organizationId,user,id);
  if(user.role===UserRole.EMPLOYEE)throw new ForbiddenException();
  return this.prisma.supportRequest.update({where:{id},data:{status:RequestStatus.CLOSED}});
 }
}
