// ============================================================
// SISTEMA DE ESTOQUE — API REST COMPLETA v2.0
// Faculdade Gran - Projeto Integrador Full Stack
// NOVOS ENDPOINTS: /contratos e /relatorio/consolidado
// ============================================================

const express = require('express');
const cors    = require('cors');

let produtos      = [];
let fornecedores  = [];
let associacoes   = [];
let contratos     = [];   // ← NOVO
let nextProdId    = 1;
let nextFornId    = 1;
let nextContId    = 1;    // ← NOVO

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ── Rota raiz ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    sistema:   'Sistema de Estoque e Contratos - Projeto Integrador ADS',
    faculdade: 'Faculdade Gran Cursos Online',
    versao:    '2.0',
    status:    '🚀 API online!',
    rotas: {
      produtos:     ['GET /produtos', 'GET /produtos/:id', 'POST /produtos', 'PUT /produtos/:id', 'DELETE /produtos/:id'],
      fornecedores: ['GET /fornecedores', 'GET /fornecedores/:id', 'POST /fornecedores', 'PUT /fornecedores/:id', 'DELETE /fornecedores/:id'],
      associacao:   ['GET /associacao', 'POST /associacao', 'DELETE /associacao', 'GET /associacao/produto/:id', 'GET /associacao/fornecedor/:id'],
      contratos:    ['GET /contratos', 'GET /contratos/:id', 'POST /contratos', 'PUT /contratos/:id', 'DELETE /contratos/:id'],
      relatorio:    ['GET /relatorio/consolidado']
    }
  });
});

// ════════════════════════════════════════════════════════════
// PRODUTOS
// ════════════════════════════════════════════════════════════
app.get('/produtos', (req, res) => res.json(produtos));

app.get('/produtos/:id', (req, res) => {
  const produto = produtos.find(p => p.id === parseInt(req.params.id));
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.json(produto);
});

app.post('/produtos', (req, res) => {
  const { nome, descricao, preco, codigo_barras } = req.body;
  if (!nome || preco === undefined) return res.status(400).json({ erro: 'Nome e preço são obrigatórios' });
  if (codigo_barras && produtos.find(p => p.codigo_barras === codigo_barras))
    return res.status(409).json({ erro: 'Código de barras já cadastrado' });
  const novo = { id: nextProdId++, nome, descricao: descricao || null, preco: parseFloat(preco), codigo_barras: codigo_barras || null, criado_em: new Date().toISOString() };
  produtos.push(novo);
  res.status(201).json(novo);
});

app.put('/produtos/:id', (req, res) => {
  const idx = produtos.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ erro: 'Produto não encontrado' });
  const { nome, descricao, preco, codigo_barras } = req.body;
  produtos[idx] = { ...produtos[idx], nome: nome ?? produtos[idx].nome, descricao: descricao ?? produtos[idx].descricao, preco: preco !== undefined ? parseFloat(preco) : produtos[idx].preco, codigo_barras: codigo_barras ?? produtos[idx].codigo_barras };
  res.json(produtos[idx]);
});

app.delete('/produtos/:id', (req, res) => {
  const idx = produtos.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ erro: 'Produto não encontrado' });
  const [removido] = produtos.splice(idx, 1);
  associacoes = associacoes.filter(a => a.produto_id !== removido.id);
  res.json({ mensagem: 'Produto removido com sucesso', produto: removido });
});

// ════════════════════════════════════════════════════════════
// FORNECEDORES
// ════════════════════════════════════════════════════════════
app.get('/fornecedores', (req, res) => res.json(fornecedores));

app.get('/fornecedores/:id', (req, res) => {
  const f = fornecedores.find(f => f.id === parseInt(req.params.id));
  if (!f) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
  res.json(f);
});

app.post('/fornecedores', (req, res) => {
  const { nome, cnpj, endereco, contato } = req.body;
  if (!nome || !cnpj) return res.status(400).json({ erro: 'Nome e CNPJ são obrigatórios' });
  if (fornecedores.find(f => f.cnpj === cnpj)) return res.status(409).json({ erro: 'CNPJ já cadastrado' });
  const novo = { id: nextFornId++, nome, cnpj, endereco: endereco || null, contato: contato || null, criado_em: new Date().toISOString() };
  fornecedores.push(novo);
  res.status(201).json(novo);
});

