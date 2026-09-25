import { Body,Controller,Get,Param,Post,Req,UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateMaterialDto } from './dto/create-material.dto';

@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.COMPANY_ADMIN)
@Controller('courses')
export class CoursesController {
 constructor(private service:CoursesService){}
 @Get() list(@Req() req:any){return this.service.list(req.user.organizationId);}
 @Post() create(@Req() req:any,@Body() dto:CreateCourseDto){return this.service.create(req.user.organizationId,dto);}
 @Post(':id/new-version') newVersion(@Req() req:any,@Param('id') id:string){return this.service.createNextVersion(req.user.organizationId,id,req.user.id);}
 @Post('versions/:id/materials') material(@Req() req:any,@Param('id') id:string,@Body() dto:CreateMaterialDto){return this.service.addMaterial(req.user.organizationId,id,dto);}
 @Post('versions/:id/publish') publish(@Req() req:any,@Param('id') id:string){return this.service.publish(req.user.organizationId,id,req.user.id);}
}
