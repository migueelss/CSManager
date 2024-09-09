// The module 'vscode' contains the VS Code extensibility API
const vscode = require('vscode');
const {
	openGUI,
	pullCommand, 
	pushCommand,
	configuration
} = require('./src/scripts/scripts');
const {	checkConfiguration } = require("./src/scripts/checkConfiguration");

// This method is called when your extension is activated
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	checkConfiguration()

	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "csmanager" is now active!');

	const disposable = vscode.commands.registerCommand('csmanager.helloWorld', function () {
		vscode.window.showInformationMessage('Hello World from CSManager!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(openGUI);
	context.subscriptions.push(pullCommand);
	context.subscriptions.push(pushCommand);
}

// This method is called when your extension is deactivated
function deactivate() {}


module.exports = {
	activate,
	deactivate
}
