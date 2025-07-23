// Configuração da API
const API_BASE_URL =
  window.location.origin +
  window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")) +
  "/backend/api"

// Variáveis globais do estabelecimento
let currentEstablishment = null
let establishmentPhone = null

// Variáveis globais do sistema
const customerData = {
  phone: "",
  name: "",
  address: "",
  id: null,
} // Mantido para consistência, mas `loggedInCustomerId` será o principal
const loggedInCustomerId = null // Armazena o ID do cliente logado
const currentAppliedCoupon = null // Armazena o cupom aplicado
const currentOrderId = null
const orderStatusCheckInterval = null

// Elementos DOM
const chatMessages = document.getElementById("chatMessages")
const cartButton = document.getElementById("cartButton")
const cartFooterButton = document.getElementById("cartFooterButton")
const cartCount = document.getElementById("cartCount")
const cartFooterCount = document.getElementById("cartFooterCount")
const menuButton = document.getElementById("menuButton")

// Importações necessárias
const bootstrap = window.bootstrap
const QRCode = window.QRCode

// Variáveis globais do sistema (declaradas)
let menuData = null
let paymentMethods = null
let deliveryMethods = null
let currentStep = null
const cart = []
const selectedDelivery = null
let selectedCategory = null
let selectedProductForCustomization = null
let selectedPayment = null

// Funções necessárias
function saveCustomerData() {
  // Implementação para salvar dados do cliente
}

function loginUser() {
  // Implementação para login do cliente
}

function registerUser() {
  // Implementação para registro do cliente
}

async function loadLoggedInCustomer() {
  // Implementação para carregar cliente logado
}

function getCurrentTime() {
  // Implementação para obter a hora atual
}

function scrollToBottom() {
  // Implementação para rolar para o fim da página
}

function renderCustomerCheck() {
  // Implementação para renderizar a tela de verificação do cliente
}

function renderCustomerFound(customer) {
  // Implementação para renderizar a tela de cliente encontrado
}

function renderPixPayment(data) {
  // Implementação para renderizar a tela de pagamento PIX
}

function renderOrderCreated(order) {
  // Implementação para renderizar a tela de pedido criado
}

function getTotalPrice() {
  // Implementação para calcular o preço total do carrinho
}

function formatPhone(phone) {
  // Implementação para formatar o número de telefone
}

function getStatusColor(status) {
  // Implementação para obter a cor do status do pedido
}

function updateCartUI() {
  // Implementação para atualizar a UI do carrinho
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  // Extrair parâmetro do estabelecimento da URL
  const urlParams = new URLSearchParams(window.location.search)
  establishmentPhone = urlParams.get("estabelecimento")

  if (!establishmentPhone) {
    showError("❌ Estabelecimento não especificado na URL")
    return
  }

  loadEstablishment()
  setupEventListeners()
})

async function loadEstablishment() {
  try {
    addBotMessage("🔄 Carregando informações do restaurante...")

    const response = await fetch(`${API_BASE_URL}/get-establishment.php?phone=${establishmentPhone}`)
    const result = await response.json()

    if (result.success) {
      currentEstablishment = result.establishment
      menuData = result.menu
      paymentMethods = result.payment_methods
      deliveryMethods = result.delivery_methods

      // Aplicar tema do estabelecimento
      applyEstablishmentTheme()

      // Inicializar chat
      initializeChat()
    } else {
      showError("❌ Restaurante não encontrado: " + result.error)
    }
  } catch (error) {
    console.error("Erro ao carregar estabelecimento:", error)
    showError("❌ Erro de conexão. Verifique se o servidor está funcionando.")
  }
}

function applyEstablishmentTheme() {
  // Atualizar header
  const headerTitle = document.querySelector(".chat-header h5")
  const headerSubtitle = document.querySelector(".chat-header small")

  if (headerTitle) headerTitle.textContent = currentEstablishment.name
  if (headerSubtitle) headerSubtitle.textContent = currentEstablishment.description || "Sempre online"

  // Aplicar cores personalizadas
  const style = document.createElement("style")
  style.textContent = `
    .chat-header { background-color: ${currentEstablishment.primary_color} !important; }
    .btn-primary { background-color: ${currentEstablishment.primary_color} !important; border-color: ${currentEstablishment.primary_color} !important; }
    .btn-success { background-color: ${currentEstablishment.secondary_color} !important; border-color: ${currentEstablishment.secondary_color} !important; }
    .price-tag { color: ${currentEstablishment.secondary_color} !important; }
    .confirmation-card { background: linear-gradient(135deg, ${currentEstablishment.primary_color}, ${currentEstablishment.secondary_color}) !important; }
  `
  document.head.appendChild(style)

  // Atualizar título da página
  document.title = `${currentEstablishment.name} - Pedidos Online`
}

