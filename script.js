// Configuração da API
const API_BASE_URL = "http://localhost/restaurant-bot/backend/api"

// Adicionar variáveis globais no início do arquivo
let customerData = {
  phone: "",
  name: "",
  address: "",
  id: null,
}

// Dados do menu (agora virão do backend, mas mantendo para demonstração)
const menuData = [
  {
    id: "burgers",
    name: "Hambúrguers",
    icon: "🍔",
    products: [
      {
        id: "classic-burger",
        name: "Hambúrguer Clássico",
        description: "Pão, carne 180g, queijo, alface, tomate, cebola",
        price: 25.9,
        image: "https://via.placeholder.com/100x100/FF6B6B/FFFFFF?text=🍔",
      },
      {
        id: "bacon-burger",
        name: "Bacon Burger",
        description: "Pão, carne 180g, bacon, queijo, alface, tomate",
        price: 29.9,
        image: "https://via.placeholder.com/100x100/4ECDC4/FFFFFF?text=🥓",
      },
      {
        id: "veggie-burger",
        name: "Veggie Burger",
        description: "Pão integral, hambúrguer de grão-de-bico, queijo vegano",
        price: 27.9,
        image: "https://via.placeholder.com/100x100/45B7D1/FFFFFF?text=🌱",
      },
    ],
  },
  {
    id: "pizzas",
    name: "Pizzas",
    icon: "🍕",
    products: [
      {
        id: "margherita",
        name: "Pizza Margherita",
        description: "Molho de tomate, mussarela, manjericão, azeite",
        price: 32.9,
        image: "https://via.placeholder.com/100x100/FF6B6B/FFFFFF?text=🍕",
      },
      {
        id: "pepperoni",
        name: "Pizza Pepperoni",
        description: "Molho de tomate, mussarela, pepperoni",
        price: 36.9,
        image: "https://via.placeholder.com/100x100/E74C3C/FFFFFF?text=🌶️",
      },
      {
        id: "quattro-formaggi",
        name: "Quattro Formaggi",
        description: "Mussarela, gorgonzola, parmesão, provolone",
        price: 38.9,
        image: "https://via.placeholder.com/100x100/F39C12/FFFFFF?text=🧀",
      },
    ],
  },
  {
    id: "drinks",
    name: "Bebidas",
    icon: "🥤",
    products: [
      {
        id: "coca-cola",
        name: "Coca-Cola 350ml",
        description: "Refrigerante de cola gelado",
        price: 5.9,
        image: "https://via.placeholder.com/100x100/8E44AD/FFFFFF?text=🥤",
      },
      {
        id: "orange-juice",
        name: "Suco de Laranja",
        description: "Suco natural de laranja 300ml",
        price: 8.9,
        image: "https://via.placeholder.com/100x100/F39C12/FFFFFF?text=🍊",
      },
      {
        id: "water",
        name: "Água Mineral",
        description: "Água mineral sem gás 500ml",
        price: 3.9,
        image: "https://via.placeholder.com/100x100/3498DB/FFFFFF?text=💧",
      },
    ],
  },
  {
    id: "desserts",
    name: "Sobremesas",
    icon: "🍰",
    products: [
      {
        id: "chocolate-cake",
        name: "Bolo de Chocolate",
        description: "Fatia de bolo de chocolate com cobertura",
        price: 12.9,
        image: "https://via.placeholder.com/100x100/8B4513/FFFFFF?text=🍰",
      },
      {
        id: "ice-cream",
        name: "Sorvete 2 Bolas",
        description: "Escolha 2 sabores: chocolate, baunilha, morango",
        price: 9.9,
        image: "https://via.placeholder.com/100x100/FF69B4/FFFFFF?text=🍨",
      },
    ],
  },
]

