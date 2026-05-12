import Database from 'better-sqlite3';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '..', 'ratings.db');

const db = new Database(dbPath);

// Ativa WAL para melhor performance em concorrência
db.pragma('journal_mode = WAL');

// Cria a tabela de avaliações caso não exista
db.exec(`
  CREATE TABLE IF NOT EXISTS ratings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    rating1    REAL    NOT NULL,
    rating2    REAL    NOT NULL,
    rating3    REAL    NOT NULL,
    rating4    REAL    NOT NULL,
    average    REAL    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  )
`);

// Statement preparado para inserção (mais performático)
const insertRating = db.prepare(`
  INSERT INTO ratings (rating1, rating2, rating3, rating4, average)
  VALUES (@rating1, @rating2, @rating3, @rating4, @average)
`);

// Statement preparado para buscar todas as avaliações
const getAllRatings = db.prepare('SELECT * FROM ratings ORDER BY created_at DESC');

export { db, insertRating, getAllRatings };