function showError(message) {
  const errorDiv = document.createElement("div")
  errorDiv.className = "alert alert-danger m-3"
  errorDiv.innerHTML = `
    <h5>Erro</h5>
    <p>${message}</p>
    <small>Verifique a URL e tente novamente.</small>
  `
  chatMessages.appendChild(errorDiv)
}

function setupEventListeners() {
  menuButton.addEventListener("click", showMainMenu)
  cartButton.addEventListener("click", showCart)
  cartFooterButton.addEventListener("click", showCart)

  // Event listener para salvar dados do cliente
  document.getElementById("saveCustomerData").addEventListener("click", saveCustomerData)
  document.getElementById("loginButton").addEventListener("click", loginUser)
  document.getElementById("registerButton").addEventListener("click", registerUser)

  // Máscara para telefone no modal
  document.addEventListener("shown.bs.modal", (e) => {
    if (e.target.id === "customerModal") {
      document.getElementById("customerPhone").focus()
    } else if (e.target.id === "loginModal") {
      document.getElementById("loginPhone").focus()
    }
  })
}

async function initializeChat() {
  currentStep = "menu"
  addBotMessage(
    `Olá! Bem-vindo ao ${currentEstablishment.name}! 🍽️\n\n${currentEstablishment.description}\n\nEu sou seu assistente virtual e vou te ajudar a fazer seu pedido. Vamos começar?`,
  )
  setTimeout(async () => {
    await loadLoggedInCustomer() // Tenta carregar cliente logado
    showMainMenu()
  }, 1000)
}

function addBotMessage(content, data = null) {
  const messageDiv = document.createElement("div")
  messageDiv.className = "message bot"

  const messageContent = document.createElement("div")
  messageContent.className = "message-content"

  if (data) {
    messageContent.innerHTML = renderMessageWithData(content, data)
  } else {
    messageContent.innerHTML = `
            <div>${content.replace(/\n/g, "<br>")}</div>
            <div class="message-time">${getCurrentTime()}</div>
        `
  }

  messageDiv.appendChild(messageContent)
  chatMessages.appendChild(messageDiv)
  scrollToBottom()
}

function addUserMessage(content) {
  const messageDiv = document.createElement("div")
  messageDiv.className = "message user"

  const messageContent = document.createElement("div")
  messageContent.className = "message-content"
  messageContent.innerHTML = `
        <div>${content}</div>
        <div class="message-time">${getCurrentTime()}</div>
    `

  messageDiv.appendChild(messageContent)
  chatMessages.appendChild(messageDiv)
  scrollToBottom()
}

function renderMessageWithData(content, data) {
  let html = `<div>${content.replace(/\n/g, "<br>")}</div>`

  switch (data.type) {
    case "categories":
      html += renderCategories(data.categories)
      break
    case "products":
      html += renderProducts(data.products)
      break
    case "continue-shopping":
      html += renderContinueShopping()
      break
    case "cart":
      html += renderCart(data.items)
      break
    case "payment":
      html += renderPaymentMethods(data.methods)
      break
    case "delivery":
      html += renderDeliveryMethods(data.methods)
      break
    case "confirmation":
      html += renderConfirmation(data)
      break
    case "customer-check":
      html += renderCustomerCheck()
      break
    case "customer-found":
      html += renderCustomerFound(data.customer)
      break
    case "pix-payment":
      html += renderPixPayment(data)
      break
    case "order-created":
      html += renderOrderCreated(data.order)
      break
    case "product-customization": // Novo tipo para personalização
      html += renderProductCustomization(data.product)
      break
    case "customer-orders-prompt": // Novo: para pedir telefone para histórico
      html += renderCustomerOrdersPrompt()
      break
    case "customer-orders-list": // Novo: para listar pedidos
      html += renderCustomerOrdersList(data.orders)
      break
    case "order-details": // Novo: para exibir detalhes de um pedido
      html += renderOrderDetails(data.order)
      break
    case "order-tracking":
      html += renderOrderStatusTracking(data.order)
      break
    case "auth-prompt": // Novo: para login/cadastro
      html += renderAuthPrompt(data.next_action)
      break
  }

  html += `<div class="message-time">${getCurrentTime()}</div>`
  return html
}

