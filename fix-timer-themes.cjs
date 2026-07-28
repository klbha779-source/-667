const fs = require('fs');
let code = fs.readFileSync('src/components/TimerScreen.tsx', 'utf8');

code = code.replace(
  /const themeClasses = \{[\s\S]*?\}[colorTheme] \|\| \{[\s\S]*?\};/,
  `const themeClasses: Record<string, any> = {
    classic: {
      bgDark: 'bg-zinc-950',
      bgLight: 'bg-white',
      accent: 'text-zinc-800',
      border: 'border-zinc-200',
      ring: 'stroke-zinc-800',
      btn: 'bg-zinc-900 hover:bg-black text-white',
      badge: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    },
    midnight: {
      bgDark: 'bg-[#0a0f1c]',
      bgLight: 'bg-slate-50',
      accent: 'text-indigo-600',
      border: 'border-indigo-100',
      ring: 'stroke-indigo-600',
      btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    ocean: {
      bgDark: 'bg-slate-950',
      bgLight: 'bg-white',
      accent: 'text-blue-600',
      border: 'border-blue-100',
      ring: 'stroke-blue-600',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
      badge: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    forest: {
      bgDark: 'bg-[#0f1714]',
      bgLight: 'bg-[#f8faf9]',
      accent: 'text-emerald-700',
      border: 'border-emerald-200',
      ring: 'stroke-emerald-700',
      btn: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    crimson: {
      bgDark: 'bg-[#1a0f12]',
      bgLight: 'bg-white',
      accent: 'text-rose-700',
      border: 'border-rose-100',
      ring: 'stroke-rose-700',
      btn: 'bg-rose-700 hover:bg-rose-800 text-white',
      badge: 'bg-rose-50 text-rose-800 border-rose-100',
    },
    sand: {
      bgDark: 'bg-[#181612]',
      bgLight: 'bg-[#fdfcfaf]',
      accent: 'text-amber-700',
      border: 'border-amber-200',
      ring: 'stroke-amber-700',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  }[colorTheme] || {
    bgDark: 'bg-zinc-950',
    bgLight: 'bg-white',
    accent: 'text-zinc-800',
    border: 'border-zinc-200',
    ring: 'stroke-zinc-800',
    btn: 'bg-zinc-900 hover:bg-black text-white',
    badge: 'bg-zinc-100 text-zinc-800 border-zinc-200',
  };`
);

fs.writeFileSync('src/components/TimerScreen.tsx', code);
