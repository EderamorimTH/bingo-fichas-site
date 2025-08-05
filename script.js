let produtos = [];
let carrinho = [];
let pagamentoSelecionado = "";
let troco = 0;

if (localStorage.getItem("produtos")) {
  produtos = JSON.parse(localStorage.getItem("produtos"));
  atualizarListaProdutos();
}

function adicionarProduto() {
  const nome = document.getElementById("nomeProduto").value;
  const preco = parseFloat(document.getElementById("precoProduto").value);

  if (!nome || isNaN(preco)) {
    alert("Preencha nome e preço corretamente.");
    return;
  }

  const produto = { nome, preco };
  produtos.push(produto);
  localStorage.setItem("produtos", JSON.stringify(produtos));
  atualizarListaProdutos();

  document.getElementById("nomeProduto").value = "";
  document.getElementById("precoProduto").value = "";
}

function atualizarListaProdutos() {
  const lista = document.getElementById("listaProdutos");
  lista.innerHTML = "";

  produtos.forEach((p, i) => {
    const item = document.createElement("div");
    item.innerHTML = `
      <button onclick="adicionarAoCarrinho(${i})">${p.nome} - R$${p.preco.toFixed(2)}</button>
    `;
    lista.appendChild(item);
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
  const lista = document.getElementById("carrinho");
  lista.innerHTML = "";

  carrinho.forEach((item, i) => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${item.qtd}x ${item.nome} - R$${(item.qtd * item.preco).toFixed(2)}
      <button onclick="editarQtd(${i}, 1)">+</button>
      <button onclick="editarQtd(${i}, -1)">-</button>
      <button onclick="removerItem(${i})">🗑</button>
    `;
    lista.appendChild(div);
  });

  const total = carrinho.reduce((s, item) => s + item.qtd * item.preco, 0);
  document.getElementById("total").textContent = total.toFixed(2);
  calcularTroco();
}

function editarQtd(index, delta) {
  carrinho[index].qtd += delta;
  if (carrinho[index].qtd <= 0) {
    carrinho.splice(index, 1);
  }
  atualizarCarrinho();
}

function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

function cancelarVenda() {
  carrinho = [];
  pagamentoSelecionado = "";
  document.getElementById("total").textContent = "0.00";
  document.getElementById("valorRecebido").value = "";
  document.getElementById("troco").textContent = "0.00";
  document.querySelectorAll(".forma-pagamento button").forEach(btn => btn.classList.remove("selecionado"));
  atualizarCarrinho();
}

function selecionarPagamento(forma) {
  pagamentoSelecionado = forma;
  document.querySelectorAll(".forma-pagamento button").forEach(btn => btn.classList.remove("selecionado"));
  document.getElementById(`btn-${forma}`).classList.add("selecionado");
}

function calcularTroco() {
  const total = parseFloat(document.getElementById("total").textContent);
  const recebido = parseFloat(document.getElementById("valorRecebido").value);

  if (!isNaN(recebido)) {
    troco = recebido - total;
    document.getElementById("troco").textContent = troco.toFixed(2);
  }
}

function imprimirFichas() {
  const total = parseFloat(document.getElementById("total").textContent).toFixed(2);
  const recebido = parseFloat(document.getElementById("valorRecebido").value || 0).toFixed(2);
  const trocoFinal = troco.toFixed(2);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [50, 30]
  });

  doc.setFontSize(8);
  doc.text("🎟️ FICHA DO BINGO 🎟️", 5, 7);

  let y = 12;
  carrinho.forEach(item => {
    doc.text(`${item.qtd}x ${item.nome}`, 5, y);
    y += 4;
  });

  doc.text(`Pagamento: ${pagamentoSelecionado}`, 5, y); y += 4;
  doc.text(`Total: R$ ${total}`, 5, y); y += 4;
  doc.text(`Recebido: R$ ${recebido}`, 5, y); y += 4;
  doc.text(`Troco: R$ ${trocoFinal}`, 5, y); y += 4;

  doc.save("ficha.pdf");
}

function finalizarVenda() {
  if (carrinho.length === 0 || !pagamentoSelecionado) {
    alert("Preencha todos os dados.");
    return;
  }

  imprimirFichas();
  alert("Venda registrada!");
  cancelarVenda();
}

function abrirRelatorio() {
  let relatorio = "📋 RELATÓRIO DE VENDAS\n\n";
  carrinho.forEach(item => {
    relatorio += `${item.qtd}x ${item.nome} - R$ ${(item.qtd * item.preco).toFixed(2)}\n`;
  });
  relatorio += `\nTotal: R$ ${parseFloat(document.getElementById("total").textContent).toFixed(2)}`;
  alert(relatorio);
}
