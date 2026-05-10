import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001'

export default function Produtos() {
  const [produtos, setProdutos]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [mensagem, setMensagem]   = useState(null)
  const [editando, setEditando]   = useState(null)

  const [form, setForm] = useState({
    nome: '', descricao: '', preco: '', codigo_barras: ''
  })

  // Carrega a lista de produtos ao abrir a página
  useEffect(() => { carregar() }, [])

  const carregar = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API}/produtos`)
      setProdutos(data)
    } catch {
      exibirMensagem('Erro ao carregar produtos. Verifique se o backend está rodando.', 'erro')
    } finally {
      setLoading(false)
    }
  }

  const exibirMensagem = (texto, tipo = 'sucesso') => {
    setMensagem({ texto, tipo })
    setTimeout(() => setMensagem(null), 4000)
  }

  const limparForm = () => {
    setForm({ nome: '', descricao: '', preco: '', codigo_barras: '' })
    setEditando(null)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.nome || !form.preco) {
      exibirMensagem('Nome e Preço são obrigatórios!', 'erro')
      return
    }
    try {
      if (editando) {
        await axios.put(`${API}/produtos/${editando}`, form)
        exibirMensagem('✅ Produto atualizado com sucesso!')
      } else {
        await axios.post(`${API}/produtos`, form)
        exibirMensagem('✅ Produto cadastrado com sucesso!')
      }
      limparForm()
      carregar()
    } catch (err) {
      exibirMensagem(err.response?.data?.erro || 'Erro ao salvar produto', 'erro')
    }
  }

  const editar = (produto) => {
    setEditando(produto.id)
    setForm({
      nome:          produto.nome,
      descricao:     produto.descricao || '',
      preco:         produto.preco,
      codigo_barras: produto.codigo_barras || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deletar = async (id, nome) => {
    if (!confirm(`Remover o produto "${nome}"?`)) return
    try {
      await axios.delete(`${API}/produtos/${id}`)
      exibirMensagem('✅ Produto removido com sucesso!')
      carregar()
    } catch (err) {
      exibirMensagem(err.response?.data?.erro || 'Erro ao remover', 'erro')
    }
  }

  return (
    <div>
      {/* Formulário */}
      <div className="card">
        <h2>{editando ? '✏️ Editar Produto' : '➕ Novo Produto'}</h2>

        {mensagem && (
          <div className={`alert ${mensagem.tipo === 'erro' ? 'alert-error' : 'alert-success'}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>Nome *</label>
            <input name="nome" value={form.nome} onChange={handleChange} placeholder="Ex: Notebook Dell" />
          </div>
          <div className="form-group">
            <label>Preço (R$) *</label>
            <input name="preco" type="number" step="0.01" value={form.preco} onChange={handleChange} placeholder="Ex: 2999.90" />
          </div>
          <div className="form-group">
            <label>Código de Barras</label>
            <input name="codigo_barras" value={form.codigo_barras} onChange={handleChange} placeholder="Ex: 7891234567890" />
          </div>
          <div className="form-group">
            <label>Descrição</label>
            <input name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição do produto" />
          </div>
        </div>

        <div className="btn-group">
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editando ? '💾 Salvar Alterações' : '➕ Cadastrar'}
          </button>
          {editando && (
            <button className="btn btn-secondary" onClick={limparForm}>✖ Cancelar</button>
          )}
        </div>
      </div>

      {/* Tabela de produtos */}
      <div className="card">
        <h2>📋 Produtos Cadastrados ({produtos.length})</h2>
        {loading ? (
          <div className="loading">⏳ Carregando...</div>
        ) : produtos.length === 0 ? (
          <div className="loading">Nenhum produto cadastrado ainda.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Descrição</th>
                  <th>Preço</th>
                  <th>Cód. Barras</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id}>
                    <td><span className="badge">#{p.id}</span></td>
                    <td><strong>{p.nome}</strong></td>
                    <td>{p.descricao || '-'}</td>
                    <td>R$ {Number(p.preco).toFixed(2)}</td>
                    <td>{p.codigo_barras || '-'}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-warning" onClick={() => editar(p)}>✏️ Editar</button>
                        <button className="btn btn-danger"  onClick={() => deletar(p.id, p.nome)}>🗑️ Remover</button>
                      </div>
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
