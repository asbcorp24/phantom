import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ReportsService {
 constructor(private prisma:PrismaService){}
 async summary(organizationId:string){
  const [users,courses,assignments,completed,overdue,certificates]=await Promise.all([
   this.prisma.user.count({where:{organizationId}}),
   this.prisma.course.count({where:{organizationId}}),
   this.prisma.assignment.count({where:{organizationId}}),
   this.prisma.assignment.count({where:{organizationId,status:'COMPLETED'}}),
   this.prisma.assignment.count({where:{organizationId,status:'OVERDUE'}}),
   this.prisma.certificate.count({where:{organizationId}})
  ]);
  return {users,courses,assignments,completed,overdue,certificates,completionRate:assignments?Math.round(completed*100/assignments):0};
 }
 async employees(organizationId:string){
  return this.prisma.user.findMany({where:{organizationId},select:{id:true,firstName:true,lastName:true,email:true,department:{select:{name:true}},assignments:{select:{id:true,status:true,progress:true,dueAt:true,course:{select:{title:true}}}},attempts:{select:{id:true,status:true,score:true,finishedAt:true,test:{select:{title:true,courseVersion:{select:{course:{select:{organizationId:true}}}}}}}},certificates:{select:{id:true,number:true,issuedAt:true,course:{select:{title:true}}}}},orderBy:{lastName:'asc'}}).then(rows=>rows.map(u=>({...u,attempts:u.attempts.filter(a=>a.test.courseVersion.course.organizationId===organizationId)})));
 }
}