function renderCategories(categories) {
  let html = '<div class="row g-2 mt-2">'
  categories.forEach((category) => {
    html += `
            <div class="col-6">
                <button class="btn btn-outline-primary category-btn w-100" onclick="showCategory(${category.id})">
                    <div class="category-icon">${category.icon}</div>
                    <small>${category.name}</small>
                </button>
            </div>
        `
  })
  html += "</div>"

  if (cart.length > 0) {
    html += `
            <button class="btn btn-success w-100 mt-3" onclick="showCart()">
                <i class="bi bi-cart"></i> Ver Carrinho (${cart.length})
            </button>
        `
  }
  // Adicionar botão "Meus Pedidos"
  html += `
    <button class="btn btn-outline-info w-100 mt-3" onclick="showCustomerOrders()">
        <i class="bi bi-clock-history"></i> Meus Pedidos
    </button>
  `
  html += `
    <div class="d-flex gap-2 mt-3">
      ${
        loggedInCustomerId
          ? `<button class="btn btn-outline-danger flex-fill" onclick="logoutCustomer()">
            <i class="bi bi-box-arrow-right"></i> Sair (${customerData.name.split(" ")[0]})
        </button>`
          : `<button class="btn btn-outline-primary flex-fill" onclick="showAuthPrompt()">
            <i class="bi bi-person"></i> Entrar / Cadastrar
        </button>`
      }
    </div>
  `

  return html
}

function renderProducts(products) {
  let html = '<div class="mt-3">'
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
                                <button class="btn btn-primary btn-sm" onclick="handleAddToCartClick(${product.id})">
                                    <i class="bi bi-plus"></i> Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
  })
  html += "</div>"

  html += `
        <div class="d-flex gap-2 mt-3">
            <button class="btn btn-outline-secondary" onclick="showMainMenu()">
                ← Voltar ao Menu
            </button>
            ${
              cart.length > 0
                ? `
                <button class="btn btn-success" onclick="showCart()">
                    <i class="bi bi-cart"></i> Carrinho (${cart.length})
                </button>
            `
                : ""
            }
        </div>
    `

  return html
}

function renderContinueShopping() {
  return `
        <div class="d-flex gap-2 mt-3">
            <button class="btn btn-outline-primary" onclick="showMainMenu()">
                Continuar Comprando
            </button>
            <button class="btn btn-success" onclick="showCart()">
                <i class="bi bi-cart"></i> Ver Carrinho (${cart.length})
            </button>
        </div>
    `
}

