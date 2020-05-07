import app from "./app";
import dotenv from 'dotenv';
dotenv.config();
import './database/database';

async function main() {
    app.listen(app.get('port'));
    console.log('   👍 Server run on port', app.get('port'), '🚀');
}

main();
