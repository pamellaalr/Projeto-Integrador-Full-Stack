// app.js - Servidor principal do Sistema de Estoque
const express = require('express');
const cors    = require('cors');

// Importa os controllers
const produtoCtrl    = require('./controllers/produtoController');
const fornecedorCtrl = require('./controllers/fornecedorController');
const associacaoCtrl = require('./controllers/associacaoController');

const app  = express();
const PORT = 3001;

// Middlewares
app.use(cors());                  // Permite requisições do frontend React
app.use(express.json());          // Interpreta JSON no body das requisições

// ─── Rotas de Produtos ───────────────────────────────────────────────────────
app.get   ('/produtos',     produtoCtrl.listarProdutos);
app.get   ('/produtos/:id', produtoCtrl.buscarProduto);
app.post  ('/produtos',     produtoCtrl.criarProduto);
app.put   ('/produtos/:id', produtoCtrl.atualizarProduto);
app.delete('/produtos/:id', produtoCtrl.deletarProduto);

// ─── Rotas de Fornecedores ───────────────────────────────────────────────────
app.get   ('/fornecedores',     fornecedorCtrl.listarFornecedores);
app.get   ('/fornecedores/:id', fornecedorCtrl.buscarFornecedor);
app.post  ('/fornecedores',     fornecedorCtrl.criarFornecedor);
app.put   ('/fornecedores/:id', fornecedorCtrl.atualizarFornecedor);
app.delete('/fornecedores/:id', fornecedorCtrl.deletarFornecedor);

// ─── Rotas de Associação Produto/Fornecedor ──────────────────────────────────
app.get   ('/associacao',               associacaoCtrl.listarAssociacoes);
app.post  ('/associacao',               associacaoCtrl.associar);
app.delete('/associacao',               associacaoCtrl.desassociar);
app.get   ('/associacao/produto/:id',   associacaoCtrl.fornecedoresDoProduto);
app.get   ('/associacao/fornecedor/:id',associacaoCtrl.produtosDoFornecedor);

// Rota raiz para verificar que o servidor está no ar
app.get('/', (req, res) => {
  res.json({
    mensagem: '🚀 API Sistema de Estoque funcionando!',
    rotas: ['/produtos', '/fornecedores', '/associacao']
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}/`);
  console.log('📦 Rotas disponíveis:');
  console.log('   GET/POST        → /produtos');
  console.log('   GET/PUT/DELETE  → /produtos/:id');
  console.log('   GET/POST        → /fornecedores');
  console.log('   GET/PUT/DELETE  → /fornecedores/:id');
  console.log('   GET/POST/DELETE → /associacao\n');
});
