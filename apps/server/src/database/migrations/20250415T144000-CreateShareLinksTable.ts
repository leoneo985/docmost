/*
 * @Author: wangjunwj wangjunwj@dinglicom.com
 * @Date: 2025-04-15 14:40:09
 * @LastEditors: wangjunwj wangjunwj@dinglicom.com
 * @LastEditTime: 2025-04-15 17:57:58
 * @FilePath: /docmost/apps/server/src/database/migrations/20250415T144000-CreateShareLinksTable.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('share_links')
    .addColumn('id', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('token', 'varchar', (col) => col.unique().notNull())
    .addColumn('resourceId', 'uuid', (col) => col.notNull())
    .addColumn(
      'resourceType',
      sql`varchar CHECK ("resourceType" IN ('page', 'space'))`,
      (col) => col.notNull(),
    ) // 使用 CHECK 约束模拟枚举
    .addColumn(
      'permissions',
      sql`varchar CHECK ("permissions" IN ('read-only'))`,
      (col) => col.notNull().defaultTo('read-only'),
    ) // 默认为只读
    .addColumn('expiresAt', 'timestamptz') // 可选的过期时间
    .addColumn('createdAt', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'createdBy',
      'uuid',
      (col) => col.references('users.id').onDelete('set null'), // 外键关联用户，用户删除后设为 null
    )
    .addColumn(
      'workspaceId',
      'uuid',
      (col) => col.references('workspaces.id').onDelete('cascade').notNull(), // 外键关联工作区，工作区删除后级联删除
    )
    .execute();

  // 为 token 和 resourceId 添加索引以提高查询性能
  await db.schema
    .createIndex('share_links_token_index')
    .on('share_links')
    .column('token')
    .execute();

  await db.schema
    .createIndex('share_links_resource_id_type_index')
    .on('share_links')
    .columns(['resourceId', 'resourceType'])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('share_links').execute();
  // 注意：索引通常会随表一起删除，但显式删除更安全
  await db.schema.dropIndex('share_links_token_index').ifExists().execute();
  await db.schema
    .dropIndex('share_links_resource_id_type_index')
    .ifExists()
    .execute();
}
