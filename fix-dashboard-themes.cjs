const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

code = code.replace(
  /\{\s*id:\s*'indigo'[\s\S]*?'bg-slate-600'\s*\},/,
  `{ id: 'classic', name: 'كلاسيكي داكن (Classic)', color: 'bg-zinc-800' },
                  { id: 'midnight', name: 'أزرق ليلي (Midnight)', color: 'bg-indigo-900' },
                  { id: 'ocean', name: 'محيطي (Ocean)', color: 'bg-blue-600' },
                  { id: 'forest', name: 'أخضر غابة (Forest)', color: 'bg-emerald-700' },
                  { id: 'crimson', name: 'قرمزي (Crimson)', color: 'bg-rose-700' },
                  { id: 'sand', name: 'صحراوي (Sand)', color: 'bg-amber-600' },`
);

fs.writeFileSync('src/components/Dashboard.tsx', code);
