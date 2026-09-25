import { BadRequestException,ForbiddenException,Injectable,NotFoundException } from '@nestjs/common';
import { AttemptStatus,PublishStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CertificatesService } from '../certificates/certificates.service';
import { CreateTestDto } from './dto/create-test.dto';
import { CreateQuestionDto } from './dto/create-question.dto';

@Injectable()
export class TestsService {
 constructor(private prisma:PrismaService,private certificates:CertificatesService){}
 async create(organizationId:string,versionId:string,dto:CreateTestDto){
  const v=await this.prisma.courseVersion.findFirst({where:{id:versionId,course:{organizationId}}});
  if(!v)throw new NotFoundException('Версия курса не найдена');
  if(v.status!==PublishStatus.DRAFT)throw new BadRequestException('Опубликованную версию менять нельзя');
  return this.prisma.test.create({data:{courseVersionId:versionId,...dto}});
 }
 async question(organizationId:string,testId:string,dto:CreateQuestionDto){
  const test=await this.prisma.test.findFirst({where:{id:testId,courseVersion:{course:{organizationId},status:PublishStatus.DRAFT}}});
  if(!test)throw new NotFoundException('Черновик теста не найден');
  const count=await this.prisma.question.count({where:{testId}});
  if(dto.options.length<2)throw new BadRequestException('Нужно минимум два варианта ответа');
  const correctCount=dto.options.filter(o=>o.correct).length;
  if(!correctCount)throw new BadRequestException('Нужен хотя бы один правильный ответ');
  if(!dto.multiple&&correctCount!==1)throw new BadRequestException('Для одиночного выбора нужен ровно один правильный ответ');
  return this.prisma.question.create({data:{testId,text:dto.text,multiple:dto.multiple,sortOrder:count,options:{create:dto.options}}});
 }
 async adminGet(organizationId:string,testId:string){
  const test=await this.prisma.test.findFirst({where:{id:testId,courseVersion:{course:{organizationId}}},include:{questions:{orderBy:{sortOrder:'asc'},include:{options:true}}}});
  if(!test)throw new NotFoundException('Тест не найден');
  return test;
 }
 async results(organizationId:string,testId:string){
  const test=await this.prisma.test.findFirst({where:{id:testId,courseVersion:{course:{organizationId}}}});
  if(!test)throw new NotFoundException('Тест не найден');
  return this.prisma.testAttempt.findMany({where:{testId},select:{id:true,status:true,score:true,startedAt:true,finishedAt:true,user:{select:{id:true,firstName:true,lastName:true,email:true}}},orderBy:{startedAt:'desc'}});
 }
 async start(organizationId:string,userId:string,assignmentId:string,testId:string){
  const a=await this.prisma.assignment.findFirst({where:{id:assignmentId,organizationId,userId,courseVersion:{tests:{some:{id:testId}}}}});
  if(!a)throw new ForbiddenException();
  if(a.progress<100)throw new BadRequestException('Сначала завершите обязательные материалы');
  const test=await this.prisma.test.findUnique({where:{id:testId}});
  if(!test)throw new NotFoundException();
  const active=await this.prisma.testAttempt.findFirst({where:{testId,userId,status:AttemptStatus.IN_PROGRESS},orderBy:{startedAt:'desc'}});
  const safe=await this.prisma.test.findUnique({where:{id:testId},select:{id:true,title:true,passingScore:true,timeLimitSec:true,maxAttempts:true,questions:{orderBy:{sortOrder:'asc'},select:{id:true,text:true,multiple:true,options:{select:{id:true,text:true}}}}}});
  if(active){
   if(!test.timeLimitSec||(Date.now()-active.startedAt.getTime())/1000<=test.timeLimitSec)return {attemptId:active.id,test:safe};
   await this.prisma.testAttempt.update({where:{id:active.id},data:{status:AttemptStatus.FAILED,score:0,finishedAt:new Date()}});
  }
  const used=await this.prisma.testAttempt.count({where:{testId,userId}});
  if(test.maxAttempts&&used>=test.maxAttempts)throw new BadRequestException('Количество попыток исчерпано');
  const attempt=await this.prisma.testAttempt.create({data:{testId,userId}});
  return {attemptId:attempt.id,test:safe};
 }
 async submit(userId:string,attemptId:string,answers:{questionId:string;optionIds:string[]}[]){
  const attempt=await this.prisma.testAttempt.findFirst({where:{id:attemptId,userId,status:AttemptStatus.IN_PROGRESS},include:{test:{include:{questions:{include:{options:true}}}}}});
  if(!attempt)throw new NotFoundException('Активная попытка не найдена');
  if(attempt.test.timeLimitSec&&(Date.now()-attempt.startedAt.getTime())/1000>attempt.test.timeLimitSec)throw new BadRequestException('Время теста истекло');
  let correct=0;
  for(const q of attempt.test.questions){
   const selected=new Set(answers.find(a=>a.questionId===q.id)?.optionIds||[]);
   const right=q.options.filter(o=>o.correct).map(o=>o.id);
   if(selected.size===right.length&&right.every(id=>selected.has(id)))correct++;
  }
  const score=attempt.test.questions.length?Math.round(correct*100/attempt.test.questions.length):0;
  const status=score>=attempt.test.passingScore?AttemptStatus.PASSED:AttemptStatus.FAILED;
  const result=await this.prisma.testAttempt.update({where:{id:attemptId},data:{answers:answers as any,score,status,finishedAt:new Date()},select:{id:true,status:true,score:true,finishedAt:true}});
  let certificate=null;
  if(status===AttemptStatus.PASSED){
   const assignment=await this.prisma.assignment.findFirst({where:{userId,courseVersionId:attempt.test.courseVersionId},orderBy:{assignedAt:'desc'}});
   if(assignment)certificate=await this.certificates.issueForPassedCourse(assignment.organizationId,userId,assignment.courseId);
  }
  return {...result,certificate};
 }
}
