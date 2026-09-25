import { Controller,Get,Req,UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReportsService } from './reports.service';
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.COMPANY_ADMIN,UserRole.CURATOR)
@Controller('reports')
export class ReportsController {
 constructor(private service:ReportsService){}
 @Get('summary') summary(@Req() req:any){return this.service.summary(req.user.organizationId);}
 @Get('employees') employees(@Req() req:any){return this.service.employees(req.user.organizationId);}
}
