/*
 * @Author: wangjun neol4401@gmail.com
 * @Date: 2025-04-23 13:21:57
 * @LastEditors: wangjun neol4401@gmail.com
 * @LastEditTime: 2025-04-24 09:07:48
 * @FilePath: /docmost/apps/server/src/common/helpers/utils.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

console.log('[envPath] Starting calculation...');
const nodeEnv = process.env.NODE_ENV;
console.log(`[envPath] Read process.env.NODE_ENV: ${nodeEnv} (Type: ${typeof nodeEnv})`);

// Calculate project root using __dirname, relative to the compiled JS file location
// __dirname should be .../docmost/apps/server/dist/common/helpers
// Project root is 5 levels up.
const projectRoot = path.resolve(__dirname, '..', '..', '..', '..', '..');
console.log(`[envPath] Calculated projectRoot using __dirname: ${projectRoot}`);

let envFilePath = path.join(projectRoot, '.env'); // Default to .env in the calculated project root
console.log(`[envPath] Default envFilePath: ${envFilePath}`);

// Use explicit check for 'production' string
if (nodeEnv === 'production') {
  console.log(`[envPath] NODE_ENV is 'production'. Checking for .env.prod...`);
  const potentialEnvPath = path.join(projectRoot, `.env.prod`);
  console.log(`[envPath] Checking path: ${potentialEnvPath}`);
  if (fs.existsSync(potentialEnvPath)) {
    envFilePath = potentialEnvPath;
    console.log(`[envPath] Found .env.prod: ${envFilePath}`);
  } else {
    console.warn(`[envPath] NODE_ENV is 'production', but '${potentialEnvPath}' not found. Falling back to default: '${envFilePath}'.`);
  }
} else {
   console.log(`[envPath] NODE_ENV is not 'production' (Value: '${nodeEnv}'). Using default: '${envFilePath}'.`);
}

console.log(`[envPath] Final envPath determined: ${envFilePath}`);
export const envPath = envFilePath;

export async function hashPassword(password: string) {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePasswordHash(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

export type RedisConfig = {
  host: string;
  port: number;
  db: number;
  password?: string;
  family?: number;
};

export function parseRedisUrl(redisUrl: string): RedisConfig {
  // format - redis[s]://[[username][:password]@][host][:port][/db-number][?family=4|6]
  const url = new URL(redisUrl);
  const { hostname, port, password, pathname, searchParams } = url;
  const portInt = parseInt(port, 10);

  let db: number = 0;
  // extract db value if present
  if (pathname.length > 1) {
    const value = pathname.slice(1);
    if (!isNaN(parseInt(value))) {
      db = parseInt(value, 10);
    }
  }

  // extract family from query parameters
  let family: number | undefined;
  const familyParam = searchParams.get('family');
  if (familyParam && !isNaN(parseInt(familyParam))) {
    family = parseInt(familyParam, 10);
  }

  return { host: hostname, port: portInt, password, db, family };
}

export function createRetryStrategy() {
  return function (times: number): number {
    return Math.max(Math.min(Math.exp(times), 20000), 3000);
  };
}

export function extractDateFromUuid7(uuid7: string) {
  //https://park.is/blog_posts/20240803_extracting_timestamp_from_uuid_v7/
  const parts = uuid7.split('-');
  const highBitsHex = parts[0] + parts[1].slice(0, 4);
  const timestamp = parseInt(highBitsHex, 16);

  return new Date(timestamp);
}
