let produtos = [];
   let carrinho = [];
   let pagamentoSelecionado = "";
   let valorRecebido = 0;
   let troco = 0;

   if (localStorage.getItem("produtos")) {
     produtos = JSON.parse(localStorage.getItem("produtos"));
     atualizarListaProdutos();
   }

   function adicionarProduto() {
     const nomeInput = document.getElementById("nomeProduto");
     const precoInput = document.getElementById("precoProduto");
     if (!nomeInput || !precoInput) {
       alert("Erro: Campos de entrada não encontrados!");
       return;
     }
     const nome = nomeInput.value.trim();
     const preco = parseFloat(precoInput.value);
     if (!nome || isNaN(preco) || preco <= 0) {
       alert("Preencha corretamente nome e preço.");
       return;
     }
     const produto = { nome, preco };
     produtos.push(produto);
     localStorage.setItem("produtos", JSON.stringify(produtos));
     atualizarListaProdutos();
     nomeInput.value = "";
     precoInput.value = "";
   }

   function atualizarListaProdutos() {
     const lista = document.getElementById("listaProdutos");
     if (!lista) return;
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
     if (!lista) return;
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
     const totalElement = document.getElementById("total");
     if (totalElement) totalElement.textContent = total.toFixed(2);
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
     const totalElement = document.getElementById("total");
     const recebidoInput = document.getElementById("valorRecebido");
     const trocoElement = document.getElementById("troco");
     if (totalElement) totalElement.textContent = "0.00";
     if (recebidoInput) recebidoInput.value = "";
     if (trocoElement) trocoElement.textContent = "0.00";
     document.querySelectorAll(".forma-pagamento button").forEach(btn => btn.classList.remove("selecionado"));
     atualizarCarrinho();
   }

   function selecionarPagamento(forma) {
     pagamentoSelecionado = forma;
     document.querySelectorAll(".forma-pagamento button").forEach(btn => btn.classList.remove("selecionado"));
     const btn = document.getElementById(`btn-${forma}`);
     if (btn) btn.classList.add("selecionado");
   }

   function calcularTroco() {
     const totalElement = document.getElementById("total");
     const recebidoInput = document.getElementById("valorRecebido");
     const trocoElement = document.getElementById("troco");
     if (!totalElement || !recebidoInput || !trocoElement) return;
     const total = parseFloat(totalElement.textContent);
     valorRecebido = parseFloat(recebidoInput.value || 0);
     if (!isNaN(valorRecebido)) {
       troco = valorRecebido - total;
       trocoElement.textContent = troco.toFixed(2);
     }
   }

   async function finalizarVenda() {
     if (carrinho.length === 0 || !pagamentoSelecionado) {
       alert("Preencha todos os dados da venda.");
       return;
     }
     const totalElement = document.getElementById("total");
     if (!totalElement) return;
     const total = parseFloat(totalElement.textContent);
     try {
       const response = await fetch("https://bingo-fichas-site.onrender.com/vender", {
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
       if (!response.ok) throw new Error("Erro ao registrar venda");
       alert("Venda registrada com sucesso!");
       cancelarVenda();
     } catch (e) {
       alert("Erro ao registrar venda.");
       console.error(e);
     }
   }

   function imprimirFichas() {
     if (carrinho.length === 0) {
       alert("Carrinho vazio!");
       return;
     }
     if (!pagamentoSelecionado) {
       alert("Selecione uma forma de pagamento!");
       return;
     }
     const totalElement = document.getElementById("total");
     const recebidoInput = document.getElementById("valorRecebido");
     const trocoElement = document.getElementById("troco");
     if (!totalElement || !recebidoInput || !trocoElement) return;
     const total = parseFloat(totalElement.textContent).toFixed(2);
     const recebido = parseFloat(recebidoInput.value || 0).toFixed(2);
     const trocoFinal = troco.toFixed(2);
     const { jsPDF } = window.jspdf;
     const doc = new jsPDF();
     doc.setFontSize(16);
     doc.text("🎟️ FICHA DO BINGO 🎟️", 20, 20);
     doc.setFontSize(12);
     doc.text("Produtos:", 20, 30);
     let y = 40;
     carrinho.forEach(item => {
       doc.text(`${item.qtd}x ${item.nome} - R$ ${item.preco.toFixed(2)}`, 20, y);
       y += 8;
     });
     y += 4;
     doc.line(20, y, 180, y); y += 8;
     doc.text(`Pagamento: ${pagamentoSelecionado.toUpperCase()}`, 20, y); y += 8;
     doc.text(`Total: R$ ${total}`, 20, y); y += 8;
     doc.text(`Recebido: R$ ${recebido}`, 20, y); y += 8;
     doc.text(`Troco: R$ ${trocoFinal}`, 20, y); y += 12;
     doc.setFontSize(10);
     doc.text("Obrigado por colaborar com o nosso bingo! 🎉", 20, y);
     doc.save("ficha.pdf");
   }

   function abrirRelatorio() {
     window.open("https://bingo-fichas-site.onrender.com/relatorio", "_blank");
   }