const paymentMethods = [
  { id: "credit", name: "Cartão de Crédito", icon: "💳" },
  { id: "debit", name: "Cartão de Débito", icon: "💳" },
  { id: "pix", name: "PIX", icon: "📱" },
  { id: "cash", name: "Dinheiro", icon: "💵" },
]

const deliveryMethods = [
  {
    id: "delivery",
    name: "Entrega",
    description: "Entregamos em sua casa",
    time: "30-45 min",
    price: 5.0,
    icon: "🚚",
  },
  {
    id: "pickup",
    name: "Retirada",
    description: "Retire no balcão",
    time: "15-20 min",
    price: 0,
    icon: "🏪",
  },
]

// Estado da aplicação
let cart = []
let currentStep = "menu"
let selectedCategory = null
let selectedPayment = ""
let selectedDelivery = ""
let currentOrderId = null

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

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initializeChat()
  setupEventListeners()
})

function setupEventListeners() {
  menuButton.addEventListener("click", showMainMenu)
  cartButton.addEventListener("click", showCart)
  cartFooterButton.addEventListener("click", showCart)

  // Event listener para salvar dados do cliente
  document.getElementById("saveCustomerData").addEventListener("click", saveCustomerData)

  // Máscara para telefone no modal
  document.addEventListener("shown.bs.modal", (e) => {
    if (e.target.id === "customerModal") {
      const phoneInput = document.getElementById("customerPhone")
      phoneInput.focus()
    }
  })
}

