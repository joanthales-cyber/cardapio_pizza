// ============================================================
// ************** ALTERE AQUI: CONFIGURAÇÃO CENTRAL ***********
// ============================================================
const configGuto = {
    cores: {
        primaria: "#C72A2A",
        secundaria: "#FEF0D9",
        destaque: "#F9B81B",
        textoEscuro: "#3E2A1F"
    },
    slogan: "Tradição em fatias que abraçam a alma! 🧡",
    pizzasSalgadas: [
        { id: "margherita", nome: "Margherita", descricao: "Molho, mussarela de búfala, manjericão.", preco: 49.90 },
        { id: "pepperoni", nome: "Pepperoni", descricao: "Pepperoni, mussarela, orégano.", preco: 59.90 },
        { id: "4queijos", nome: "Quatro Queijos", descricao: "Mussarela, provolone, parmesão, gorgonzola.", preco: 64.90 },
        { id: "calabresa", nome: "Calabresa", descricao: "Calabresa, cebola, azeitonas.", preco: 54.90 },
        { id: "frangocatupiry", nome: "Frango com Catupiry", descricao: "Frango, catupiry, milho.", preco: 62.90 },
        { id: "vegetariana", nome: "Vegetariana", descricao: "Rúcula, tomate seco, cogumelos.", preco: 58.90 }
    ],
    pizzasDoces: [
        { id: "chocmorango", nome: "Chocolate com Morango", descricao: "Chocolate meio amargo, morangos.", preco: 55.90 },
        { id: "bananacanela", nome: "Banana com Canela", descricao: "Banana caramelizada, canela.", preco: 49.90 },
        { id: "romeujulieta", nome: "Romeu e Julieta", descricao: "Goiabada, queijo, canela.", preco: 52.90 }
    ],
    telefone: "(11) 3200-9090",
    endereco: "Rua das Margheritas, 1010 - São Paulo - SP",
    horario: "Terça a Domingo, 18h às 23h30 | Sex/Sáb até 00h30",
    redesSociais: {
        instagram: "@gutopizza",
        facebook: "/gutopizzaria",
        whatsapp: "(11) 97777-1234"
    },
    metodosPagamento: [
        { id: "dinheiro", nome: "Dinheiro (10% OFF)", desconto: 0.10 },
        { id: "pix", nome: "PIX (5% OFF)", desconto: 0.05 },
        { id: "cartao_credito", nome: "Cartão de Crédito", desconto: 0 },
        { id: "cartao_debito", nome: "Cartão de Débito", desconto: 0 },
        { id: "vale_refeicao", nome: "Vale Refeição", desconto: 0 }
    ],
    pagamentoMensagemTemplate: "✅ Pedido confirmado! Forma: {metodo}. {descontoMsg} Total com taxas: R$ {totalFinal}. Obrigado!",
    taxaEntrega: 7.50,
    carrinhoVazioMsg: "🛒 Seu carrinho está vazio. Adicione pizzas deliciosas!"
};

// ************** FIM DA ÁREA EDITÁVEL ***********************
// ============================================================

// ========== SISTEMA DE CARRINHO ==========
let carrinho = []; // { id, nome, preco, quantidade }

function salvarCarrinho() {
    localStorage.setItem("gutoCarrinho", JSON.stringify(carrinho));
}

function carregarCarrinho() {
    const saved = localStorage.getItem("gutoCarrinho");
    if (saved) {
        try {
            carrinho = JSON.parse(saved);
        } catch(e) { carrinho = []; }
    } else {
        carrinho = [];
    }
    atualizarBadgeCarrinho();
}

function adicionarAoCarrinho(id, nome, preco) {
    const existente = carrinho.find(item => item.id === id);
    if (existente) {
        existente.quantidade += 1;
    } else {
        carrinho.push({ id, nome, preco, quantidade: 1 });
    }
    salvarCarrinho();
    atualizarBadgeCarrinho();
    exibirToastCarrinho(`🍕 ${nome} adicionado ao carrinho!`);
    renderizarCarrinhoModal(); // atualiza modal se estiver aberto
}

function removerDoCarrinho(id) {
    const index = carrinho.findIndex(item => item.id === id);
    if (index !== -1) {
        carrinho.splice(index, 1);
        salvarCarrinho();
        atualizarBadgeCarrinho();
        renderizarCarrinhoModal();
        if (carrinho.length === 0) fecharModalCarrinho();
    }
}

