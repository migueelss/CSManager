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
    ["/itensMonitor/", "emoi"],
    ["/valoresDefeito/", "eudefs"],
    ["/regras/", "ebrule"],
    ["/opcoesEcra/", "etl"],
    ["/eventos/", "eeventos"]
]);

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
        //{ label: "Enviar TODOS os scripts de Framework", id: "all"},
        { label: "Javascript de Utilizador", id: "/javascriptUtilizador/"},
        { label: "Scripts Web (VB.NET)", id: "/vbScriptsWeb/"},
        { label: "Monitores", id: "/itensMonitor/"},
        { label: "Valores por Defeito", id: "/valoresDefeito/"},
        { label: "Regras", id: "/regras/"},
        { label: "Opções de Ecrã", id: "/opcoesEcra/"},
        { label: "Eventos", id: "/eventos/"}
    ];
    
    const selectedCategory = await vscode.window.showQuickPick(pickCategories, {
        placeHolder: "",
        canPickMany: false,
    });

    if (!selectedCategory) {return;}

    pickScripts = await listPushFiles(selectedCategory.id);

    pScripts = await vscode.window.showQuickPick(pickScripts, {
        placeHolder: selectedCategory.label,
        canPickMany: true,
    });

    if (!pScripts) {
        showPushOptions();    
        return;
    }

    if (pScripts.length == 0) {
        vscode.window.showInformationMessage('Não selecionou nenhum script.');
        return;
    }

    await pushScripts(pScripts);
    vscode.window.showInformationMessage('Script(s) submetido(s).');
}

async function listPushFiles(folder) {
    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;


    if (!fs.existsSync(path.join(workspacePath, folder))) {
        vscode.window.showErrorMessage(`Não encontrei nada em ${folder}`);
        return
    }
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
                console.error('Erro ao processar o ficheiro:', pFile, err);
            }
        }
    }
}


module.exports = {
    pushCommand
}