import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AuditService {
 constructor(private prisma:PrismaService){}
 write(actorId:string|null,organizationId:string|null,action:string,entityType:string,entityId:string|null,result='SUCCESS',metadata?:any){
  return this.prisma.auditLog.create({data:{actorId,organizationId,action,entityType,entityId,result,metadata}});
 }
 list(organizationId:string){
  return this.prisma.auditLog.findMany({where:{organizationId},include:{actor:{select:{firstName:true,lastName:true,email:true}}},orderBy:{createdAt:'desc'},take:500});
 }
}
