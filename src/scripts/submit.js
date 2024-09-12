const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { checkConfiguration } = require ('./checkConfiguration');
const sql = require('mssql');
const { getDBConfig } = require('./dbconfig');

const mapTables = new Map([
    ["/javascriptUtilizador/", "jsu"],
    ["/vbScriptsWeb/", "escr"],
    ["/itensMonitor/", "emoi"],
    ["/valoresDefeito/", "eudefs"],
    ["/regras/", "ebrule"],
    ["/opcoesEcra/", "etl"],
    ["/eventos/", "eeventos"]
]);


const submitCommand = vscode.commands.registerCommand('csmanager.submit', function () {
    if (checkConfiguration()) {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('Nenhum folder aberto. Por favor, abra um folder para usar este comando.');
            return; 
          }

        pushScript(vscode.window.activeTextEditor);  
    } else {
        vscode.window.showErrorMessage('Configure primeiro as configurações para acesso à base de dados!\n > CSManager: Configure');
    }

});

async function pushScript(pScript) {
    const pScriptPath = pScript.document.uri.fsPath;
    const dFiles = fs.readdirSync(path.dirname(pScriptPath));
    let pScriptSTAMP = null;
    const dFilesFiltered = dFiles.filter(file => {
        if (!file.includes('.')) {
            pScriptSTAMP = file;
            return false;
        }
        return true;
    });
    
    try {
    let pool = await sql.connect(getDBConfig());

    let pFileCode = fs.readFileSync(pScriptPath, 'utf-8');

    let result = await pool.request()
    .input('fileCode', sql.NVarChar, pFileCode)
    .query(
        `UPDATE ${mapTables.get(`/${path.basename(path.dirname(path.dirname(pScriptPath)))}/`)}
        SET ${path.basename(pScriptPath).split('.').slice(0, -1).join('.')} = @fileCode
        WHERE ${mapTables.get(`/${path.basename(path.dirname(path.dirname(pScriptPath)))}/`)}stamp LIKE '%${pScriptSTAMP}%'`
    );
    vscode.window.showInformationMessage('Script submetido.');
    } catch {
        vscode.window.showErrorMessage("Erro ao gravar o script!");
    } finally {
        sql.close();
    }
    return;
}

module.exports = {
    submitCommand
}