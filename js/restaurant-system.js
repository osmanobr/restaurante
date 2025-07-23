/**
 * Sistema de Restaurante - JavaScript Vanilla
 * Gerencia todo o fluxo de pedidos do chatbot
 */

class RestaurantSystem {
  constructor() {
    this.API_BASE_URL = this.getApiBaseUrl();
    this.currentEstablishment = null;
    this.establishmentPhone = null;
    this.menuData = null;
    this.paymentMethods = null;
    this.deliveryMethods = null;
    this.currentStep = null;
    this.cart = [];
    this.customerData = {
      phone: "",
      name: "",
      address: "",
      id: null,
    };
    this.loggedInCustomerId = null;
    this.currentAppliedCoupon = null;
    this.currentOrderId = null;
    this.selectedCategory = null;
    this.selectedProductForCustomization = null;
    this.selectedPayment = null;
    this.selectedDelivery = null;
    
    this.initializeElements();
    this.init();
  }

  getApiBaseUrl() {
    const currentPath = window.location.pathname;
    const basePath = currentPath.substring(0, currentPath.lastIndexOf("/"));
    return window.location.origin + basePath + "/backend/api";
  }

  initializeElements() {
    this.chatMessages = document.getElementById("chatMessages");
    this.cartButton = document.getElementById("cartButton");
    this.cartFooterButton = document.getElementById("cartFooterButton");
    this.cartCount = document.getElementById("cartCount");
    this.cartFooterCount = document.getElementById("cartFooterCount");
    this.menuButton = document.getElementById("menuButton");
  }

  init() {
    // Extrair parâmetro do estabelecimento da URL
    const urlParams = new URLSearchParams(window.location.search);
    this.establishmentPhone = urlParams.get("estabelecimento");

    if (!this.establishmentPhone) {
      this.showError("❌ Estabelecimento não especificado na URL");
      return;
    }

    this.loadEstablishment();
    this.setupEventListeners();
  }

  async loadEstablishment() {
    try {
      this.addBotMessage("🔄 Carregando informações do restaurante...");

      const response = await fetch(`${this.API_BASE_URL}/get-establishment.php?phone=${this.establishmentPhone}`);
      const result = await response.json();

      if (result.success) {
        this.currentEstablishment = result.establishment;
        this.menuData = result.menu;
        this.paymentMethods = result.payment_methods;
        this.deliveryMethods = result.delivery_methods;

        this.applyEstablishmentTheme();
        this.initializeChat();
      } else {
        this.showError("❌ Restaurante não encontrado: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao carregar estabelecimento:", error);
      this.showError("❌ Erro de conexão. Verifique se o servidor está funcionando.");
    }
  }

  applyEstablishmentTheme() {
    // Atualizar header
    const headerTitle = document.querySelector(".chat-header h5");
    const headerSubtitle = document.querySelector(".chat-header small");

    if (headerTitle) headerTitle.textContent = this.currentEstablishment.name;
    if (headerSubtitle) headerSubtitle.textContent = this.currentEstablishment.description || "Sempre online";

    // Aplicar cores personalizadas
    const style = document.createElement("style");
    style.textContent = `
      .chat-header { 
        background: linear-gradient(135deg, ${this.currentEstablishment.primary_color}, ${this.currentEstablishment.secondary_color}) !important; 
      }
      .btn-primary { 
        background: linear-gradient(135deg, ${this.currentEstablishment.primary_color}, ${this.currentEstablishment.secondary_color}) !important; 
        border: none !important; 
      }
      .btn-success { 
        background: linear-gradient(135deg, ${this.currentEstablishment.secondary_color}, ${this.currentEstablishment.primary_color}) !important; 
        border: none !important; 
      }
      .price-tag { 
        color: ${this.currentEstablishment.secondary_color} !important; 
      }
      .confirmation-card { 
        background: linear-gradient(135deg, ${this.currentEstablishment.primary_color}, ${this.currentEstablishment.secondary_color}) !important; 
      }
      .category-btn:hover {
        border-color: ${this.currentEstablishment.primary_color} !important;
      }
    `;
    document.head.appendChild(style);

    // Atualizar título da página
    document.title = `${this.currentEstablishment.name} - Pedidos Online`;
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "alert alert-danger";
    errorDiv.innerHTML = `
      <h5>Erro</h5>
      <p>${message}</p>
      <small>Verifique a URL e tente novamente.</small>
    `;
    this.chatMessages.appendChild(errorDiv);
  }

  setupEventListeners() {
    this.menuButton.addEventListener("click", () => this.showMainMenu());
    this.cartButton.addEventListener("click", () => this.showCart());
    this.cartFooterButton.addEventListener("click", () => this.showCart());

    // Event listeners para modais
    const saveCustomerBtn = document.getElementById("saveCustomerData");
    const loginBtn = document.getElementById("loginButton");
    
    if (saveCustomerBtn) {
      saveCustomerBtn.addEventListener("click", () => this.saveCustomerData());
    }
    
    if (loginBtn) {
      loginBtn.addEventListener("click", () => this.loginUser());
    }
  }

  async initializeChat() {
    this.currentStep = "menu";
    this.addBotMessage(
      `Olá! Bem-vindo ao ${this.currentEstablishment.name}! 🍽️\n\n${this.currentEstablishment.description}\n\nEu sou seu assistente virtual e vou te ajudar a fazer seu pedido. Vamos começar?`
    );
    
    setTimeout(async () => {
      await this.loadLoggedInCustomer();
      this.showMainMenu();
    }, 1000);
  }

  async loadLoggedInCustomer() {
    // Implementar lógica para carregar cliente logado se necessário
    // Por enquanto, apenas um placeholder
  }

  addBotMessage(content, data = null) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message bot";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    if (data) {
      messageContent.innerHTML = this.renderMessageWithData(content, data);
    } else {
      messageContent.innerHTML = `
        <div>${content.replace(/\n/g, "<br>")}</div>
        <div class="message-time">${this.getCurrentTime()}</div>
      `;
    }

