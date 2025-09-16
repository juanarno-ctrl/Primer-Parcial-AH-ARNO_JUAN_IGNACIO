import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from './models/user.js';
import Type from './models/type.js';
import Pokemon from './models/Pokemon.js';

dotenv.config();

async function seed() {
  // Conectar usando la URL del .env
  console.log('MONGODB_URI cargada?', !!process.env.MONGODB_URI);
  await connectDB(process.env.MONGODB_URI);
  console.log('📦 Sembrando en DB:', mongoose.connection.name);

  // Tipos
  const baseTypes = [
    'grass','fire','water','fairy','flying','dark','steel','ghost','fighting','psychic'
  ];
  await Type.deleteMany({});
  await Type.insertMany(baseTypes.map(name => ({ name })));

  // Pokémon Gen VI (subset)
  const mons = [
    { name: 'Chesnaught', nat_dex: 652, stats: { hp:88,attack:107,defense:122,sp_attack:74,sp_defense:75,speed:64 }, types: ['grass','fighting'] },
    { name: 'Delphox',   nat_dex: 655, stats: { hp:75,attack:69, defense:72, sp_attack:114, sp_defense:100, speed:104 }, types: ['fire','psychic'] },
    { name: 'Greninja',  nat_dex: 658, stats: { hp:72,attack:95, defense:67, sp_attack:103, sp_defense:71,  speed:122 }, types: ['water','dark'] },
    { name: 'Talonflame',nat_dex: 663, stats: { hp:78,attack:81, defense:71, sp_attack:74,  sp_defense:69,  speed:126 }, types: ['fire','flying'] },
    { name: 'Aegislash', nat_dex: 681, stats: { hp:60,attack:50, defense:140,sp_attack:50,  sp_defense:140, speed:60  }, types: ['steel','ghost'] },
    { name: 'Sylveon',   nat_dex: 700, stats: { hp:95,attack:65, defense:65, sp_attack:110, sp_defense:130, speed:60  }, types: ['fairy'] }
  ];

  await Pokemon.deleteMany({});
  await Pokemon.insertMany(mons.map(m => ({ ...m, generation: 6 })));

  // Usuario demo
  await User.deleteMany({ email: 'demo@api.com' });
  const hash = bcrypt.hashSync('demo1234', 10);
  await User.create({ name: 'Demo', email: 'demo@api.com', password_hash: hash });

  console.log('✅ Seed completo (MongoDB)');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

