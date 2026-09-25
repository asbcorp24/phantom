import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class CertificatesService {
 constructor(private prisma:PrismaService){}
 listMine(organizationId:string,userId:string){return this.prisma.certificate.findMany({where:{organizationId,userId},include:{course:true,organization:{select:{name:true}}},orderBy:{issuedAt:'desc'}});}
 async issueForPassedCourse(organizationId:string,userId:string,courseId:string){
  const assignment=await this.prisma.assignment.findFirst({where:{organizationId,userId,courseId},include:{courseVersion:{include:{tests:true}}},orderBy:{assignedAt:'desc'}});
  if(!assignment)throw new NotFoundException('Назначение не найдено');
  if(assignment.progress<100)return null;
  const tests=assignment.courseVersion.tests;
  if(tests.length){
   const passed=await this.prisma.testAttempt.findMany({where:{userId,testId:{in:tests.map(t=>t.id)},status:'PASSED'},select:{testId:true},distinct:['testId']});
   if(passed.length<tests.length)return null;
  }
  const existing=await this.prisma.certificate.findUnique({where:{assignmentId:assignment.id}});
  if(existing)return existing;
  const number='PH-'+new Date().getFullYear()+'-'+randomUUID().slice(0,8).toUpperCase();
  return this.prisma.certificate.create({data:{organizationId,userId,courseId,assignmentId:assignment.id,number}});
 }
 async getMine(organizationId:string,userId:string,id:string){
  const cert=await this.prisma.certificate.findFirst({where:{id,organizationId,userId},include:{course:true,organization:{select:{name:true}},user:{select:{firstName:true,lastName:true,middleName:true}}}});
  if(!cert)throw new NotFoundException('Сертификат не найден');
  return cert;
 }
}