function renderCart(items) {
  let html = '<div class="mt-3">'

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
                                    }</li>`,
                                )
                                .join("") +
                              `</ul>`
                            : ""
                        }
                        <span class="price-tag small">R$ ${calculateItemTotalPrice(item).toFixed(2)}</span>
                    </div>
                    <div class="col-5">
                        <div class="quantity-controls">
                            <button class="btn btn-outline-secondary quantity-btn" onclick="updateCartQuantity(${item.product.id}, ${item.quantity - 1}, ${item.options ? JSON.stringify(item.options.map((o) => o.id)) : "[]"})">
                                <i class="bi bi-dash"></i>
                            </button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-outline-secondary quantity-btn" onclick="updateCartQuantity(${item.product.id}, ${item.quantity + 1}, ${item.options ? JSON.stringify(item.options.map((o) => o.id)) : "[]"})">
                                <i class="bi bi-plus"></i>
                            </button>
                            <button class="btn btn-outline-danger quantity-btn ms-2" onclick="updateCartQuantity('${item.product.id}', 0, ${item.options ? JSON.stringify(item.options.map((o) => o.id)) : "[]"})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
  })

  const subtotal = getTotalPrice()
  let discountAmount = 0
  if (currentAppliedCoupon) {
    discountAmount = currentAppliedCoupon.discount_amount
  }
  const total = subtotal - discountAmount
  const minOrder = currentEstablishment.min_order || 0

  html += `
        <hr>
        <div class="mb-3">
          <label for="couponCode" class="form-label small">Tem um cupom?</label>
          <div class="input-group">
            <input type="text" class="form-control" id="couponCode" placeholder="CÓDIGO DO CUPOM" value="${currentAppliedCoupon ? currentAppliedCoupon.code : ""}">
            <button class="btn btn-outline-secondary" type="button" onclick="applyCoupon()">Aplicar</button>
          </div>
          ${currentAppliedCoupon ? `<div class="text-success small mt-1">Cupom aplicado: ${currentAppliedCoupon.description} (-R$ ${currentAppliedCoupon.discount_amount.toFixed(2)})</div>` : ""}
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
        <div class="d-flex gap-2 mt-3">
            <button class="btn btn-outline-primary" onclick="showMainMenu()">
                Continuar Comprando
            </button>
            <button class="btn btn-success flex-fill" onclick="proceedToPayment()" ${minOrder > 0 && subtotal < minOrder ? "disabled" : ""}>
                Finalizar Pedido
            </button>
        </div>
    `

  html += "</div>"
  return html
}

function renderPaymentMethods(methods) {
  let html = '<div class="row g-2 mt-2">'
  methods.forEach((method) => {
    html += `
            <div class="col-6">
                <div class="card payment-method" onclick="selectPayment('${method.id}')">
                    <div class="card-body text-center py-3">
                        <div class="fs-4 mb-2">${method.icon}</div>
                        <small>${method.name}</small>
                    </div>
                </div>
            </div>
        `
  })
  html += "</div>"
  return html
}

function renderDeliveryMethods(methods) {
  let html = '<div class="mt-2">'
  methods.forEach((method) => {
    html += `
            <div class="card delivery-method mb-2" onclick="selectDelivery('${method.id}')">
                <div class="card-body">
                    <div class="d-flex align-items-center">
                        <div class="fs-4 me-3">${method.icon}</div>
                        <div class="flex-grow-1">
                            <div class="d-flex align-items-center gap-2">
                                <h6 class="mb-0">${method.name}</h6>
                                ${method.price > 0 ? `<span class="badge bg-secondary">+R$ ${method.price.toFixed(2)}</span>` : ""}
                            </div>
                            <small class="text-muted">${method.description}</small><br>
                            <small class="text-primary">${method.time}</small>
                        </div>
                    </div>
                </div>
            </div>
        `
  })
  html += "</div>"
  return html
}

function renderConfirmation(data) {
  const paymentMethod = paymentMethods.find((p) => p.id === data.payment)
  const deliveryMethod = deliveryMethods.find((d) => d.id === data.delivery)

  const subtotal = data.total - data.deliveryFee + data.discount_amount // Recalcula subtotal antes do desconto
  const total = data.total

  let html = `
    <div class="customer-info mb-3">
      <h6><i class="bi bi-person"></i> Dados do Cliente:</h6>
      <p class="mb-1"><strong>Nome:</strong> ${customerData.name}</p>
      <p class="mb-1"><strong>Telefone:</strong> ${formatPhone(customerData.phone)}</p>
      ${selectedDelivery === "delivery" ? `<p class="mb-0"><strong>Endereço:</strong> ${customerData.address}</p>` : ""}
    </div>
    
    <div class="card confirmation-card mt-3">
      <div class="card-body">
        <h6 class="card-title text-white">Itens do Pedido:</h6>
  `

  data.cart.forEach((item) => {
    html += `
      <div class="d-flex justify-content-between text-white-50 small">
        <span>${item.quantity}x ${item.product.name}</span>
        <span>R$ ${calculateItemTotalPrice(item).toFixed(2)}</span>
      </div>
    `
    if (item.options && item.options.length > 0) {
      html += `<ul class="list-unstyled text-white-50 small ms-3 mb-1">`
      item.options.forEach((opt) => {
        html += `<li>- ${opt.name} ${opt.price_adjustment > 0 ? `(+R$ ${opt.price_adjustment.toFixed(2)})` : ""}</li>`
      })
      html += `</ul>`
    }
  })

  html += `
        <hr class="text-white-50">
        <div class="d-flex justify-content-between text-white-50 small">
          <span>Subtotal:</span>
          <span>R$ ${subtotal.toFixed(2)}</span>
        </div>
  `

  if (data.discount_amount > 0) {
    html += `
    <div class="d-flex justify-content-between text-white-50 small text-success">
      <span>Desconto do Cupom:</span>
      <span>- R$ ${data.discount_amount.toFixed(2)}</span>
    </div>`
  }

  if (data.deliveryFee > 0) {
    html += `
        <div class="d-flex justify-content-between text-white-50 small">
          <span>Taxa de entrega:</span>
          <span>R$ ${data.deliveryFee.toFixed(2)}</span>
        </div>
    `
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
    <button class="btn btn-light w-100 mt-3" onclick="createOrder()">
      <strong>Confirmar Pedido</strong>
    </button>
  `

  return html
}