app.put('/fornecedores/:id', (req, res) => {
  const idx = fornecedores.findIndex(f => f.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
  const { nome, cnpj, endereco, contato } = req.body;
  fornecedores[idx] = { ...fornecedores[idx], nome: nome ?? fornecedores[idx].nome, cnpj: cnpj ?? fornecedores[idx].cnpj, endereco: endereco ?? fornecedores[idx].endereco, contato: contato ?? fornecedores[idx].contato };
  res.json(fornecedores[idx]);
});

app.delete('/fornecedores/:id', (req, res) => {
  const idx = fornecedores.findIndex(f => f.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
  const [removido] = fornecedores.splice(idx, 1);
  associacoes = associacoes.filter(a => a.fornecedor_id !== removido.id);
  res.json({ mensagem: 'Fornecedor removido com sucesso', fornecedor: removido });
});

// ════════════════════════════════════════════════════════════
// ASSOCIAÇÃO PRODUTO / FORNECEDOR (N:N)
// ════════════════════════════════════════════════════════════
app.get('/associacao', (req, res) => {
  const resultado = associacoes.map(a => {
    const produto    = produtos.find(p => p.id === a.produto_id);
    const fornecedor = fornecedores.find(f => f.id === a.fornecedor_id);
    return { produto_id: a.produto_id, produto_nome: produto?.nome, preco: produto?.preco, fornecedor_id: a.fornecedor_id, fornecedor_nome: fornecedor?.nome, cnpj: fornecedor?.cnpj };
  });
  res.json(resultado);
});

app.post('/associacao', (req, res) => {
  const { produto_id, fornecedor_id } = req.body;
  if (!produto_id || !fornecedor_id) return res.status(400).json({ erro: 'produto_id e fornecedor_id são obrigatórios' });
  if (!produtos.find(p => p.id === parseInt(produto_id))) return res.status(404).json({ erro: 'Produto não encontrado' });
  if (!fornecedores.find(f => f.id === parseInt(fornecedor_id))) return res.status(404).json({ erro: 'Fornecedor não encontrado' });
  if (associacoes.find(a => a.produto_id === parseInt(produto_id) && a.fornecedor_id === parseInt(fornecedor_id)))
    return res.status(409).json({ erro: 'Associação já existe' });
  associacoes.push({ produto_id: parseInt(produto_id), fornecedor_id: parseInt(fornecedor_id) });
  res.status(201).json({ mensagem: 'Associação criada com sucesso', produto_id, fornecedor_id });
});

app.delete('/associacao', (req, res) => {
  const { produto_id, fornecedor_id } = req.body;
  const idx = associacoes.findIndex(a => a.produto_id === parseInt(produto_id) && a.fornecedor_id === parseInt(fornecedor_id));
  if (idx === -1) return res.status(404).json({ erro: 'Associação não encontrada' });
  associacoes.splice(idx, 1);
  res.json({ mensagem: 'Associação removida com sucesso' });
});

app.get('/associacao/produto/:id', (req, res) => {
  const ids = associacoes.filter(a => a.produto_id === parseInt(req.params.id)).map(a => a.fornecedor_id);
  res.json(fornecedores.filter(f => ids.includes(f.id)));
});

app.get('/associacao/fornecedor/:id', (req, res) => {
  const ids = associacoes.filter(a => a.fornecedor_id === parseInt(req.params.id)).map(a => a.produto_id);
  res.json(produtos.filter(p => ids.includes(p.id)));
});

// ════════════════════════════════════════════════════════════
// NOVO ENDPOINT 1 — CONTRATOS
// Gestão de contratos por cliente, com vinculação de produtos
// ════════════════════════════════════════════════════════════

// GET /contratos — Lista todos os contratos
app.get('/contratos', (req, res) => {
  const resultado = contratos.map(c => ({
    ...c,
    produtos_alocados: produtos.filter(p => (c.produtos_ids || []).includes(p.id))
  }));
  res.json(resultado);
});

// GET /contratos/:id — Busca contrato por ID
app.get('/contratos/:id', (req, res) => {
  const contrato = contratos.find(c => c.id === parseInt(req.params.id));
  if (!contrato) return res.status(404).json({ erro: 'Contrato não encontrado' });
  res.json({
    ...contrato,
    produtos_alocados: produtos.filter(p => (contrato.produtos_ids || []).includes(p.id))
  });
});

// POST /contratos — Cria novo contrato
app.post('/contratos', (req, res) => {
  const { cliente, descricao, data_inicio, data_vencimento, valor, produtos_ids } = req.body;
  if (!cliente || !data_inicio || !data_vencimento) {
    return res.status(400).json({ erro: 'Cliente, data_inicio e data_vencimento são obrigatórios' });
  }

  const hoje       = new Date();
  const vencimento = new Date(data_vencimento);
  const status     = vencimento >= hoje ? 'ativo' : 'vencido';

  const novo = {
    id:              nextContId++,
    cliente,
    descricao:       descricao       || null,
    data_inicio,
    data_vencimento,
    valor:           valor           ? parseFloat(valor) : null,
    produtos_ids:    produtos_ids    || [],
    status,
    criado_em:       new Date().toISOString()
  };

  contratos.push(novo);
  res.status(201).json({ ...novo, produtos_alocados: produtos.filter(p => novo.produtos_ids.includes(p.id)) });
});

// PUT /contratos/:id — Atualiza contrato
app.put('/contratos/:id', (req, res) => {
  const idx = contratos.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ erro: 'Contrato não encontrado' });
  const { cliente, descricao, data_inicio, data_vencimento, valor, produtos_ids } = req.body;

  if (data_vencimento) {
    contratos[idx].status = new Date(data_vencimento) >= new Date() ? 'ativo' : 'vencido';
  }

  contratos[idx] = {
    ...contratos[idx],
    cliente:         cliente         ?? contratos[idx].cliente,
    descricao:       descricao       ?? contratos[idx].descricao,
    data_inicio:     data_inicio     ?? contratos[idx].data_inicio,
    data_vencimento: data_vencimento ?? contratos[idx].data_vencimento,
    valor:           valor !== undefined ? parseFloat(valor) : contratos[idx].valor,
    produtos_ids:    produtos_ids    ?? contratos[idx].produtos_ids,
  };

  res.json(contratos[idx]);
});

