import {BadRequestException,Controller,Get,Param,Post,Req,Res,UploadedFile,UseGuards,UseInterceptors} from '@nestjs/common';
import {Response} from 'express';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {RolesGuard} from '../auth/roles.guard';
import {Roles} from '../auth/roles.decorator';
import {UserRole} from '@prisma/client';
import {FileInterceptor} from '@nestjs/platform-express';
import {FilesService} from './files.service';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
 constructor(private service:FilesService){}
 @UseGuards(RolesGuard)
 @Roles(UserRole.COMPANY_ADMIN)
 @Post('materials/upload')
 @UseInterceptors(FileInterceptor('file',{limits:{fileSize:100*1024*1024}}))
 upload(@Req() req:any,@UploadedFile() file?:Express.Multer.File){
  if(!file)throw new BadRequestException('Файл не передан');
  return this.service.saveMaterialFile(req.user.organizationId,file.originalname,file.mimetype,file.buffer);
 }
 @Get('materials/:id')
 async material(@Req() req:any,@Res() res:Response,@Param('id') id:string){
  const file=await this.service.material(req.user.organizationId,req.user.id,req.user.role,id);
  res.setHeader('Content-Disposition','inline');
  res.setHeader('Cache-Control','private, no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  file.stream.pipe(res);
 }
}
