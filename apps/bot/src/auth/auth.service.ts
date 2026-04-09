import { Injectable, Logger } from '@nestjs/common';
import { ApiClientService } from '../api-client.service';

interface BotUser {
  id: number;
  name: string;
  phone: string;
  role: string;
  telegramId: string;
  telegramLang: string;
  branches: { id: number; name: string }[];
  botSections: string[];
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private userCache = new Map<string, { user: BotUser; cachedAt: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly apiClient: ApiClientService) {}

  async getUserByTelegramId(telegramId: string): Promise<BotUser | null> {
    const cached = this.userCache.get(telegramId);
    if (cached && Date.now() - cached.cachedAt < this.CACHE_TTL) {
      return cached.user;
    }

    try {
      const user = await this.apiClient.get<BotUser>(`/users/telegram/${telegramId}`);
      this.userCache.set(telegramId, { user, cachedAt: Date.now() });
      return user;
    } catch {
      return null;
    }
  }

  hasPermission(user: BotUser, section: string): boolean {
    if (user.role === 'CEO') return true;
    return user.botSections?.includes(section) ?? false;
  }

  clearCache(telegramId?: string) {
    if (telegramId) {
      this.userCache.delete(telegramId);
    } else {
      this.userCache.clear();
    }
  }
}
