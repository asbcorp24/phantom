import {Controller,Get,Param,Req,Res,UseGuards} from '@nestjs/common';
import {Response} from 'express';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {FilesService} from './files.service';

@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
 constructor(private service:FilesService){}
 @Get('materials/:id')
 async material(@Req() req:any,@Res() res:Response,@Param('id') id:string){
  const file=await this.service.material(req.user.organizationId,req.user.id,req.user.role,id);
  res.setHeader('Content-Disposition','inline');
  file.stream.pipe(res);
 }
}
