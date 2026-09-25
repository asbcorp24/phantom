import { Body,Controller,Get,Param,Patch,Req,UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressService } from './progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
@UseGuards(JwtAuthGuard)
@Controller('learning')
export class ProgressController {
 constructor(private service:ProgressService){}
 @Get(':assignmentId') get(@Req() req:any,@Param('assignmentId') id:string){return this.service.getAssignment(req.user.organizationId,req.user.id,id);}
 @Patch(':assignmentId/progress') update(@Req() req:any,@Param('assignmentId') id:string,@Body() dto:UpdateProgressDto){return this.service.update(req.user.organizationId,req.user.id,id,dto.progress,dto.completed);}
}
