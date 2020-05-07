import { Pool, ClientConfig } from 'pg';
import config from '../config/config';

const dbOptions: ClientConfig = {
    user: config.DB.USER,
    password: config.DB.PASSWORD,
    host: config.DB.HOST,
    port: config.DB.PORT,
    database: config.DB.DATABASE
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
