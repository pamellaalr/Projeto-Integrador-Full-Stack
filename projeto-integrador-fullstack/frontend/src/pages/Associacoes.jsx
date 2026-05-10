import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001'

export default function Associacoes() {
  const [associacoes, setAssociacoes]   = useState([])
  const [produtos, setProdutos]         = useState([])
  const [fornecedores, setFornecedores] = useState([])
  const [loading, setLoading]           = useState(true)
  const [mensagem, setMensagem]         = useState(null)

  const [form, setForm] = useState({ produto_id: '', fornecedor_id: '' })

  useEffect(() => { carregarTudo() }, [])

  const carregarTudo = async () => {
    try {
      setLoading(true)
      const [assoc, prods, fornecs] = await Promise.all([
        axios.get(`${API}/associacao`),
        axios.get(`${API}/produtos`),
        axios.get(`${API}/fornecedores`)
      ])
      setAssociacoes(assoc.data)
      setProdutos(prods.data)
      setFornecedores(fornecs.data)
    } catch {
      exibirMensagem('Erro ao carregar dados. Verifique se o backend está rodando.', 'erro')
    } finally {
      setLoading(false)
    }
  }

  const exibirMensagem = (texto, tipo = 'sucesso') => {
    setMensagem({ texto, tipo })
    setTimeout(() => setMensagem(null), 4000)
  }

  const associar = async () => {
    if (!form.produto_id || !form.fornecedor_id) {
      exibirMensagem('Selecione um produto e um fornecedor!', 'erro')
      return
    }
    try {
      await axios.post(`${API}/associacao`, {
        produto_id:    Number(form.produto_id),
        fornecedor_id: Number(form.fornecedor_id)
      })
      exibirMensagem('✅ Associação criada com sucesso!')
      setForm({ produto_id: '', fornecedor_id: '' })
      carregarTudo()
    } catch (err) {
      exibirMensagem(err.response?.data?.erro || 'Erro ao associar', 'erro')
    }
  }

  const desassociar = async (produto_id, fornecedor_id, prodNome, fornNome) => {
    if (!confirm(`Remover a associação entre "${prodNome}" e "${fornNome}"?`)) return
    try {
      await axios.delete(`${API}/associacao`, { data: { produto_id, fornecedor_id } })
      exibirMensagem('✅ Associação removida com sucesso!')
      carregarTudo()
    } catch (err) {
      exibirMensagem(err.response?.data?.erro || 'Erro ao desassociar', 'erro')
    }
  }

  return (
    <div>
      {/* Formulário de associação */}
      <div className="card">
        <h2>🔗 Nova Associação Produto / Fornecedor</h2>
        <p style={{ color: '#888', marginBottom: 16, fontSize: '0.9rem' }}>
          Um produto pode ter vários fornecedores e um fornecedor pode fornecer vários produtos (relação N:N).
        </p>

        {mensagem && (
          <div className={`alert ${mensagem.tipo === 'erro' ? 'alert-error' : 'alert-success'}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>Produto *</label>
            <select
              value={form.produto_id}
              onChange={e => setForm({ ...form, produto_id: e.target.value })}
            >
              <option value="">-- Selecione um produto --</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>#{p.id} - {p.nome} (R$ {Number(p.preco).toFixed(2)})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fornecedor *</label>
            <select
              value={form.fornecedor_id}
              onChange={e => setForm({ ...form, fornecedor_id: e.target.value })}
            >
              <option value="">-- Selecione um fornecedor --</option>
              {fornecedores.map(f => (
                <option key={f.id} value={f.id}>#{f.id} - {f.nome}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="btn-group">
          <button className="btn btn-primary" onClick={associar}>🔗 Associar</button>
        </div>

        {produtos.length === 0 && (
          <p style={{ color: '#e94560', marginTop: 12, fontSize: '0.85rem' }}>
            ⚠️ Cadastre produtos na aba "Produtos" antes de criar associações.
          </p>
        )}
        {fornecedores.length === 0 && (
          <p style={{ color: '#e94560', marginTop: 4, fontSize: '0.85rem' }}>
            ⚠️ Cadastre fornecedores na aba "Fornecedores" antes de criar associações.
          </p>
        )}
      </div>

      {/* Tabela de associações */}
      <div className="card">
        <h2>📋 Associações Cadastradas ({associacoes.length})</h2>
        {loading ? (
          <div className="loading">⏳ Carregando...</div>
        ) : associacoes.length === 0 ? (
          <div className="loading">Nenhuma associação cadastrada ainda.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço</th>
                  <th>Fornecedor</th>
                  <th>CNPJ</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {associacoes.map((a, i) => (
                  <tr key={i}>
                    <td><strong>{a.produto_nome}</strong> <span className="badge">#{a.produto_id}</span></td>
                    <td>R$ {Number(a.preco).toFixed(2)}</td>
                    <td><strong>{a.fornecedor_nome}</strong> <span className="badge">#{a.fornecedor_id}</span></td>
                    <td>{a.cnpj}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => desassociar(a.produto_id, a.fornecedor_id, a.produto_nome, a.fornecedor_nome)}
                      >
                        🗑️ Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
