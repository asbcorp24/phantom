import { Body,Controller,Get,Param,Patch,Post,Req,UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard,RolesGuard)
@Roles(UserRole.COMPANY_ADMIN)
@Controller('users')
export class UsersController {
 constructor(private readonly service:UsersService){}
 @Get() findAll(@Req() req:any){return this.service.findByOrganization(req.user.organizationId);}
 @Post() create(@Req() req:any,@Body() dto:CreateUserDto){return this.service.create(req.user.organizationId,dto,req.user.id);}
 @Patch(':id') update(@Req() req:any,@Param('id') id:string,@Body() dto:UpdateUserDto){return this.service.update(req.user.organizationId,id,dto,req.user.id);}
}
