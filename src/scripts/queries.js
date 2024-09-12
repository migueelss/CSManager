//Pull
const pull_queryjsUser = "SELECT titulo as name, javascript as code, jsustamp as stamp, '/javascriptUtilizador/' as folder, 'javascript' as type, '.js' as extension FROM jsu" 
const pull_queryvbWebScripts = "SELECT codigo as name, expressao as code, escrstamp as stamp, '/vbScriptsWeb/' as folder, 'expressao' as type, '.vb' as extension FROM escr"
const pull_queryMonitores = `SELECT resumo as name, CONCAT(ecol1, '/@!barreira#bRrieR*>/', sqlexpr, '/@!barreira#bRrieR*>/', ecol3) as code, emoistamp as stamp, '/itensMonitor/' as folder, 'ecol1/@!barreira#bRrieR*>/sqlexpr/@!barreira#bRrieR*>/ecol3' as type, '.vb/@!barreira#bRrieR*>/.vb/@!barreira#bRrieR*>/.vb' as extension FROM emoi` //ecol1 sqlexpr ecol3
const pull_queryValoresDefeito = `SELECT descricao as name, expvb as code, eudefsstamp as stamp, '/valoresDefeito/' as folder, 'expvb' as type, '.vb' as extension FROM eudefs`
const pull_queryRegras = `SELECT descricao as name, CONCAT(expressao, '/@!barreira#bRrieR*>/', mensagem) as code, ebrulestamp as stamp, '/regras/' as folder, 'expressao/@!barreira#bRrieR*>/mensagem' as type, '.vb/@!barreira#bRrieR*>/.vb' as extension FROM ebrule`
const pull_queryOpcoesEcra = `SELECT resumo as name, expressao as code, etlstamp as stamp, '/opcoesEcra/' as folder, 'expressao' as type, '.vb' as extension FROM etl`
const pull_queryEventos = `SELECT resumo as name, CONCAT(condicao, '/@!barreira#bRrieR*>/', expressao) as code, eeventosstamp as stamp, '/eventos/' as folder, 'condicao/@!barreira#bRrieR*>/expressao' as type, '.vb/@!barreira#bRrieR*>/.vb' as extension FROM eeventos`
module.exports = {
    pull_queryjsUser,
    pull_queryvbWebScripts,
    pull_queryMonitores,
    pull_queryValoresDefeito,
    pull_queryRegras,
    pull_queryOpcoesEcra,
    pull_queryEventos
}