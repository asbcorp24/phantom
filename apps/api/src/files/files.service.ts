import {ForbiddenException,Injectable,NotFoundException} from '@nestjs/common';
import {createReadStream,existsSync,mkdirSync,writeFileSync} from 'fs';
import {extname,resolve,sep} from 'path';
import {randomUUID} from 'crypto';
import {PrismaService} from '../prisma/prisma.service';
import {AuditService} from '../audit/audit.service';

@Injectable()
export class FilesService {
 constructor(private prisma:PrismaService,private audit:AuditService){}
 private path(filePath:string){
  const root=resolve(process.env.STORAGE_PATH||'./storage/private');
  const full=resolve(root,filePath);
  if(full!==root&&!full.startsWith(root+sep))throw new ForbiddenException();
  return full;
 }
 async saveMaterialFile(organizationId:string,originalName:string,mimeType:string,buffer:Buffer){
  const allowed:Record<string,string[]>={
   'application/pdf':['.pdf'],
   'image/jpeg':['.jpg','.jpeg'],
   'image/png':['.png'],
   'image/webp':['.webp'],
   'video/mp4':['.mp4'],
   'video/webm':['.webm']
  };
  const ext=extname(originalName).toLowerCase();
  if(!allowed[mimeType]?.includes(ext))throw new ForbiddenException('Недопустимый тип файла');
  const rel=organizationId+'/'+randomUUID()+ext;
  const full=this.path(rel);mkdirSync(resolve(full,'..'),{recursive:true});writeFileSync(full,buffer);
  return {filePath:rel};
 }
 async material(organizationId:string,userId:string,role:string,materialId:string){
  const material=await this.prisma.material.findFirst({where:{id:materialId,courseVersion:{course:{organizationId}}}});
  if(!material?.filePath)throw new NotFoundException('Файл не найден');
  if(role!=='COMPANY_ADMIN'){
   const assignment=await this.prisma.assignment.findFirst({where:{organizationId,userId,courseVersionId:material.courseVersionId}});
   if(!assignment)throw new ForbiddenException();
  }
  const full=this.path(material.filePath);
  if(!existsSync(full))throw new NotFoundException('Файл не найден');
  await this.audit.write(userId,organizationId,'FILE_DOWNLOADED','Material',materialId);
  return {stream:createReadStream(full),name:material.title};
 }
}
