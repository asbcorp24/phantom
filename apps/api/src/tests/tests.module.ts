import { Module } from '@nestjs/common';
import { CertificatesModule } from '../certificates/certificates.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
@Module({imports:[CertificatesModule,NotificationsModule],controllers:[TestsController],providers:[TestsService]})
export class TestsModule {}
