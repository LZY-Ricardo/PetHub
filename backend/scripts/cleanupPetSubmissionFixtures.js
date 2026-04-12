require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mysql = require('mysql2/promise');

async function main() {
  const prefix = process.env.CLEANUP_PET_PREFIX || '联调送养犬_';
  const executeMode = process.argv.includes('--execute');
  const dryRun = !executeMode && process.env.CLEANUP_DRY_RUN !== 'false';

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'pet_management_platform'
  });

  const [rows] = await connection.query(
    'SELECT id, name, submission_status, status, owner_user_id, created_at FROM pet_info WHERE source_type = ? AND name LIKE ? ORDER BY id DESC',
    ['user', `${prefix}%`]
  );

  if (dryRun) {
    console.log(JSON.stringify({
      dryRun: true,
      prefix,
      database: process.env.DB_DATABASE || 'pet_management_platform',
      matchedCount: rows.length,
      records: rows
    }, null, 2));
    await connection.end();
    return;
  }

  if (!rows.length) {
    console.log(JSON.stringify({
      dryRun: false,
      prefix,
      database: process.env.DB_DATABASE || 'pet_management_platform',
      deletedCount: 0
    }, null, 2));
    await connection.end();
    return;
  }

  const ids = rows.map((item) => item.id);
  const placeholders = ids.map(() => '?').join(', ');

  await connection.beginTransaction();

  try {
    const [adoptionResult] = await connection.query(
      `DELETE FROM adoption_application WHERE pet_id IN (${placeholders})`,
      ids
    );
    const [notificationResult] = await connection.query(
      `DELETE FROM user_notification WHERE related_type = 'pet_submission' AND related_id IN (${placeholders})`,
      ids
    );
    const [petResult] = await connection.query(
      `DELETE FROM pet_info WHERE id IN (${placeholders})`,
      ids
    );

    const [remainingRows] = await connection.query(
      'SELECT id, name FROM pet_info WHERE id IN (' + placeholders + ')',
      ids
    );

    if (remainingRows.length > 0) {
      throw new Error(`删除校验失败，仍存在 ${remainingRows.length} 条宠物记录`);
    }

    await connection.commit();

    console.log(JSON.stringify({
      dryRun: false,
      prefix,
      database: process.env.DB_DATABASE || 'pet_management_platform',
      deletedCount: ids.length,
      deletedIds: ids,
      deletedApplications: adoptionResult.affectedRows || 0,
      deletedNotifications: notificationResult.affectedRows || 0,
      deletedPets: petResult.affectedRows || 0,
      verificationPassed: true
    }, null, 2));
  } catch (deleteError) {
    await connection.rollback();
    throw deleteError;
  }

  await connection.end();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
