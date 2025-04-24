/*
 * @Author: wangjun neol4401@gmail.com
 * @Date: 2025-04-23 13:21:57
 * @LastEditors: wangjun neol4401@gmail.com
 * @LastEditTime: 2025-04-23 19:14:37
 * @FilePath: /docmost/apps/server/src/integrations/environment/domain.service.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Injectable } from '@nestjs/common';
import { EnvironmentService } from './environment.service';

@Injectable()
export class DomainService {
  constructor(private environmentService: EnvironmentService) {}

  getUrl(hostname?: string): string {
    if (!this.environmentService.isCloud()) {
      return this.environmentService.getAppUrl();
    }

    const domain = this.environmentService.getSubdomainHost();
    if (!hostname || !domain) {
      return this.environmentService.getAppUrl();
    }

    const protocol = this.environmentService.isHttps() ? 'https' : 'http';
    return `${protocol}://${hostname}.${domain}`;
  }
}
