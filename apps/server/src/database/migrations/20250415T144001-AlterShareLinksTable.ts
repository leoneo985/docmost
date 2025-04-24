import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // 1. 重命名列
  await db.schema
    .alterTable('share_links')
    .renameColumn('resourceId', 'resource_id')
    .execute();
  await db.schema
    .alterTable('share_links')
    .renameColumn('resourceType', 'resource_type')
    .execute();
  await db.schema
    .alterTable('share_links')
    .renameColumn('expiresAt', 'expires_at')
    .execute();
  await db.schema
    .alterTable('share_links')
    .renameColumn('createdAt', 'created_at')
    .execute();
  await db.schema
    .alterTable('share_links')
    .renameColumn('createdBy', 'created_by_user_id')
    .execute();
  await db.schema
    .alterTable('share_links')
    .renameColumn('workspaceId', 'workspace_id')
    .execute();
  await db.schema
    .alterTable('share_links')
    .renameColumn('permissions', 'access_level') // 重命名 permissions 列
    .execute();

  // 2. 修改列类型/约束
  await db.schema
    .alterTable('share_links')
    .alterColumn('token', (col) => col.setDataType('varchar(255)')) // 指定 token 长度
    .execute();
  await db.schema
    .alterTable('share_links')
    .alterColumn('access_level', (col) => col.setDataType('varchar(50)')) // 调整 access_level 类型长度 (如果需要)
    .execute();

  // 3. 添加新列
  await db.schema
    .alterTable('share_links')
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull(),
    )
    .execute();
  await db.schema
    .alterTable('share_links')
    .addColumn('deleted_at', 'timestamptz')
    .execute();

  // 4. 重命名和添加索引 (处理索引的代码保持不变，因为它们已经是单独的语句)
  await db.schema.dropIndex('share_links_token_index').ifExists().execute();
  await db.schema
    .createIndex('idx_shared_links_token')
    .on('share_links') // 注意：这里表名还没改
    .column('token')
    .execute();

  await db.schema
    .dropIndex('share_links_resource_id_type_index')
    .ifExists()
    .execute();
  await db.schema
    .createIndex('idx_shared_links_resource')
    .on('share_links') // 注意：这里表名还没改
    .columns(['resource_type', 'resource_id']) // 使用已重命名的列
    .execute();

  // 添加缺失的索引
  await db.schema
    .createIndex('idx_shared_links_workspace_id')
    .on('share_links') // 注意：这里表名还没改
    .column('workspace_id') // 使用已重命名的列
    .execute();

  // 5. 最后重命名表
  await db.schema.alterTable('share_links').renameTo('shared_links').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
   // 1. 先重命名表回原来的名字
  await db.schema.alterTable('shared_links').renameTo('share_links').execute();

  // 2. 删除添加的索引
  await db.schema.dropIndex('idx_shared_links_workspace_id').ifExists().execute();

  // 3. 重命名索引回原来的名字 (drop new, create old)
  await db.schema.dropIndex('idx_shared_links_token').ifExists().execute();
  await db.schema
    .createIndex('share_links_token_index')
    .on('share_links')
    .column('token')
    .execute();

  await db.schema.dropIndex('idx_shared_links_resource').ifExists().execute();
  await db.schema
    .createIndex('share_links_resource_id_type_index')
    .on('share_links')
    // 使用 down 函数中应该存在的列名 (down 操作是 up 的逆序)
    // 在重命名列之前，这些索引应该引用旧列名
    .columns(['resource_id', 'resource_type'])
    .execute();

  // 4. 删除添加的列
  await db.schema
    .alterTable('share_links')
    .dropColumn('updated_at')
    .execute();
   await db.schema
    .alterTable('share_links')
    .dropColumn('deleted_at')
    .execute();

  // 5. 修改列类型/约束回原来的状态 (如果需要且可能)
  // Kysely 可能不直接支持改回不指定长度的 varchar，这里可能需要原生 SQL 或省略

  // 6. 重命名列回原来的名字 (按 up 中重命名的逆序)
  await db.schema
    .alterTable('share_links')
    .renameColumn('access_level', 'permissions')
    .execute();
  await db.schema
    .alterTable('share_links')
    .renameColumn('workspace_id', 'workspaceId')
    .execute();
  await db.schema
    .alterTable('share_links')
    .renameColumn('created_by_user_id', 'createdBy')
    .execute();
   await db.schema
    .alterTable('share_links')
    .renameColumn('created_at', 'createdAt')
    .execute();
  await db.schema
    .alterTable('share_links')
    .renameColumn('expires_at', 'expiresAt')
    .execute();
  await db.schema
    .alterTable('share_links')
    .renameColumn('resource_type', 'resourceType')
    .execute();
  await db.schema
    .alterTable('share_links')
    .renameColumn('resource_id', 'resourceId')
    .execute();
} 