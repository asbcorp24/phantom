import { Controller,Get,Param,Post,Req,UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
 constructor(private service:NotificationsService){}
 @Get() list(@Req() req:any){return this.service.list(req.user.organizationId,req.user.id);}
 @Get('unread-count') unread(@Req() req:any){return this.service.unread(req.user.organizationId,req.user.id).then(count=>({count}));}
 @Post(':id/read') read(@Req() req:any,@Param('id') id:string){return this.service.read(req.user.organizationId,req.user.id,id);}
}
