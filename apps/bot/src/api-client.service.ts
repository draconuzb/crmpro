import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ApiClientService implements OnModuleInit {
  private readonly logger = new Logger(ApiClientService.name);
  private client: AxiosInstance;
  private accessToken: string | null = null;

  onModuleInit() {
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';

    this.client = axios.create({
      baseURL: `${baseURL}/api`,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      if (this.accessToken) {
        config.headers.Authorization = `Bearer ${this.accessToken}`;
      }
      return config;
    });

    this.logger.log(`API client initialized: ${baseURL}`);
  }

  async authenticate() {
    const phone = process.env.BOT_SERVICE_PHONE;
    const password = process.env.BOT_SERVICE_PASSWORD;

    if (!phone || !password) {
      this.logger.warn('BOT_SERVICE_PHONE or BOT_SERVICE_PASSWORD not set');
      return;
    }

    try {
      const response = await this.client.post('/auth/login', { phone, password });
      this.accessToken = response.data.accessToken;
      this.logger.log('Bot authenticated with API');
    } catch (error) {
      this.logger.error('Failed to authenticate bot with API', error);
    }
  }

  async get<T = any>(path: string, params?: any): Promise<T> {
    if (!this.accessToken) await this.authenticate();
    const response = await this.client.get(path, { params });
    return response.data;
  }

  async post<T = any>(path: string, data?: any): Promise<T> {
    if (!this.accessToken) await this.authenticate();
    const response = await this.client.post(path, data);
    return response.data;
  }

  async put<T = any>(path: string, data?: any): Promise<T> {
    if (!this.accessToken) await this.authenticate();
    const response = await this.client.put(path, data);
    return response.data;
  }

  async delete<T = any>(path: string): Promise<T> {
    if (!this.accessToken) await this.authenticate();
    const response = await this.client.delete(path);
    return response.data;
  }

  setBranchId(branchId: number) {
    this.client.defaults.headers['x-branch-id'] = branchId.toString();
  }
}
