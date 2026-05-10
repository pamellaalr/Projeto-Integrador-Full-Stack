// fornecedorController.js - Controlador de Fornecedores (CRUD completo)
const db = require('../database');

// GET /fornecedores - Lista todos os fornecedores
const listarFornecedores = (req, res) => {
  try {
    const fornecedores = db.prepare('SELECT * FROM fornecedores ORDER BY nome').all();
    res.json(fornecedores);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar fornecedores', detalhe: error.message });
  }
};

// GET /fornecedores/:id - Busca um fornecedor pelo ID
const buscarFornecedor = (req, res) => {
  try {
    const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);
    if (!fornecedor) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
    res.json(fornecedor);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar fornecedor', detalhe: error.message });
  }
};

// POST /fornecedores - Cria um novo fornecedor
const criarFornecedor = (req, res) => {
  try {
    const { nome, cnpj, endereco, contato } = req.body;

    if (!nome || !cnpj) {
      return res.status(400).json({ erro: 'Nome e CNPJ são obrigatórios' });
    }

    const resultado = db.prepare(
      'INSERT INTO fornecedores (nome, cnpj, endereco, contato) VALUES (?, ?, ?, ?)'
    ).run(nome, cnpj, endereco || null, contato || null);

    const novoFornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(resultado.lastInsertRowid);
    res.status(201).json(novoFornecedor);
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(409).json({ erro: 'CNPJ já cadastrado' });
    }
    res.status(500).json({ erro: 'Erro ao criar fornecedor', detalhe: error.message });
  }
};

// PUT /fornecedores/:id - Atualiza um fornecedor
const atualizarFornecedor = (req, res) => {
  try {
    const { nome, cnpj, endereco, contato } = req.body;
    const { id } = req.params;

    const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(id);
    if (!fornecedor) return res.status(404).json({ erro: 'Fornecedor não encontrado' });

    db.prepare(
      'UPDATE fornecedores SET nome = ?, cnpj = ?, endereco = ?, contato = ? WHERE id = ?'
    ).run(
      nome ?? fornecedor.nome,
      cnpj ?? fornecedor.cnpj,
      endereco ?? fornecedor.endereco,
      contato ?? fornecedor.contato,
      id
    );

    const atualizado = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(id);
    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar fornecedor', detalhe: error.message });
  }
};

// DELETE /fornecedores/:id - Remove um fornecedor
const deletarFornecedor = (req, res) => {
  try {
    const fornecedor = db.prepare('SELECT * FROM fornecedores WHERE id = ?').get(req.params.id);
    if (!fornecedor) return res.status(404).json({ erro: 'Fornecedor não encontrado' });

    db.prepare('DELETE FROM fornecedores WHERE id = ?').run(req.params.id);
    res.json({ mensagem: 'Fornecedor removido com sucesso', fornecedor });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar fornecedor', detalhe: error.message });
  }
};

module.exports = { listarFornecedores, buscarFornecedor, criarFornecedor, atualizarFornecedor, deletarFornecedor };
