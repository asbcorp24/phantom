import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NotificationsService } from './notifications.service';

@Injectable()
export class DeadlineScheduler {
  private readonly logger = new Logger(DeadlineScheduler.name);
  constructor(private readonly notifications: NotificationsService) {}

  @Cron('0 15 2 * * *')
  async run() {
    try {
      const result = await this.notifications.processDeadlines();
      this.logger.log('Deadline processing completed: ' + JSON.stringify(result));
    } catch (error) {
      this.logger.error('Deadline processing failed', error instanceof Error ? error.stack : String(error));
    }
  }
}
