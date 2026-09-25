import { BadRequestException,Injectable,NotFoundException } from '@nestjs/common';
import { PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateMaterialDto } from './dto/create-material.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CoursesService {
 constructor(private prisma:PrismaService,private audit:AuditService){}
 list(organizationId:string){return this.prisma.course.findMany({where:{organizationId},include:{versions:{orderBy:{version:'desc'},take:1,include:{materials:true}},_count:{select:{assignments:true}}},orderBy:{createdAt:'desc'}});}
 async create(organizationId:string,dto:CreateCourseDto){
  return this.prisma.course.create({data:{organizationId,title:dto.title,description:dto.description,mandatory:dto.mandatory??false,versions:{create:{version:1}}},include:{versions:true}});
 }
 async ownedVersion(organizationId:string,versionId:string){
  const version=await this.prisma.courseVersion.findFirst({where:{id:versionId,course:{organizationId}}});
  if(!version) throw new NotFoundException('Версия курса не найдена');
  return version;
 }
 async addMaterial(organizationId:string,versionId:string,dto:CreateMaterialDto){
  const version=await this.ownedVersion(organizationId,versionId);
  if(version.status!==PublishStatus.DRAFT) throw new BadRequestException('Материалы опубликованной версии изменять нельзя');
  const count=await this.prisma.material.count({where:{courseVersionId:versionId}});
  return this.prisma.material.create({data:{courseVersionId:versionId,title:dto.title,type:dto.type,content:dto.content,filePath:dto.filePath,required:dto.required??true,sortOrder:count}});
 }
 async publish(organizationId:string,versionId:string,actorId?:string){
  const version=await this.ownedVersion(organizationId,versionId);
  if(version.status!==PublishStatus.DRAFT) throw new BadRequestException('Версия уже опубликована');
  const result=await this.prisma.courseVersion.update({where:{id:versionId},data:{status:PublishStatus.PUBLISHED,publishedAt:new Date()}});
  await this.audit.write(actorId??null,organizationId,'COURSE_PUBLISHED','CourseVersion',versionId);
  return result;
 }
 async createNextVersion(organizationId:string,courseId:string,actorId?:string){
  const course=await this.prisma.course.findFirst({where:{id:courseId,organizationId},include:{versions:{orderBy:{version:'desc'},take:1,include:{materials:true,tests:{include:{questions:{include:{options:true}}}}}}}});
  if(!course)throw new NotFoundException('Курс не найден');
  const source=course.versions[0];
  if(!source)throw new BadRequestException('У курса нет исходной версии');
  if(source.status===PublishStatus.DRAFT)throw new BadRequestException('Сначала опубликуйте текущий черновик');
  const created=await this.prisma.courseVersion.create({data:{
   courseId,version:source.version+1,
   materials:{create:source.materials.map(m=>({title:m.title,type:m.type,content:m.content,filePath:m.filePath,sortOrder:m.sortOrder,required:m.required}))},
   tests:{create:source.tests.map(t=>({title:t.title,passingScore:t.passingScore,timeLimitSec:t.timeLimitSec,maxAttempts:t.maxAttempts,questions:{create:t.questions.map(q=>({text:q.text,multiple:q.multiple,sortOrder:q.sortOrder,options:{create:q.options.map(o=>({text:o.text,correct:o.correct}))}}))}}))}
  },include:{materials:true,tests:{include:{questions:{include:{options:true}}}}}});
  await this.audit.write(actorId??null,organizationId,'COURSE_VERSION_CREATED','CourseVersion',created.id,'SUCCESS',{courseId,version:created.version});
  return created;
 }

}
