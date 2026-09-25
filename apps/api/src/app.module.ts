import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { HealthController } from './health.controller';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, OrganizationsModule, UsersModule],
  controllers: [HealthController],
})
export class AppModule {}
