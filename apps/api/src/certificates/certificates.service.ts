import { Injectable,NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class CertificatesService {
 constructor(private prisma:PrismaService,private audit:AuditService){}
 listMine(organizationId:string,userId:string){return this.prisma.certificate.findMany({where:{organizationId,userId},include:{course:true,organization:{select:{name:true}}},orderBy:{issuedAt:'desc'}});}
 async issueForPassedCourse(organizationId:string,userId:string,courseId:string){
  const assignment=await this.prisma.assignment.findFirst({where:{organizationId,userId,courseId},orderBy:{assignedAt:'desc'}});
  if(!assignment)throw new NotFoundException('Назначение не найдено');
  return this.issueForAssignment(organizationId,userId,assignment.id);
 }
 async issueForAssignment(organizationId:string,userId:string,assignmentId:string){
  const assignment=await this.prisma.assignment.findFirst({where:{id:assignmentId,organizationId,userId},include:{courseVersion:{include:{tests:true}}}});
  if(!assignment)throw new NotFoundException('Назначение не найдено');
  if(assignment.progress<100)return null;
  const tests=assignment.courseVersion.tests;
  if(tests.length){
   const passed=await this.prisma.testAttempt.findMany({where:{userId,assignmentId:assignment.id,testId:{in:tests.map(t=>t.id)},status:'PASSED'},select:{testId:true},distinct:['testId']});
   if(passed.length<tests.length)return null;
  }
  const existing=await this.prisma.certificate.findUnique({where:{assignmentId:assignment.id}});
  if(existing)return existing;
  const number='PH-'+new Date().getFullYear()+'-'+randomUUID().slice(0,8).toUpperCase();
  const cert=await this.prisma.certificate.create({data:{organizationId,userId,courseId,assignmentId:assignment.id,number}});
  await this.audit.write(userId,organizationId,'CERTIFICATE_ISSUED','Certificate',cert.id,'SUCCESS',{assignmentId:assignment.id});
  return cert;
 }
 async getMine(organizationId:string,userId:string,id:string){
  const cert=await this.prisma.certificate.findFirst({where:{id,organizationId,userId},include:{course:true,organization:{select:{name:true}},user:{select:{firstName:true,lastName:true,middleName:true}}}});
  if(!cert)throw new NotFoundException('Сертификат не найден');
  return cert;
 }
 async listCompany(organizationId:string){
  return this.prisma.certificate.findMany({where:{organizationId},include:{course:true,user:{select:{id:true,firstName:true,lastName:true,email:true}}},orderBy:{issuedAt:'desc'}});
 }
 async revoke(organizationId:string,id:string,actorId:string,reason:string){
  const cert=await this.prisma.certificate.findFirst({where:{id,organizationId}});
  if(!cert)throw new NotFoundException('Сертификат не найден');
  if(cert.revokedAt)return cert;
  const updated=await this.prisma.certificate.update({where:{id},data:{revokedAt:new Date()}});
  await this.audit.write(actorId,organizationId,'CERTIFICATE_REVOKED','Certificate',id,'SUCCESS',{reason});
  return updated;
 }

}