function atualizarQuantidade(id, novaQuantidade) {
    if (novaQuantidade <= 0) {
        removerDoCarrinho(id);
        return;
    }
    const item = carrinho.find(item => item.id === id);
    if (item) {
        item.quantidade = novaQuantidade;
        salvarCarrinho();
        atualizarBadgeCarrinho();
        renderizarCarrinhoModal();
    }
}

function calcularSubtotal() {
    return carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
}

function calcularTotalComEntrega() {
    const subtotal = calcularSubtotal();
    return subtotal + configGuto.taxaEntrega;
}

function atualizarBadgeCarrinho() {
    const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    const badge = document.getElementById("cart-badge");
    if (badge) badge.textContent = totalItens;
}

function exibirToastCarrinho(msg) {
    const toast = document.createElement("div");
    toast.className = "toast-notify";
    toast.textContent = msg;
    toast.style.background = "#2e7d32";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// Modal do carrinho
let cartModal = null;

function criarModalCarrinho() {
    if (document.getElementById("cartModal")) return;
    const modal = document.createElement("div");
    modal.id = "cartModal";
    modal.className = "cart-modal";
    modal.innerHTML = `
        <div class="cart-modal-content">
            <span class="close-cart">&times;</span>
            <h2>🛒 Seu Carrinho</h2>
            <ul class="cart-items-list"></ul>
            <div class="cart-total"></div>
            <div class="cart-actions">
                <button class="btn-clear" id="clearCartBtn">Esvaziar carrinho</button>
                <button class="btn-checkout" id="checkoutCartBtn">Finalizar pedido</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    cartModal = modal;
    
    // eventos
    const closeBtn = modal.querySelector(".close-cart");
    closeBtn.onclick = () => fecharModalCarrinho();
    modal.onclick = (e) => { if (e.target === modal) fecharModalCarrinho(); };
    
    document.getElementById("clearCartBtn").addEventListener("click", () => {
        if (confirm("Esvaziar todo o carrinho?")) {
            carrinho = [];
            salvarCarrinho();
            atualizarBadgeCarrinho();
            renderizarCarrinhoModal();
            fecharModalCarrinho();
            exibirToastCarrinho("Carrinho esvaziado.");
        }
    });
    
    document.getElementById("checkoutCartBtn").addEventListener("click", () => {
        if (carrinho.length === 0) {
            alert(configGuto.carrinhoVazioMsg);
            return;
        }
        fecharModalCarrinho();
        // Rola até a seção de pagamento e destaca
        const paymentSection = document.querySelector(".payment-section");
        if (paymentSection) {
            paymentSection.scrollIntoView({ behavior: "smooth" });
            paymentSection.style.transition = "0.3s";
            paymentSection.style.boxShadow = "0 0 0 3px var(--destaque)";
            setTimeout(() => paymentSection.style.boxShadow = "", 1500);
        }
        // Exibir resumo no console (opcional)
        console.log("Resumo do pedido:", carrinho);
    });
}

function renderizarCarrinhoModal() {
    if (!cartModal) criarModalCarrinho();
    const listContainer = cartModal.querySelector(".cart-items-list");
    const totalContainer = cartModal.querySelector(".cart-total");
    if (!listContainer) return;
    
    if (carrinho.length === 0) {
        listContainer.innerHTML = `<li style="text-align:center; padding:20px;">${configGuto.carrinhoVazioMsg}</li>`;
        totalContainer.innerHTML = "";
        return;
    }
    
    listContainer.innerHTML = "";
    carrinho.forEach(item => {
        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${escapeHtml(item.nome)}</div>
                <div class="cart-item-price">R$ ${item.preco.toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-minus" data-id="${item.id}">-</button>
                <span class="cart-item-qty">${item.quantidade}</span>
                <button class="qty-plus" data-id="${item.id}">+</button>
                <button class="remove-item" data-id="${item.id}">🗑️</button>
            </div>
        `;
        listContainer.appendChild(li);
    });
    
    // Eventos dos botões dinâmicos
    document.querySelectorAll(".qty-minus").forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const item = carrinho.find(i => i.id === id);
            if (item) atualizarQuantidade(id, item.quantidade - 1);
        };
    });
    document.querySelectorAll(".qty-plus").forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            const item = carrinho.find(i => i.id === id);
            if (item) atualizarQuantidade(id, item.quantidade + 1);
        };
    });
    document.querySelectorAll(".remove-item").forEach(btn => {
        btn.onclick = () => removerDoCarrinho(btn.dataset.id);
    });
    
    const subtotal = calcularSubtotal();
    const total = calcularTotalComEntrega();
    totalContainer.innerHTML = `
        <div>Subtotal: R$ ${subtotal.toFixed(2)}</div>
        <div>Taxa de entrega: R$ ${configGuto.taxaEntrega.toFixed(2)}</div>
        <div style="font-size:1.6rem; margin-top:8px;">Total: R$ ${total.toFixed(2)}</div>
    `;
}

