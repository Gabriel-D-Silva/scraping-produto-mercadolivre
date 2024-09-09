const readlineSync = require('readline-sync');
const puppeteer = require('puppeteer');
const url = "https://www.mercadolivre.com.br/";
let produtos = []
let i = 1;

console.log("Buscador de ofertas no mercado livre")

async function bot() {

    // Pergunta qual item o usuario quer procurar
    const itemBuscado = readlineSync.question('Qual item voce deseja buscar no mercado livre?: ');
    console.log('Processando dados, aguarde...')

    // Inicializa a janela e vai pro mercado livre
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url);

    // Pesquisa o item na barra de pesquisa e clica no botao de procurar resultados
    await page.locator('#cb1-edit').fill(itemBuscado);
    await Promise.all([
        page.waitForNavigation(),
        page.locator('.nav-icon-search').click()
    ])

    // Puxa os links de todos os itens da 1º pagina e os guarda na array 'resultados'
    const resultados = await page.$$eval('.ui-search-item__group.ui-search-item__group--title > a', elemento => elemento.map(link => link.href));
    
    // Itera sobre cada link diretamente
    for (const resultado of resultados) {

        // Se o contador atingir um valor maior que 10, termina a instrução
        if (i > 10) {
            break
        }

        // Vai para a pagina do item atual
        await page.goto(resultado);

        // Espera a pagina carregar, pelo menos até os componentes necessarios existirem
        await Promise.all([
            await page.waitForSelector('.ui-pdp-title'),
            await page.waitForSelector('.andes-money-amount__fraction'),
        ])

        // Puxa os dados de titulo, preco e nota do produto
        const titulo = await page.$eval('.ui-pdp-title', nome => nome.innerHTML);
        const preco = await page.$eval('.andes-money-amount__fraction', valor => valor.innerHTML);
        // As vezes a nota do produto não vai tar na pagina dele, então se ela não tiver lá, essa variavel vai ser nula
        const nota_produto = await page.evaluate(() => {
            const elemento = document.querySelector('.ui-pdp-review__rating');
            if (!elemento) {
                return null;
            }
            return elemento.innerHTML;
        })
        const link = await resultado;

        // Coloca esses dados dentro de um objeto e os insere no array 'produtos'
        const objeto = {};
        objeto.titulo = titulo;
        objeto.preco = preco;
        (nota_produto != null ? objeto.nota = nota_produto : objeto.nota = 'Não encontrado');
        objeto.link = resultado;
        produtos.push(objeto);

        // Aumenta o contador i em 1
        console.log(`Pagina ${i} processada com sucesso.`)
        i++;
    }
    
    // Imprime na tela os dados e fecha o navegador
    console.log(produtos);
    await browser.close();
}

bot ();