function initializeChat() {
  addBotMessage(
    "Olá! Bem-vindo ao nosso restaurante! 🍽️\n\nEu sou seu assistente virtual e vou te ajudar a fazer seu pedido. Vamos começar?",
  )
  setTimeout(() => {
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
  }

  html += `<div class="message-time">${getCurrentTime()}</div>`
  return html
}

function renderCategories(categories) {
  let html = '<div class="row g-2 mt-2">'
  categories.forEach((category) => {
    html += `
            <div class="col-6">
                <button class="btn btn-outline-primary category-btn w-100" onclick="showCategory('${category.id}')">
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
                                <button class="btn btn-primary btn-sm" onclick="addToCart('${product.id}')">
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
                        <span class="price-tag small">R$ ${item.product.price.toFixed(2)}</span>
                    </div>
                    <div class="col-5">
                        <div class="quantity-controls">
                            <button class="btn btn-outline-secondary quantity-btn" onclick="updateCartQuantity('${item.product.id}', ${item.quantity - 1})">
                                <i class="bi bi-dash"></i>
                            </button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-outline-secondary quantity-btn" onclick="updateCartQuantity('${item.product.id}', ${item.quantity + 1})">
                                <i class="bi bi-plus"></i>
                            </button>
                            <button class="btn btn-outline-danger quantity-btn ms-2" onclick="updateCartQuantity('${item.product.id}', 0)">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
  })

  const total = getTotalPrice()
  html += `
        <hr>
        <div class="d-flex justify-content-between align-items-center">
            <h5>Total:</h5>
            <h5 class="price-tag">R$ ${total.toFixed(2)}</h5>
        </div>
        <div class="d-flex gap-2 mt-3">
            <button class="btn btn-outline-primary" onclick="showMainMenu()">
                Continuar Comprando
            </button>
            <button class="btn btn-success flex-fill" onclick="proceedToPayment()">
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
        <span>R$ ${(item.product.price * item.quantity).toFixed(2)}</span>
      </div>
    `
  })

  html += `
        <hr class="text-white-50">
        <div class="d-flex justify-content-between text-white-50 small">
          <span>Subtotal:</span>
          <span>R$ ${(data.total - data.deliveryFee).toFixed(2)}</span>
        </div>
  `

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
          <strong>R$ ${data.total.toFixed(2)}</strong>
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

function addToCart(productId) {
  const product = selectedCategory.products.find((p) => p.id === productId)
  addUserMessage(`Adicionar ${product.name}`)

  const existingItem = cart.find((item) => item.product.id === productId)
  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.push({ product, quantity: 1 })
  }

  updateCartUI()
  addBotMessage(`${product.name} adicionado ao carrinho! 🛒\n\nDeseja continuar comprando ou finalizar o pedido?`, {
    type: "continue-shopping",
  })
}

function updateCartQuantity(productId, newQuantity) {
  if (newQuantity === 0) {
    cart = cart.filter((item) => item.product.id !== productId)
  } else {
    const item = cart.find((item) => item.product.id === productId)
    if (item) {
      item.quantity = newQuantity
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
  currentStep = "customer-validation"
  addUserMessage("Finalizar pedido")
  addBotMessage("Para finalizar seu pedido, preciso de alguns dados. Vou verificar se você já é nosso cliente.", {
    type: "customer-check",
  })
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
  } else {
    currentStep = "delivery"
    addBotMessage("Ótimo! Agora escolha como deseja receber seu pedido:", {
      type: "delivery",
      methods: deliveryMethods,
    })
  }
}

function selectDelivery(deliveryId) {
  selectedDelivery = deliveryId
  const delivery = deliveryMethods.find((d) => d.id === deliveryId)
  addUserMessage(delivery.name)

  if (selectedPayment === "pix") {
    // Para PIX, mostrar o QR Code antes da confirmação
    const total = getTotalPrice()
    const deliveryFee = delivery.price || 0
    const finalTotal = total + deliveryFee

    addBotMessage("Aqui está seu código PIX para pagamento:", {
      type: "pix-payment",
      total: finalTotal,
    })

    // Gerar QR Code após renderizar
    setTimeout(() => {
      generatePixQRCode(finalTotal)
    }, 500)
  } else {
    // Para outros pagamentos, ir direto para confirmação
    currentStep = "confirmation"
    const total = getTotalPrice()
    const deliveryFee = delivery.price || 0
    const finalTotal = total + deliveryFee

    addBotMessage("Resumo do seu pedido:", {
      type: "confirmation",
      cart: cart,
      payment: selectedPayment,
      delivery: selectedDelivery,
      total: finalTotal,
      deliveryFee: deliveryFee,
    })
  }
}

// Nova função para criar pedido via API
async function createOrder() {
  addUserMessage("Confirmar pedido")
  addBotMessage("Processando seu pedido... ⏳")

  try {
    const orderData = {
      customer_id: customerData.id,
      items: cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
      })),
      payment_method: selectedPayment,
      delivery_method: selectedDelivery,
    }

    const response = await fetch(`${API_BASE_URL}/create-order.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    const result = await response.json()

    if (result.success) {
      currentOrderId = result.order.id
      addBotMessage("🎉 Pedido criado com sucesso!", {
        type: "order-created",
        order: result.order,
      })

      // Se for PIX, iniciar verificação de pagamento
      if (selectedPayment === "pix") {
        startPixPaymentCheck()
      }
    } else {
      addBotMessage("❌ Erro ao criar pedido: " + result.error)
    }
  } catch (error) {
    console.error("Erro ao criar pedido:", error)
    addBotMessage("❌ Erro de conexão. Tente novamente.")
  }
}

function updateCartUI() {
  const count = cart.length
  cartCount.textContent = count
  cartFooterCount.textContent = count

  if (count > 0) {
    cartButton.style.display = "block"
    cartFooterButton.style.display = "block"
  } else {
    cartButton.style.display = "none"
    cartFooterButton.style.display = "none"
  }
}

function getTotalPrice() {
  return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
}

function getCurrentTime() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function scrollToBottom() {
  setTimeout(() => {
    chatMessages.scrollTop = chatMessages.scrollHeight
  }, 100)
}

// Função para validar telefone
function validatePhone(phone) {
  const cleanPhone = phone.replace(/\D/g, "")
  // Aceitar telefones com 10 ou 11 dígitos (com ou sem 9 no celular) e qualquer DDD válido (dois dígitos)
  return cleanPhone.length >= 10 && cleanPhone.length <= 11 && /^\d{2}/.test(cleanPhone)
}

// Função para formatar telefone
function formatPhone(phone) {
  const cleanPhone = phone.replace(/\D/g, "")
  if (cleanPhone.length === 11) {
    return `(${cleanPhone.substr(0, 2)}) ${cleanPhone.substr(2, 5)}-${cleanPhone.substr(7, 4)}`
  } else if (cleanPhone.length === 10) {
    return `(${cleanPhone.substr(0, 2)}) ${cleanPhone.substr(2, 4)}-${cleanPhone.substr(6, 4)}`
  }
  return phone
}

// Nova função para verificar cliente via API
async function checkCustomerExists(phone) {
  try {
    const response = await fetch(`${API_BASE_URL}/check-customer.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: phone }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.found ? result.customer : null
  } catch (error) {
    console.error("Erro ao verificar cliente:", error)
    return null
  }
}

// Função para mostrar modal de cadastro
function showCustomerModal() {
  const modal = new bootstrap.Modal(document.getElementById("customerModal"))
  modal.show()

  // Aplicar máscara no telefone
  const phoneInput = document.getElementById("customerPhone")
  phoneInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length <= 11) {
      if (value.length >= 7) {
        value = value.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
      } else if (value.length >= 3) {
        value = value.replace(/(\d{2})(\d+)/, "($1) $2")
      }
      e.target.value = value
    }
  })
}

// Nova função para salvar dados do cliente via API
async function saveCustomerData() {
  const phone = document.getElementById("customerPhone").value
  const name = document.getElementById("customerName").value
  const address = document.getElementById("customerAddress").value

  if (!validatePhone(phone)) {
    alert("Por favor, digite um celular válido com DDD")
    return
  }

  if (!name.trim() || !address.trim()) {
    alert("Por favor, preencha todos os campos obrigatórios")
    return
  }

  try {
    const response = await fetch(`${API_BASE_URL}/register-customer.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone.replace(/\D/g, ""),
        name: name.trim(),
        address: address.trim(),
      }),
    })

    const result = await response.json()

    if (result.success) {
      customerData = {
        id: result.customer.id,
        phone: result.customer.phone,
        name: result.customer.name,
        address: result.customer.address,
      }

      // Fechar modal
      const modal = bootstrap.Modal.getInstance(document.getElementById("customerModal"))
      modal.hide()

      addUserMessage(`Dados salvos: ${name}`)
      addBotMessage(`Obrigado, ${name}! Seus dados foram salvos. Agora escolha a forma de pagamento:`, {
        type: "payment",
        methods: paymentMethods,
      })

      currentStep = "payment"
    } else {
      alert("Erro ao salvar dados: " + result.error)
    }
  } catch (error) {
    console.error("Erro ao salvar cliente:", error)
    alert("Erro de conexão. Tente novamente.")
  }
}

