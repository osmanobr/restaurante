<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Restaurante</title>
    
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link href="app/globals.css" rel="stylesheet">
    
    <!-- QR Code Library -->
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
</head>
<body>
    <div class="container-fluid p-0">
        <div class="row justify-content-center">
            <div class="col-12 col-md-6 col-lg-4">
                <div class="chat-container">
                    <!-- Header -->
                    <div class="chat-header text-white p-3 d-flex align-items-center">
                        <div class="avatar me-3">
                            <span class="fs-4">🍽️</span>
                        </div>
                        <div class="flex-grow-1">
                            <h5 class="mb-0" id="restaurantName">Carregando...</h5>
                            <small class="text-light" id="restaurantStatus">Aguarde...</small>
                        </div>
                        <button class="btn btn-outline-light btn-sm" id="cartButton" style="display: none;">
                            <i class="bi bi-cart"></i>
                            <span id="cartCount">0</span>
                        </button>
                    </div>

                    <!-- Messages Area -->
                    <div class="chat-messages" id="chatMessages">
                        <!-- Messages will be inserted here -->
                    </div>

                    <!-- Quick Actions -->
                    <div class="chat-footer bg-light p-3">
                        <div class="d-flex" style="gap: 0.5rem; flex-wrap: wrap;">
                            <button class="btn btn-outline-primary btn-sm" id="menuButton">
                                <i class="bi bi-house"></i> Menu Principal
                            </button>
                            <button class="btn btn-outline-success btn-sm" id="cartFooterButton" style="display: none;">
                                <i class="bi bi-cart"></i> Carrinho (<span id="cartFooterCount">0</span>)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de cadastro de cliente -->
    <div class="modal fade" id="customerModal" tabindex="-1" aria-labelledby="customerModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="customerModalLabel">Dados para Cadastro</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="customerForm">
                        <div class="mb-3">
                            <label for="customerPhone" class="form-label">Celular *</label>
                            <input type="tel" class="form-control" id="customerPhone" placeholder="(11) 99999-9999" required>
                            <div class="form-text">Digite seu celular com DDD</div>
                        </div>
                        <div class="mb-3">
                            <label for="customerName" class="form-label">Nome Completo *</label>
                            <input type="text" class="form-control" id="customerName" placeholder="Seu nome completo" required>
                        </div>
                        <div class="mb-3">
                            <label for="customerAddress" class="form-label">Endereço Completo *</label>
                            <textarea class="form-control" id="customerAddress" rows="3" placeholder="Rua, número, bairro, cidade" required></textarea>
                            <div class="form-text">Necessário apenas para entrega</div>
                        </div>
                        <div class="mb-3">
                            <label for="customerPassword" class="form-label">Senha *</label>
                            <input type="password" class="form-control" id="customerPassword" placeholder="Mínimo 6 caracteres" required>
                            <div class="form-text">Use uma senha segura</div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="saveCustomerData">Cadastrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Login -->
    <div class="modal fade" id="loginModal" tabindex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="loginModalLabel">Entrar</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="mb-3">
                            <label for="loginPhone" class="form-label">Celular *</label>
                            <input type="tel" class="form-control" id="loginPhone" placeholder="(11) 99999-9999" required>
                        </div>
                        <div class="mb-3">
                            <label for="loginPassword" class="form-label">Senha *</label>
                            <input type="password" class="form-control" id="loginPassword" required>
                        </div>
                        <div id="loginError" class="text-danger small mb-3"></div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" id="loginButton">Entrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Custom JS -->
    <script src="js/restaurant-system.js"></script>
</body>
</html>