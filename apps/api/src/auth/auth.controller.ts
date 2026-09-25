import { Body,Controller,Get,Post,Req,UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
@Controller('auth')
export class AuthController {
 constructor(private service:AuthService){}
 @Post('login') login(@Body() dto:LoginDto){return this.service.login(dto.email,dto.password);}
 @UseGuards(JwtAuthGuard) @Get('me') me(@Req() req:any){return req.user;}
 @UseGuards(JwtAuthGuard) @Post('2fa/setup') setup(@Req() req:any){return this.service.setupTwoFactor(req.user.id);}
 @UseGuards(JwtAuthGuard) @Post('2fa/enable') enable(@Req() req:any,@Body() body:{code:string}){return this.service.enableTwoFactor(req.user.id,body.code);}
 @Post('2fa/verify') verify(@Body() body:{challengeToken:string,code:string}){return this.service.verifyTwoFactor(body.challengeToken,body.code);}
}
