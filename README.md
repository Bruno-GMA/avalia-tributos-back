# Avalia Tributos - Backend

API REST construída com Node.js e Express para o sistema de NPS Tributos.

## Tecnologias

- **Node.js**: Ambiente de execução Javascript.
- **Express**: Framework web para Node.js.
- **JSON Web Token (JWT)**: Para autenticação segura.
- **Dotenv**: Gerenciamento de variáveis de ambiente.
- **CORS**: Controle de acesso HTTP.

## Requisitos

- Node.js instalado (versão 18 ou superior recomendada).
- NPM ou Yarn.

## Configuração

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env` na raiz do projeto baseado no exemplo abaixo:
   ```env
   PORT=3000
   USUARIO=admin
   SENHA=senha_segura
   JWT_SECRET=seu_segredo_super_secreto
   JWT_EXPIRES_IN=1h
   ```

## Execução

### Desenvolvimento
Para rodar o servidor com recarregamento automático:
```bash
npm run watch
```

### Produção
Para rodar o servidor normalmente:
```bash
npm start
```

## Endpoints da API

### Autenticação
- **POST `/api/login`**: Realiza o login e retorna um token JWT.
  - **Body**: `{ "usuario": "...", "senha": "..." }`

### Usuário
- **GET `/api/perfil`** (Protegido): Retorna as informações do usuário contidas no token.
  - **Header**: `Authorization: Bearer <token>`

---
Desenvolvido por Bruno-GMA.
