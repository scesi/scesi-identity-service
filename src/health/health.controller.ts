import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../modules/auth/decorators';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the service health status, timestamp and uptime.',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      example: {
        status: 'ok',
        timestamp: '2026-09-11T00:00:00.000Z',
        uptime: 123.45,
      },
    },
  })
  check() {
    return this.healthService.execute();
  }
}
