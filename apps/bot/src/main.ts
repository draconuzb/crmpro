import { NestFactory } from '@nestjs/core';
import { BotModule } from './bot.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('CRMPro Bot');

  const app = await NestFactory.create(BotModule);

  // Optional HTTP port for health checks
  const port = process.env.BOT_PORT || 3001;
  await app.listen(port);

  logger.log(`CRMPro Telegram Bot started on port ${port}`);
  logger.log(`Bot is polling for updates...`);
}

bootstrap();
