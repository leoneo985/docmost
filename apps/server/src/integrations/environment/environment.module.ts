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
import { validate } from './environment.validation';
import { DomainService } from './domain.service';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { envPath } from '../../common/helpers/utils';

console.log('[EnvModule - PreLoad] Attempting synchronous dotenv load...');
console.log(`[EnvModule - PreLoad] Using envPath: ${envPath}`);
console.log(`[EnvModule - PreLoad] process.env.STORAGE_LOCAL_PATH BEFORE sync load: ${process.env.STORAGE_LOCAL_PATH}`);
try {
  const result = dotenv.config({ path: envPath, override: true });
  if (result.error) {
    console.error('[EnvModule - PreLoad] Error during sync dotenv load:', result.error);
  } else {
    console.log('[EnvModule - PreLoad] Sync dotenv load successful. Parsed keys:', Object.keys(result.parsed || {}).join(', '));
  }
} catch (err) {
  console.error('[EnvModule - PreLoad] Exception during sync dotenv load:', err);
}
console.log(`[EnvModule - PreLoad] process.env.STORAGE_LOCAL_PATH AFTER sync load: ${process.env.STORAGE_LOCAL_PATH}`);
console.log(`[EnvModule - PreLoad] process.env.DATABASE_URL AFTER sync load: ${process.env.DATABASE_URL}`);

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      expandVariables: true,
    }),
  ],
  providers: [EnvironmentService, DomainService],
  exports: [EnvironmentService, DomainService],
})
export class EnvironmentModule {}
