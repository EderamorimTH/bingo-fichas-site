let produtos = [];
let carrinho = [];
let pagamentoSelecionado = "";

function adicionarProduto() {
  const nome = document.getElementById("nome").value.trim();
  const preco = parseFloat(document.getElementById("preco").value);
  if (nome && preco > 0) {
    produtos.push({ nome, preco });
    atualizarBotoes();
    document.getElementById("nome").value = "";
    document.getElementById("preco").value = "";
  } else {
    alert("Digite um nome e um preço válido!");
  }
}

function atualizarBotoes() {
  const container = document.getElementById("botoes-produtos");
  container.innerHTML = "";
  produtos.forEach((p, i) => {
    const btn = document.createElement("button");
    btn.textContent = `${p.nome} - R$ ${p.preco.toFixed(2)}`;
    btn.className = "produto-btn";
    btn.onclick = () => adicionarAoCarrinho(i);
    container.appendChild(btn);
  });
}

function adicionarAoCarrinho(index) {
  const existente = carrinho.find(item => item.nome === produtos[index].nome);
  if (existente) {
    existente.qtd++;
  } else {
    carrinho.push({ ...produtos[index], qtd: 1 });
  }
  atualizarCarrinho();
}

function atualizarCarrinho() {
  const container = document.getElementById("carrinho");
  container.innerHTML = "";
  let total = 0;
  carrinho.forEach((item, i) => {
    total += item.qtd * item.preco;
    const div = document.createElement("div");
    div.className = "carrinho-item";
    div.innerHTML = `${item.nome} - R$${item.preco.toFixed(2)} x ${item.qtd}
      <button onclick="alterarQtd(${i}, 1)">+</button>
      <button onclick="alterarQtd(${i}, -1)">-</button>
      <button onclick="removerItem(${i})">x</button>`;
    container.appendChild(div);
  });
  document.getElementById("total").textContent = total.toFixed(2);
  calcularTroco();
}

function alterarQtd(i, delta) {
  carrinho[i].qtd += delta;
  if (carrinho[i].qtd <= 0) carrinho.splice(i, 1);
  atualizarCarrinho();
}

function removerItem(i) {
  carrinho.splice(i, 1);
  atualizarCarrinho();
}

function setPagamento(tipo) {
  pagamentoSelecionado = tipo;
  document.getElementById("pagamento").textContent = tipo;
}

function calcularTroco() {
  const recebido = parseFloat(document.getElementById("valor-recebido").value || 0);
  const total = parseFloat(document.getElementById("total").textContent);
  const troco = recebido - total;
  document.getElementById("troco").textContent = troco >= 0 ? troco.toFixed(2) : "0.00";
}

function imprimirFichas() {
  if (carrinho.length === 0) return alert("Carrinho vazio!");

  let texto = "🎟️ FICHA DO BINGO 🎟️\n";
  texto += "=====================\n";
  carrinho.forEach(item => {
    texto += `${item.qtd}x ${item.nome} - R$${item.preco.toFixed(2)}\n`;
  });
  texto += "---------------------\n";
  texto += `Pagamento: ${pagamentoSelecionado}\n`;
  texto += `Total: R$ ${parseFloat(document.getElementById("total").textContent).toFixed(2)}\n`;

  const blob = new Blob([texto], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ficha.txt";
  a.click();

  alert("Ficha gerada! Agora abra com RawBT para imprimir.");
}

}

function gerarRelatorio() {
  window.open("https://bingo-fichas-site.onrender.com/relatorio", "_blank");
}
