// associacaoController.js - Controlador de Associação Produto/Fornecedor (N:N)
const db = require('../database');

// POST /associacao - Associa um produto a um fornecedor
const associar = (req, res) => {
  try {
    const { produto_id, fornecedor_id } = req.body;

    if (!produto_id || !fornecedor_id) {
      return res.status(400).json({ erro: 'produto_id e fornecedor_id são obrigatórios' });
    }

    // Verifica se produto e fornecedor existem
    const produto = db.prepare('SELECT id FROM produtos WHERE id = ?').get(produto_id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    const fornecedor = db.prepare('SELECT id FROM fornecedores WHERE id = ?').get(fornecedor_id);
    if (!fornecedor) return res.status(404).json({ erro: 'Fornecedor não encontrado' });

    db.prepare(
      'INSERT INTO produto_fornecedor (produto_id, fornecedor_id) VALUES (?, ?)'
    ).run(produto_id, fornecedor_id);

    res.status(201).json({ mensagem: 'Associação criada com sucesso', produto_id, fornecedor_id });
  } catch (error) {
    if (error.message.includes('UNIQUE') || error.message.includes('PRIMARY KEY')) {
      return res.status(409).json({ erro: 'Associação já existe' });
    }
    res.status(500).json({ erro: 'Erro ao associar', detalhe: error.message });
  }
};

// DELETE /associacao - Remove uma associação entre produto e fornecedor
const desassociar = (req, res) => {
  try {
    const { produto_id, fornecedor_id } = req.body;

    if (!produto_id || !fornecedor_id) {
      return res.status(400).json({ erro: 'produto_id e fornecedor_id são obrigatórios' });
    }

    const resultado = db.prepare(
      'DELETE FROM produto_fornecedor WHERE produto_id = ? AND fornecedor_id = ?'
    ).run(produto_id, fornecedor_id);

    if (resultado.changes === 0) {
      return res.status(404).json({ erro: 'Associação não encontrada' });
    }

    res.json({ mensagem: 'Associação removida com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao desassociar', detalhe: error.message });
  }
};

// GET /associacao/produto/:id - Lista todos os fornecedores de um produto
const fornecedoresDoProduto = (req, res) => {
  try {
    const fornecedores = db.prepare(`
      SELECT f.*
      FROM fornecedores f
      INNER JOIN produto_fornecedor pf ON f.id = pf.fornecedor_id
      WHERE pf.produto_id = ?
      ORDER BY f.nome
    `).all(req.params.id);

    res.json(fornecedores);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar fornecedores do produto', detalhe: error.message });
  }
};

// GET /associacao/fornecedor/:id - Lista todos os produtos de um fornecedor
const produtosDoFornecedor = (req, res) => {
  try {
    const produtos = db.prepare(`
      SELECT p.*
      FROM produtos p
      INNER JOIN produto_fornecedor pf ON p.id = pf.produto_id
      WHERE pf.fornecedor_id = ?
      ORDER BY p.nome
    `).all(req.params.id);

    res.json(produtos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar produtos do fornecedor', detalhe: error.message });
  }
};

// GET /associacao - Lista todas as associações com detalhes
const listarAssociacoes = (req, res) => {
  try {
    const associacoes = db.prepare(`
      SELECT
        p.id   AS produto_id,
        p.nome AS produto_nome,
        p.preco,
        f.id   AS fornecedor_id,
        f.nome AS fornecedor_nome,
        f.cnpj
      FROM produto_fornecedor pf
      INNER JOIN produtos    p ON p.id = pf.produto_id
      INNER JOIN fornecedores f ON f.id = pf.fornecedor_id
      ORDER BY p.nome, f.nome
    `).all();

    res.json(associacoes);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar associações', detalhe: error.message });
  }
};

module.exports = { associar, desassociar, fornecedoresDoProduto, produtosDoFornecedor, listarAssociacoes };