// Novo: Função para renderizar a tela de personalização do produto
function renderProductCustomization(product) {
  let html = `
    <div class="product-customization-container mt-3">
      <h5 class="mb-3">${product.name} <span class="price-tag">R$ ${product.price.toFixed(2)}</span></h5>
      <p class="text-muted small">${product.description}</p>
      <hr>
      <form id="productOptionsForm">
  `

  product.options_groups.forEach((group) => {
    html += `
      <div class="mb-4">
        <h6>${group.name} ${group.min_selection > 0 ? '<span class="badge bg-info">Obrigatório</span>' : ""}</h6>
        <p class="small text-muted">
          ${group.type === "checkbox" ? `Selecione até ${group.max_selection} opções.` : "Selecione uma opção."}
        </p>
        <div class="options-list">
    `
    group.options.forEach((option) => {
      const optionId = `option-${option.id}`
      const priceDisplay = option.price_adjustment > 0 ? ` (+R$ ${option.price_adjustment.toFixed(2)})` : ""
      html += `
        <div class="form-check">
          <input class="form-check-input" type="${group.type}" name="option-group-${group.id}" id="${optionId}" value="${option.id}"
            data-group-id="${group.id}"
            data-option-id="${option.id}"
            data-price-adjustment="${option.price_adjustment}"
            data-type="${group.type}"
            data-min-selection="${group.min_selection}"
            data-max-selection="${group.max_selection}"
          >
          <label class="form-check-label" for="${optionId}">
            ${option.name} ${priceDisplay}
          </label>
        </div>
      `
    })
    html += `
        </div>
      </div>
    `
  })

  html += `
      </form>
      <hr>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <h5>Total do Item:</h5>
        <h5 class="price-tag" id="customizationItemTotalPrice">R$ ${product.price.toFixed(2)}</h5>
      </div>
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-outline-secondary" onclick="showCategory(${selectedCategory.id})">
          ← Voltar
        </button>
        <button class="btn btn-success flex-fill" onclick="addCustomizedProductToCart()">
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  `
  return html
}

// Novo: Renderiza o prompt para o telefone do cliente para ver pedidos
function renderCustomerOrdersPrompt() {
  return `
    <div class="mt-3">
      <div class="mb-3">
        <label for="phoneOrdersCheck" class="form-label">Para ver seus pedidos, digite seu celular:</label>
        <div class="input-group">
          <input type="tel" class="form-control phone-mask" id="phoneOrdersCheck" placeholder="(11) 99999-9999">
          <button class="btn btn-primary" onclick="checkPhoneForOrders()">Verificar Pedidos</button>
        </div>
      </div>
    </div>
  `
}

// Novo: Renderiza a lista de pedidos do cliente
function renderCustomerOrdersList(orders) {
  let html = `
    <div class="mt-3">
      <h6><i class="bi bi-clock-history"></i> Seus Pedidos Anteriores:</h6>
  `
  if (orders.length === 0) {
    html += `<div class="alert alert-info mt-3">Nenhum pedido encontrado para este número.</div>`
  } else {
    orders.forEach((order) => {
      html += `
        <div class="card mb-2">
          <div class="card-body">
            <h6 class="card-title">Pedido #${order.order_number}</h6>
            <p class="card-text small mb-1">Data: ${order.created_at}</p>
            <p class="card-text small mb-1">Total: <span class="price-tag">R$ ${order.total.toFixed(2)}</span></p>
            <p class="card-text small mb-2">Status: <span class="badge bg-${getStatusColor(order.status)}">${order.status_message}</span></p>
            <button class="btn btn-sm btn-outline-primary" onclick="viewOrderDetails(${order.id})">Ver Detalhes</button>
            <button class="btn btn-sm btn-info ms-2" onclick="trackOrder(${order.id})">Acompanhar</button>
          </div>
        </div>
      `
    })
  }
  html += `
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-outline-secondary" onclick="showMainMenu()">
          ← Voltar ao Menu
        </button>
      </div>
    </div>
  `
  return html
}

