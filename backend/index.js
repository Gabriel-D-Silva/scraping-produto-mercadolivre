const express = require('express');;
const scrapeLinksMC = require('./scrap_href');
const scrapeItensInfo = require('./cluster');
const cors = require('cors');
const ejs = require('ejs');

const porta = 3000;

const app = express();

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.json());


app.get('/scrape', async (req, res) => {

  const produto = req.query.produto;

  if (!produto) {
    return res.status(400).send('Por favor, forneça um produto para busca!')
  }

  try {

    const hrefs = await scrapeLinksMC(produto);
    const resultados = await scrapeItensInfo(hrefs)
    
    await res.render('resultado', { resultados });

  } catch (error) {

    console.error('Erro na rota /scrape:', error.message);
    res.status(500).send('Erro no servidor');

  }
})

// Inicia o servidor na porta 5000 e imprime uma mensagem para indicar que está rodando
app.listen(porta, () => {
    console.log(`Server rodando na porta ${porta}`)
});