    messageDiv.appendChild(messageContent);
    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addUserMessage(content) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message user";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.innerHTML = `
      <div>${content}</div>
      <div class="message-time">${this.getCurrentTime()}</div>
    `;

    messageDiv.appendChild(messageContent);
    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  renderMessageWithData(content, data) {
    let html = `<div>${content.replace(/\n/g, "<br>")}</div>`;

    switch (data.type) {
      case "categories":
        html += this.renderCategories(data.categories);
        break;
      case "products":
        html += this.renderProducts(data.products);
        break;
      case "continue-shopping":
        html += this.renderContinueShopping();
        break;
      case "cart":
        html += this.renderCart(data.items);
        break;
      case "payment":
        html += this.renderPaymentMethods(data.methods);
        break;
      case "delivery":
        html += this.renderDeliveryMethods(data.methods);
        break;
      case "confirmation":
        html += this.renderConfirmation(data);
        break;
      case "customer-check":
        html += this.renderCustomerCheck();
        break;
      case "customer-found":
        html += this.renderCustomerFound(data.customer);
        break;
      case "pix-payment":
        html += this.renderPixPayment(data);
        break;
      case "order-created":
        html += this.renderOrderCreated(data.order);
        break;
      case "product-customization":
        html += this.renderProductCustomization(data.product);
        break;
      case "auth-prompt":
        html += this.renderAuthPrompt(data.next_action);
        break;
    }

    html += `<div class="message-time">${this.getCurrentTime()}</div>`;
    return html;
  }

  renderCategories(categories) {
    let html = '<div class="row g-2 mt-2">';
    categories.forEach((category) => {
      html += `
        <div class="col-6">
          <button class="btn category-btn w-100" onclick="restaurantSystem.showCategory(${category.id})">
            <div class="category-icon">${category.icon}</div>
            <small>${category.name}</small>
          </button>
        </div>
      `;
    });
    html += "</div>";

    if (this.cart.length > 0) {
      html += `
        <button class="btn btn-success w-100 mt-3" onclick="restaurantSystem.showCart()">
          <i class="bi bi-cart"></i> Ver Carrinho (${this.cart.length})
        </button>
      `;
    }

    // Adicionar botão "Meus Pedidos"
    html += `
      <button class="btn btn-outline-primary w-100 mt-3" onclick="restaurantSystem.showCustomerOrders()">
        <i class="bi bi-clock-history"></i> Meus Pedidos
      </button>
    `;

    // Botão de login/logout
    html += `
      <div class="d-flex mt-3">
        ${
          this.loggedInCustomerId
            ? `<button class="btn btn-outline-secondary w-100" onclick="restaurantSystem.logoutCustomer()">
                <i class="bi bi-box-arrow-right"></i> Sair (${this.customerData.name.split(" ")[0]})
              </button>`
            : `<button class="btn btn-outline-primary w-100" onclick="restaurantSystem.showAuthPrompt()">
                <i class="bi bi-person"></i> Entrar / Cadastrar
              </button>`
        }
      </div>
    `;

    return html;
  }

  renderProducts(products) {
    let html = '<div class="mt-3">';
    products.forEach((product) => {
      html += `
        <div class="card product-card mb-3">
          <div class="card-body">
            <div class="row align-items-center">
              <div class="col-3">
                <img src="${product.image}" alt="${product.name}" class="img-fluid rounded">
              </div>
              <div class="col-9">
                <h6 class="card-title mb-1">${product.name}</h6>
                <p class="card-text small text-muted mb-2">${product.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="price-tag">R$ ${product.price.toFixed(2)}</span>
                  <button class="btn btn-primary btn-sm" onclick="restaurantSystem.handleAddToCartClick(${product.id})">
                    <i class="bi bi-plus"></i> Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    html += "</div>";

    html += `
      <div class="d-flex mt-3" style="gap: 0.5rem;">
        <button class="btn btn-outline-secondary" onclick="restaurantSystem.showMainMenu()">
          ← Voltar ao Menu
        </button>
        ${
          this.cart.length > 0
            ? `
            <button class="btn btn-success" onclick="restaurantSystem.showCart()">
              <i class="bi bi-cart"></i> Carrinho (${this.cart.length})
            </button>
          `
            : ""
        }
      </div>
    `;

    return html;
  }

