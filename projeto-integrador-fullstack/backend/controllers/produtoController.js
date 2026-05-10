// produtoController.js - Controlador de Produtos (CRUD completo)
const db = require('../database');

// GET /produtos - Lista todos os produtos
const listarProdutos = (req, res) => {
  try {
    const produtos = db.prepare('SELECT * FROM produtos ORDER BY nome').all();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar produtos', detalhe: error.message });
  }
};

// GET /produtos/:id - Busca um produto pelo ID
const buscarProduto = (req, res) => {
  try {
    const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(produto);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar produto', detalhe: error.message });
  }
};

// POST /produtos - Cria um novo produto
const criarProduto = (req, res) => {
  try {
    const { nome, descricao, preco, codigo_barras } = req.body;

    if (!nome || preco === undefined) {
      return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
    }

    const resultado = db.prepare(
      'INSERT INTO produtos (nome, descricao, preco, codigo_barras) VALUES (?, ?, ?, ?)'
    ).run(nome, descricao || null, preco, codigo_barras || null);

    const novoProduto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(resultado.lastInsertRowid);
    res.status(201).json(novoProduto);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({ erro: 'Código de barras já cadastrado' });
    }
    res.status(500).json({ erro: 'Erro ao criar produto', detalhe: error.message });
  }
};

// PUT /produtos/:id - Atualiza um produto existente
const atualizarProduto = (req, res) => {
  try {
    const { nome, descricao, preco, codigo_barras } = req.body;
    const { id } = req.params;

    const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    db.prepare(
      'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, codigo_barras = ? WHERE id = ?'
    ).run(
      nome ?? produto.nome,
      descricao ?? produto.descricao,
      preco ?? produto.preco,
      codigo_barras ?? produto.codigo_barras,
      id
    );

    const atualizado = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar produto', detalhe: error.message });
  }
};

// DELETE /produtos/:id - Remove um produto
const deletarProduto = (req, res) => {
  try {
    const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(req.params.id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    db.prepare('DELETE FROM produtos WHERE id = ?').run(req.params.id);
    res.json({ mensagem: 'Produto removido com sucesso', produto });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar produto', detalhe: error.message });
  }
};

module.exports = { listarProdutos, buscarProduto, criarProduto, atualizarProduto, deletarProduto };
