import { Body,Controller,Get,Param,Post,Req,UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CertificatesService } from './certificates.service';
import { RevokeCertificateDto } from './dto/revoke-certificate.dto';
@UseGuards(JwtAuthGuard,RolesGuard)
@Controller('certificates')
export class CertificatesController {
 constructor(private service:CertificatesService){}
 @Roles(UserRole.EMPLOYEE,UserRole.CURATOR,UserRole.COMPANY_ADMIN) @Get('mine') mine(@Req() req:any){return this.service.listMine(req.user.organizationId,req.user.id);}
 @Roles(UserRole.COMPANY_ADMIN) @Get('company') company(@Req() req:any){return this.service.listCompany(req.user.organizationId);}
 @Roles(UserRole.COMPANY_ADMIN) @Post(':id/revoke') revoke(@Req() req:any,@Param('id') id:string,@Body() dto:RevokeCertificateDto){return this.service.revoke(req.user.organizationId,id,req.user.id,dto.reason);}
 @Roles(UserRole.EMPLOYEE,UserRole.CURATOR,UserRole.COMPANY_ADMIN) @Get(':id') get(@Req() req:any,@Param('id') id:string){return this.service.getMine(req.user.organizationId,req.user.id,id);}
}
