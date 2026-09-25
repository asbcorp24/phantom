import { Body,Controller,Delete,Get,Param,Post,Req,UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.COMPANY_ADMIN)
@Controller('groups')
export class GroupsController {
 constructor(private service:GroupsService){}
 @Get() list(@Req() req:any){return this.service.list(req.user.organizationId);}
 @Post() create(@Req() req:any,@Body() dto:CreateGroupDto){return this.service.create(req.user.organizationId,dto.name,dto.departmentId);}
 @Post(':id/members/:userId') add(@Req() req:any,@Param('id') id:string,@Param('userId') userId:string){return this.service.addMember(req.user.organizationId,id,userId);}
 @Delete(':id/members/:userId') remove(@Req() req:any,@Param('id') id:string,@Param('userId') userId:string){return this.service.removeMember(req.user.organizationId,id,userId);}
}