  renderContinueShopping() {
    return `
      <div class="d-flex mt-3" style="gap: 0.5rem;">
        <button class="btn btn-outline-primary" onclick="restaurantSystem.showMainMenu()">
          Continuar Comprando
        </button>
        <button class="btn btn-success" onclick="restaurantSystem.showCart()">
          <i class="bi bi-cart"></i> Ver Carrinho (${this.cart.length})
        </button>
      </div>
    `;
  }

  renderCart(items) {
    let html = '<div class="mt-3">';

    items.forEach((item) => {
      html += `
        <div class="cart-item">
          <div class="row align-items-center">
            <div class="col-2">
              <img src="${item.product.image}" alt="${item.product.name}" class="img-fluid rounded">
            </div>
            <div class="col-5">
              <h6 class="mb-1 small">${item.product.name}</h6>
              ${
                item.options && item.options.length > 0
                  ? `<ul class="list-unstyled small text-muted mb-1">` +
                    item.options
                      .map(
                        (opt) =>
                          `<li>${opt.name} ${
                            opt.price_adjustment > 0 ? `(+R$ ${opt.price_adjustment.toFixed(2)})` : ""
                          }</li>`
                      )
                      .join("") +
                    `</ul>`
                  : ""
              }
              <span class="price-tag small">R$ ${this.calculateItemTotalPrice(item).toFixed(2)}</span>
            </div>
            <div class="col-5">
              <div class="quantity-controls">
                <button class="btn quantity-btn" onclick="restaurantSystem.updateCartQuantity(${item.product.id}, ${item.quantity - 1}, ${item.options ? JSON.stringify(item.options.map((o) => o.id)) : "[]"})">
                  <i class="bi bi-dash"></i>
                </button>
                <span class="mx-2">${item.quantity}</span>
                <button class="btn quantity-btn" onclick="restaurantSystem.updateCartQuantity(${item.product.id}, ${item.quantity + 1}, ${item.options ? JSON.stringify(item.options.map((o) => o.id)) : "[]"})">
                  <i class="bi bi-plus"></i>
                </button>
                <button class="btn quantity-btn ms-2" onclick="restaurantSystem.updateCartQuantity('${item.product.id}', 0, ${item.options ? JSON.stringify(item.options.map((o) => o.id)) : "[]"})">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    const subtotal = this.getTotalPrice();
    let discountAmount = 0;
    if (this.currentAppliedCoupon) {
      discountAmount = this.currentAppliedCoupon.discount_amount;
    }
    const total = subtotal - discountAmount;
    const minOrder = this.currentEstablishment.min_order || 0;

    html += `
      <hr>
      <div class="mb-3">
        <label for="couponCode" class="form-label small">Tem um cupom?</label>
        <div class="d-flex" style="gap: 0.5rem;">
          <input type="text" class="form-control" id="couponCode" placeholder="CÓDIGO DO CUPOM" value="${this.currentAppliedCoupon ? this.currentAppliedCoupon.code : ""}">
          <button class="btn btn-outline-secondary" type="button" onclick="restaurantSystem.applyCoupon()">Aplicar</button>
        </div>
        ${this.currentAppliedCoupon ? `<div class="text-success small mt-1">Cupom aplicado: ${this.currentAppliedCoupon.description} (-R$ ${this.currentAppliedCoupon.discount_amount.toFixed(2)})</div>` : ""}
        <div id="couponError" class="text-danger small mt-1"></div>
      </div>
      <div class="d-flex justify-content-between align-items-center">
        <h5>Subtotal:</h5>
        <h5 class="price-tag">R$ ${subtotal.toFixed(2)}</h5>
      </div>
      ${
        discountAmount > 0
          ? `
      <div class="d-flex justify-content-between align-items-center text-success">
        <h5>Desconto:</h5>
        <h5 class="price-tag">- R$ ${discountAmount.toFixed(2)}</h5>
      </div>`
          : ""
      }
      <div class="d-flex justify-content-between align-items-center">
        <h5>Total:</h5>
        <h5 class="price-tag">R$ ${total.toFixed(2)}</h5>
      </div>
      ${
        minOrder > 0 && subtotal < minOrder
          ? `
          <div class="alert alert-warning small mt-2">
            <i class="bi bi-info-circle"></i> Pedido mínimo: R$ ${minOrder.toFixed(2)}
          </div>
      `
          : ""
      }
      <div class="d-flex mt-3" style="gap: 0.5rem;">
        <button class="btn btn-outline-primary" onclick="restaurantSystem.showMainMenu()">
          Continuar Comprando
        </button>
        <button class="btn btn-success flex-fill" onclick="restaurantSystem.proceedToPayment()" ${minOrder > 0 && subtotal < minOrder ? "disabled" : ""}>
          Finalizar Pedido
        </button>
      </div>
    `;

    html += "</div>";
    return html;
  }

  renderPaymentMethods(methods) {
    let html = '<div class="row g-2 mt-2">';
    methods.forEach((method) => {
      html += `
        <div class="col-6">
          <div class="card payment-method" onclick="restaurantSystem.selectPayment('${method.id}')">
            <div class="card-body text-center py-3">
              <div class="fs-4 mb-2">${method.icon}</div>
              <small>${method.name}</small>
            </div>
          </div>
        </div>
      `;
    });
    html += "</div>";
    return html;
  }

  renderDeliveryMethods(methods) {
    let html = '<div class="mt-2">';
    methods.forEach((method) => {
      html += `
        <div class="card delivery-method mb-2" onclick="restaurantSystem.selectDelivery('${method.id}')">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="fs-4 me-3">${method.icon}</div>
              <div class="flex-grow-1">
                <div class="d-flex align-items-center" style="gap: 0.5rem;">
                  <h6 class="mb-0">${method.name}</h6>
                  ${method.price > 0 ? `<span class="badge bg-secondary">+R$ ${method.price.toFixed(2)}</span>` : ""}
                </div>
                <small class="text-muted">${method.description}</small><br>
                <small class="text-primary">${method.time}</small>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    html += "</div>";
    return html;
  }

  renderConfirmation(data) {
    const paymentMethod = this.paymentMethods.find((p) => p.id === data.payment);
    const deliveryMethod = this.deliveryMethods.find((d) => d.id === data.delivery);

    const subtotal = data.total - data.deliveryFee + data.discount_amount;
    const total = data.total;

    let html = `
      <div class="customer-info mb-3">
        <h6><i class="bi bi-person"></i> Dados do Cliente:</h6>
        <p class="mb-1"><strong>Nome:</strong> ${this.customerData.name}</p>
        <p class="mb-1"><strong>Telefone:</strong> ${this.formatPhone(this.customerData.phone)}</p>
        ${this.selectedDelivery === "delivery" ? `<p class="mb-0"><strong>Endereço:</strong> ${this.customerData.address}</p>` : ""}
      </div>
      
      <div class="card confirmation-card mt-3">
        <div class="card-body">
          <h6 class="card-title text-white">Itens do Pedido:</h6>
    `;

    data.cart.forEach((item) => {
      html += `
        <div class="d-flex justify-content-between text-white-50 small">
          <span>${item.quantity}x ${item.product.name}</span>
          <span>R$ ${this.calculateItemTotalPrice(item).toFixed(2)}</span>
        </div>
      `;
      if (item.options && item.options.length > 0) {
        html += `<ul class="list-unstyled text-white-50 small ms-3 mb-1">`;
        item.options.forEach((opt) => {
          html += `<li>- ${opt.name} ${opt.price_adjustment > 0 ? `(+R$ ${opt.price_adjustment.toFixed(2)})` : ""}</li>`;
        });
        html += `</ul>`;
      }
    });

    html += `
          <hr class="text-white-50">
          <div class="d-flex justify-content-between text-white-50 small">
            <span>Subtotal:</span>
            <span>R$ ${subtotal.toFixed(2)}</span>
          </div>
    `;

    if (data.discount_amount > 0) {
      html += `
      <div class="d-flex justify-content-between text-white-50 small text-success">
        <span>Desconto do Cupom:</span>
        <span>- R$ ${data.discount_amount.toFixed(2)}</span>
      </div>`;
    }

    if (data.deliveryFee > 0) {
      html += `
          <div class="d-flex justify-content-between text-white-50 small">
            <span>Taxa de entrega:</span>
            <span>R$ ${data.deliveryFee.toFixed(2)}</span>
          </div>
      `;
    }

    html += `
          <div class="d-flex justify-content-between text-white">
            <strong>Total:</strong>
            <strong>R$ ${total.toFixed(2)}</strong>
          </div>
          <hr class="text-white-50">
          <div class="small text-white-50">
            <div class="d-flex justify-content-between">
              <span>Pagamento:</span>
              <span>${paymentMethod.name}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span>Entrega:</span>
              <span>${deliveryMethod.name}</span>
            </div>
            <div class="d-flex justify-content-between">
              <span>Tempo estimado:</span>
              <span>${deliveryMethod.time}</span>
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn-light w-100 mt-3" onclick="restaurantSystem.createOrder()">
        <strong>Confirmar Pedido</strong>
      </button>
    `;

    return html;
  }

  renderCustomerCheck() {
    return `
      <div class="mt-3">
        <div class="mb-3">
          <label for="phoneCheck" class="form-label">Digite seu celular:</label>
          <div class="d-flex" style="gap: 0.5rem;">
            <input type="tel" class="form-control phone-mask" id="phoneCheck" placeholder="(00) 00000-0000">
            <button class="btn btn-primary" onclick="restaurantSystem.checkPhone()">Verificar</button>
          </div>
        </div>
      </div>
    `;
  }

  renderCustomerFound(customer) {
    return `
      <div class="customer-info">
        <h6><i class="bi bi-person-check"></i> Cliente Encontrado!</h6>
        <p class="mb-1"><strong>Nome:</strong> ${customer.name}</p>
        <p class="mb-1"><strong>Telefone:</strong> ${this.formatPhone(customer.phone)}</p>
        <p class="mb-1"><strong>Endereço:</strong> ${customer.address}</p>
        <p class="mb-0 small text-muted">Cliente desde: ${customer.member_since}</p>
      </div>
      <div class="d-flex mt-3" style="gap: 0.5rem;">
        <button class="btn btn-success" onclick="restaurantSystem.useExistingCustomer()">Usar estes dados</button>
        <button class="btn btn-outline-secondary" onclick="restaurantSystem.showCustomerModal()">Alterar dados</button>
      </div>
    `;
  }

  renderPixPayment(data) {
    const uniqueId = Date.now();
    return `
      <div class="pix-container">
        <h6><i class="bi bi-qr-code"></i> Pagamento PIX</h6>
        <p class="text-muted small">Escaneie o QR Code ou copie o código abaixo:</p>
        
        <div class="qr-code-container">
          <canvas id="qrcode-${uniqueId}"></canvas>
        </div>
        
        <div class="pix-code" id="pixCode">Gerando código PIX...</div>
        
        <button class="btn btn-outline-primary copy-button" onclick="restaurantSystem.copyPixCode()" disabled id="copyButton">
          <i class="bi bi-clipboard"></i> Copiar Código PIX
          <span class="copy-success" id="copySuccess">Copiado!</span>
        </button>
        
        <div class="mt-3">
          <p class="small text-muted">
            <strong>Valor:</strong> R$ ${data.total.toFixed(2)}<br>
            <strong>Favorecido:</strong> ${this.currentEstablishment.name}<br>
            <strong>Chave PIX:</strong> ${this.currentEstablishment.pix_key || 'Não informada'}
          </p>
        </div>
        
        <div class="alert alert-info small mt-3">
          <i class="bi bi-info-circle"></i> 
          Após realizar o pagamento, clique no botão abaixo para continuar.
        </div>
        
        <button class="btn btn-success w-100 mt-2" onclick="restaurantSystem.confirmPixPayment()">
          <i class="bi bi-check-circle"></i> Já fiz o pagamento
        </button>
      </div>
    `;
  }

  renderOrderCreated(order) {
    return `
      <div class="alert alert-success">
        <h6><i class="bi bi-check-circle"></i> Pedido #${order.order_number}</h6>
        <p class="mb-1">Cliente: ${order.customer_name}</p>
        <p class="mb-1">Total: R$ ${order.total.toFixed(2)}</p>
        <p class="mb-0">Status: ${order.status}</p>
      </div>
      
      <button class="btn btn-primary w-100 mt-3" onclick="restaurantSystem.startNewOrder()">
        Fazer Novo Pedido
      </button>
    `;
  }

  renderProductCustomization(product) {
    // Implementar se necessário
    return `<div>Personalização de produto em desenvolvimento...</div>`;
  }

  renderAuthPrompt(nextAction = null) {
    return `
      <div class="mt-3">
        <h6>Bem-vindo(a)! Para continuar, faça login ou cadastre-se:</h6>
        <div class="d-flex mt-3" style="gap: 0.5rem;">
          <button class="btn btn-primary flex-fill" onclick="restaurantSystem.showLoginModal('${nextAction}')">
            <i class="bi bi-box-arrow-in-right"></i> Entrar
          </button>
          <button class="btn btn-outline-primary flex-fill" onclick="restaurantSystem.showRegisterModal('${nextAction}')">
            <i class="bi bi-person-plus"></i> Cadastrar
          </button>
        </div>
        <div class="d-flex mt-3">
          <button class="btn btn-outline-secondary w-100" onclick="restaurantSystem.showMainMenu()">
            ← Voltar ao Menu
          </button>
        </div>
      </div>
    `;
  }

  // Métodos principais do sistema
  showMainMenu() {
    this.currentStep = "menu";
    this.addBotMessage("Aqui está nosso menu principal. Escolha uma categoria:", {
      type: "categories",
      categories: this.menuData,
    });
  }

  showCategory(categoryId) {
    const category = this.menuData.find((c) => c.id === categoryId);
    this.selectedCategory = category;
    this.currentStep = "category";
    this.addUserMessage(`Ver ${category.name}`);
    this.addBotMessage(`Ótima escolha! Aqui estão nossos ${category.name.toLowerCase()}:`, {
      type: "products",
      products: category.products,
    });
  }

  handleAddToCartClick(productId) {
    const product = this.selectedCategory.products.find((p) => p.id === productId);
    if (product && product.options_groups && product.options_groups.length > 0) {
      // Implementar personalização se necessário
      this.addToCart(product, []);
    } else {
      this.addToCart(product, []);
    }
  }

  addToCart(product, options = []) {
    this.addUserMessage(`Adicionar ${product.name}`);

    const itemIdentifier = `${product.id}-${options
      .map((o) => o.id)
      .sort()
      .join("-")}`;

    const existingItem = this.cart.find((item) => {
      const existingItemOptionsIds = item.options
        ? item.options
            .map((o) => o.id)
            .sort()
            .join("-")
        : "";
      return `${item.product.id}-${existingItemOptionsIds}` === itemIdentifier;
    });

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ product, quantity: 1, options });
    }

