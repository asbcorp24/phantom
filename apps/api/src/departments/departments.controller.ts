import { Body,Controller,Get,Post,Req,UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentsService } from './departments.service';

@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.COMPANY_ADMIN)
@Controller('departments')
export class DepartmentsController {
 constructor(private service:DepartmentsService){}
 @Get() list(@Req() req:any){return this.service.list(req.user.organizationId);}
 @Post() create(@Req() req:any,@Body() dto:CreateDepartmentDto){return this.service.create(req.user.organizationId,dto.name);}
}