function abrirModalCarrinho() {
    if (!cartModal) criarModalCarrinho();
    renderizarCarrinhoModal();
    cartModal.style.display = "flex";
}

function fecharModalCarrinho() {
    if (cartModal) cartModal.style.display = "none";
}

// Função para criar botão flutuante do carrinho
function criarBotaoCarrinho() {
    const btn = document.createElement("button");
    btn.id = "cartFloatBtn";
    btn.className = "cart-button";
    btn.innerHTML = `🛒 Carrinho <span id="cart-badge" class="cart-badge">0</span>`;
    btn.onclick = abrirModalCarrinho;
    document.body.appendChild(btn);
    atualizarBadgeCarrinho();
}

// ========== FIM CARRINHO ==========

// ========== DETECÇÃO DE MUDANÇAS (mantido) ==========
function deepDiff(obj1, obj2, path = "") {
    const changes = [];
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);
    for (let key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        const val1 = obj1?.[key];
        const val2 = obj2?.[key];
        if (typeof val1 === "object" && val1 !== null && typeof val2 === "object" && val2 !== null) {
            changes.push(...deepDiff(val1, val2, newPath));
        } else if (val1 !== val2) {
            if (val1 === undefined) changes.push(`➕ ${newPath} adicionado: ${JSON.stringify(val2)}`);
            else if (val2 === undefined) changes.push(`➖ ${newPath} removido: ${JSON.stringify(val1)}`);
            else changes.push(`🔄 ${newPath}: ${JSON.stringify(val1)} → ${JSON.stringify(val2)}`);
        }
    }
    return changes;
}

function detectAndShowChanges() {
    const saved = localStorage.getItem("gutoConfigBackup");
    if (!saved) {
        localStorage.setItem("gutoConfigBackup", JSON.stringify(configGuto));
        return [];
    }
    let previousConfig;
    try { previousConfig = JSON.parse(saved); } catch(e) { return []; }
    const changes = deepDiff(previousConfig, configGuto);
    if (changes.length > 0) {
        localStorage.setItem("gutoConfigBackup", JSON.stringify(configGuto));
        showChangesModal(changes);
        showToast(`🔔 ${changes.length} alteração(ões) detectada(s)!`);
    }
    return changes;
}

function showChangesModal(changes) {
    const existing = document.getElementById("changesModal");
    if (existing) existing.remove();
    const modal = document.createElement("div");
    modal.id = "changesModal";
    modal.className = "modal";
    modal.style.display = "flex";
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h3>📝 Modificações no configGuto</h3>
            <ul>${changes.map(c => `<li>${c}</li>`).join("")}</ul>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector(".close-modal").onclick = () => modal.remove();
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
}

function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "toast-notify";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function refreshCardapio() {
    applyColorTheme();
    buildFullMenu();
    detectAndShowChanges();
}

// ========== FUNÇÕES DE RENDERIZAÇÃO PRINCIPAIS ==========
let currentFilter = 'all';
let selectedPaymentId = null;

function applyColorTheme() {
    const root = document.documentElement;
    root.style.setProperty('--primaria', configGuto.cores.primaria);
    root.style.setProperty('--secundaria', configGuto.cores.secundaria);
    root.style.setProperty('--destaque', configGuto.cores.destaque);
    root.style.setProperty('--texto-escuro', configGuto.cores.textoEscuro);
}