// Funções de renderização
function renderCustomerCheck() {
  return `
    <div class="mt-3">
      <div class="mb-3">
        <label for="phoneCheck" class="form-label">Digite seu celular:</label>
        <div class="input-group">
          <input type="tel" class="form-control phone-mask" id="phoneCheck" placeholder="(00) 00000-0000">
          <button class="btn btn-primary" onclick="checkPhone()">Verificar</button>
        </div>
      </div>
    </div>
  `
}

function renderCustomerFound(customer) {
  return `
    <div class="customer-info">
      <h6><i class="bi bi-person-check"></i> Cliente Encontrado!</h6>
      <p class="mb-1"><strong>Nome:</strong> ${customer.name}</p>
      <p class="mb-1"><strong>Telefone:</strong> ${formatPhone(customer.phone)}</p>
      <p class="mb-1"><strong>Endereço:</strong> ${customer.address}</p>
      <p class="mb-0 small text-muted">Cliente desde: ${customer.member_since}</p>
    </div>
    <div class="d-flex gap-2 mt-3">
      <button class="btn btn-success" onclick="useExistingCustomer()">Usar estes dados</button>
      <button class="btn btn-outline-secondary" onclick="showCustomerModal()">Alterar dados</button>
    </div>
  `
}

// Atualizar renderPixPayment para usar ID único
function renderPixPayment(data) {
  const uniqueId = Date.now()
  return `
    <div class="pix-container">
      <h6><i class="bi bi-qr-code"></i> Pagamento PIX</h6>
      <p class="text-muted small">Escaneie o QR Code ou copie o código abaixo:</p>
      
      <div class="qr-code-container">
        <canvas id="qrcode-${uniqueId}"></canvas>
      </div>
      
      <div class="pix-code" id="pixCode">Gerando código PIX...</div>
      
      <button class="btn btn-outline-primary copy-button" onclick="copyPixCode()" disabled id="copyButton">
        <i class="bi bi-clipboard"></i> Copiar Código PIX
        <span class="copy-success" id="copySuccess">Copiado!</span>
      </button>
      
      <div class="mt-3">
        <p class="small text-muted">
          <strong>Valor:</strong> R$ ${data.total.toFixed(2)}<br>
          <strong>Favorecido:</strong> Restaurante Exemplo Ltda<br>
          <strong>Chave PIX:</strong> 36c4b8c5-4c5e-4c5e-8c5e-4c5e4c5e4c5e
        </p>
      </div>
      
      <div class="alert alert-info small mt-3">
        <i class="bi bi-info-circle"></i> 
        Após realizar o pagamento, clique no botão abaixo para continuar.
      </div>
      
      <button class="btn btn-success w-100 mt-2" onclick="confirmPixPayment()">
        <i class="bi bi-check-circle"></i> Já fiz o pagamento
      </button>
    </div>
  `
}

