import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CreateCompanyAdminDto } from './dto/create-company-admin.dto';

@Injectable()
export class OrganizationsService {
 constructor(private readonly prisma: PrismaService) {}

 findAll() {
  return this.prisma.organization.findMany({
   include: { _count: { select: { users: true, courses: true } } },
   orderBy: { name: 'asc' }
  });
 }

 async create(dto: CreateOrganizationDto) {
  const exists=await this.prisma.organization.findUnique({where:{slug:dto.slug}});
  if(exists) throw new ConflictException('Организация с таким идентификатором уже существует');
  return this.prisma.organization.create({data:dto});
 }

 async createAdmin(organizationId:string,dto:CreateCompanyAdminDto) {
  const org=await this.prisma.organization.findUnique({where:{id:organizationId}});
  if(!org) throw new NotFoundException('Организация не найдена');
  const exists=await this.prisma.user.findUnique({where:{email:dto.email.toLowerCase()}});
  if(exists) throw new ConflictException('Пользователь с таким e-mail уже существует');
  return this.prisma.user.create({
   data:{organizationId,email:dto.email.toLowerCase(),firstName:dto.firstName,lastName:dto.lastName,passwordHash:await bcrypt.hash(dto.password,12),role:UserRole.COMPANY_ADMIN},
   select:{id:true,email:true,firstName:true,lastName:true,role:true,status:true,organizationId:true}
  });
 }
}
