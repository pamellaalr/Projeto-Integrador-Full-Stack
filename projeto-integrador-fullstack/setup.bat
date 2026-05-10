@echo off
chcp 65001 >nul
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   SETUP AUTOMÁTICO - SISTEMA DE ESTOQUE (Projeto ADS)   ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: ── Verificações iniciais ──────────────────────────────────────────────────
echo [1/6] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
  echo    ERRO: Node.js nao encontrado!
  echo    Baixe em: https://nodejs.org/en  (versao LTS)
  pause & exit /b 1
)
echo    OK - Node.js instalado!

echo [2/6] Verificando Git...
git --version >nul 2>&1
if errorlevel 1 (
  echo    ERRO: Git nao encontrado!
  echo    Baixe em: https://git-scm.com/download/win
  pause & exit /b 1
)
echo    OK - Git instalado!

:: ── Configuração do Git ────────────────────────────────────────────────────
echo.
echo [3/6] Configurando Git...
set /p GIT_NOME=   Seu nome completo (para o Git): 
set /p GIT_EMAIL=  Seu email do GitHub: 
git config --global user.name  "%GIT_NOME%"
git config --global user.email "%GIT_EMAIL%"
echo    OK - Git configurado!

:: ── Instalação das dependências ────────────────────────────────────────────
echo.
echo [4/6] Instalando dependencias do Backend (pode demorar um pouco)...
cd backend
call npm install
if errorlevel 1 ( echo ERRO no backend! & pause & exit /b 1 )
cd ..

echo    Instalando dependencias do Frontend...
cd frontend
call npm install
if errorlevel 1 ( echo ERRO no frontend! & pause & exit /b 1 )
cd ..
echo    OK - Dependencias instaladas!

:: ── GitHub ────────────────────────────────────────────────────────────────
echo.
echo [5/6] Configurando GitHub...
echo.
echo    Acesse https://github.com/pamellaalr e crie um repositorio chamado:
echo    projeto-integrador-fullstack
echo    (marque Public e NAO marque nenhuma opcao de inicializacao)
echo.
pause

set /p GITHUB_USER=   Seu usuario do GitHub (ex: pamellaalr): 
set REPO_URL=https://github.com/%GITHUB_USER%/projeto-integrador-fullstack.git

:: ── Git init e push ───────────────────────────────────────────────────────
echo.
echo [6/6] Enviando projeto para o GitHub...
git init
git add .
git commit -m "feat: projeto integrador fullstack - sistema de estoque

- Backend: Node.js + Express + SQLite
- Controllers: Produto, Fornecedor, Associacao (CRUD completo)
- Frontend: React.js + Vite + Axios
- Pages: Produtos, Fornecedores, Associacoes (relacao N:N)"

git branch -M main
git remote add origin %REPO_URL%

echo.
echo    Fazendo push para o GitHub...
echo    (Uma janela pode abrir pedindo login - use seu usuario e senha/token do GitHub)
echo.
git push -u origin main

if errorlevel 1 (
  echo.
  echo    ATENCAO: Se o push falhou, tente:
  echo    1. Crie um token em: https://github.com/settings/tokens
  echo    2. Use o token como senha quando solicitado
  echo.
  pause
  exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                  TUDO PRONTO!                           ║
echo ║                                                         ║
echo ║  Repositorio: github.com/%GITHUB_USER%/projeto-integrador-fullstack
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Para rodar o projeto:
echo.
echo   BACKEND:  cd backend  ^&^& node app.js       (porta 3001)
echo   FRONTEND: cd frontend ^&^& npm run dev       (porta 5173)
echo.
pause
