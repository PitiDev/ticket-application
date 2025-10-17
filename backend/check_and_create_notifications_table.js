const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function checkAndCreateNotificationsTable() {
    try {
        console.log('Checking notifications table...');

        // Check if notifications table exists
        const [tables] = await db.execute(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'notifications'
        `);

        if (tables[0].count === 0) {
            console.log('Notifications table does not exist. Creating...');

            // Read and execute SQL file
            const sqlPath = path.join(__dirname, 'create_notifications_table.sql');
            const sql = fs.readFileSync(sqlPath, 'utf8');

            await db.query(sql);

            console.log('✓ Notifications table created successfully!');
        } else {
            console.log('✓ Notifications table already exists.');

            // Check table structure
            const [columns] = await db.execute(`
                SHOW COLUMNS FROM notifications
            `);

            console.log('\nTable structure:');
            columns.forEach(col => {
                console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `(${col.Key})` : ''}`);
            });
        }

        // Check if there are any notifications
        const [count] = await db.execute('SELECT COUNT(*) as total FROM notifications');
        console.log(`\n✓ Total notifications in database: ${count[0].total}`);

        // Show sample notifications
        if (count[0].total > 0) {
            const [sample] = await db.execute('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5');
            console.log('\nSample notifications:');
            sample.forEach((notif, idx) => {
                console.log(`  ${idx + 1}. [${notif.type}] ${notif.title} - User: ${notif.user_id}, Read: ${notif.is_read}`);
            });
        } else {
            console.log('\n⚠ No notifications found in database.');
            console.log('Notifications will be created when tickets are assigned or updated.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAndCreateNotificationsTable();
