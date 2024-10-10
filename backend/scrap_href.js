const puppeteer = require('puppeteer');

async function scrapeLinksMC(itemBuscado) {

    const url = "https://www.mercadolivre.com.br/";

    // Inicializa a janela e vai pro mercado livre
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url);

    try {
        // Pesquisa o item na barra de pesquisa e clica no botao de procurar resultados
        await page.type('#cb1-edit', itemBuscado);
        await Promise.all([
            page.click('.nav-icon-search'),
            page.waitForNavigation()
        ])
       

        // Puxa os links de todos os itens da 1º pagina e os retorna para a API
        await page.waitForSelector('.ui-search-link__title-card.ui-search-link');
        const hrefs = await page.$$eval('.ui-search-link__title-card.ui-search-link', (elemento) => 
            elemento.map(link => link.href));
        return hrefs;
        // As vezes, essa classe não aparece nos seletores CSS do mercado livre, preciso adicionar
        // tratamento de erro ou correção aqui...

    } catch (error) {
        console.error('Erro durante a execução:', error.message);
    } finally {
        await browser.close();
    }
}

module.exports = scrapeLinksMC;