function renderOrderCreated(order) {
  return `
    <div class="alert alert-success">
      <h6><i class="bi bi-check-circle"></i> Pedido #${order.order_number}</h6>
      <p class="mb-1">Cliente: ${order.customer_name}</p>
      <p class="mb-1">Total: R$ ${order.total.toFixed(2)}</p>
      <p class="mb-0">Status: ${order.status}</p>
    </div>
    
    ${
      order.pix_code
        ? `
      <div class="pix-container">
        <h6><i class="bi bi-qr-code"></i> Pagamento PIX</h6>
        <div class="qr-code-container">
          <canvas id="qrcode-order-${order.id}"></canvas>
        </div>
        <div class="pix-code">${order.pix_code}</div>
        <button class="btn btn-outline-primary copy-button" onclick="copyPixCode('${order.pix_code}')">
          <i class="bi bi-clipboard"></i> Copiar Código PIX
        </button>
        <div class="mt-3">
          <div class="alert alert-info small">
            <i class="bi bi-info-circle"></i> Verificando pagamento automaticamente...
          </div>
        </div>
      </div>
    `
        : ""
    }
    
    <button class="btn btn-primary w-100 mt-3" onclick="startNewOrder()">
      Fazer Novo Pedido
    </button>
  `
}

// Nova função para verificar telefone via API
async function checkPhone() {
  const phoneInput = document.getElementById("phoneCheck")
  const phone = phoneInput.value.replace(/\D/g, "")

  if (!validatePhone(phone)) {
    alert("Por favor, digite um celular válido com DDD (10 ou 11 dígitos)")
    phoneInput.focus()
    return
  }

  addUserMessage(`Telefone: ${formatPhone(phone)}`)
  addBotMessage("Verificando seus dados... ⏳")

  try {
    const existingCustomer = await checkCustomerExists(phone)

    if (existingCustomer) {
      customerData = existingCustomer
      addBotMessage("✅ Encontrei seus dados em nosso sistema:", {
        type: "customer-found",
        customer: existingCustomer,
      })
    } else {
      addBotMessage("📝 Não encontrei seus dados em nosso sistema. Vamos fazer um cadastro rápido para você!")
      setTimeout(() => {
        showCustomerModal()
      }, 1000)
    }
  } catch (error) {
    console.error("Erro ao verificar cliente:", error)
    addBotMessage("❌ Erro ao verificar dados. Vamos fazer seu cadastro:")
    setTimeout(() => {
      showCustomerModal()
    }, 1000)
  }
}

