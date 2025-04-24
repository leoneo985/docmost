/*
 * @Author: wangjunwj wangjunwj@dinglicom.com
 * @Date: 2025-04-23 13:21:57
 * @LastEditors: wangjun neol4401@gmail.com
 * @LastEditTime: 2025-04-23 18:21:28
 * @FilePath: /docmost/apps/server/src/integrations/environment/environment.module.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Global, Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { ConfigModule } from '@nestjs/config';
import { validate, loadEnvWithOverride } from './environment.validation';
import { DomainService } from './domain.service';
import * as path from 'path';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadEnvWithOverride],
      validate,
    }),
  ],
  providers: [EnvironmentService, DomainService],
  exports: [EnvironmentService, DomainService],
})
export class EnvironmentModule {}