// Novo: Renderiza os detalhes de um pedido específico
function renderOrderDetails(order) {
  const paymentMethod = paymentMethods.find((p) => p.id === order.payment_method)
  const deliveryMethod = deliveryMethods.find((d) => d.id === order.delivery_method)

  let html = `
    <div class="mt-3">
      <h6><i class="bi bi-receipt"></i> Detalhes do Pedido #${order.order_number}</h6>
      <div class="card mt-3">
        <div class="card-body">
          <p class="mb-1"><strong>Data:</strong> ${order.created_at}</p>
          <p class="mb-1"><strong>Status:</strong> <span class="badge bg-${getStatusColor(order.status)}">${order.status_message}</span></p>
          <hr>
          <h6>Itens do Pedido:</h6>
  `
  order.items.forEach((item) => {
    html += `
      <div class="d-flex justify-content-between small">
        <span>${item.quantity}x ${item.name}</span>
        <span>R$ ${item.item_total.toFixed(2)}</span>
      </div>
    `
    if (item.options && item.options.length > 0) {
      html += `<ul class="list-unstyled small ms-3 mb-1">`
      item.options.forEach((opt) => {
        html += `<li>- ${opt.name} ${opt.price_adjustment > 0 ? `(+R$ ${opt.price_adjustment.toFixed(2)})` : ""}</li>`
      })
      html += `</ul>`
    }
  })

  html += `
          <hr>
          <div class="d-flex justify-content-between small">
            <span>Subtotal:</span>
            <span>R$ ${(order.subtotal + order.discount_amount).toFixed(2)}</span>
          </div>
          ${
            order.discount_amount > 0
              ? `
          <div class="d-flex justify-content-between small text-success">
            <span>Desconto do Cupom:</span>
            <span>- R$ ${order.discount_amount.toFixed(2)}</span>
          </div>`
              : ""
          }
          ${
            order.delivery_fee > 0
              ? `
          <div class="d-flex justify-content-between small">
            <span>Taxa de entrega:</span>
            <span>R$ ${order.delivery_fee.toFixed(2)}</span>
          </div>`
              : ""
          }
          <div class="d-flex justify-content-between font-weight-bold">
            <span>Total:</span>
            <span class="price-tag">R$ ${order.total.toFixed(2)}</span>
          </div>
          <hr>
          <p class="mb-1"><strong>Pagamento:</strong> ${paymentMethod ? paymentMethod.name : order.payment_method} ${order.payment_method === "pix" ? (order.pix_paid ? "(Pago)" : "(Pendente)") : ""}</p>
          <p class="mb-1"><strong>Entrega:</strong> ${deliveryMethod ? deliveryMethod.name : order.delivery_method}</p>
        </div>
      </div>
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-outline-secondary" onclick="showCustomerOrders()">
          ← Voltar aos Pedidos
        </button>
        <button class="btn btn-primary" onclick="startNewOrder()">
          Fazer Novo Pedido
        </button>
      </div>
    </div>
  `
  return html
}

// Adicionar uma nova função `renderOrderStatusTracking` para a tela de rastreamento
// Adicione esta função em um local apropriado, por exemplo, após `renderOrderDetails`
function renderOrderStatusTracking(order) {
  const paymentMethod = paymentMethods.find((p) => p.id === order.payment_method)
  const deliveryMethod = deliveryMethods.find((d) => d.id === order.delivery_method)

  let html = `
    <div class="mt-3">
      <h6><i class="bi bi-truck"></i> Acompanhamento do Pedido #${order.order_number}</h6>
      <div class="card mt-3">
        <div class="card-body">
          <p class="mb-1"><strong>Status Atual:</strong> <span class="badge bg-${getStatusColor(order.status)}">${order.status_message}</span></p>
          <p class="mb-1"><strong>Última Atualização:</strong> ${order.updated_at}</p>
          <hr>
          <h6>Detalhes:</h6>
          <p class="mb-1"><strong>Total:</strong> <span class="price-tag">R$ ${order.total.toFixed(2)}</span></p>
          <p class="mb-1"><strong>Pagamento:</strong> ${paymentMethod ? paymentMethod.name : order.payment_method} ${order.payment_method === "pix" ? (order.pix_paid ? "(Pago)" : "(Pendente)") : ""}</p>
          <p class="mb-1"><strong>Entrega:</strong> ${deliveryMethod ? deliveryMethod.name : order.delivery_method} (${deliveryMethod ? deliveryMethod.time : "N/A"})</p>
          <hr>
          <h6>Itens:</h6>
  `
  order.items.forEach((item) => {
    html += `
      <div class="d-flex justify-content-between small">
        <span>${item.quantity}x ${item.name}</span>
        <span>R$ ${item.item_total.toFixed(2)}</span>
      </div>
    `
    if (item.options && item.options.length > 0) {
      html += `<ul class="list-unstyled small ms-3 mb-1">`
      item.options.forEach((opt) => {
        html += `<li>- ${opt.name} ${opt.price_adjustment > 0 ? `(+R$ ${opt.price_adjustment.toFixed(2)})` : ""}</li>`
      })
      html += `</ul>`
    }
  })

  html += `
        </div>
      </div>
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-outline-secondary" onclick="showMainMenu()">
          ← Voltar ao Menu
        </button>
        ${
          order.status !== "delivered" && order.status !== "cancelled"
            ? `
        <button class="btn btn-info" onclick="trackOrder(${order.id})">
          <i class="bi bi-arrow-clockwise"></i> Atualizar Status
        </button>
        `
            : ""
        }
      </div>
    </div>
  `
  return html
}

