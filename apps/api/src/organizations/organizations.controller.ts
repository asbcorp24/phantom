import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CreateCompanyAdminDto } from './dto/create-company-admin.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PLATFORM_OWNER)
@Controller('organizations')
export class OrganizationsController {
 constructor(private readonly service:OrganizationsService){}
 @Get() findAll(){return this.service.findAll();}
 @Post() create(@Body() dto:CreateOrganizationDto){return this.service.create(dto);}
 @Post(':id/admins') createAdmin(@Param('id') id:string,@Body() dto:CreateCompanyAdminDto){return this.service.createAdmin(id,dto);}
}