// Função para usar cliente existente
function useExistingCustomer() {
  addUserMessage("Usar dados cadastrados")
  addBotMessage("Perfeito! Agora escolha a forma de pagamento:", {
    type: "payment",
    methods: paymentMethods,
  })

  currentStep = "payment"
}

// Função para gerar QR Code
function generateQRCode() {
  const canvas = document.querySelector('[id^="qrcode-"]')
  if (canvas && currentOrderId) {
    // Buscar código PIX do pedido criado
    fetch(`${API_BASE_URL}/get-order-status.php?order_id=${currentOrderId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.pix_code) {
          QRCode.toCanvas(
            canvas,
            data.pix_code,
            {
              width: 200,
              margin: 2,
              color: {
                dark: "#000000",
                light: "#FFFFFF",
              },
            },
            (error) => {
              if (error) console.error(error)
            },
          )

          // Atualizar código PIX na interface
          const pixCodeElement = document.getElementById("pixCode")
          if (pixCodeElement) {
            pixCodeElement.textContent = data.pix_code
          }

          // Habilitar botão de copiar
          const copyButton = document.getElementById("copyButton")
          if (copyButton) {
            copyButton.disabled = false
            copyButton.onclick = () => copyPixCode(data.pix_code)
          }
        }
      })
      .catch((error) => console.error("Erro ao buscar código PIX:", error))
  }
}

// Função para copiar código PIX
function copyPixCode(code = null) {
  const pixCodeElement = document.getElementById("pixCode")
  const codeText = code || (pixCodeElement ? pixCodeElement.textContent : "")

  if (!codeText || codeText === "Gerando código PIX...") {
    alert("Código PIX ainda não está disponível")
    return
  }

  navigator.clipboard
    .writeText(codeText)
    .then(() => {
      const successSpan = document.getElementById("copySuccess")
      if (successSpan) {
        successSpan.classList.add("show")
        setTimeout(() => {
          successSpan.classList.remove("show")
        }, 2000)
      }
    })
    .catch((err) => {
      // Fallback para navegadores mais antigos
      const textArea = document.createElement("textarea")
      textArea.value = codeText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)

      const successSpan = document.getElementById("copySuccess")
      if (successSpan) {
        successSpan.classList.add("show")
        setTimeout(() => {
          successSpan.classList.remove("show")
        }, 2000)
      }
    })
}

// Função para confirmar pagamento PIX
function confirmPixPayment() {
  addUserMessage("Pagamento realizado")
  addBotMessage("Pagamento PIX confirmado! Agora escolha como deseja receber seu pedido:", {
    type: "delivery",
    methods: deliveryMethods,
  })
  currentStep = "delivery"
}

// Nova função para verificar pagamento PIX automaticamente
async function startPixPaymentCheck() {
  if (!currentOrderId) return

  const checkPayment = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-pix-payment.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_id: currentOrderId }),
      })

      const result = await response.json()

      if (result.paid) {
        addBotMessage(`✅ ${result.message}`)
        addBotMessage("Seu pedido está sendo preparado! Você receberá atualizações sobre o status.")

        // Parar verificação
        clearInterval(paymentCheckInterval)

        // Iniciar verificação de status do pedido
        startOrderStatusCheck()
      }
    } catch (error) {
      console.error("Erro ao verificar pagamento:", error)
    }
  }

  // Verificar a cada 10 segundos
  const paymentCheckInterval = setInterval(checkPayment, 10000)

  // Parar após 5 minutos
  setTimeout(() => {
    clearInterval(paymentCheckInterval)
  }, 300000)
}

// Nova função para verificar status do pedido
async function startOrderStatusCheck() {
  if (!currentOrderId) return

  let lastStatus = "pending"

  const checkStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get-order-status.php?order_id=${currentOrderId}`)
      const result = await response.json()

      if (result.status !== lastStatus) {
        lastStatus = result.status

        const statusMessages = {
          confirmed: "✅ Pedido confirmado!",
          preparing: "👨‍🍳 Preparando seu pedido...",
          ready: "🎉 Pedido pronto! Pode vir buscar ou aguardar a entrega.",
          delivered: "✅ Pedido entregue com sucesso!",
        }

        if (statusMessages[result.status]) {
          addBotMessage(statusMessages[result.status])
        }

        if (result.status === "delivered") {
          clearInterval(statusCheckInterval)
          setTimeout(() => {
            startNewOrder()
          }, 3000)
        }
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error)
    }
  }

  // Verificar a cada 30 segundos
  const statusCheckInterval = setInterval(checkStatus, 30000)
}