// Novo: Renderiza o prompt de autenticação (Login/Cadastro)
function renderAuthPrompt(nextAction = null) {
  return `
    <div class="mt-3">
      <h6>Bem-vindo(a)! Para continuar, faça login ou cadastre-se:</h6>
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-primary flex-fill" onclick="showLoginModal('${nextAction}')">
          <i class="bi bi-box-arrow-in-right"></i> Entrar
        </button>
        <button class="btn btn-outline-primary flex-fill" onclick="showRegisterModal('${nextAction}')">
          <i class="bi bi-person-plus"></i> Cadastrar
        </button>
      </div>
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-outline-secondary w-100" onclick="showMainMenu()">
          ← Voltar ao Menu
        </button>
      </div>
    </div>
  `
}

function showMainMenu() {
  currentStep = "menu"
  addBotMessage("Aqui está nosso menu principal. Escolha uma categoria:", {
    type: "categories",
    categories: menuData,
  })
}

function showCategory(categoryId) {
  const category = menuData.find((c) => c.id === categoryId)
  selectedCategory = category
  currentStep = "category"
  addUserMessage(`Ver ${category.name}`)
  addBotMessage(`Ótima escolha! Aqui estão nossos ${category.name.toLowerCase()}:`, {
    type: "products",
    products: category.products,
  })
}

// Novo: Função para lidar com o clique em "Adicionar"
function handleAddToCartClick(productId) {
  const product = selectedCategory.products.find((p) => p.id === productId)
  if (product && product.options_groups && product.options_groups.length > 0) {
    selectedProductForCustomization = product
    currentStep = "product-customization"
    addUserMessage(`Personalizar ${product.name}`)
    addBotMessage(`Personalize seu ${product.name}:`, {
      type: "product-customization",
      product: product,
    })
    // Adicionar listener para atualizar preço ao selecionar opções
    setTimeout(() => {
      document.getElementById("productOptionsForm").addEventListener("change", updateCustomizationTotalPrice)
      updateCustomizationTotalPrice() // Inicializa o preço
    }, 200)
  } else {
    // Se não tem opções, adiciona direto ao carrinho
    addToCart(product, [])
  }
}

// Novo: Função para adicionar produto customizado ao carrinho
function addCustomizedProductToCart() {
  const form = document.getElementById("productOptionsForm")
  const selectedOptions = []
  let isValid = true

  selectedProductForCustomization.options_groups.forEach((group) => {
    const groupOptions = Array.from(form.querySelectorAll(`input[name="option-group-${group.id}"]:checked`))

    if (groupOptions.length < group.min_selection) {
      alert(`Por favor, selecione pelo menos ${group.min_selection} opção(ões) para "${group.name}".`)
      isValid = false
      return
    }
    if (groupOptions.length > group.max_selection) {
      alert(`Por favor, selecione no máximo ${group.max_selection} opção(ões) para "${group.name}".`)
      isValid = false
      return
    }

    groupOptions.forEach((input) => {
      const optionId = Number.parseInt(input.value)
      const optionDetail = group.options.find((opt) => opt.id === optionId)
      if (optionDetail) {
        selectedOptions.push(optionDetail)
      }
    })
  })

  if (!isValid) {
    return
  }

  addToCart(selectedProductForCustomization, selectedOptions)
  selectedProductForCustomization = null // Limpa o produto em personalização
}

// Modificado: addToCart agora aceita opções
function addToCart(product, options = []) {
  addUserMessage(`Adicionar ${product.name}`)

  // Criar um identificador único para o item do carrinho, incluindo as opções
  const itemIdentifier = `${product.id}-${options
    .map((o) => o.id)
    .sort()
    .join("-")}`

  const existingItem = cart.find((item) => {
    const existingItemOptionsIds = item.options
      ? item.options
          .map((o) => o.id)
          .sort()
          .join("-")
      : ""
    return `${item.product.id}-${existingItemOptionsIds}` === itemIdentifier
  })

  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.push({ product, quantity: 1, options })
  }

  updateCartUI()
  addBotMessage(`${product.name} adicionado ao carrinho! 🛒\n\nDeseja continuar comprando ou finalizar o pedido?`, {
    type: "continue-shopping",
  })
}

// Novo: Calcula o preço total de um item do carrinho, incluindo opções
function calculateItemTotalPrice(cartItem) {
  let itemPrice = cartItem.product.price
  if (cartItem.options) {
    cartItem.options.forEach((option) => {
      itemPrice += option.price_adjustment
    })
  }
  return itemPrice * cartItem.quantity
}

