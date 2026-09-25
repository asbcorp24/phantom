import { Module } from '@nestjs/common';
import { CertificatesModule } from '../certificates/certificates.module';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
@Module({imports:[CertificatesModule],controllers:[TestsController],providers:[TestsService]})
export class TestsModule {}
