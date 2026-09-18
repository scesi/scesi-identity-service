import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './modules/auth/decorators';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Service root',
    description: 'Returns a plain-text greeting. Useful for smoke checks.',
  })
  @ApiResponse({ status: 200, description: 'Plain-text greeting' })
  getHello(): string {
    return this.appService.getHello();
  }
}
