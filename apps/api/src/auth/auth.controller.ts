import { Body,Controller,Get,Post,Req,UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
@Controller('auth')
export class AuthController {
 constructor(private service:AuthService){}
 @Post('login') login(@Body() dto:LoginDto){return this.service.login(dto.email,dto.password);}
 @UseGuards(JwtAuthGuard) @Get('me') me(@Req() req:any){return req.user;}
}
