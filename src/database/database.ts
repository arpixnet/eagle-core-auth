import { Pool, ClientConfig } from 'pg';
import config from '../config/config';

const dbOptions: ClientConfig = {
    user: config.db.user,
    password: config.db.password,
    host: config.db.host,
    port: config.db.port,
    database: config.db.database
};

const pool = new Pool(dbOptions);

pool.connect().then(() => {
    console.log('   🐘 PostgreSQL connection stablished');
    console.log('');
}).catch(err => {
    console.log('   PostgreSQL connection error:', err);
    process.exit();
});

export default pool;
