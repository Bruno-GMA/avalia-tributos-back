import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

const { USUARIO, SENHA, JWT_SECRET, JWT_EXPIRES_IN } = process.env;

// ---------------------------------------------------------------------------
// Middlewares globais
// ---------------------------------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// Middleware de autenticação JWT
// ---------------------------------------------------------------------------
function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  // Formato esperado: "Bearer <token>"
  const [scheme, token] = authHeader.split(' ');

  if (!/^Bearer$/i.test(scheme) || !token) {
    return res.status(401).json({ message: 'Formato de token inválido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    return res.status(401).json({ message: 'Token inválido' });
  }
}

// ---------------------------------------------------------------------------
// Rotas públicas
// ---------------------------------------------------------------------------

// POST /api/login — Autentica o usuário e retorna o JWT
app.post('/api/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (usuario === USUARIO && senha === SENHA) {
    const token = jwt.sign(
      { usuario },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN || '1h' }
    );

    return res.json({
      message: 'Login bem-sucedido',
      token,
    });
  }

  return res.status(401).json({ message: 'Credenciais inválidas' });
});

// ---------------------------------------------------------------------------
// Rotas protegidas
// ---------------------------------------------------------------------------

// GET /api/perfil — Retorna os dados do usuário autenticado
app.get('/api/perfil', autenticar, (req, res) => {
  return res.json({
    message: 'Acesso autorizado',
    usuario: req.usuario,
  });
});

// ---------------------------------------------------------------------------
// Inicialização do servidor
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});