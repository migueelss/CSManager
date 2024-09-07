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
    //const pullFiles = await listPullFiles();

    const pickCategories = [
        { label: "Todos os scripts de Framework", id: "all"},
        { label: "Javascript de Utilizador", id: "jsUser"},
    ];

    const selectedCategory = await vscode.window.showQuickPick(pickCategories, {
        placeHolder: "",
        canPickMany: false,
    });

    if (!selectedCategory) {return;}

    let pickScripts = [];
    let pullScripts = [];

    switch (selectedCategory.id) {
        case "all":
            break;
        case "jsUser":
            pickScripts = await listPullFiles(pull_queryjsUser);
            
            pullScripts = await vscode.window.showQuickPick(pickScripts, {
                placeHolder: "Javascript de Utilizador",
                canPickMany: true,
            });
            console.log(pullScripts);
    }

    if (!pullScripts) {return;}

    if (pullScripts.length == 0) {
        vscode.window.showInformationMessage('Não selecionou nenhum script.');
        return;
    }

    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    console.log("PullScripts:")
    console.log(pullScripts)
    pullScripts.forEach(item => {
        fs.access(path.join(workspacePath, item.folder), fs.constants.F_OK, (err) => {
            if (err) {
                fs.mkdir(path.join(workspacePath, item.folder), { recursive: true}, (err) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Erro ao criar a pasta "${item.folder}": ${err.message}`);
                    } else {
                        vscode.window.showInformationMessage(`A pasta "${item.folder}" foi criada com sucesso.`);
                    }
                });
            }
            fs.access(path.join(workspacePath, item.folder, `/${item.label}/`), fs.constants.F_OK, (err) => {
                if (err) {
                    fs.mkdir(path.join(workspacePath, item.folder, `/${item.label}/`), { recursive: true}, (err) => {
                        if (err) {
                            return;
                        }
                    });
                }
                fs.writeFile(path.join(workspacePath, item.folder, `/${item.label}/`,(item.id+item.extension)), item.code, (err) => {
                    if (err) {
                        vscode.window.showErrorMessage(`Erro ao receber o script "${item.label}": ${err.message}`);
                    }
                });
            });
        });
    });
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


module.exports = {
    pullCommand
}