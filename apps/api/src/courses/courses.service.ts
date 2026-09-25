import { BadRequestException,Injectable,NotFoundException } from '@nestjs/common';
import { PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateMaterialDto } from './dto/create-material.dto';

@Injectable()
export class CoursesService {
 constructor(private prisma:PrismaService){}
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
 async publish(organizationId:string,versionId:string){
  const version=await this.ownedVersion(organizationId,versionId);
  if(version.status!==PublishStatus.DRAFT) throw new BadRequestException('Версия уже опубликована');
  return this.prisma.courseVersion.update({where:{id:versionId},data:{status:PublishStatus.PUBLISHED,publishedAt:new Date()}});
 }
}
