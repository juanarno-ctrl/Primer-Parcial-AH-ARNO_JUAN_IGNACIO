import { Router } from 'express';
import { validationResult } from 'express-validator';
import { authenticateToken } from '../middlewares/auth.js';
import { createPokemonValidator, updatePokemonValidator, idParam, listQuery } from '../validators/pokemon.validators.js';
import Pokemon from '../models/Pokemon.js';

const router = Router();

// GET /api/pokemon
router.get('/', listQuery, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { page = 1, limit = 10, name, type, min_attack, max_speed } = req.query;

  const q = { generation: 6 };
  if (name) q.name = { $regex: name, $options: 'i' };
  if (type) q.types = type.toLowerCase();
  if (min_attack) q['stats.attack'] = { ...(q['stats.attack'] || {}), $gte: Number(min_attack) };
  if (max_speed) q['stats.speed'] = { ...(q['stats.speed'] || {}), $lte: Number(max_speed) };

  const pageN = Math.max(1, Number(page || 1));
  const limitN = Math.max(1, Math.min(100, Number(limit || 10)));
  const skipN = (pageN - 1) * limitN;

  const data = await Pokemon.find(q)
    .sort({ nat_dex: 1 })
    .skip(skipN)
    .limit(limitN)
    .lean();

  // Para mantener compatibilidad con el frontend (CSV de tipos)
  const mapped = data.map(p => ({ ...p, types: (p.types || []).join(',') }));
  res.json({ page: pageN, limit: limitN, data: mapped });
});

// GET /api/pokemon/:id (id de Mongo)
router.get('/:id', idParam, async (req, res) => {
  // idParam valida numérico, pero en Mongo el _id es ObjectId.
  // Lo reemplazamos por una validación simple:
  const { id } = req.params;
  try {
    const p = await Pokemon.findById(id).lean();
    if (!p) return res.status(404).json({ error: 'Pokémon no encontrado' });
    p.types = (p.types || []).join(',');
    res.json(p);
  } catch {
    return res.status(400).json({ error: 'ID inválido' });
  }
});

// POST /api/pokemon (JWT)
router.post('/', authenticateToken, createPokemonValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, nat_dex, generation = 6, stats, types } = req.body;
  try {
    const created = await Pokemon.create({
      name, nat_dex, generation,
      stats,
      types: (types || []).map(t => t.toLowerCase())
    });
    res.status(201).json(created);
  } catch (e) {
    const msg = e.code === 11000 ? 'nat_dex duplicado' : e.message;
    res.status(500).json({ error: 'Error al crear Pokémon', detail: msg });
  }
});

// PATCH /api/pokemon/:id (JWT)
router.patch('/:id', authenticateToken, updatePokemonValidator, async (req, res) => {
  const { id } = req.params;
  const payload = {};
  if (req.body.name) payload.name = req.body.name;
  if (req.body.nat_dex) payload.nat_dex = req.body.nat_dex;
  if (req.body.generation) payload.generation = req.body.generation;
  if (req.body.stats) {
    for (const k of ['hp','attack','defense','sp_attack','sp_defense','speed']) {
      if (typeof req.body.stats[k] === 'number') {
        payload[`stats.${k}`] = req.body.stats[k];
      }
    }
  }
  if (Array.isArray(req.body.types)) payload.types = req.body.types.map(t => t.toLowerCase());

  try {
    const updated = await Pokemon.findByIdAndUpdate(id, payload, { new: true });
    if (!updated) return res.status(404).json({ error: 'Pokémon no encontrado' });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: 'ID inválido o datos incorrectos', detail: e.message });
  }
});

// DELETE /api/pokemon/:id (JWT)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const del = await Pokemon.findByIdAndDelete(id);
    if (!del) return res.status(404).json({ error: 'Pokémon no encontrado' });
    res.status(204).send();
  } catch {
    res.status(400).json({ error: 'ID inválido' });
  }
});

export default router;