// Função para iniciar novo pedido
function startNewOrder() {
  // Reset do sistema
  cart = []
  selectedPayment = ""
  selectedDelivery = ""
  currentStep = "menu"
  currentOrderId = null
  customerData = { phone: "", name: "", address: "", id: null }
  updateCartUI()

  addBotMessage("Gostaria de fazer um novo pedido?")
  showMainMenu()
}

// Nova função para gerar QR Code PIX antes de criar o pedido
// Adicionar logs para debug do QR Code
function generatePixQRCode(total) {
  console.log("🔄 Gerando QR Code PIX para valor:", total)

  try {
    // Gerar código PIX temporário para exibição
    const tempOrderId = "TEMP" + Date.now()
    console.log("📱 Order ID temporário:", tempOrderId)

    fetch(`${API_BASE_URL}/generate-pix.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: total,
        order_id: tempOrderId,
      }),
    })
      .then((response) => {
        console.log("📡 Resposta da API PIX:", response.status)
        return response.json()
      })
      .then((result) => {
        console.log("💳 Resultado PIX:", result)

        if (result.success) {
          // Encontrar o canvas e gerar QR Code
          const canvas = document.querySelector('[id^="qrcode-"]')
          console.log("🎨 Canvas encontrado:", !!canvas)
          console.log("📊 QRCode library:", !!QRCode)

          if (canvas && QRCode) {
            QRCode.toCanvas(
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
                  console.error("❌ Erro ao gerar QR Code:", error)
                } else {
                  console.log("✅ QR Code gerado com sucesso!")
                }
              },
            )

            // Atualizar código PIX na interface
            const pixCodeElement = document.getElementById("pixCode")
            if (pixCodeElement) {
              pixCodeElement.textContent = result.pix_code
              console.log("📝 Código PIX atualizado na interface")
            }

            // Habilitar botão de copiar
            const copyButton = document.getElementById("copyButton")
            if (copyButton) {
              copyButton.disabled = false
              copyButton.onclick = () => copyPixCode(result.pix_code)
              console.log("🔘 Botão de copiar habilitado")
            }
          } else {
            console.error("❌ Canvas ou QRCode library não encontrados")
          }
        } else {
          console.error("❌ Erro na API PIX:", result.error)
          addBotMessage("❌ Erro ao gerar código PIX. Tente outro método de pagamento.")
        }
      })
      .catch((error) => {
        console.error("❌ Erro ao gerar PIX:", error)
        addBotMessage("❌ Erro de conexão ao gerar PIX. Tente novamente.")
      })
  } catch (error) {
    console.error("❌ Erro geral:", error)
  }
}