// DELETE /contratos/:id — Remove contrato
app.delete('/contratos/:id', (req, res) => {
  const idx = contratos.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ erro: 'Contrato não encontrado' });
  const [removido] = contratos.splice(idx, 1);
  res.json({ mensagem: 'Contrato removido com sucesso', contrato: removido });
});

// ════════════════════════════════════════════════════════════
// NOVO ENDPOINT 2 — RELATÓRIO CONSOLIDADO
// Dashboard gerencial com visão transversal de todo o sistema
// ════════════════════════════════════════════════════════════
app.get('/relatorio/consolidado', (req, res) => {
  const hoje = new Date();

  // Contratos agrupados por status
  const contratosAtivos   = contratos.filter(c => c.status === 'ativo');
  const contratosVencidos = contratos.filter(c => c.status === 'vencido');

  // Contratos que vencem nos próximos 30 dias
  const vencendoEm30dias = contratosAtivos.filter(c => {
    const diff = (new Date(c.data_vencimento) - hoje) / (1000 * 60 * 60 * 24);
    return diff <= 30;
  });

  // Produto mais associado a fornecedores
  const produtoMaisAssociado = produtos.map(p => ({
    ...p,
    total_fornecedores: associacoes.filter(a => a.produto_id === p.id).length
  })).sort((a, b) => b.total_fornecedores - a.total_fornecedores)[0] || null;

  // Fornecedor mais ativo
  const fornecedorMaisAtivo = fornecedores.map(f => ({
    ...f,
    total_produtos: associacoes.filter(a => a.fornecedor_id === f.id).length
  })).sort((a, b) => b.total_produtos - a.total_produtos)[0] || null;

  // Valor total dos contratos ativos
  const valorTotalAtivos = contratosAtivos
    .filter(c => c.valor)
    .reduce((acc, c) => acc + c.valor, 0);

  res.json({
    gerado_em: new Date().toISOString(),
    resumo: {
      total_produtos:    produtos.length,
      total_fornecedores: fornecedores.length,
      total_associacoes:  associacoes.length,
      total_contratos:    contratos.length,
    },
    contratos: {
      ativos:              contratosAtivos.length,
      vencidos:            contratosVencidos.length,
      vencendo_em_30_dias: vencendoEm30dias.length,
      valor_total_ativos:  parseFloat(valorTotalAtivos.toFixed(2)),
      alertas:             vencendoEm30dias.map(c => ({
        id:              c.id,
        cliente:         c.cliente,
        data_vencimento: c.data_vencimento
      }))
    },
    destaques: {
      produto_mais_associado:  produtoMaisAssociado,
      fornecedor_mais_ativo:   fornecedorMaisAtivo,
    },
    detalhes: {
      contratos_ativos:   contratosAtivos,
      contratos_vencidos: contratosVencidos,
    }
  });
});

// ── Inicia o servidor ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 API Sistema de Estoque v2.0 rodando na porta ${PORT}`);
  console.log('📦 Endpoints: /produtos | /fornecedores | /associacao | /contratos | /relatorio/consolidado\n');
});
