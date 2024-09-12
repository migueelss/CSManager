const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

const configuration = vscode.commands.registerCommand('csmanager.configuration', async function () {
    const config = vscode.workspace.getConfiguration('csManager');

    // Função para exibir o InputBox e atualizar a configuração
    async function promptInput(prompt, key) {
        const value = await vscode.window.showInputBox({
          prompt: prompt,
          placeHolder: config.get(key),
          ignoreFocusOut: true,
          validateInput: (input) => {
            if (!input || input === '' || !hasNonWhitespaceCharacters(input)) {
              return "O campo não pode estar vazio!";
            }
            return null;
          },
          value: config.get(key) || ''
        });
        
        if (value !== undefined && value !== '') {
          await config.update(key, value.trim(), vscode.ConfigurationTarget.Global);
        }
    }

    // Chama a função para cada configuração em sequência
    try {
        await promptInput('Endereço do servidor de base de dados', 'dbhost');
        await promptInput('Porta do servidor de base de dados', 'port');
        await promptInput('Utilizador para autenticação na base de dados', 'user');
        await promptInput('Password para autenticação na base de dados', 'password');
        await promptInput('Nome da base de dados', 'db');
        vscode.window.showInformationMessage('Configurações atualizadas.');
    } catch (err) {
        vscode.window.showErrorMessage('Erro ao atualizar configurações: ' + err.message);
    }
});

function hasNonWhitespaceCharacters(str) {
    return str.trim().length > 0;
  }

module.exports = {
    configuration
}