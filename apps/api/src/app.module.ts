import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module';
import { CoursesModule } from './courses/courses.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ProgressModule } from './progress/progress.module';
import { TestsModule } from './tests/tests.module';
import { CertificatesModule } from './certificates/certificates.module';
import { ReportsModule } from './reports/reports.module';
@Module({imports:[PrismaModule,AuthModule,OrganizationsModule,UsersModule,DepartmentsModule,CoursesModule,AssignmentsModule,ProgressModule,TestsModule,CertificatesModule,ReportsModule],controllers:[HealthController]})
export class AppModule {}
