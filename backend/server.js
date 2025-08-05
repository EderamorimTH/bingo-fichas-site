const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

const Venda = mongoose.model('Venda', {
  carrinho: Array,
  pagamentoSelecionado: String,
  total: Number,
  valorRecebido: Number,
  troco: Number,
  data: { type: Date, default: Date.now }
});

app.post('/vender', async (req, res) => {
  const venda = new Venda(req.body);
  await venda.save();
  res.send({ status: 'ok' });
});

app.get('/relatorio', async (req, res) => {
  const vendas = await Venda.find();
  const resumo = {};
  let total = 0;
  const pagamentos = { Dinheiro: 0, Pix: 0, Cartão: 0 };

  vendas.forEach(venda => {
    venda.carrinho.forEach(item => {
      if (!resumo[item.nome]) resumo[item.nome] = { qtd: 0, total: 0 };
      resumo[item.nome].qtd += item.qtd;
      resumo[item.nome].total += item.qtd * item.preco;
      total += item.qtd * item.preco;
    });
    pagamentos[venda.pagamentoSelecionado] += venda.total;
  });

  let texto = 'RELATÓRIO FINAL DO DIA\\n========================\\n';
  Object.entries(resumo).forEach(([nome, dados]) => {
    texto += `${nome}: ${dados.qtd} vendidos | R$ ${dados.total.toFixed(2)}\\n`;
  });
  texto += '\\n-- PAGAMENTO --\\n';
  Object.entries(pagamentos).forEach(([tipo, valor]) => {
    texto += `${tipo}: R$ ${valor.toFixed(2)}\\n`;
  });
  texto += '------------------------\\n';
  texto += `TOTAL GERAL: R$ ${total.toFixed(2)}\\n========================`;

  res.setHeader('Content-Type', 'text/plain');
  res.send(texto);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Servidor rodando na porta ' + port));
