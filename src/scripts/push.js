const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { checkConfiguration } = require ('./checkConfiguration');
const sql = require('mssql');
const { getDBConfig } = require('./dbconfig');
//const { } = require ('./queries');

const mapTables = new Map([
    ["/javascriptUtilizador/", "jsu"],
    ["/vbScriptsWeb/", "escr"],
    ["/monitores/", "emoi"],
])

const pushCommand = vscode.commands.registerCommand('csmanager.push', function () {
    if (checkConfiguration()) {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('Nenhum folder aberto. Por favor, abra um folder para usar este comando.');
            return; 
          }

        showPushOptions();  
    } else {
        vscode.window.showErrorMessage('Configure primeiro as configurações para acesso à base de dados!\n > CSManager: Configure');
    }

});

async function showPushOptions() {

    const pickCategories = [
        { label: "Enviar TODOS os scripts de Framework", id: "all"},
        { label: "Javascript de Utilizador", id: "jsUser"},
        { label: "Scripts Web (VB.NET)", id: "vbScriptsWeb"},
        { label: "Monitores", id: "vbMonitores"}
    ];
    
    const selectedCategory = await vscode.window.showQuickPick(pickCategories, {
        placeHolder: "",
        canPickMany: false,
    });

    if (!selectedCategory) {return;}

    switch (selectedCategory.id) {
        case "all":
            break;
        case "jsUser":
            pickScripts = await listPushFiles('/javascriptUtilizador/');
            
            pScripts = await vscode.window.showQuickPick(pickScripts, {
                placeHolder: "Javascript de Utilizador",
                canPickMany: true,
            });
            break;
        case "vbScriptsWeb":
            pickScripts = await listPushFiles('/vbScriptsWeb/');
            
            pScripts = await vscode.window.showQuickPick(pickScripts, {
                placeHolder: "Scripts Web (VB.NET)",
                canPickMany: true,
            });
            break;
        case "vbMonitores":
            pickScripts = await listPushFiles('/monitores/');
            
            pScripts = await vscode.window.showQuickPick(pickScripts, {
                placeHolder: "Monitores",
                canPickMany: true,
            });
            break;
    }

    if (!pScripts) {
        showPushOptions();    
        return;
    }

    if (pScripts.length == 0) {
        vscode.window.showInformationMessage('Não selecionou nenhum script.');
        return;
    }

    await pushScripts(pScripts);
}

async function listPushFiles(folder) {
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;

    fScripts = fs.readdirSync(path.join(workspacePath, folder)).filter(file => {
        return fs.statSync(path.join(workspacePath, folder, file)).isDirectory();
    });
    const formatResult = fScripts.map(item => ({ label: `${item}`,type: folder, path: path.join(workspacePath, folder, item)}));
    return formatResult;
}

async function pushScripts(pScripts) {
    for (const item of pScripts) {
        const files = fs.readdirSync(item.path);
        let pScriptSTAMP = null;
        const pushFiles = files.filter(file => {
            if (!file.includes('.')) {
                pScriptSTAMP = file;
                return false;
            }
            return true;
        });

        for (const pFile of pushFiles) {
            try {
                let pool = await sql.connect(getDBConfig());

                let pFileCode = fs.readFileSync(path.join(item.path, pFile), 'utf-8');
                let result = await pool.request()
                .input('fileCode', sql.NVarChar, pFileCode)
                .query(
                    `UPDATE ${mapTables.get(item.type)}
                    SET ${pFile.split('.').slice(0, -1).join('.')} = @fileCode
                    WHERE ${mapTables.get(item.type)}stamp LIKE '%${pScriptSTAMP}%'`
                );

                

                sql.close();
            } catch (err) {
                console.error('Error processing file:', pFile, err);
            }
        }
    }
}


module.exports = {
    pushCommand
}