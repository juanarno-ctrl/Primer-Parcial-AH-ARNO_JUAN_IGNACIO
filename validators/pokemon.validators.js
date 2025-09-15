import { body, query } from 'express-validator';

export const createPokemonValidator = [
  body('name').isString().trim().isLength({ min: 2 }).withMessage('Nombre mínimo 2 caracteres'),
  body('nat_dex').isInt({ min: 1 }).withMessage('nat_dex entero positivo'),
  body('generation').optional().isInt({ min: 1 }),
  body('stats.hp').isInt({ min: 1 }),
  body('stats.attack').isInt({ min: 1 }),
  body('stats.defense').isInt({ min: 1 }),
  body('stats.sp_attack').isInt({ min: 1 }),
  body('stats.sp_defense').isInt({ min: 1 }),
  body('stats.speed').isInt({ min: 1 }),
  body('types').isArray({ min: 1 }).withMessage('Debe incluir al menos un tipo'),
  body('types.*').isString().trim()
];

export const updatePokemonValidator = [
  body('name').optional().isString().trim().isLength({ min: 2 }),
  body('nat_dex').optional().isInt({ min: 1 }),
  body('generation').optional().isInt({ min: 1 }),
  body('stats.hp').optional().isInt({ min: 1 }),
  body('stats.attack').optional().isInt({ min: 1 }),
  body('stats.defense').optional().isInt({ min: 1 }),
  body('stats.sp_attack').optional().isInt({ min: 1 }),
  body('stats.sp_defense').optional().isInt({ min: 1 }),
  body('stats.speed').optional().isInt({ min: 1 }),
  body('types').optional().isArray({ min: 1 }),
  body('types.*').optional().isString().trim()
];

export const listQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('name').optional().isString().trim(),
  query('type').optional().isString().trim(),
  query('min_attack').optional().isInt({ min: 0 }),
  query('max_speed').optional().isInt({ min: 0 })
];
