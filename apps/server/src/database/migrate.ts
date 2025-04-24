/*
 * @Author: wangjun neol4401@gmail.com
 * @Date: 2025-04-23 13:21:57
 * @LastEditors: wangjun neol4401@gmail.com
 * @LastEditTime: 2025-04-23 20:14:03
 * @FilePath: /docmost/apps/server/src/database/migrate.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as path from 'path';
import { promises as fs } from 'fs';
import pg from 'pg';
import {
  Kysely,
  Migrator,
  PostgresDialect,
  FileMigrationProvider,
} from 'kysely';
import { run } from 'kysely-migration-cli';
import * as dotenv from 'dotenv';
import { envPath } from '../common/helpers/utils';

dotenv.config({ path: envPath });
console.log('envPath', envPath)
console.log('process.env.NODE_ENV', process.env.NODE_ENV)
console.log(process.env.DATABASE_URL)
const migrationFolder = path.join(__dirname, './migrations');
// console.log(process.env) // Keep this if you want to see all vars

const db = new Kysely<any>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    }) as any,
  }),
});

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder,
  }),
});

run(db, migrator, migrationFolder);
