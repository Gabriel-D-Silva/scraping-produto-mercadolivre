const { Cluster } = require('puppeteer-cluster');

async function scrapeItensInfo(hrefs) {
  let produtos = [];
    
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 3,
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);

    await Promise.all([
        page.waitForSelector('.ui-pdp-title'),
        page.waitForSelector('.andes-money-amount__fraction')
    ]);

    const titulo = await page.$eval('.ui-pdp-title', nome => nome.innerHTML);
    const valor = await page.$eval('.andes-money-amount__fraction', valor => valor.innerHTML);
    const nota_produto = await page.evaluate(() => {
        const elemento = document.querySelector('.ui-pdp-review__rating');
        return elemento ? elemento.innerHTML : 'Não encontrado';
    });

    produtos.push({ titulo: titulo, valor: valor, nota: nota_produto, link: url});

  });

  for (const href of hrefs) {
    cluster.queue(href);
  }

  await cluster.idle();
  await cluster.close();

  return produtos;
};

module.exports = scrapeItensInfo