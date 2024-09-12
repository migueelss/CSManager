const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { checkConfiguration } = require ('./checkConfiguration');
const sql = require('mssql');
const { getDBConfig } = require('./dbconfig');
const { pull_queryjsUser, pull_queryvbWebScripts, pull_queryMonitores, pull_queryObjetosEcra } = require ('./queries');

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
        //{ label: "Receber TODOS os scripts de Framework", id: "all"},
        { label: "Javascript de Utilizador", id: "jsUser", query: pull_queryjsUser},
        { label: "Scripts Web (VB.NET)", id: "vbScriptsWeb", query: pull_queryvbWebScripts},
        { label: "Monitores", id: "vbMonitores", query: pull_queryMonitores},
        { label: "Objetos de Ecrã", id: "objetosEcra", query: pull_queryObjetosEcra}
    ];

    const selectedCategory = await vscode.window.showQuickPick(pickCategories, {
        placeHolder: "",
        canPickMany: false,
    });

    if (!selectedCategory) {return;}

    let pickScripts = [];
    let pScripts = [];

    pickScripts = await listPullFiles(selectedCategory.query);

    pScripts = await vscode.window.showQuickPick(pickScripts, {
        placeHolder: selectedCategory.label,
        canPickMany: true,
    });

    if (!pScripts) {
        showPullOptions();    
        return;
    }

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
            code: row.code.split('/@!barreira#bRrieR*>/'),
            folder: row.folder,
            extension: row.extension.split('/@!barreira#bRrieR*>/'),
            col: row.type.split('/@!barreira#bRrieR*>/')
        }));

        return formatResult;
    } catch (err) {
        vscode.window.showErrorMessage(`Erro: ${err}`);
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
        const idPath = path.join(scriptFolderPath, item.id)
    
        ensureDirectoryExists(folderPath, () => {
            ensureDirectoryExists(scriptFolderPath, () => {
                writeFile(idPath, "");
                item.col.forEach((value, index) => {
                    var filePath = path.join(scriptFolderPath, value + item.extension[index]);
                    writeFile(filePath, item.code[index]);
                });
            });
        });
    });
}

module.exports = {
    pullCommand
}