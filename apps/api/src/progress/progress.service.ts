import { Injectable,NotFoundException } from '@nestjs/common';
import { AssignmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ProgressService {
 constructor(private prisma:PrismaService){}
 async getAssignment(organizationId:string,userId:string,id:string){
  const a=await this.prisma.assignment.findFirst({where:{id,organizationId,userId},include:{course:true,courseVersion:{include:{materials:{orderBy:{sortOrder:'asc'}},tests:{select:{id:true,title:true,passingScore:true,timeLimitSec:true,maxAttempts:true}}}}}});
  if(!a) throw new NotFoundException('Назначение не найдено');
  return a;
 }
 async update(organizationId:string,userId:string,id:string,progress:number,completed?:boolean){
  await this.getAssignment(organizationId,userId,id);
  const done=completed||progress>=100;
  return this.prisma.assignment.update({where:{id},data:{progress:done?100:progress,status:done?AssignmentStatus.COMPLETED:progress>0?AssignmentStatus.IN_PROGRESS:AssignmentStatus.ASSIGNED,completedAt:done?new Date():null}});
 }
}
