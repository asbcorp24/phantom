import { Body,Controller,Get,Post,Req,UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';

@UseGuards(JwtAuthGuard,RolesGuard)
@Controller('assignments')
export class AssignmentsController {
 constructor(private service:AssignmentsService){}
 @Roles(UserRole.COMPANY_ADMIN,UserRole.CURATOR)
 @Post() create(@Req() req:any,@Body() dto:CreateAssignmentDto){return this.service.create(req.user.organizationId,dto.userId,dto.courseId,dto.dueAt);}
 @Roles(UserRole.EMPLOYEE,UserRole.CURATOR,UserRole.COMPANY_ADMIN)
 @Get('mine') mine(@Req() req:any){return this.service.listForUser(req.user.organizationId,req.user.id);}
}
