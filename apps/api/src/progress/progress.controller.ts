import { Body,Controller,Get,Param,Patch,Req,UseGuards } from '@nestjs/common';
import { IsBoolean,IsInt,IsOptional,Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProgressService } from './progress.service';
class MaterialProgressDto {
 @IsBoolean() viewed!:boolean;
 @IsOptional() @IsInt() @Min(0) position?:number;
}
@UseGuards(JwtAuthGuard)
@Controller('learning')
export class ProgressController {
 constructor(private service:ProgressService){}
 @Get(':assignmentId') get(@Req() req:any,@Param('assignmentId') id:string){return this.service.getAssignment(req.user.organizationId,req.user.id,id);}
 @Patch(':assignmentId/materials/:materialId') material(@Req() req:any,@Param('assignmentId') assignmentId:string,@Param('materialId') materialId:string,@Body() dto:MaterialProgressDto){return this.service.material(req.user.organizationId,req.user.id,assignmentId,materialId,dto.viewed,dto.position??0);}
}
