import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module';
@Module({imports:[PrismaModule,AuthModule,OrganizationsModule,UsersModule,DepartmentsModule],controllers:[HealthController]})
export class AppModule {}
