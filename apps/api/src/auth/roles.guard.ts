import { CanActivate,ExecutionContext,ForbiddenException,Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
@Injectable()
export class RolesGuard implements CanActivate {
 constructor(private reflector:Reflector){}
 canActivate(ctx:ExecutionContext){
  const roles=this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY,[ctx.getHandler(),ctx.getClass()]);
  if(!roles)return true;
  if(!roles.includes(ctx.switchToHttp().getRequest().user?.role))throw new ForbiddenException();
  return true;
 }
}
