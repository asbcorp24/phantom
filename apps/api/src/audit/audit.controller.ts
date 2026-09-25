import { Controller,Get,Req,UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuditService } from './audit.service';
@UseGuards(JwtAuthGuard,RolesGuard)
@Controller('audit')
export class AuditController {
 constructor(private service:AuditService){}
 @Roles(UserRole.COMPANY_ADMIN) @Get()
 list(@Req() req:any){return this.service.list(req.user.organizationId);}
}
