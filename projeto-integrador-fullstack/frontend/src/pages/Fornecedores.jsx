import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001'

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([])
  const [loading, setLoading]           = useState(true)
  const [mensagem, setMensagem]         = useState(null)
  const [editando, setEditando]         = useState(null)

  const [form, setForm] = useState({
    nome: '', cnpj: '', endereco: '', contato: ''
  })

  useEffect(() => { carregar() }, [])

  const carregar = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${API}/fornecedores`)
      setFornecedores(data)
    } catch {
      exibirMensagem('Erro ao carregar fornecedores. Verifique se o backend está rodando.', 'erro')
    } finally {
      setLoading(false)
    }
  }

  const exibirMensagem = (texto, tipo = 'sucesso') => {
    setMensagem({ texto, tipo })
    setTimeout(() => setMensagem(null), 4000)
  }

  const limparForm = () => {
    setForm({ nome: '', cnpj: '', endereco: '', contato: '' })
    setEditando(null)
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!form.nome || !form.cnpj) {
      exibirMensagem('Nome e CNPJ são obrigatórios!', 'erro')
      return
    }
    try {
      if (editando) {
        await axios.put(`${API}/fornecedores/${editando}`, form)
        exibirMensagem('✅ Fornecedor atualizado com sucesso!')
      } else {
        await axios.post(`${API}/fornecedores`, form)
        exibirMensagem('✅ Fornecedor cadastrado com sucesso!')
      }
      limparForm()
      carregar()
    } catch (err) {
      exibirMensagem(err.response?.data?.erro || 'Erro ao salvar fornecedor', 'erro')
    }
  }

  const editar = (fornecedor) => {
    setEditando(fornecedor.id)
    setForm({
      nome:     fornecedor.nome,
      cnpj:     fornecedor.cnpj,
      endereco: fornecedor.endereco || '',
      contato:  fornecedor.contato  || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deletar = async (id, nome) => {
    if (!confirm(`Remover o fornecedor "${nome}"?`)) return
    try {
      await axios.delete(`${API}/fornecedores/${id}`)
      exibirMensagem('✅ Fornecedor removido com sucesso!')
      carregar()
    } catch (err) {
      exibirMensagem(err.response?.data?.erro || 'Erro ao remover', 'erro')
    }
  }

  return (
    <div>
      {/* Formulário */}
      <div className="card">
        <h2>{editando ? '✏️ Editar Fornecedor' : '➕ Novo Fornecedor'}</h2>

        {mensagem && (
          <div className={`alert ${mensagem.tipo === 'erro' ? 'alert-error' : 'alert-success'}`}>
            {mensagem.texto}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label>Nome *</label>
            <input name="nome" value={form.nome} onChange={handleChange} placeholder="Ex: Distribuidora ABC Ltda" />
          </div>
          <div className="form-group">
            <label>CNPJ *</label>
            <input name="cnpj" value={form.cnpj} onChange={handleChange} placeholder="Ex: 12.345.678/0001-99" />
          </div>
          <div className="form-group">
            <label>Contato</label>
            <input name="contato" value={form.contato} onChange={handleChange} placeholder="Ex: (61) 99999-0000" />
          </div>
          <div className="form-group">
            <label>Endereço</label>
            <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Ex: Rua das Flores, 123 - Brasília/DF" />
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

      {/* Tabela */}
      <div className="card">
        <h2>📋 Fornecedores Cadastrados ({fornecedores.length})</h2>
        {loading ? (
          <div className="loading">⏳ Carregando...</div>
        ) : fornecedores.length === 0 ? (
          <div className="loading">Nenhum fornecedor cadastrado ainda.</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>CNPJ</th>
                  <th>Contato</th>
                  <th>Endereço</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {fornecedores.map(f => (
                  <tr key={f.id}>
                    <td><span className="badge">#{f.id}</span></td>
                    <td><strong>{f.nome}</strong></td>
                    <td>{f.cnpj}</td>
                    <td>{f.contato || '-'}</td>
                    <td>{f.endereco || '-'}</td>
                    <td>
                      <div className="btn-group">
                        <button className="btn btn-warning" onClick={() => editar(f)}>✏️ Editar</button>
                        <button className="btn btn-danger"  onClick={() => deletar(f.id, f.nome)}>🗑️ Remover</button>
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
