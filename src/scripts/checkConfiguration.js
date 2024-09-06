const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

function checkConfiguration() {
	const config = vscode.workspace.getConfiguration('csManager');

	const dbhost = config.get('dbhost');
  	const port = config.get('port');
  	const user = config.get('user');
  	const password = config.get('password');
  	const db = config.get('db');

	if (!dbhost || !port || !user || !password || !db) {
        vscode.window.showInformationMessage('Algumas configurações estão por preencher!');
		vscode.commands.executeCommand('csmanager.configuration');
		return false;
	} else {
		return true;
	}
}

module.exports = {
    checkConfiguration
}