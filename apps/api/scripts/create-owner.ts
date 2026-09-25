import { PrismaClient,UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma=new PrismaClient();
async function main(){
 const email=process.env.OWNER_EMAIL?.trim().toLowerCase();
 const password=process.env.OWNER_PASSWORD;
 if(!email||!password||password.length<12) throw new Error('Set OWNER_EMAIL and OWNER_PASSWORD (minimum 12 characters)');
 const existing=await prisma.user.findUnique({where:{email}});
 if(existing){console.log('Owner account already exists');return;}
 await prisma.user.create({data:{email,passwordHash:await bcrypt.hash(password,12),firstName:'Владелец',lastName:'Платформы',role:UserRole.PLATFORM_OWNER}});
 console.log('Platform owner account created');
}
main().finally(()=>prisma.$disconnect());
