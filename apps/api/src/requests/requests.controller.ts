import { Body,Controller,Get,Param,Post,Req,UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { MessageDto } from './dto/message.dto';
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
 constructor(private service:RequestsService){}
 @Get() list(@Req() req:any){return this.service.list(req.user.organizationId,req.user);}
 @Post() create(@Req() req:any,@Body() dto:CreateRequestDto){return this.service.create(req.user.organizationId,req.user.id,dto.subject,dto.message);}
 @Get(':id') get(@Req() req:any,@Param('id') id:string){return this.service.get(req.user.organizationId,req.user,id);}
 @Post(':id/messages') message(@Req() req:any,@Param('id') id:string,@Body() dto:MessageDto){return this.service.message(req.user.organizationId,req.user,id,dto.text);}
 @Post(':id/close') close(@Req() req:any,@Param('id') id:string){return this.service.close(req.user.organizationId,req.user,id);}
}
