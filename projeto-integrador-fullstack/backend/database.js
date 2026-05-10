// database.js - Configuração e inicialização do banco de dados SQLite
const Database = require('better-sqlite3');
const path = require('path');

// Cria ou abre o arquivo do banco de dados na pasta do projeto
const db = new Database(path.join(__dirname, 'estoque.db'));

// Ativa suporte a chaves estrangeiras (necessário no SQLite)
db.pragma('foreign_keys = ON');

// Cria as tabelas se ainda não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT    NOT NULL,
    descricao   TEXT,
    preco       REAL    NOT NULL,
    codigo_barras TEXT  UNIQUE,
    criado_em   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS fornecedores (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nome      TEXT NOT NULL,
    cnpj      TEXT UNIQUE NOT NULL,
    endereco  TEXT,
    contato   TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS produto_fornecedor (
    produto_id    INTEGER NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    PRIMARY KEY (produto_id, fornecedor_id),
    FOREIGN KEY (produto_id)    REFERENCES produtos(id)    ON DELETE CASCADE,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE CASCADE
  );
`);

console.log('✅ Banco de dados inicializado com sucesso!');

module.exports = db;
