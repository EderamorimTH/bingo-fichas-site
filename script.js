let produtos = [];
let carrinho = [];
let pagamentoSelecionado = "";
let valorRecebido = 0;
let troco = 0;

// Carregar produtos salvos (se houver)
if (localStorage.getItem("produtos")) {
  produtos = JSON.parse(localStorage.getItem("produtos"));
  atualizarListaProdutos();
}

// Adicionar novo produto
function adicionarProduto() {
  const nome = document.getElementById("nomeProduto").value;
  const preco = parseFloat(document.getElementById("precoProduto").value);

  if (!nome || isNaN(preco)) {
    alert("Preencha corretamente nome e preço.");
    return;
  }

  const produto = { nome, preco };
  produtos.push(produto);
  localStorage.setItem("produtos", JSON.stringify(produtos));
  atualizarListaProdutos();

  document.getElementById("nomeProduto").value = "";
  document.getElementById("precoProduto").value = "";
}

// Atualiza lista de produtos na tela
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

// Adiciona produto ao carrinho
function adicionarAoCarrinho(index) {
  const existente = carrinho.find(item => item.nome === produtos[index].nome);
  if (existente) {
    existente.qtd++;
  } else {
    carrinho.push({ ...produtos[index], qtd: 1 });
  }
  atualizarCarrinho();
}

// Atualiza exibição do carrinho
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

  calcularTroco(); // Atualiza o troco
}

// Editar quantidade de item no carrinho
function editarQtd(index, delta) {
  carrinho[index].qtd += delta;
  if (carrinho[index].qtd <= 0) {
    carrinho.splice(index, 1);
  }
  atualizarCarrinho();
}

// Remover item do carrinho
function removerItem(index) {
  carrinho.splice(index, 1);
  atualizarCarrinho();
}

// Cancelar toda a venda
function cancelarVenda() {
  carrinho = [];
  pagamentoSelecionado = "";
  document.getElementById("total").textContent = "0.00";
  document.getElementById("valorRecebido").value = "";
  document.getElementById("troco").textContent = "0.00";
  document.querySelectorAll(".forma-pagamento button").forEach(btn => btn.classList.remove("selecionado"));
  atualizarCarrinho();
}

// Seleciona forma de pagamento
function selecionarPagamento(forma) {
  pagamentoSelecionado = forma;
  document.querySelectorAll(".forma-pagamento button").forEach(btn => btn.classList.remove("selecionado"));
  document.getElementById(`btn-${forma}`).classList.add("selecionado");
}

// Calcular troco
function calcularTroco() {
  const total = parseFloat(document.getElementById("total").textContent);
  valorRecebido = parseFloat(document.getElementById("valorRecebido").value);

  if (!isNaN(valorRecebido)) {
    troco = valorRecebido - total;
    document.getElementById("troco").textContent = troco.toFixed(2);
  }
}

// Finalizar venda e enviar para backend
async function finalizarVenda() {
  if (carrinho.length === 0 || !pagamentoSelecionado) {
    alert("Preencha todos os dados da venda.");
    return;
  }

  const total = parseFloat(document.getElementById("total").textContent);

  try {
    await fetch("https://bingo-fichas-site.onrender.com/vender", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carrinho,
        pagamento: pagamentoSelecionado,
        total,
        valorRecebido,
        troco
      })
    });

    alert("Venda registrada com sucesso!");
    cancelarVenda();
  } catch (e) {
    alert("Erro ao registrar venda.");
    console.error(e);
  }
}

// Imprimir ficha (RawBT ou similar)
function imprimirFichas() {
  if (carrinho.length === 0) {
    alert("Carrinho vazio!");
    return;
  }

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

  alert("Ficha gerada! Agora abra com o app RawBT para imprimir.");
}

// Abrir relatório
function abrirRelatorio() {
  window.open("https://bingo-fichas-site.onrender.com/relatorio", "_blank");
}
