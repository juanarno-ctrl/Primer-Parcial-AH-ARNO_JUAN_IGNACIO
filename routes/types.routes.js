import { Router } from 'express';
import Type from '../models/type.js';

const router = Router();

router.get('/', async (req, res) => {
  const { name } = req.query;
  const q = name ? { name: { $regex: name, $options: 'i' } } : {};
  const rows = await Type.find(q).sort({ name: 1 }).lean();
  // devolver en mayúscula inicial “bonito”
  const pretty = rows.map(t => ({ ...t, name: t.name.charAt(0).toUpperCase() + t.name.slice(1) }));
  res.json(pretty);
});

export default router;

