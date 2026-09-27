import { BadRequestException,Injectable,NotFoundException } from '@nestjs/common';
import { AssignmentStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ProgressService {
 constructor(private prisma:PrismaService){}
 async getAssignment(organizationId:string,userId:string,id:string){
  const a=await this.prisma.assignment.findFirst({where:{id,organizationId,userId},include:{course:true,materialProgress:true,courseVersion:{include:{materials:{orderBy:{sortOrder:'asc'}},tests:{select:{id:true,title:true,passingScore:true,timeLimitSec:true,maxAttempts:true}}}}}});
  if(!a) throw new NotFoundException('Назначение не найдено');
  return {...a,courseVersion:{...a.courseVersion,materials:a.courseVersion.materials.map(({filePath,...m})=>({...m,hasFile:Boolean(filePath)}))}};
 }
 async material(organizationId:string,userId:string,assignmentId:string,materialId:string,viewed:boolean,position=0){
  const a=await this.getAssignment(organizationId,userId,assignmentId);
  const material=a.courseVersion.materials.find(m=>m.id===materialId);
  if(!material)throw new NotFoundException('Материал не найден');
  if(position<0)throw new BadRequestException('Некорректная позиция');
  await this.prisma.materialProgress.upsert({where:{assignmentId_materialId:{assignmentId,materialId}},create:{assignmentId,materialId,userId,viewed,position},update:{viewed,position}});
  const required=a.courseVersion.materials.filter(m=>m.required);
  const viewedRequired=required.length?await this.prisma.materialProgress.count({where:{assignmentId,userId,materialId:{in:required.map(m=>m.id)},viewed:true}}):0;
  const progress=required.length?Math.round(viewedRequired*100/required.length):100;
  const status=progress>0?AssignmentStatus.IN_PROGRESS:AssignmentStatus.ASSIGNED;
  await this.prisma.assignment.update({where:{id:assignmentId},data:{progress,status}});
  return {progress,materialId,viewed,position};
 }
}
