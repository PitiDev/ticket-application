const db = require('./src/config/database');

async function testQuery() {
    try {
        console.log('Test 1: Simple select without params...');
        const [test1] = await db.execute('SELECT * FROM notifications LIMIT 5');
        console.log(`✓ Success: Found ${test1.length} notifications`);

        console.log('\nTest 2: Select with user_id parameter...');
        const userId = 13;
        const [test2] = await db.execute(
            'SELECT * FROM notifications WHERE user_id = ? LIMIT 5',
            [userId]
        );
        console.log(`✓ Success: Found ${test2.length} notifications for user ${userId}`);

        console.log('\nTest 3: Select with JOIN...');
        const [test3] = await db.execute(`
            SELECT n.*, t.ticket_number, t.title as ticket_title
            FROM notifications n
            LEFT JOIN tickets t ON n.ticket_id = t.id
            WHERE n.user_id = ?
            LIMIT 5
        `, [userId]);
        console.log(`✓ Success: Found ${test3.length} notifications with ticket info`);

        console.log('\nTest 4: Dynamic LIMIT (current implementation)...');
        const limit = 5;
        const query = `
            SELECT n.*, t.ticket_number, t.title as ticket_title
            FROM notifications n
            LEFT JOIN tickets t ON n.ticket_id = t.id
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC LIMIT ${limit}
        `;
        const [test4] = await db.execute(query, [userId]);
        console.log(`✓ Success: Found ${test4.length} notifications`);
        if (test4.length > 0) {
            console.log('\nSample notification:');
            console.log(JSON.stringify(test4[0], null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('✗ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

testQuery();
