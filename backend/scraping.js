const puppeteer = require('puppeteer');

async function scrapeMercadoLivre(itemBuscado) {

    const url = "https://www.mercadolivre.com.br/";
    let produtos = [];
    let i = 1;

    // Inicializa a janela e vai pro mercado livre
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(url);

    try {
        // Pesquisa o item na barra de pesquisa e clica no botao de procurar resultados
        await Promise.all([
            page.type('#cb1-edit', itemBuscado)
        ])
        await Promise.all([
            page.waitForNavigation(),
            page.click('.nav-icon-search')
        ]);

        // Puxa os links de todos os itens da 1º pagina e os guarda na array 'links'
        const links = await page.$$eval('.ui-search-link__title-card.ui-search-link', (elemento) => elemento.map(link => link.href));
        
        // Itera sobre cada link diretamente
        for (const link of links) {
    
            // Para a execução após 50 iterações
            if (i > 50) break;
    
            // Vai para a pagina do item atual
            await page.goto(link);

            // Espera a pagina carregar, pelo menos até os componentes necessarios existirem
            await Promise.all([
                page.waitForSelector('.ui-pdp-title'),
                page.waitForSelector('.andes-money-amount__fraction'),
            ])
    
            // Puxa os dados de titulo, preco e nota do produto
            const titulo = await page.$eval('.ui-pdp-title', nome => nome.innerHTML);
            const preco = await page.$eval('.andes-money-amount__fraction', valor => valor.innerHTML);
            // As vezes a nota do produto não vai tar na pagina dele, então se ela não tiver lá, essa variavel vai ser nula
            const nota_produto = await page.evaluate(() => {
                const elemento = document.querySelector('.ui-pdp-review__rating');
                return elemento ? elemento.innerHTML : 'Não encontrado';
            })
    
            // Insere esses dados dentro de um objeto na array 'produtos'
            produtos.push({ titulo: titulo, valor: preco, nota: nota_produto, link: link});
    
            // Soma o contador
            i++;
        }

        return produtos;

    } catch (error) {
        console.error('Erro durante a execução:', error.message);
    } finally {
        await browser.close();
    }
}

module.exports = scrapeMercadoLivre;
