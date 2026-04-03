import { Injectable, Logger } from '@nestjs/common';
import { ApiClientService } from './api-client.service';

@Injectable()
export class BotService {
  private readonly logger = new Logger(BotService.name);

  constructor(private readonly apiClient: ApiClientService) {}

  async validateUser(telegramId: string) {
    try {
      const user = await this.apiClient.get(`/users/telegram/${telegramId}`);
      return user;
    } catch {
      this.logger.warn(`Unauthorized Telegram user: ${telegramId}`);
      return null;
    }
  }
}