function escapeHtml(str) {
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function renderHeader() {
    const header = document.createElement('header');
    header.className = 'header';
    header.innerHTML = `<div class="container"><h1>🍕 GUTO PIZZA</h1><div class="slogan">✨ ${escapeHtml(configGuto.slogan)} ✨</div></div>`;
    return header;
}

function renderPizzaSection(title, pizzasArray, sectionId) {
    if (!pizzasArray.length) return document.createElement('div');
    const section = document.createElement('section');
    section.className = 'pizza-section';
    section.id = sectionId;
    const titleEl = document.createElement('h2');
    titleEl.className = 'section-title';
    titleEl.textContent = title;
    const grid = document.createElement('div');
    grid.className = 'cards-grid';
    pizzasArray.forEach(pizza => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-content">
                <h3>${escapeHtml(pizza.nome)}</h3>
                <div class="desc">${escapeHtml(pizza.descricao)}</div>
                <div class="price">R$ ${pizza.preco.toFixed(2)}</div>
                <button class="add-to-cart-btn" data-id="${pizza.id}" data-nome="${escapeHtml(pizza.nome)}" data-preco="${pizza.preco}">➕ Adicionar ao carrinho</button>
            </div>
        `;
        const btn = card.querySelector('.add-to-cart-btn');
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            adicionarAoCarrinho(pizza.id, pizza.nome, pizza.preco);
        });
        grid.appendChild(card);
    });
    section.appendChild(titleEl);
    section.appendChild(grid);
    return section;
}

function renderContact() {
    const contact = document.createElement('div');
    contact.className = 'contact';
    contact.innerHTML = `
        <div class="contact-info"><p>📞 ${escapeHtml(configGuto.telefone)}</p><p>📍 ${escapeHtml(configGuto.endereco)}</p></div>
        <div class="social-links"><a href="#">📷 ${escapeHtml(configGuto.redesSociais.instagram)}</a><a href="#">📘 ${escapeHtml(configGuto.redesSociais.facebook)}</a><a href="#">💬 ${escapeHtml(configGuto.redesSociais.whatsapp)}</a></div>
        <div class="hours">🕒 ${escapeHtml(configGuto.horario)}</div>
    `;
    return contact;
}

function renderPaymentSection() {
    const section = document.createElement('div');
    section.className = 'payment-section';
    section.innerHTML = `<div class="payment-title">💳 Escolha a forma de pagamento</div><div class="payment-options" id="paymentOptions"></div><button class="confirm-payment-btn" id="confirmPaymentBtn">✅ Confirmar pedido e pagamento</button><div class="payment-message" id="paymentMessage" style="display:none;"></div>`;
    
    const optionsDiv = section.querySelector('#paymentOptions');
    configGuto.metodosPagamento.forEach(metodo => {
        const optDiv = document.createElement('div');
        optDiv.className = 'payment-option';
        if (selectedPaymentId === metodo.id) optDiv.classList.add('selected');
        optDiv.innerHTML = `<input type="radio" name="payment" value="${metodo.id}" id="pay_${metodo.id}" ${selectedPaymentId === metodo.id ? 'checked' : ''}><label for="pay_${metodo.id}">${metodo.nome}</label>`;
        optDiv.addEventListener('click', () => {
            const radio = optDiv.querySelector('input');
            radio.checked = true;
            selectedPaymentId = metodo.id;
            document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
            optDiv.classList.add('selected');
            const msgDiv = section.querySelector('#paymentMessage');
            msgDiv.style.display = 'none';
        });
        optionsDiv.appendChild(optDiv);
    });
    
    const confirmBtn = section.querySelector('#confirmPaymentBtn');
    const msgDiv = section.querySelector('#paymentMessage');
    confirmBtn.addEventListener('click', () => {
        if (carrinho.length === 0) {
            msgDiv.style.display = 'block';
            msgDiv.innerHTML = '⚠️ Seu carrinho está vazio. Adicione pizzas primeiro!';
            msgDiv.style.background = '#ffcc80';
            return;
        }
        if (!selectedPaymentId) {
            msgDiv.style.display = 'block';
            msgDiv.innerHTML = '⚠️ Selecione uma forma de pagamento.';
            msgDiv.style.background = '#ffcc80';
            return;
        }
        const metodo = configGuto.metodosPagamento.find(m => m.id === selectedPaymentId);
        const subtotal = calcularSubtotal();
        const totalComEntrega = calcularTotalComEntrega();
        let descontoMsg = '';
        let valorFinal = totalComEntrega;
        if (metodo.desconto > 0) {
            const desconto = totalComEntrega * metodo.desconto;
            valorFinal = totalComEntrega - desconto;
            descontoMsg = `🎉 ${metodo.desconto*100}% de desconto aplicado (-R$ ${desconto.toFixed(2)})! `;
        }
        let mensagem = configGuto.pagamentoMensagemTemplate
            .replace('{metodo}', metodo.nome)
            .replace('{descontoMsg}', descontoMsg)
            .replace('{totalFinal}', `R$ ${valorFinal.toFixed(2)}`);
        msgDiv.style.display = 'block';
        msgDiv.innerHTML = mensagem;
        msgDiv.style.background = '#c8e6c9';
        // Limpar carrinho após confirmação? (opcional, mas bom)
        carrinho = [];
        salvarCarrinho();
        atualizarBadgeCarrinho();
        if (cartModal) renderizarCarrinhoModal();
        setTimeout(() => {
            msgDiv.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    });
    return section;
}

function renderFooter() {
    const footer = document.createElement('footer');
    footer.innerHTML = `<div class="container"><p>© ${new Date().getFullYear()} GUTO PIZZA - Todos os sabores com amor.</p><p style="font-size:0.75rem;">🍃 Tradição & Inovação 🍃</p></div>`;
    return footer;
}

function updateFilterVisibility() {
    const salg = document.getElementById('sec-salgadas');
    const doces = document.getElementById('sec-doces');
    if (!salg || !doces) return;
    if (currentFilter === 'all') { salg.classList.remove('hidden-section'); doces.classList.remove('hidden-section'); }
    else if (currentFilter === 'salgadas') { salg.classList.remove('hidden-section'); doces.classList.add('hidden-section'); }
    else if (currentFilter === 'doces') { salg.classList.add('hidden-section'); doces.classList.remove('hidden-section'); }
}

function setupFilters() {
    const allBtn = document.getElementById('filter-all');
    const salgBtn = document.getElementById('filter-salg');
    const docesBtn = document.getElementById('filter-doces');
    if (allBtn) allBtn.onclick = () => { currentFilter = 'all'; updateFilterVisibility(); };
    if (salgBtn) salgBtn.onclick = () => { currentFilter = 'salgadas'; updateFilterVisibility(); };
    if (docesBtn) docesBtn.onclick = () => { currentFilter = 'doces'; updateFilterVisibility(); };
}

function setupDarkMode() {
    const darkBtn = document.getElementById('dark-mode-btn');
    if (darkBtn) darkBtn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        darkBtn.textContent = document.body.classList.contains('dark-mode') ? '☀️ Modo Clássico' : '🌙 Modo Noturno';
    };
}

function buildFullMenu() {
    const root = document.getElementById('root');
    if (!root) return;
    root.innerHTML = '';
    applyColorTheme();
    root.appendChild(renderHeader());
    const container = document.createElement('div');
    container.className = 'container';
    container.innerHTML = `<div class="controls"><button class="btn" id="filter-all">🍕 Todas</button><button class="btn" id="filter-salg">🍅 Salgadas</button><button class="btn" id="filter-doces">🍫 Doces</button><button class="btn btn-dark" id="dark-mode-btn">🌙 Modo Noturno</button><button class="btn" id="viewChangesBtn">🔍 Mudanças</button></div>`;
    root.appendChild(container);
    
    const secSalg = renderPizzaSection("🍕 Pizzas Salgadas", configGuto.pizzasSalgadas, "sec-salgadas");
    const secDoces = renderPizzaSection("🍰 Pizzas Doces", configGuto.pizzasDoces, "sec-doces");
    container.appendChild(secSalg);
    container.appendChild(secDoces);
    container.appendChild(renderPaymentSection());
    container.appendChild(renderContact());
    root.appendChild(renderFooter());
    
    setupFilters();
    setupDarkMode();
    updateFilterVisibility();
    
    const changesBtn = document.getElementById('viewChangesBtn');
    if (changesBtn) changesBtn.onclick = () => detectAndShowChanges();
    
    // Garantir que o botão flutuante do carrinho exista
    if (!document.getElementById('cartFloatBtn')) criarBotaoCarrinho();
}

// Inicialização completa
document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinho();
    buildFullMenu();
    detectAndShowChanges();
    window.configGuto = configGuto;
    window.refreshCardapio = refreshCardapio;
    console.log("🍕 GUTO PIZZA com carrinho ativado! Use configGuto para personalizar.");
});