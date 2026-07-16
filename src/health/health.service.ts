import { Injectable } from '@nestjs/common';
import { IActionBase } from '../core/interfaces';

export interface HealthResult {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
}

@Injectable()
export class HealthService implements IActionBase<void, HealthResult> {
  execute(): Promise<HealthResult> {
    return Promise.resolve({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
}
