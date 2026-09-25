import { Controller,Get,Param,Req,UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CertificatesService } from './certificates.service';
@UseGuards(JwtAuthGuard)
@Controller('certificates')
export class CertificatesController {
 constructor(private service:CertificatesService){}
 @Get('mine') mine(@Req() req:any){return this.service.listMine(req.user.organizationId,req.user.id);}
 @Get(':id') get(@Req() req:any,@Param('id') id:string){return this.service.getMine(req.user.organizationId,req.user.id,id);}
}
