/**
 * Design Tokens — source de vérité pour tous les styles de l'app.
 *
 * Pourquoi ce fichier ?
 * Plutôt que d'écrire des classes Tailwind longues et répétées dans chaque
 * composant, on centralise ici les "recettes" de style. Si le design change,
 * on modifie une seule ligne ici et c'est répercuté partout.
 */

export const tokens = {

  // ── Layout ──────────────────────────────────────────────────────────────
  layout: {
    page: 'min-h-screen bg-stone-200 flex justify-center font-sans selection:bg-black selection:text-white',
    container: 'w-full max-w-md bg-[#FAFAFA] min-h-screen relative flex flex-col shadow-2xl overflow-hidden pb-24',
  },

  // ── Cards / Surfaces ─────────────────────────────────────────────────────
  card: {
    base: 'bg-white rounded-[32px] shadow-card border border-stone-100/80',
    padding: 'p-7',
    alt: 'bg-[#F5F4F1] rounded-[32px] border border-stone-200/60',
    sm: 'bg-white rounded-[28px] shadow-card border border-stone-100/80 p-5',
  },

  // ── Boutons ──────────────────────────────────────────────────────────────
  btn: {
    primary: 'w-full py-4 px-6 bg-black text-white rounded-full text-[13px] font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors shadow-button active:scale-[0.98]',
    secondary: 'w-full py-4 px-6 bg-stone-50 text-black border border-stone-100 rounded-full text-[13px] font-semibold tracking-wide flex items-center justify-center gap-2 hover:bg-stone-100 hover:border-stone-200 transition-all active:scale-[0.98]',
    ghost: 'flex items-center gap-2 text-stone-400 hover:text-black transition-colors',
    sm: 'py-2.5 px-3 rounded-full text-[10px] font-semibold tracking-wide flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all',
  },

  // ── Typographie ──────────────────────────────────────────────────────────
  text: {
    title: "font-['Lora'] italic font-bold text-black leading-tight",
    cardTitle: "font-['Lora'] italic font-bold text-[22px] text-black leading-tight",
    body: "text-[13px] font-['Inter'] font-normal text-stone-500 leading-relaxed",
    eyebrow: 'font-medium text-[10px] tracking-[0.35em] uppercase text-white/90',
    navLabel: 'text-[7px] font-bold tracking-widest uppercase text-center leading-tight',
  },

  // ── Conteneurs d'icônes ──────────────────────────────────────────────────
  icon: {
    container: 'inline-flex items-center justify-center w-12 h-12 rounded-[16px] bg-stone-50 text-black border border-stone-100 transition-transform group-hover:scale-105',
    containerWhite: 'inline-flex items-center justify-center w-12 h-12 rounded-[16px] bg-white text-black border border-stone-200/80 shadow-sm transition-transform group-hover:scale-105',
  },

  // ── Inputs / Formulaires ─────────────────────────────────────────────────
  input: {
    base: 'w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-stone-300',
    textarea: 'w-full px-4 py-3 rounded-2xl border border-stone-200 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-black/10 transition-all placeholder:text-stone-300 resize-none',
    error: 'border-red-300 focus:ring-red-200',
  },

  // ── Navigation ───────────────────────────────────────────────────────────
  nav: {
    pill: 'fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[380px] bg-white/50 backdrop-blur-2xl border border-stone-300/50 rounded-full px-2 py-3 flex justify-between items-center z-50 shadow-nav',
    itemActive: 'text-black',
    itemInactive: 'text-stone-400 hover:text-black',
  },

  // ── Header transparent (sur bannière) ────────────────────────────────────
  header: {
    floating: 'absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-6 py-6',
    logoPill: 'bg-white/40 px-5 py-2 rounded-full backdrop-blur-md border border-white/40 shadow-sm flex items-center justify-center',
    iconBtn: 'p-2 rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-sm transition-transform active:scale-95',
  },

} as const