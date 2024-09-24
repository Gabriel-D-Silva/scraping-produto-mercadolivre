const express = require('express');
const scrapeMercadoLivre = require('./scraping')
const cors = require('cors')

const porta = 3000;

const app = express();

app.use(cors());
app.use(express.json());


app.get('/scrape', async (req, res) => {

  const produto = req.query.produto;

  try {

    // Aguarda o resultado da função de scraping
    const resultado = await scrapeMercadoLivre(produto);

    // Envia o resultado como resposta
    res.json(resultado);
  
  } catch (error) {

    console.error('Erro na rota /scrape:', error.message);
    res.status(500).send('Erro no servidor');

  }
})

// Inicia o servidor na porta 5000 e imprime uma mensagem para indicar que está rodando
app.listen(porta, () => {
    console.log(`Server rodando na porta ${porta}`)
});