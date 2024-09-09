//Pull
const pull_queryjsUser = "SELECT titulo as name, javascript as code, jsustamp as stamp, '/javascriptUtilizador/' as folder, 'javascript' as type, '.js' as extension FROM jsu" 
const pull_queryvbWebScripts = "SELECT codigo as name, expressao as code, escrstamp as stamp, '/vbScriptsWeb/' as folder, 'expressao' as type, '.vb' as extension FROM escr"
const pull_queryMonitores = `SELECT resumo as name, CONCAT(ecol1, '/@!barreira#bRrieR*>/', sqlexpr, '/@!barreira#bRrieR*>/', ecol3) as code, emoistamp as stamp, '/itensMonitor/' as folder, 'ecol1/@!barreira#bRrieR*>/sqlexpr/@!barreira#bRrieR*>/ecol3' as type, '.vb' as extension FROM emoi` //ecol1 sqlexpr ecol3
module.exports = {
    pull_queryjsUser,
    pull_queryvbWebScripts,
    pull_queryMonitores
}