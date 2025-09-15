import mongoose from 'mongoose';

const statsSchema = new mongoose.Schema({
  hp: { type: Number, required: true, min: 1 },
  attack: { type: Number, required: true, min: 1 },
  defense: { type: Number, required: true, min: 1 },
  sp_attack: { type: Number, required: true, min: 1 },
  sp_defense: { type: Number, required: true, min: 1 },
  speed: { type: Number, required: true, min: 1 }
}, { _id: false });

const pokemonSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nat_dex: { type: Number, required: true, unique: true, index: true },
  generation: { type: Number, required: true, default: 6 },
  stats: { type: statsSchema, required: true },
  // guardamos tipos como strings normalizados (más simple para filtrar)
  types: [{ type: String, lowercase: true, trim: true }]
}, { timestamps: true });

export default mongoose.model('Pokemon', pokemonSchema);
