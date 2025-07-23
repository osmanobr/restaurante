<?php

// Inclui o arquivo de configuração do banco de dados
// Ajuste o caminho se o seu arquivo database.php estiver em outro local
// Assumindo que adduser.php está na raiz do projeto e database.php está em backend/config/
require_once __DIR__ . '/backend/config/database.php';

// Dados do novo usuário administrador
$username = "superadmin"; // Altere para o nome de usuário desejado
$email = "superadmin@example.com"; // Altere para o email desejado
$password = "superadmin123"; // Altere para uma senha forte e segura

// Hash da senha antes de armazenar no banco de dados
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

try {
    // Conecta ao banco de dados usando a classe Database
    $database = new Database();
    $pdo = $database->getConnection();

    // Verifica se o usuário já existe (opcional, mas recomendado)
    // Usando a tabela 'admin_users' e a coluna 'username' ou 'email'
    $stmt = $pdo->prepare("SELECT id FROM admin_users WHERE email = ? OR username = ?");
    $stmt->execute([$email, $username]);
    if ($stmt->fetch()) {
        echo "Erro: Um administrador com este email ou nome de usuário já existe.\n";
    } else {
        // Prepara a query SQL para inserir o novo administrador
        // Usando a tabela 'admin_users' e a coluna 'password_hash'
        $stmt = $pdo->prepare("INSERT INTO admin_users (username, email, password_hash, role) VALUES (?, ?, ?, ?)");

        // Executa a query
        // Definindo o role como 'super_admin' para este usuário inicial
        if ($stmt->execute([$username, $email, $hashed_password, 'super_admin'])) {
            echo "Usuário administrador '" . htmlspecialchars($username) . "' criado com sucesso!\n";
        } else {
            echo "Erro ao criar o usuário administrador.\n";
        }
    }
} catch (PDOException $e) {
    echo "Erro de conexão ou banco de dados: " . $e->getMessage() . "\n";
}

?>
