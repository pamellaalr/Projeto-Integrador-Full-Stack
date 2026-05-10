# Sistema de Estoque - Projeto Integrador Fullstack

**FACULDADE GRAN** (https://faculdade.grancursosonline.com.br/)

Projeto da Disciplina: Projeto Integrador - Análise e Desenvolvimento de Sistemas

## 📦 Sobre o Sistema

Sistema de Estoque fullstack com gerenciamento de **Produtos**, **Fornecedores** e a **Associação** entre eles (relação muitos-para-muitos).

## 🛠️ Tecnologias

- **Backend:** Node.js + Express + SQLite
- **Frontend:** React.js + Vite + Axios
- **Banco de Dados:** SQLite (arquivo local)
- **Testes de API:** Insomnia / Postman

## 🚀 Como rodar

### Backend
```bash
cd backend
npm install
node app.js
```
Acesse: http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Acesse: http://localhost:5173

## 📋 Endpoints da API

### Produtos
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /produtos | Lista todos |
| GET | /produtos/:id | Busca por ID |
| POST | /produtos | Cria novo |
| PUT | /produtos/:id | Atualiza |
| DELETE | /produtos/:id | Remove |

### Fornecedores
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /fornecedores | Lista todos |
| GET | /fornecedores/:id | Busca por ID |
| POST | /fornecedores | Cria novo |
| PUT | /fornecedores/:id | Atualiza |
| DELETE | /fornecedores/:id | Remove |

### Associação Produto/Fornecedor
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /associacao | Associa produto a fornecedor |
| DELETE | /associacao | Remove associação |
| GET | /associacao/produto/:id | Fornecedores de um produto |
| GET | /associacao/fornecedor/:id | Produtos de um fornecedor |
