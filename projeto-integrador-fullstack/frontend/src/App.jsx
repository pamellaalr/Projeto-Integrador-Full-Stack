import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Produtos     from './pages/Produtos'
import Fornecedores from './pages/Fornecedores'
import Associacoes  from './pages/Associacoes'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <h1>📦 Sistema de Estoque</h1>
          <p>Faculdade Gran - Projeto Integrador ADS</p>
        </header>

        <nav className="nav">
          <NavLink to="/"             className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end>
            🛒 Produtos
          </NavLink>
          <NavLink to="/fornecedores" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            🏭 Fornecedores
          </NavLink>
          <NavLink to="/associacoes"  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            🔗 Associações
          </NavLink>
        </nav>

        <main className="main">
          <Routes>
            <Route path="/"             element={<Produtos />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/associacoes"  element={<Associacoes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
