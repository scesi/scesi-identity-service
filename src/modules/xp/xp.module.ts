import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { XpRule, XpHistory } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([XpRule, XpHistory])],
  exports: [TypeOrmModule],
})
export class XpModule {}
