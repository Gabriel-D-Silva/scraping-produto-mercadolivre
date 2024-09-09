const readlineSync = require('readline-sync');
const puppeteer = require('puppeteer');
const url = "https://www.mercadolivre.com.br/";
let i = 1;

console.log("Buscador de ofertas no mercado livre")

async function bot() {

    // Pergunta qual item o usuario quer procurar
    const itemBuscado = readlineSync.question('Qual item voce deseja buscar no mercado livre?: ');

    // Inicializa a janela e vai pro mercado livre
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url);

    // Pesquisa o item na barra de pesquisa e clica no botao de procurar resultados
    await page.locator('#cb1-edit').fill(itemBuscado);
    await Promise.all([
        page.waitForNavigation(),
        page.locator('.nav-icon-search').click()
    ])

    // Puxa os links de todos os itens da 1º pagina e imprime na tela, falta tratar os dados, farei depois
    const resultados = await page.$$eval('.ui-search-item__group.ui-search-item__group--title > a', elemento => elemento.map(link => link.href));
    console.log(resultados);
    await browser.close();
}

bot ();