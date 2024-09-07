const vscode = require('vscode');

function getDBConfig() {
    const config = vscode.workspace.getConfiguration('csManager');
    db_config = {
        user: config.get('user'),
        password: config.get('password'),
        server: config.get('dbhost'),
        database: config.get('db'),
        options: {
            trustServerCertificate: true
        }
    };
    return db_config;
}

module.exports = {
    getDBConfig
}