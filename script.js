let produtos = [];
   let carrinho = [];
   let pagamentoSelecionado = "";
   let valorRecebido = 0;
   let troco = 0;
   let editIndex = null;

   if (localStorage.getItem("produtos")) {
     produtos = JSON.parse(localStorage.getItem("produtos"));
     atualizarListaProdutos();
   }

   function adicionarOuEditarProduto() {
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
     if (editIndex !== null) {
       produtos[editIndex] = { nome, preco };
       editIndex = null;
     } else {
       produtos.push({ nome, preco });
     }
     localStorage.setItem("produtos", JSON.stringify(produtos));
     atualizarListaProdutos();
     nomeInput.value = "";
     precoInput.value = "";
   }

   function editarProduto(index) {
     const produto = produtos[index];
     document.getElementById("nomeProduto").value = produto.nome;
     document.getElementById("precoProduto").value = produto.preco;
     editIndex = index;
   }

   function excluirProduto(index) {
     if (confirm("Deseja excluir o produto " + produtos[index].nome + "?")) {
       produtos.splice(index, 1);
       localStorage.setItem("produtos", JSON.stringify(produtos));
       atualizarListaProdutos();
     }
   }

   function atualizarListaProdutos() {
     const lista = document.getElementById("listaProdutos");
     if (!lista) return;
     lista.innerHTML = "";
     produtos.forEach((p, i) => {
       const item = document.createElement("div");
       item.innerHTML = `
         <button onclick="adicionarAoCarrinho(${i})">${p.nome} - R$${p.preco.toFixed(2)}</button>
         <button class="edit-btn" onclick="editarProduto(${i})">✏️</button>
         <button class="delete-btn" onclick="excluirProduto(${i})">🗑</button>
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
     const { jsPDF } = window.jspdf;
     const doc = new jsPDF({
       orientation: "portrait",
       unit: "mm",
       format: [50, 30]
     });
     let pageAdded = false;
     carrinho.forEach(item => {
       for (let i = 0; i < item.qtd; i++) {
         if (pageAdded) {
           doc.addPage([50, 30], "portrait");
         }
         doc.setFontSize(8);
         doc.text("Ficha do Bingo", 25, 3, { align: "center" });
         doc.setFontSize(6);
         doc.text(item.nome, 25, 8, { align: "center" });
         doc.text(`Total: R$ ${item.preco.toFixed(2)}`, 25, 13, { align: "center" });
         doc.setFontSize(4);
         doc.text("Obrigado por colaborar!", 25, 18, { align: "center" });
         pageAdded = true;
       }
     });
     doc.save("fichas.pdf");
   }

   function abrirRelatorio() {
     window.open("https://bingo-fichas-site.onrender.com/relatorio", "_blank");
   }
