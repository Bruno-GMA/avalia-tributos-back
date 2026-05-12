import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { insertRating, getAllRatings } from './database.js';

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

// POST /submit — Recebe as notas do front e salva no banco
app.post('/submit', (req, res) => {
  const { rating1, rating2, rating3, rating4, average } = req.body;

  // Validação básica
  const values = [rating1, rating2, rating3, rating4, average];
  if (values.some((v) => v === undefined || v === null || typeof v !== 'number')) {
    return res.status(400).json({ message: 'Todos os campos (rating1-4, average) devem ser números.' });
  }

  try {
    const result = insertRating.run({ rating1, rating2, rating3, rating4, average });
    return res.status(201).json({
      message: 'Avaliação salva com sucesso',
      id: result.lastInsertRowid,
    });
  } catch (err) {
    console.error('Erro ao salvar avaliação:', err);
    return res.status(500).json({ message: 'Erro interno ao salvar avaliação' });
  }
});

// GET /ratings — Lista todas as avaliações (protegida por JWT)
app.get('/ratings', autenticar, (_req, res) => {
  try {
    const rows = getAllRatings.all();
    return res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar avaliações:', err);
    return res.status(500).json({ message: 'Erro interno ao buscar avaliações' });
  }
});

// ---------------------------------------------------------------------------
// Inicialização do servidor
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});