    this.updateCartUI();
    this.addBotMessage(`${product.name} adicionado ao carrinho! 🛒\n\nDeseja continuar comprando ou finalizar o pedido?`, {
      type: "continue-shopping",
    });
  }

  calculateItemTotalPrice(cartItem) {
    let itemPrice = cartItem.product.price;
    if (cartItem.options) {
      cartItem.options.forEach((option) => {
        itemPrice += option.price_adjustment;
      });
    }
    return itemPrice * cartItem.quantity;
  }

  updateCartQuantity(productId, newQuantity, optionsIds = []) {
    const itemIdentifier = `${productId}-${optionsIds.sort().join("-")}`;

    const itemIndex = this.cart.findIndex((item) => {
      const existingItemOptionsIds = item.options
        ? item.options
            .map((o) => o.id)
            .sort()
            .join("-")
        : "";
      return `${item.product.id}-${existingItemOptionsIds}` === itemIdentifier;
    });

    if (itemIndex !== -1) {
      if (newQuantity === 0) {
        this.cart.splice(itemIndex, 1);
      } else {
        this.cart[itemIndex].quantity = newQuantity;
      }
    }

    this.updateCartUI();

    if (this.currentStep === "cart") {
      setTimeout(() => {
        this.showCart();
      }, 100);
    }
  }

  showCart() {
    this.currentStep = "cart";
    this.addUserMessage("Ver carrinho");

    if (this.cart.length === 0) {
      this.addBotMessage("Seu carrinho está vazio. Que tal escolher alguns produtos deliciosos?");
      this.showMainMenu();
    } else {
      this.addBotMessage("Aqui está seu carrinho:", {
        type: "cart",
        items: this.cart,
      });
    }
  }

  proceedToPayment() {
    const total = this.getTotalPrice();
    const minOrder = this.currentEstablishment.min_order || 0;

    if (minOrder > 0 && total < minOrder) {
      this.addBotMessage(`❌ Pedido mínimo é de R$ ${minOrder.toFixed(2)}. Adicione mais itens ao carrinho.`);
      return;
    }

    if (this.loggedInCustomerId) {
      this.currentStep = "payment";
      this.addUserMessage("Finalizar pedido");
      this.addBotMessage("Perfeito! Agora escolha a forma de pagamento:", {
        type: "payment",
        methods: this.paymentMethods,
      });
    } else {
      this.currentStep = "auth-prompt";
      this.addUserMessage("Finalizar pedido");
      this.addBotMessage("Para finalizar seu pedido, preciso de alguns dados. Vou verificar se você já é nosso cliente.", {
        type: "customer-check",
      });
    }
  }

  selectPayment(paymentId) {
    this.selectedPayment = paymentId;
    const payment = this.paymentMethods.find((p) => p.id === paymentId);
    this.addUserMessage(`Pagamento: ${payment.name}`);

    this.currentStep = "delivery";
    this.addBotMessage("Agora escolha como deseja receber seu pedido:", {
      type: "delivery",
      methods: this.deliveryMethods,
    });
  }

  selectDelivery(deliveryId) {
    this.selectedDelivery = deliveryId;
    const delivery = this.deliveryMethods.find((d) => d.id === deliveryId);
    this.addUserMessage(delivery.name);

    if (this.selectedPayment === "pix") {
      const total = this.getTotalPrice();
      const deliveryFee = delivery.price || 0;
      const finalTotal = total + deliveryFee;

      this.addBotMessage("Aqui está seu código PIX para pagamento:", {
        type: "pix-payment",
        total: finalTotal,
      });

      setTimeout(() => {
        this.generatePixQRCode(finalTotal);
      }, 500);
    } else {
      this.currentStep = "confirmation";
      const total = this.getTotalPrice();
      const deliveryFee = delivery.price || 0;
      const finalTotal = total + deliveryFee;

      this.addBotMessage("Resumo do seu pedido:", {
        type: "confirmation",
        cart: this.cart,
        payment: this.selectedPayment,
        delivery: this.selectedDelivery,
        total: finalTotal,
        deliveryFee: deliveryFee,
        discount_amount: 0,
      });
    }
  }

  async checkPhone() {
    const phoneInput = document.getElementById("phoneCheck");
    const phone = phoneInput.value.replace(/\D/g, "");

    if (!this.validatePhone(phone)) {
      alert("Por favor, digite um celular válido com DDD (10 ou 11 dígitos)");
      phoneInput.focus();
      return;
    }

    this.addUserMessage(`Telefone: ${this.formatPhone(phone)}`);
    this.addBotMessage("Verificando seus dados... ⏳");

    try {
      const existingCustomer = await this.checkCustomerExists(phone);

      if (existingCustomer) {
        this.customerData = existingCustomer;
        this.addBotMessage("✅ Encontrei seus dados em nosso sistema:", {
          type: "customer-found",
          customer: existingCustomer,
        });
      } else {
        this.addBotMessage("📝 Não encontrei seus dados em nosso sistema. Vamos fazer um cadastro rápido para você!");
        setTimeout(() => {
          this.showCustomerModal();
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao verificar cliente:", error);
      this.addBotMessage("❌ Erro ao verificar dados. Vamos fazer seu cadastro:");
      setTimeout(() => {
        this.showCustomerModal();
      }, 1000);
    }
  }

  async checkCustomerExists(phone) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/check-customer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phone }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.found ? result.customer : null;
    } catch (error) {
      console.error("Erro ao verificar cliente:", error);
      return null;
    }
  }

  useExistingCustomer() {
    this.addUserMessage("Usar dados cadastrados");
    this.addBotMessage("Perfeito! Agora escolha a forma de pagamento:", {
      type: "payment",
      methods: this.paymentMethods,
    });

    this.currentStep = "payment";
  }

  showCustomerModal() {
    const modal = new bootstrap.Modal(document.getElementById("customerModal"));
    modal.show();

    const phoneInput = document.getElementById("customerPhone");
    phoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      if (value.length <= 11) {
        if (value.length >= 7) {
          value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        } else if (value.length >= 3) {
          value = value.replace(/(\d{2})(\d+)/, "($1) $2");
        }
        e.target.value = value;
      }
    });
  }

  async saveCustomerData() {
    const phone = document.getElementById("customerPhone").value;
    const name = document.getElementById("customerName").value;
    const address = document.getElementById("customerAddress").value;
    const password = document.getElementById("customerPassword").value;

    if (!this.validatePhone(phone)) {
      alert("Por favor, digite um celular válido com DDD");
      return;
    }

    if (!name.trim() || !address.trim() || !password.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/register-customer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          name: name.trim(),
          address: address.trim(),
          password: password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        this.customerData = {
          id: result.customer.id,
          phone: result.customer.phone,
          name: result.customer.name,
          address: result.customer.address,
        };

        const modal = bootstrap.Modal.getInstance(document.getElementById("customerModal"));
        modal.hide();

        this.addUserMessage(`Dados salvos: ${name}`);
        this.addBotMessage(`Obrigado, ${name}! Seus dados foram salvos. Agora escolha a forma de pagamento:`, {
          type: "payment",
          methods: this.paymentMethods,
        });

        this.currentStep = "payment";
      } else {
        alert("Erro ao salvar dados: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      alert("Erro de conexão. Tente novamente.");
    }
  }

  async loginUser() {
    const phone = document.getElementById("loginPhone").value;
    const password = document.getElementById("loginPassword").value;

    if (!this.validatePhone(phone) || !password) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/login-customer.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          password: password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        this.customerData = result.customer;
        this.loggedInCustomerId = result.customer.id;

        const modal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
        modal.hide();

        this.addUserMessage(`Login realizado: ${result.customer.name}`);
        this.addBotMessage(`Bem-vindo de volta, ${result.customer.name}! Agora escolha a forma de pagamento:`, {
          type: "payment",
          methods: this.paymentMethods,
        });

        this.currentStep = "payment";
      } else {
        document.getElementById("loginError").textContent = result.error;
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      document.getElementById("loginError").textContent = "Erro de conexão. Tente novamente.";
    }
  }

  async createOrder() {
    this.addUserMessage("Confirmar pedido");
    this.addBotMessage("Processando seu pedido... ⏳");

    try {
      const orderData = {
        customer_id: this.customerData.id,
        items: this.cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          options: item.options || [],
        })),
        payment_method: this.selectedPayment,
        delivery_method: this.selectedDelivery,
        coupon_code: this.currentAppliedCoupon ? this.currentAppliedCoupon.code : null,
      };

      const response = await fetch(`${this.API_BASE_URL}/create-order.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        this.currentOrderId = result.order.id;
        this.addBotMessage("🎉 Pedido criado com sucesso!", {
          type: "order-created",
          order: result.order,
        });

        if (this.selectedPayment === "pix") {
          this.startPixPaymentCheck();
        }
      } else {
        this.addBotMessage("❌ Erro ao criar pedido: " + result.error);
      }
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      this.addBotMessage("❌ Erro de conexão. Tente novamente.");
    }
  }

  generatePixQRCode(total) {
    try {
      const tempOrderId = "TEMP" + Date.now();

      fetch(`${this.API_BASE_URL}/generate-pix.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          order_id: tempOrderId,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            const canvas = document.querySelector('[id^="qrcode-"]');

            if (canvas && window.QRCode) {
              window.QRCode.toCanvas(
                canvas,
                result.pix_code,
                {
                  width: 200,
                  margin: 2,
                  color: {
                    dark: "#000000",
                    light: "#FFFFFF",
                  },
                },
                (error) => {
                  if (error) {
                    console.error("❌ Erro ao gerar QR Code:", error);
                  }
                }
              );

              const pixCodeElement = document.getElementById("pixCode");
              if (pixCodeElement) {
                pixCodeElement.textContent = result.pix_code;
              }

              const copyButton = document.getElementById("copyButton");
              if (copyButton) {
                copyButton.disabled = false;
                copyButton.onclick = () => this.copyPixCode(result.pix_code);
              }
            }
          } else {
            this.addBotMessage("❌ Erro ao gerar código PIX. Tente outro método de pagamento.");
          }
        })
        .catch((error) => {
          console.error("❌ Erro ao gerar PIX:", error);
          this.addBotMessage("❌ Erro de conexão ao gerar PIX. Tente novamente.");
        });
    } catch (error) {
      console.error("❌ Erro geral:", error);
    }
  }

  copyPixCode(code = null) {
    const pixCodeElement = document.getElementById("pixCode");
    const codeText = code || (pixCodeElement ? pixCodeElement.textContent : "");

    if (!codeText || codeText === "Gerando código PIX...") {
      alert("Código PIX ainda não está disponível");
      return;
    }

    navigator.clipboard
      .writeText(codeText)
      .then(() => {
        const successSpan = document.getElementById("copySuccess");
        if (successSpan) {
          successSpan.classList.add("show");
          setTimeout(() => {
            successSpan.classList.remove("show");
          }, 2000);
        }
      })
      .catch((err) => {
        const textArea = document.createElement("textarea");
        textArea.value = codeText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        const successSpan = document.getElementById("copySuccess");
        if (successSpan) {
          successSpan.classList.add("show");
          setTimeout(() => {
            successSpan.classList.remove("show");
          }, 2000);
        }
      });
  }

  confirmPixPayment() {
    this.addUserMessage("Pagamento realizado");
    this.addBotMessage("Pagamento PIX confirmado! Agora escolha como deseja receber seu pedido:", {
      type: "delivery",
      methods: this.deliveryMethods,
    });
    this.currentStep = "delivery";
  }

  async startPixPaymentCheck() {
    if (!this.currentOrderId) return;

    const checkPayment = async () => {
      try {
        const response = await fetch(`${this.API_BASE_URL}/check-pix-payment.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order_id: this.currentOrderId }),
        });

        const result = await response.json();

        if (result.paid) {
          this.addBotMessage(`✅ ${result.message}`);
          this.addBotMessage("Seu pedido está sendo preparado! Você receberá atualizações sobre o status.");

          clearInterval(this.paymentCheckInterval);
          this.startOrderStatusCheck();
        }
      } catch (error) {
        console.error("Erro ao verificar pagamento:", error);
      }
    };

    this.paymentCheckInterval = setInterval(checkPayment, 10000);

    setTimeout(() => {
      clearInterval(this.paymentCheckInterval);
    }, 300000);
  }

  async startOrderStatusCheck() {
    if (!this.currentOrderId) return;

    let lastStatus = "pending";

    const checkStatus = async () => {
      try {
        const response = await fetch(`${this.API_BASE_URL}/get-order-status.php?order_id=${this.currentOrderId}`);
        const result = await response.json();

        if (result.status !== lastStatus) {
          lastStatus = result.status;

          const statusMessages = {
            confirmed: "✅ Pedido confirmado!",
            preparing: "👨‍🍳 Preparando seu pedido...",
            ready: "🎉 Pedido pronto! Pode vir buscar ou aguardar a entrega.",
            delivered: "✅ Pedido entregue com sucesso!",
          };

          if (statusMessages[result.status]) {
            this.addBotMessage(statusMessages[result.status]);
          }

          if (result.status === "delivered") {
            clearInterval(this.statusCheckInterval);
            setTimeout(() => {
              this.startNewOrder();
            }, 3000);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error);
      }
    };

    this.statusCheckInterval = setInterval(checkStatus, 30000);
  }

  startNewOrder() {
    this.cart = [];
    this.selectedPayment = "";
    this.selectedDelivery = "";
    this.currentStep = "menu";
    this.currentOrderId = null;
    this.customerData = { phone: "", name: "", address: "", id: null };
    this.updateCartUI();

    this.addBotMessage("Gostaria de fazer um novo pedido?");
    this.showMainMenu();
  }

  // Métodos auxiliares
  updateCartUI() {
    const count = this.cart.length;
    this.cartCount.textContent = count;
    this.cartFooterCount.textContent = count;

    if (count > 0) {
      this.cartButton.style.display = "block";
      this.cartFooterButton.style.display = "block";
    } else {
      this.cartButton.style.display = "none";
      this.cartFooterButton.style.display = "none";
    }
  }

  getTotalPrice() {
    return this.cart.reduce((total, item) => total + this.calculateItemTotalPrice(item), 0);
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 100);
  }

  validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 11 && /^\d{2}/.test(cleanPhone);
  }

  formatPhone(phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 11) {
      return `(${cleanPhone.substr(0, 2)}) ${cleanPhone.substr(2, 5)}-${cleanPhone.substr(7, 4)}`;
    } else if (cleanPhone.length === 10) {
      return `(${cleanPhone.substr(0, 2)}) ${cleanPhone.substr(2, 4)}-${cleanPhone.substr(6, 4)}`;
    }
    return phone;
  }

  // Métodos placeholder para funcionalidades futuras
  showCustomerOrders() {
    this.addBotMessage("Funcionalidade de histórico de pedidos em desenvolvimento...");
  }

  showAuthPrompt() {
    this.addBotMessage("Para acessar recursos adicionais, faça login ou cadastre-se:", {
      type: "auth-prompt",
      next_action: null,
    });
  }

  showLoginModal(nextAction) {
    const modal = new bootstrap.Modal(document.getElementById("loginModal"));
    modal.show();
  }

  showRegisterModal(nextAction) {
    this.showCustomerModal();
  }

  logoutCustomer() {
    this.loggedInCustomerId = null;
    this.customerData = { phone: "", name: "", address: "", id: null };
    this.addBotMessage("Logout realizado com sucesso!");
    this.showMainMenu();
  }

  applyCoupon() {
    const couponCode = document.getElementById("couponCode").value.trim();
    const errorDiv = document.getElementById("couponError");

    if (!couponCode) {
      errorDiv.textContent = "Digite um código de cupom";
      return;
    }

    // Implementar validação de cupom via API
    errorDiv.textContent = "Funcionalidade de cupons em desenvolvimento...";
  }
}

// Inicializar o sistema quando o DOM estiver carregado
let restaurantSystem;

document.addEventListener("DOMContentLoaded", () => {
  restaurantSystem = new RestaurantSystem();
});