import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class DepartmentsService {
 constructor(private prisma:PrismaService){}
 list(organizationId:string){return this.prisma.department.findMany({where:{organizationId},include:{_count:{select:{users:true,groups:true}}},orderBy:{name:'asc'}});}
 create(organizationId:string,name:string){return this.prisma.department.create({data:{organizationId,name}});}
}
