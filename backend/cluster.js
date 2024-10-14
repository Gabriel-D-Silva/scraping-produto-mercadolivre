const { Cluster } = require('puppeteer-cluster');

async function scrapeItensInfo(hrefs) {
  let produtos = [];

  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 5,
  });

  await cluster.task(async ({ page, data: url }) => {
    try {
      console.log(`Acessando URL: ${url}`);
      await page.goto(url);

      await Promise.all([
        page.waitForSelector('.ui-pdp-title'),
        page.waitForSelector('.andes-money-amount__fraction')
      ]);

      const titulo = await page.$eval('.ui-pdp-title', nome => nome.innerHTML);
      console.log(`Título: ${titulo}`);

      let valor;
      const temDesconto = await page.$('.andes-money-amount.ui-pdp-price__part.ui-pdp-price__original-value.andes-money-amount--previous.andes-money-amount--cents-superscript.andes-money-amount--compact') !== null;
      if (temDesconto) {
        valor = await page.$$eval('.andes-money-amount.ui-pdp-price__part.andes-money-amount--cents-superscript.andes-money-amount--compact > .andes-money-amount__fraction', preco => preco[1].innerHTML);
      } else {
        valor = await page.$eval('.andes-money-amount__fraction', preco => preco.innerHTML);
      }
      const valorDefinitivo = valor;
      console.log(`Valor: ${valorDefinitivo}`);

      const nota_produto = await page.evaluate(() => {
        const elemento = document.querySelector('.ui-pdp-review__rating');
        return elemento ? elemento.innerHTML : 'Não encontrado';
      });
      console.log(`Nota: ${nota_produto}`);

      produtos.push({ titulo, valor: valorDefinitivo, nota: nota_produto, link: url });
    } catch (error) {
      console.error(`Erro ao processar ${url}:`, error);
    }
  });

  // Adicionando cada URL ao cluster
  for (const href of hrefs) {
    cluster.queue(href); // Adiciona a URL para processamento no cluster
  }

  // Espera todas as tarefas do cluster finalizarem
  await cluster.idle();
  await cluster.close();

  return produtos;
}

module.exports = scrapeItensInfo;