// Novo: Atualiza o preço total na tela de personalização
function updateCustomizationTotalPrice() {
  if (!selectedProductForCustomization) return

  let currentPrice = selectedProductForCustomization.price
  const form = document.getElementById("productOptionsForm")
  if (!form) return

  selectedProductForCustomization.options_groups.forEach((group) => {
    const selectedInputs = Array.from(form.querySelectorAll(`input[name="option-group-${group.id}"]:checked`))

    // Para grupos de rádio, garantir que apenas um seja selecionado se min_selection = 1
    if (group.type === "radio" && group.min_selection === 1 && selectedInputs.length > 1) {
      // Isso não deveria acontecer com inputs de rádio, mas como fallback
      selectedInputs.slice(1).forEach((input) => (input.checked = false))
    }

    selectedInputs.forEach((input) => {
      const optionId = Number.parseInt(input.value)
      const option = group.options.find((opt) => opt.id === optionId)
      if (option) {
        currentPrice += option.price_adjustment
      }
    })
  })

  document.getElementById("customizationItemTotalPrice").textContent = `R$ ${currentPrice.toFixed(2)}`
}

// Modificado: updateCartQuantity agora aceita options (para identificar o item único)
function updateCartQuantity(productId, newQuantity, optionsIds = []) {
  const itemIdentifier = `${productId}-${optionsIds.sort().join("-")}`

  const itemIndex = cart.findIndex((item) => {
    const existingItemOptionsIds = item.options
      ? item.options
          .map((o) => o.id)
          .sort()
          .join("-")
      : ""
    return `${item.product.id}-${existingItemOptionsIds}` === itemIdentifier
  })

  if (itemIndex !== -1) {
    if (newQuantity === 0) {
      cart.splice(itemIndex, 1) // Remove o item
    } else {
      cart[itemIndex].quantity = newQuantity
    }
  }

  updateCartUI()

  // Atualizar a visualização do carrinho se estiver sendo exibido
  if (currentStep === "cart") {
    setTimeout(() => {
      showCart()
    }, 100)
  }
}

function showCart() {
  currentStep = "cart"
  addUserMessage("Ver carrinho")

  if (cart.length === 0) {
    addBotMessage("Seu carrinho está vazio. Que tal escolher alguns produtos deliciosos?")
    showMainMenu()
  } else {
    addBotMessage("Aqui está seu carrinho:", {
      type: "cart",
      items: cart,
    })
  }
}

function proceedToPayment() {
  const total = getTotalPrice()
  const minOrder = currentEstablishment.min_order || 0

  if (minOrder > 0 && total < minOrder) {
    addBotMessage(`❌ Pedido mínimo é de R$ ${minOrder.toFixed(2)}. Adicione mais itens ao carrinho.`)
    return
  }

  if (loggedInCustomerId) {
    // Se já logado, vai direto para a escolha de pagamento
    currentStep = "payment"
    addUserMessage("Finalizar pedido")
    addBotMessage("Perfeito! Agora escolha a forma de pagamento:", {
      type: "payment",
      methods: paymentMethods,
    })
  } else {
    // Se não logado, pede para entrar ou cadastrar
    currentStep = "auth-prompt"
    addUserMessage("Finalizar pedido")
    addBotMessage("Para finalizar seu pedido, por favor, faça login ou cadastre-se:", {
      type: "auth-prompt", // Novo tipo de mensagem
      next_action: "proceed-to-payment",
    })
  }
}

function selectPayment(paymentId) {
  selectedPayment = paymentId
  const payment = paymentMethods.find((p) => p.id === paymentId)
  addUserMessage(`Pagamento: ${payment.name}`)

  if (paymentId === "pix") {
    currentStep = "delivery"
    addBotMessage("Pagamento via PIX selecionado! Agora escolha como deseja receber seu pedido:", {
      type: "delivery",
      methods: deliveryMethods,
    })
  }
}

function showCustomerOrders() {
  currentStep = "customer-orders-prompt"
  addUserMessage("Meus Pedidos")
  addBotMessage("Para ver seus pedidos anteriores, por favor, digite seu número de telefone:", {
    type: "customer-orders-prompt",
  })
}

function checkPhoneForOrders() {
  const phoneInput = document.getElementById("phoneOrdersCheck")
  const phone = phoneInput.value

  if (!phone) {
    alert("Por favor, digite seu número de telefone.")
    return
  }

  // Implementação para verificar o telefone e listar os pedidos
}

function viewOrderDetails(orderId) {
  // Implementação para exibir detalhes do pedido
}

function trackOrder(orderId) {
  // Implementação para rastrear o pedido
}

function logoutCustomer() {
  // Implementação para logout do cliente
}

function showLoginModal(nextAction) {
  // Implementação para mostrar o modal de login
}

function showRegisterModal(nextAction) {
  // Implementação para mostrar o modal de registro
}

function applyCoupon() {
  // Implementação para aplicar cupom
}

function createOrder() {
  // Implementação para criar pedido
}

function startNewOrder() {
  // Implementação para iniciar um novo pedido
}
