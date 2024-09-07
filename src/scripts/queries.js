//Pull
const pull_queryjsUser = "SELECT titulo as name, javascript as code, jsustamp as stamp, '/javascriptUtilizador/' as folder, '.js' as extension FROM jsu" 
const pull_queryvbWebScripts = "SELECT codigo as name, expressao as code, escrstamp as stamp, '/vbScriptsWeb/' as folder, '.vb' as extension FROM escr"
module.exports = {
    pull_queryjsUser,
    pull_queryvbWebScripts
}