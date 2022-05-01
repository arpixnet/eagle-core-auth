import server from "./server";
import './database/database';

async function main() {
    server.listen(server.get('port'));
    console.log('   👍 Server run on port', server.get('port'), '🚀');
}

main();
