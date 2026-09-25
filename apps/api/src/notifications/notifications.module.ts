import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { DeadlineScheduler } from './deadline.scheduler';
@Module({controllers:[NotificationsController],providers:[NotificationsService,DeadlineScheduler],exports:[NotificationsService]})
export class NotificationsModule {}
