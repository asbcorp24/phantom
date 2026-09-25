import { Body,Controller,Get,Param,Post,Req,UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@UseGuards(JwtAuthGuard,RolesGuard)
@Controller('tests')
export class TestsController {
 constructor(private service:TestsService){}
 @Roles(UserRole.COMPANY_ADMIN) @Post('versions/:versionId')
 create(@Req() req:any,@Param('versionId') versionId:string,@Body() dto:CreateTestDto){return this.service.create(req.user.organizationId,versionId,dto);}
 @Roles(UserRole.COMPANY_ADMIN) @Post(':testId/questions')
 question(@Req() req:any,@Param('testId') testId:string,@Body() dto:CreateQuestionDto){return this.service.question(req.user.organizationId,testId,dto);}
 @Roles(UserRole.COMPANY_ADMIN) @Get(':testId/admin')
 adminGet(@Req() req:any,@Param('testId') testId:string){return this.service.adminGet(req.user.organizationId,testId);}
 @Roles(UserRole.COMPANY_ADMIN,UserRole.CURATOR) @Get(':testId/results')
 results(@Req() req:any,@Param('testId') testId:string){return this.service.results(req.user.organizationId,testId);}
 @Roles(UserRole.EMPLOYEE,UserRole.CURATOR,UserRole.COMPANY_ADMIN) @Post(':testId/assignments/:assignmentId/start')
 start(@Req() req:any,@Param('testId') testId:string,@Param('assignmentId') assignmentId:string){return this.service.start(req.user.organizationId,req.user.id,assignmentId,testId);}
 @Roles(UserRole.EMPLOYEE,UserRole.CURATOR,UserRole.COMPANY_ADMIN) @Post('attempts/:attemptId/submit')
 submit(@Req() req:any,@Param('attemptId') attemptId:string,@Body() dto:SubmitAttemptDto){return this.service.submit(req.user.id,attemptId,dto.answers);}
}
