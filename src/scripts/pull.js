const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { checkConfiguration } = require ('./checkConfiguration');
const sql = require('mssql');
const { getDBConfig } = require('./dbconfig');
const { pull_queryjsUser } = require ('./queries');

const pullCommand = vscode.commands.registerCommand('csmanager.pull', function () {
    if (checkConfiguration()) {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('Nenhum folder aberto. Por favor, abra um folder para usar este comando.');
            return; 
          }

        showPullOptions();  
    } else {
        vscode.window.showErrorMessage('Configure primeiro as configurações para acesso à base de dados!\n > CSManager: Configure');
    }

});

async function showPullOptions() {

    const pickCategories = [
        { label: "Importar TODOS os scripts de Framework", id: "all"},
        { label: "Javascript de Utilizador", id: "jsUser"},
    ];

    const selectedCategory = await vscode.window.showQuickPick(pickCategories, {
        placeHolder: "",
        canPickMany: false,
    });

    if (!selectedCategory) {return;}

    let pickScripts = [];
    let pScripts = [];

    switch (selectedCategory.id) {
        case "all":
            break;
        case "jsUser":
            pickScripts = await listPullFiles(pull_queryjsUser);
            
            pScripts = await vscode.window.showQuickPick(pickScripts, {
                placeHolder: "Javascript de Utilizador",
                canPickMany: true,
            });
    }

    if (!pScripts) {return;}

    if (pScripts.length == 0) {
        vscode.window.showInformationMessage('Não selecionou nenhum script.');
        return;
    }

    await pullScripts(pScripts);
}

async function listPullFiles(query) {
    try {
        
        let pool = await sql.connect(getDBConfig());

        let result = await pool.request().query(query);

        let formatResult = result.recordset.map(row => ({
            label: row.name,
            id: row.stamp,
            code: row.code,
            folder: row.folder,
            extension: row.extension
        }));

        console.log(result.recordset);
        return formatResult;
    } catch (err) {
        console.log(err);
    } finally {
        sql.close();
    }
}

function ensureDirectoryExists(dirPath, callback) {
    fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
            vscode.window.showErrorMessage(`Erro ao criar a pasta "${dirPath}": ${err.message}`);
        } else {
            callback();
        }
    });
}

function writeFile(filePath, content) {
    fs.writeFile(filePath, content, (err) => {
        if (err) {
            vscode.window.showErrorMessage(`Erro ao receber o script "${path.basename(filePath)}": ${err.message}`);
        }
    });
}

function pullScripts(pScripts) {
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    
    pScripts.forEach(item => {
        const folderPath = path.join(workspacePath, item.folder);
        const scriptFolderPath = path.join(folderPath, item.label);
        const filePath = path.join(scriptFolderPath, item.id + item.extension);
    
        ensureDirectoryExists(folderPath, () => {
            ensureDirectoryExists(scriptFolderPath, () => {
                writeFile(filePath, item.code);
            });
        });
    });
}

module.exports = {
    pullCommand
}