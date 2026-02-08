<!-- Competitive PK Arena Lobby -->
<!DOCTYPE html>
<html class="light" lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>竞技 PK 竞技场 - 词汇大师 2.0</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#25f46a",
                        "background-light": "#f5f8f6",
                        "background-dark": "#102216",
                        "accent-blue": "#4f46e5",
                        "accent-red": "#ef4444",
                    },
                    fontFamily: {
                        "display": ["'Noto Sans SC'", "Lexend", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "full": "9999px"},
                    backgroundImage: {
                        'grid-pattern': "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
                    }
                },
            },
        }
    </script>
<style>
        .skew-divider {
            clip-path: polygon(0 0, 100% 0, 80% 100%, -20% 100%);
        }
        .vs-pulse {
            animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 244, 106, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(37, 244, 106, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 244, 106, 0); }
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-[#0d1c12] dark:text-white font-display min-h-screen flex flex-col overflow-hidden transition-colors duration-200">
<header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e7f4eb] dark:border-white/10 px-10 py-4 bg-white/80 dark:bg-[#102216]/80 backdrop-blur-md sticky top-0 z-50">
<div class="flex items-center gap-4 text-[#0d1c12] dark:text-white">
<div class="size-8 text-primary">
<span class="material-symbols-outlined text-4xl">school</span>
</div>
<h2 class="text-xl font-black leading-tight tracking-[-0.015em]">词汇大师 2.0</h2>
</div>
<div class="flex flex-1 justify-end gap-8 items-center">
<nav class="hidden md:flex items-center gap-9">
<a class="text-sm font-bold hover:text-primary transition-colors" href="#">仪表盘</a>
<a class="text-sm font-bold text-primary" href="#">竞技场</a>
<a class="text-sm font-bold hover:text-primary transition-colors" href="#">排行榜</a>
<a class="text-sm font-bold hover:text-primary transition-colors" href="#">商店</a>
</nav>
<div class="flex items-center gap-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1 pr-4 rounded-full shadow-sm">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8" data-alt="User profile avatar small" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuBZLLUu6beN5Q_VlhqxgD_m4QnvNEsAo2fspcXLJU1PHsAgKWpbEnVrnat1yQ4fRW0zeoTRMkR6EIrT03FgQCPdPYAgm4_HX1fbDe62-QgSgfaZW1fyd0Dht-dYVNfe-y29nKKBQZt6ubX8qNwTzGjXu_4qUCOqL-J-lRovd9VvhLlslxxwvptcI_ufUcNMTaZR0-xT0sA703Odq6vSTc2dnHugYO2j3quZ1_AFI0OBkoKDNtOuEw4I87MVoqUOrWawDlExMfYp8kpn");'></div>
<div class="flex flex-col">
<span class="text-xs font-bold leading-none">WordWizard99</span>
<span class="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Lvl 12 学者</span>
</div>
</div>
</div>
</header>
<main class="flex-1 relative flex flex-col items-center justify-center p-6 lg:p-10 w-full max-w-[1600px] mx-auto">
<div class="absolute inset-0 pointer-events-none overflow-hidden opacity-30 dark:opacity-10 z-0">
<div class="absolute top-0 left-0 w-full h-full bg-grid-pattern bg-[length:40px_40px]"></div>
<div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-overlay"></div>
<div class="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-blue-400/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-overlay"></div>
</div>
<div class="relative w-full max-w-6xl bg-white dark:bg-[#1a3524] rounded-xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col z-10 min-h-[700px]">
<div class="pt-8 px-8 pb-4 flex flex-col items-center gap-6 relative z-20">
<div class="flex flex-col items-center gap-1">
<div class="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-yellow-200 dark:border-yellow-700/50">
<span class="material-symbols-outlined text-sm">emoji_events</span> 第 3 赛季
                    </div>
<h1 class="text-4xl md:text-5xl font-black italic tracking-tighter text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600">PK 竞技场</h1>
</div>
<div class="w-full max-w-2xl flex flex-col gap-2">
<div class="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
<span>你</span>
<span>战场平衡</span>
<span>对手</span>
</div>
<div class="h-6 w-full bg-gray-100 dark:bg-black/30 rounded-full overflow-hidden relative shadow-inner border border-gray-200 dark:border-white/5">
<div class="absolute left-1/2 top-0 bottom-0 w-1 bg-white/50 z-10 -translate-x-1/2"></div>
<div class="h-full bg-gradient-to-r from-primary via-green-400 to-emerald-500 w-[50%] rounded-r-lg relative transition-all duration-1000 ease-out">
<div class="absolute right-2 top-1/2 -translate-y-1/2 size-2 bg-white rounded-full animate-pulse"></div>
</div>
</div>
</div>
</div>
<div class="flex-1 flex flex-col md:flex-row relative">
<div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
<div class="vs-pulse bg-white dark:bg-[#1a3524] rounded-full p-2 shadow-xl border-4 border-gray-100 dark:border-[#2a4534]">
<div class="size-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center shadow-inner text-white font-black text-3xl italic transform -skew-x-6 border-4 border-red-400">
                            VS
                        </div>
</div>
</div>
<div class="flex-1 p-8 flex flex-col items-center justify-center relative bg-gradient-to-b from-primary/5 to-transparent border-b md:border-b-0 md:border-r border-dashed border-gray-200 dark:border-white/10">
<div class="relative group">
<div class="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-all duration-500"></div>
<div class="relative size-40 md:size-48 rounded-full border-8 border-white dark:border-[#2a4534] shadow-xl overflow-hidden bg-gray-200">
<div class="w-full h-full bg-cover bg-center transition-transform duration-700 hover:scale-110" data-alt="User Avatar High Quality" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuAq7cVRpMH-hQWBVF-hMuKXwyXfqm9naKZamsFQY7k7eI2n-wWAOpJ1JiQzIz63R81MZta0iw4E6U8N7cnzCkTBUC-Clgh86qvbhI3E5bcUxVp8ks-6e5g1Xud07F_1kATTaVz5PCROPdSWm43nQimUeTaVVp7HhPRbmLvT0D338I-wquYO2gAaQznJX0cV51RZMfqW0Pnp6k9OU5ez_k09eD1VVYi-n9lRmNqKBGolp1ugV_tQ6b5joJdgAwYqPttstYpkRz3QP0E7");'></div>
</div>
<div class="absolute -bottom-2 -right-2 bg-primary text-[#0d1c12] border-4 border-white dark:border-[#1a3524] size-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg rotate-3 group-hover:rotate-12 transition-transform">
                            12
                        </div>
</div>
<div class="mt-8 text-center space-y-2">
<h3 class="text-3xl font-black text-[#0d1c12] dark:text-white">WordWizard99</h3>
<div class="flex items-center justify-center gap-2">
<span class="px-3 py-1 rounded-full bg-primary/10 text-emerald-700 dark:text-emerald-300 text-sm font-bold border border-primary/20">胜率: 68%</span>
<span class="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold border border-blue-200 dark:border-blue-800/50">大师联赛</span>
</div>
</div>
</div>
<div class="flex-1 p-8 flex flex-col items-center justify-center relative">
<div class="relative">
<div class="absolute inset-0 rounded-full border-2 border-dashed border-gray-300 dark:border-white/20 animate-[spin_10s_linear_infinite]"></div>
<div class="absolute -inset-4 rounded-full border border-gray-200 dark:border-white/10 animate-[ping_3s_linear_infinite] opacity-50"></div>
<div class="relative size-40 md:size-48 rounded-full border-8 border-gray-100 dark:border-[#2a4534] shadow-inner bg-gray-50 dark:bg-white/5 flex items-center justify-center overflow-hidden">
<span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 animate-pulse">question_mark</span>
</div>
</div>
<div class="mt-8 text-center space-y-2">
<h3 class="text-3xl font-black text-gray-300 dark:text-gray-600">等待中...</h3>
<div class="flex items-center justify-center gap-2 opacity-50">
<span class="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 text-sm font-bold border border-gray-200 dark:border-white/10">胜率: --%</span>
<span class="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 text-sm font-bold border border-gray-200 dark:border-white/10">未定级</span>
</div>
</div>
</div>
</div>
<div class="p-6 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-center gap-6 relative z-20">
<button class="group relative flex items-center gap-4 bg-primary hover:bg-emerald-400 text-[#0d1c12] py-4 px-10 rounded-full shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:-translate-y-1 w-full md:w-auto min-w-[320px] justify-center overflow-hidden">
<div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
<span class="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">swords</span>
<div class="flex flex-col items-start relative z-10 text-left">
<span class="text-xs uppercase tracking-widest font-bold opacity-80">竞技模式</span>
<span class="text-xl font-black leading-none">开始排位赛</span>
</div>
</button>
<div class="flex items-center gap-4">
<span class="text-xs font-bold text-gray-400 uppercase tracking-widest">或</span>
</div>
<button class="group flex items-center gap-3 bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border-2 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 py-3 px-8 rounded-full transition-all duration-300 w-full md:w-auto justify-center">
<span class="material-symbols-outlined text-2xl group-hover:text-primary transition-colors">smart_toy</span>
<div class="flex flex-col items-start text-left">
<span class="text-[10px] uppercase tracking-widest font-bold opacity-60">训练模式</span>
<span class="text-base font-bold leading-none">人机对战</span>
</div>
</button>
</div>
</div>
<div class="mt-8 w-full max-w-4xl opacity-60 hover:opacity-100 transition-opacity">
<div class="flex items-center gap-3 justify-center text-sm font-medium text-gray-500 dark:text-gray-400">
<span class="material-symbols-outlined text-primary">campaign</span>
<span>近期战报:</span>
<span class="font-bold text-gray-700 dark:text-gray-200">LexiChamp</span> 击败了 <span class="font-bold text-gray-700 dark:text-gray-200">VocabKing</span> (比分: 15-12)
                <span class="mx-2 text-gray-300">•</span>
<span class="font-bold text-gray-700 dark:text-gray-200">Speller101</span> 刚刚达到了 15 级！
            </div>
</div>
</main>
<div class="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-emerald-50 to-transparent dark:from-emerald-900/10 pointer-events-none z-0"></div>

</body></html>

<!-- Settings and Theme Customization -->
<!DOCTYPE html>
<html class="light" lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Vocab Master - 设置</title>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#25f46a",
                        "background-light": "#f5f8f6",
                        "background-dark": "#102216",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1a3324",
                    },
                    fontFamily: {
                        "display": ["Lexend", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "1rem", "lg": "1.5rem", "xl": "2rem", "2xl": "3rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-[#0d1c12] dark:text-white font-display min-h-screen flex flex-col overflow-x-hidden">
<header class="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7f4eb] dark:border-b-[#1f422b] bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-10 py-3">
<div class="flex items-center gap-4">
<div class="size-8 text-primary">
<span class="material-symbols-outlined text-4xl">school</span>
</div>
<h2 class="text-lg font-bold leading-tight tracking-[-0.015em]">Vocab Master</h2>
</div>
<div class="flex flex-1 justify-end gap-8">
<nav class="hidden md:flex items-center gap-9">
<a class="text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">仪表盘</a>
<a class="text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">游戏</a>
<a class="text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">排行榜</a>
<a class="text-primary text-sm font-bold leading-normal" href="#">设置</a>
</nav>
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20 cursor-pointer" data-alt="User profile avatar showing a smiling student" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuB_Q29xznZTIo2XS9fIusuHSNJOE7PSYtD4Fuv85WMxvJUscRVujLxEygJMi1_u378fX5kwsvctxLgElNSUyuQOgYXNq-xSUvIMDLrfnZPjpa6Ir9dO9b_ElMVwwZhT6GvdoA6iL-YOgsvAu-k7lr19FbtZBC3mMilLorQqV2XRvoZMs57VLdHNbpQETWFecTjB7rBbJHbQtaFNpGZd5sI4mL3mMlgF_gVc0EWsEAftRO2ls7PqGeRRhAQalLAzhgUWMgk-7OExVwnr");'></div>
</div>
</header>
<main class="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8">
<div class="w-full max-w-[960px] flex flex-col gap-8">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div class="flex flex-col gap-2">
<h1 class="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">设置与主题定制</h1>
<p class="text-[#499c65] dark:text-[#6ec98d] text-base md:text-lg font-normal">打造属于你自己的 Vocab Master！</p>
</div>
<button class="flex items-center gap-2 px-6 py-3 bg-white dark:bg-surface-dark border border-[#e7f4eb] dark:border-[#1f422b] rounded-full hover:bg-gray-50 dark:hover:bg-[#234530] transition-colors shadow-sm group">
<span class="material-symbols-outlined text-primary group-hover:-translate-x-1 transition-transform">arrow_back</span>
<span class="text-sm font-bold">返回仪表盘</span>
</button>
</div>
<section class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 shadow-sm border border-[#e7f4eb] dark:border-[#1f422b]">
<div class="flex items-center gap-2 mb-6">
<span class="material-symbols-outlined text-primary text-2xl">palette</span>
<h2 class="text-xl font-bold">主题切换</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="group relative flex flex-col gap-3 cursor-pointer">
<div class="relative w-full aspect-[16/10] rounded-xl overflow-hidden border-4 border-primary shadow-lg ring-4 ring-primary/20 transition-all">
<div class="absolute top-3 right-3 z-10 bg-primary text-[#0d1c12] text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
<span class="material-symbols-outlined text-sm">check_circle</span>
                                已使用
                            </div>
<div class="w-full h-full bg-[#f8fcf9] p-3 flex flex-col gap-2">
<div class="h-2 w-1/3 bg-[#e7f4eb] rounded-full"></div>
<div class="flex-1 bg-white rounded-lg border border-[#e7f4eb] p-2 flex gap-2">
<div class="w-8 h-8 rounded-full bg-primary/20"></div>
<div class="flex-1 flex flex-col gap-1">
<div class="h-2 w-3/4 bg-gray-100 rounded-full"></div>
<div class="h-2 w-1/2 bg-gray-100 rounded-full"></div>
</div>
</div>
<div class="h-8 w-full bg-primary rounded-full"></div>
</div>
</div>
<div class="flex justify-between items-center px-1">
<span class="font-bold text-lg">经典绿</span>
<div class="size-6 rounded-full border-2 border-primary flex items-center justify-center bg-primary">
<div class="size-2.5 bg-white rounded-full"></div>
</div>
</div>
</div>
<div class="group relative flex flex-col gap-3 cursor-pointer opacity-80 hover:opacity-100 hover:-translate-y-1 transition-all">
<div class="relative w-full aspect-[16/10] rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-400 bg-gray-900 shadow-md">
<div class="w-full h-full bg-[#0f172a] p-3 flex flex-col gap-2">
<div class="h-2 w-1/3 bg-indigo-900 rounded-full"></div>
<div class="flex-1 bg-[#1e293b] rounded-lg border border-indigo-900/50 p-2 flex gap-2">
<div class="w-8 h-8 rounded-full bg-indigo-500/20"></div>
<div class="flex-1 flex flex-col gap-1">
<div class="h-2 w-3/4 bg-slate-700 rounded-full"></div>
<div class="h-2 w-1/2 bg-slate-700 rounded-full"></div>
</div>
</div>
<div class="h-8 w-full bg-indigo-500 rounded-full"></div>
</div>
</div>
<div class="flex justify-between items-center px-1">
<span class="font-bold text-lg">午夜星空</span>
<div class="size-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-transparent"></div>
</div>
</div>
<div class="group relative flex flex-col gap-3 cursor-pointer opacity-80 hover:opacity-100 hover:-translate-y-1 transition-all">
<div class="relative w-full aspect-[16/10] rounded-xl overflow-hidden border-2 border-transparent hover:border-orange-400 bg-orange-50 shadow-md">
<div class="w-full h-full bg-[#fff7ed] p-3 flex flex-col gap-2">
<div class="h-2 w-1/3 bg-orange-200 rounded-full"></div>
<div class="flex-1 bg-white rounded-lg border border-orange-100 p-2 flex gap-2">
<div class="w-8 h-8 rounded-full bg-orange-500/20"></div>
<div class="flex-1 flex flex-col gap-1">
<div class="h-2 w-3/4 bg-orange-100 rounded-full"></div>
<div class="h-2 w-1/2 bg-orange-100 rounded-full"></div>
</div>
</div>
<div class="h-8 w-full bg-orange-500 rounded-full"></div>
</div>
</div>
<div class="flex justify-between items-center px-1">
<span class="font-bold text-lg">落日橙</span>
<div class="size-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center bg-transparent"></div>
</div>
</div>
</div>
</section>
<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
<div class="flex flex-col gap-4">
<h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] px-1">偏好设置</h2>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-[#e7f4eb] dark:border-[#1f422b] overflow-hidden divide-y divide-[#e7f4eb] dark:divide-[#1f422b]">
<div class="flex items-center gap-4 px-6 py-5 justify-between hover:bg-gray-50 dark:hover:bg-[#234530] transition-colors">
<div class="flex items-center gap-4">
<div class="text-[#0d1c12] dark:text-white flex items-center justify-center rounded-lg bg-[#e7f4eb] dark:bg-[#1f422b] shrink-0 size-12">
<span class="material-symbols-outlined text-2xl">volume_up</span>
</div>
<div class="flex flex-col">
<p class="text-base font-bold leading-tight">音效</p>
<p class="text-sm text-gray-500 dark:text-gray-400">答对时播放音效</p>
</div>
</div>
<div class="shrink-0">
<label class="relative flex h-[32px] w-[56px] cursor-pointer items-center rounded-full border-none bg-primary p-1 justify-end transition-colors">
<div class="h-full w-[24px] rounded-full bg-white shadow-sm"></div>
<input checked="" class="invisible absolute" type="checkbox"/>
</label>
</div>
</div>
<div class="flex items-center gap-4 px-6 py-5 justify-between hover:bg-gray-50 dark:hover:bg-[#234530] transition-colors">
<div class="flex items-center gap-4">
<div class="text-[#0d1c12] dark:text-white flex items-center justify-center rounded-lg bg-[#e7f4eb] dark:bg-[#1f422b] shrink-0 size-12">
<span class="material-symbols-outlined text-2xl">vibration</span>
</div>
<div class="flex flex-col">
<p class="text-base font-bold leading-tight">触感</p>
<p class="text-sm text-gray-500 dark:text-gray-400">互动时震动反馈</p>
</div>
</div>
<div class="shrink-0">
<label class="relative flex h-[32px] w-[56px] cursor-pointer items-center rounded-full border-none bg-[#e7f4eb] dark:bg-[#2a4d36] p-1 justify-start transition-colors">
<div class="h-full w-[24px] rounded-full bg-white shadow-sm"></div>
<input class="invisible absolute" type="checkbox"/>
</label>
</div>
</div>
<div class="flex items-center gap-4 px-6 py-5 justify-between hover:bg-gray-50 dark:hover:bg-[#234530] transition-colors">
<div class="flex items-center gap-4">
<div class="text-[#0d1c12] dark:text-white flex items-center justify-center rounded-lg bg-[#e7f4eb] dark:bg-[#1f422b] shrink-0 size-12">
<span class="material-symbols-outlined text-2xl">motion_photos_on</span>
</div>
<div class="flex flex-col">
<p class="text-base font-bold leading-tight">减弱动态效果</p>
<p class="text-sm text-gray-500 dark:text-gray-400">减少动画以提高专注度</p>
</div>
</div>
<div class="shrink-0">
<label class="relative flex h-[32px] w-[56px] cursor-pointer items-center rounded-full border-none bg-[#e7f4eb] dark:bg-[#2a4d36] p-1 justify-start transition-colors">
<div class="h-full w-[24px] rounded-full bg-white shadow-sm"></div>
<input class="invisible absolute" type="checkbox"/>
</label>
</div>
</div>
</div>
</div>
<div class="flex flex-col gap-4">
<h2 class="text-[22px] font-bold leading-tight tracking-[-0.015em] px-1">账号设置</h2>
<div class="bg-surface-light dark:bg-surface-dark rounded-xl shadow-sm border border-[#e7f4eb] dark:border-[#1f422b] p-6 flex flex-col gap-4 h-full">
<div class="flex items-center gap-4 mb-2">
<div class="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-16 ring-4 ring-primary/20" data-alt="User profile avatar close up" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCUaNy3aVvE_BCMqNHItYNvJwSWcYaKXOUfsE9QiQdKeYTRGmYQhJyXv1DQoXuglnXbI749ysMbGa5U8iQkuCJi1t-0STrHn5i9rUGE1VBkbg5qESAgy8IMCnW3vsM0u5pF-fspGPTT90mtwrTZxqnF9Gn5D_mgrV1nc4CjP39Qm0ZlaaMBNp0Fjs0VxPvTGXmjBz-WuCxxEJAaQPcZrNwSv84JNSpxLhY-SUCL6h1oBgefHZSY_GAPiOp8EtJHB11TrGXrI7c3UF6Y");'></div>
<div>
<p class="text-lg font-bold">Alex 同学</p>
<p class="text-sm text-gray-500 dark:text-gray-400">等级 12 • 4,502 积分</p>
</div>
</div>
<button class="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-[#e7f4eb] dark:border-[#1f422b] hover:bg-[#f8fcf9] dark:hover:bg-[#1f3a29] transition-colors group">
<span class="font-medium">编辑个人资料</span>
<span class="material-symbols-outlined text-gray-400 group-hover:text-primary">chevron_right</span>
</button>
<button class="flex items-center justify-between w-full px-4 py-3 rounded-lg border border-[#e7f4eb] dark:border-[#1f422b] hover:bg-[#f8fcf9] dark:hover:bg-[#1f3a29] transition-colors group">
<span class="font-medium">修改密码</span>
<span class="material-symbols-outlined text-gray-400 group-hover:text-primary">chevron_right</span>
</button>
<div class="mt-auto pt-4 flex flex-col gap-3">
<button class="w-full py-3 rounded-full border-2 border-red-100 text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
<span class="material-symbols-outlined text-xl">logout</span>
                                退出登录
                            </button>
<button class="text-xs text-gray-400 hover:text-red-500 underline decoration-gray-300 hover:decoration-red-300 underline-offset-4 transition-colors">
                                删除我的账号数据
                            </button>
</div>
</div>
</div>
</div>
</div>
</main>
<div class="h-20"></div>

</body></html>

<!-- 荣誉成就墙 -->
<!DOCTYPE html>

<html class="light" lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Vocab Master 2.0 - 荣誉成就墙</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&amp;family=Noto+Sans+SC:wght@300;400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#25f46a",
                        "primary-dark": "#1bc452",
                        "background-light": "#f5f8f6",
                        "background-dark": "#102216",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1c2e22",
                    },
                    fontFamily: {
                        "display": ['Lexend', '"Noto Sans SC"', 'sans-serif'],
                        "body": ['"Noto Sans SC"', 'sans-serif']
                    },
                    borderRadius: { "DEFAULT": "1rem", "lg": "1.5rem", "xl": "2rem", "2xl": "3rem", "full": "9999px" },
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Noto Sans SC', sans-serif;
        }
        h1, h2, h3, h4, h5, h6, .font-display {
            font-family: 'Lexend', 'Noto Sans SC', sans-serif;
        }
        /* Custom scrollbar for better aesthetics */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 20px;
        }
        .dark ::-webkit-scrollbar-thumb {
            background-color: #334155;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white min-h-screen flex flex-col">
<div class="flex flex-col min-h-screen">
<!-- Navigation Bar -->
<header class="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md px-6 py-3 lg:px-12">
<div class="flex items-center gap-4">
<div class="size-8 text-primary">
<svg fill="none" viewbox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_6_535)">
<path clip-rule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fill-rule="evenodd"></path>
</g>
<defs>
<clippath id="clip0_6_535"><rect fill="white" height="48" width="48"></rect></clippath>
</defs>
</svg>
</div>
<h2 class="text-xl font-display font-bold tracking-tight text-slate-900 dark:text-white">Vocab Master 2.0</h2>
</div>
<!-- Desktop Nav Links -->
<nav class="hidden md:flex items-center gap-8 ml-12 mr-auto">
<a class="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium" href="#">首页</a>
<a class="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium" href="#">学习</a>
<a class="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium" href="#">单词本</a>
<a class="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors text-sm font-medium" href="#">竞技场</a>
<a class="text-primary font-bold text-sm leading-normal border-b-2 border-primary" href="#">成就</a>
</nav>
<div class="flex items-center gap-4">
<div class="flex items-center gap-2 px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
<span class="material-symbols-outlined text-yellow-600 text-[18px]">bolt</span>
<span class="text-xs font-bold text-yellow-700 dark:text-yellow-400">120 XP</span>
</div>
<button class="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors text-slate-700 dark:text-slate-200">
<span class="material-symbols-outlined text-[20px]">notifications</span>
</button>
<button class="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-surface-dark hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors text-slate-700 dark:text-slate-200">
<span class="material-symbols-outlined text-[20px]">settings</span>
</button>
<div class="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-blue-400 p-[2px]">
<div class="h-full w-full rounded-full bg-surface-light dark:bg-surface-dark p-[2px]">
<img alt="User Avatar" class="rounded-full object-cover h-full w-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvrh8g1leZhFQhriaYazCYGee_7f7pPjoMCuzGrVuqFeHizRkOyi2VYj7xLBmP9vGQEtwL9cMd0T-Wl-qdFmw2ZvBdyEoWyC95PhE_O2hk6fhdPmZsgoXHrlfZQg4eQORSnxEvphL5E8HKllgqPJAH1mNI8AzAnR2oEnIqQEcqenxec3WQFcAxFVD1BpHhCi8xvq40UcHHEnE2fBTTw6I-nLK6i5V5nwfph_fgMwPIHIEDmnNIl--8kVPSu01doRhajCQ8MAyhDhsm"/>
</div>
</div>
</div>
</header>
<!-- Main Content -->
<main class="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8">
<!-- Hero / Header Section -->
<section class="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
<div class="flex flex-col gap-2">
<div class="flex items-center gap-3">
<div class="p-2 bg-primary/20 rounded-lg text-primary-dark dark:text-primary">
<span class="material-symbols-outlined text-[32px]">military_tech</span>
</div>
<h1 class="text-3xl md:text-4xl font-display font-black tracking-tight text-slate-900 dark:text-white">荣誉成就墙</h1>
</div>
<p class="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl">
                        记录你的每一次进步，收集所有徽章！每一个里程碑都值得庆祝。
                    </p>
</div>
<!-- Stats Cards -->
<div class="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
<div class="flex-1 md:w-40 bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
<span class="text-3xl font-display font-black text-slate-900 dark:text-white">12</span>
<span class="text-xs font-bold text-primary-dark dark:text-primary uppercase tracking-wider mt-1">已获得勋章</span>
</div>
<div class="flex-1 md:w-40 bg-surface-light dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
<span class="text-3xl font-display font-black text-slate-400">38</span>
<span class="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">待解锁</span>
</div>
<div class="flex-1 md:w-40 bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-xl border border-primary/20 shadow-sm flex flex-col items-center justify-center text-center">
<span class="text-3xl font-display font-black text-primary-dark dark:text-primary">Lv. 12</span>
<span class="text-xs font-bold text-primary-dark dark:text-primary uppercase tracking-wider mt-1">当前等级</span>
</div>
</div>
</section>
<!-- Filters -->
<div class="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
<button class="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-medium shadow-lg shadow-slate-200 dark:shadow-none hover:translate-y-[-1px] transition-transform">
<span class="material-symbols-outlined text-[18px]">grid_view</span>
                    全部成就
                </button>
<button class="flex items-center gap-2 px-5 py-2.5 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-medium hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
<span class="material-symbols-outlined text-[18px] text-primary">lock_open</span>
                    已解锁
                </button>
<button class="flex items-center gap-2 px-5 py-2.5 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-medium hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">
<span class="material-symbols-outlined text-[18px] text-yellow-500">timelapse</span>
                    进行中
                </button>
<button class="flex items-center gap-2 px-5 py-2.5 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-medium hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors ml-auto">
<span class="material-symbols-outlined text-[18px]">sort</span>
                    排序
                </button>
</div>
<!-- Achievement Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
<!-- Badge 1: 7-Day Streak (In Progress) -->
<div class="group relative bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]">
<div class="absolute top-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">进行中</div>
<div class="flex flex-col items-center text-center">
<div class="relative mb-4">
<div class="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-200 dark:shadow-none">
<span class="material-symbols-outlined text-[40px]">local_fire_department</span>
</div>
<!-- Circular Progress Ring SVG could go here -->
</div>
<h3 class="text-lg font-display font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">7天连击</h3>
<p class="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 flex items-center justify-center">连续学习7天不断签</p>
<!-- Progress Bar -->
<div class="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden mb-2">
<div class="bg-primary h-full rounded-full w-[70%]"></div>
</div>
<div class="flex justify-between w-full text-xs font-medium text-slate-400">
<span>5天</span>
<span>目标: 7天</span>
</div>
</div>
</div>
<!-- Badge 2: First 100 Words (Unlocked) -->
<div class="group relative bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border-2 border-primary/20 dark:border-primary/30 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:translate-y-[-4px]">
<div class="absolute top-4 right-4 bg-primary text-slate-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
<span class="material-symbols-outlined text-[12px]">check</span> 已获得
                    </div>
<div class="flex flex-col items-center text-center">
<div class="relative mb-4">
<div class="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-slate-900 shadow-lg shadow-emerald-100 dark:shadow-none animate-pulse">
<span class="material-symbols-outlined text-[40px]">spa</span>
</div>
</div>
<h3 class="text-lg font-display font-bold text-slate-900 dark:text-white mb-1">初露锋芒</h3>
<p class="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 flex items-center justify-center">成功学习首100个单词</p>
<div class="w-full mt-auto">
<button class="w-full py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                查看详情
                            </button>
</div>
</div>
</div>
<!-- Badge 3: PK King (Locked) -->
<div class="group relative bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm opacity-80 hover:opacity-100 transition-all duration-300">
<div class="absolute top-4 right-4 text-slate-300 dark:text-slate-600">
<span class="material-symbols-outlined text-[20px]">lock</span>
</div>
<div class="flex flex-col items-center text-center grayscale group-hover:grayscale-0 transition-all duration-500">
<div class="relative mb-4">
<div class="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-400 to-indigo-500 flex items-center justify-center text-white">
<span class="material-symbols-outlined text-[40px]">swords</span>
</div>
</div>
<h3 class="text-lg font-display font-bold text-slate-400 dark:text-slate-500 mb-1">PK之王</h3>
<p class="text-sm text-slate-400 dark:text-slate-600 mb-4 h-10 flex items-center justify-center">在竞技场赢得10场PK</p>
<!-- Progress Bar -->
<div class="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
<div class="bg-slate-300 dark:bg-slate-600 h-full rounded-full w-[20%]"></div>
</div>
<div class="flex justify-between w-full text-xs font-medium text-slate-400">
<span>2场</span>
<span>目标: 10场</span>
</div>
</div>
</div>
<!-- Badge 4: Vocab Master (In Progress) -->
<div class="group relative bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]">
<div class="absolute top-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">进行中</div>
<div class="flex flex-col items-center text-center">
<div class="relative mb-4">
<div class="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-100 dark:shadow-none">
<span class="material-symbols-outlined text-[40px]">menu_book</span>
</div>
</div>
<h3 class="text-lg font-display font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">单词大师</h3>
<p class="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 flex items-center justify-center">累计掌握500个单词</p>
<!-- Progress Bar -->
<div class="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden mb-2">
<div class="bg-primary h-full rounded-full w-[40%]"></div>
</div>
<div class="flex justify-between w-full text-xs font-medium text-slate-400">
<span>200词</span>
<span>目标: 500词</span>
</div>
</div>
</div>
<!-- Badge 5: Early Bird (Unlocked) -->
<div class="group relative bg-primary/5 dark:bg-primary/10 rounded-2xl p-6 border-2 border-primary/20 dark:border-primary/30 shadow-sm hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:translate-y-[-4px]">
<div class="absolute top-4 right-4 bg-primary text-slate-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
<span class="material-symbols-outlined text-[12px]">check</span> 已获得
                    </div>
<div class="flex flex-col items-center text-center">
<div class="relative mb-4">
<div class="w-20 h-20 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-400 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-100 dark:shadow-none">
<span class="material-symbols-outlined text-[40px]">wb_twilight</span>
</div>
</div>
<h3 class="text-lg font-display font-bold text-slate-900 dark:text-white mb-1">早起的鸟儿</h3>
<p class="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 flex items-center justify-center">早上6-8点完成一次打卡</p>
<div class="w-full mt-auto">
<button class="w-full py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                查看详情
                            </button>
</div>
</div>
</div>
<!-- Badge 6: Social Butterfly (Locked) -->
<div class="group relative bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm opacity-80 hover:opacity-100 transition-all duration-300">
<div class="absolute top-4 right-4 text-slate-300 dark:text-slate-600">
<span class="material-symbols-outlined text-[20px]">lock</span>
</div>
<div class="flex flex-col items-center text-center grayscale group-hover:grayscale-0 transition-all duration-500">
<div class="relative mb-4">
<div class="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-400 to-rose-500 flex items-center justify-center text-white">
<span class="material-symbols-outlined text-[40px]">diversity_3</span>
</div>
</div>
<h3 class="text-lg font-display font-bold text-slate-400 dark:text-slate-500 mb-1">社交达人</h3>
<p class="text-sm text-slate-400 dark:text-slate-600 mb-4 h-10 flex items-center justify-center">添加5位好友并互动</p>
<!-- Progress Bar -->
<div class="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
<div class="bg-slate-300 dark:bg-slate-600 h-full rounded-full w-[0%]"></div>
</div>
<div class="flex justify-between w-full text-xs font-medium text-slate-400">
<span>0位</span>
<span>目标: 5位</span>
</div>
</div>
</div>
<!-- Badge 7: Speed Learner (Locked) -->
<div class="group relative bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm opacity-80 hover:opacity-100 transition-all duration-300">
<div class="absolute top-4 right-4 text-slate-300 dark:text-slate-600">
<span class="material-symbols-outlined text-[20px]">lock</span>
</div>
<div class="flex flex-col items-center text-center grayscale group-hover:grayscale-0 transition-all duration-500">
<div class="relative mb-4">
<div class="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white">
<span class="material-symbols-outlined text-[40px]">electric_bolt</span>
</div>
</div>
<h3 class="text-lg font-display font-bold text-slate-400 dark:text-slate-500 mb-1">极速挑战</h3>
<p class="text-sm text-slate-400 dark:text-slate-600 mb-4 h-10 flex items-center justify-center">在60秒内正确回答20题</p>
<!-- Progress Bar -->
<div class="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-2">
<div class="bg-slate-300 dark:bg-slate-600 h-full rounded-full w-[50%]"></div>
</div>
<div class="flex justify-between w-full text-xs font-medium text-slate-400">
<span>最高10题</span>
<span>目标: 20题</span>
</div>
</div>
</div>
<!-- Badge 8: Perfect Week (In Progress) -->
<div class="group relative bg-surface-light dark:bg-surface-dark rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px]">
<div class="absolute top-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">进行中</div>
<div class="flex flex-col items-center text-center">
<div class="relative mb-4">
<div class="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-400 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-violet-200 dark:shadow-none">
<span class="material-symbols-outlined text-[40px]">diamond</span>
</div>
</div>
<h3 class="text-lg font-display font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">完美一周</h3>
<p class="text-sm text-slate-500 dark:text-slate-400 mb-4 h-10 flex items-center justify-center">一周内每天准确率达到100%</p>
<!-- Progress Bar -->
<div class="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden mb-2">
<div class="bg-primary h-full rounded-full w-[85%]"></div>
</div>
<div class="flex justify-between w-full text-xs font-medium text-slate-400">
<span>6天</span>
<span>目标: 7天</span>
</div>
</div>
</div>
</div>
<!-- Empty State / Load More (Optional, showing more content available) -->
<div class="flex justify-center mt-12 mb-8">
<button class="flex items-center gap-2 px-8 py-3 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary rounded-full font-bold transition-all">
                    加载更多成就
                    <span class="material-symbols-outlined text-[20px]">expand_more</span>
</button>
</div>
</main>
</div>
</body></html>

<!-- 平板端响应式主页 -->
<!DOCTYPE html>

<html class="light" lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>单词大师 - Vocab Master 2.0</title>
<!-- Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&amp;family=Noto+Sans+SC:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Theme Config -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#25f46a",
                        "primary-dark": "#1bc452",
                        "secondary": "#e7f4eb",
                        "background-light": "#f5f8f6",
                        "background-dark": "#102216",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1a3322",
                        "text-main": "#0d1c12",
                        "text-muted": "#499c65",
                    },
                    fontFamily: {
                        "display": ['Lexend', 'Noto Sans SC', 'sans-serif'],
                        "body": ['Noto Sans SC', 'sans-serif'],
                    },
                    borderRadius: {
                        "DEFAULT": "1rem",
                        "lg": "1.5rem",
                        "xl": "2rem",
                        "2xl": "2.5rem",
                        "full": "9999px"
                    },
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Lexend', 'Noto Sans SC', sans-serif;
        }
        /* Custom scrollbar for webkit */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
            background: #d1d5db; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #9ca3af; 
        }
        .bento-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .bento-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-text-main dark:text-white transition-colors duration-200 overflow-hidden">
<div class="flex h-screen w-full overflow-hidden">
<!-- Navigation Rail (Left Side) -->
<nav class="hidden md:flex flex-col w-24 h-full bg-surface-light dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 items-center py-8 z-20 shadow-sm shrink-0">
<div class="mb-8">
<div class="size-12 rounded-2xl bg-primary flex items-center justify-center text-text-main font-bold text-2xl shadow-lg shadow-primary/30">
                    V
                </div>
</div>
<div class="flex flex-col gap-6 flex-1 w-full px-4">
<a class="group flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary dark:bg-primary/20 text-primary-dark dark:text-primary transition-all" href="#">
<span class="material-symbols-outlined text-[28px] fill-1">home</span>
<span class="text-xs font-medium mt-1">主页</span>
</a>
<a class="group flex flex-col items-center justify-center p-3 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white transition-all" href="#">
<span class="material-symbols-outlined text-[28px]">book_2</span>
<span class="text-xs font-medium mt-1">词书</span>
</a>
<a class="group flex flex-col items-center justify-center p-3 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white transition-all" href="#">
<span class="material-symbols-outlined text-[28px]">sports_esports</span>
<span class="text-xs font-medium mt-1">复习</span>
</a>
<a class="group flex flex-col items-center justify-center p-3 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white transition-all" href="#">
<span class="material-symbols-outlined text-[28px]">leaderboard</span>
<span class="text-xs font-medium mt-1">排行</span>
</a>
</div>
<div class="mt-auto flex flex-col gap-4 w-full px-4">
<a class="group flex flex-col items-center justify-center p-3 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white transition-all" href="#">
<span class="material-symbols-outlined text-[28px]">settings</span>
</a>
<div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm" data-alt="用户头像" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMqUWxY6AY8Es9NuDxDp9dyyTnRXdAU44hYR6hk8gXFm-lWsRZjOfvhzmqahoVzUz31jyINkY0cNt3V7jykK-w_eqZY6wAO3eiYrdSARBBtHKP8gU4W59uzHYv0pvVIlC1XMHg_WMymEN6n6f6LOYUaGeyTNOFCjYc6oV92IbWqpGifbjebmQO87f3LUs8ihUBqXVRvv6716sncJVepKPGPbEZGhnaadEzAylnn-KFsm34unCXgN4_h2_Nki8BARbFA9sbY4dmLawj');"></div>
</div>
</nav>
<!-- Mobile Bottom Nav (Visible only on small screens) -->
<nav class="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 flex justify-around items-center px-4 z-50">
<a class="flex flex-col items-center justify-center text-primary-dark dark:text-primary" href="#">
<span class="material-symbols-outlined text-[28px] fill-1">home</span>
<span class="text-[10px] font-medium mt-1">主页</span>
</a>
<a class="flex flex-col items-center justify-center text-gray-400" href="#">
<span class="material-symbols-outlined text-[28px]">book_2</span>
<span class="text-[10px] font-medium mt-1">词书</span>
</a>
<a class="flex flex-col items-center justify-center text-gray-400" href="#">
<span class="material-symbols-outlined text-[28px]">sports_esports</span>
<span class="text-[10px] font-medium mt-1">复习</span>
</a>
<a class="flex flex-col items-center justify-center text-gray-400" href="#">
<span class="material-symbols-outlined text-[28px]">person</span>
<span class="text-[10px] font-medium mt-1">我的</span>
</a>
</nav>
<!-- Main Content Area -->
<main class="flex-1 h-full overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8">
<div class="max-w-7xl mx-auto h-full flex flex-col gap-8">
<!-- Header Section -->
<header class="flex justify-between items-center shrink-0">
<div class="flex flex-col">
<h1 class="text-3xl md:text-4xl font-black tracking-tight text-text-main dark:text-white">早安, 冒险者! 👋</h1>
<p class="text-text-muted dark:text-gray-400 mt-1 text-base md:text-lg">准备好迎接今天的挑战了吗？</p>
</div>
<div class="hidden md:flex items-center gap-3 bg-white dark:bg-surface-dark px-4 py-2 rounded-full shadow-sm">
<span class="material-symbols-outlined text-orange-500 fill-1">local_fire_department</span>
<span class="font-bold text-lg">12</span>
<span class="text-sm text-gray-500 dark:text-gray-400 font-medium">连胜天数</span>
</div>
</header>
<!-- Dashboard Grid -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[600px]">
<!-- Left Hero Section (Adventure) -->
<div class="lg:col-span-5 flex flex-col gap-6 h-full">
<!-- Hero Card -->
<div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm h-full min-h-[400px] border border-gray-100 dark:border-gray-800 bento-card group cursor-pointer">
<!-- Background Decoration -->
<div class="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
<div class="relative z-10">
<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary dark:bg-primary/20 text-text-main dark:text-white text-xs font-bold uppercase tracking-wider mb-4">
<span class="size-2 rounded-full bg-primary animate-pulse"></span>
                                    进行中
                                </div>
<h2 class="text-3xl md:text-4xl font-bold leading-tight mb-2">GRE 核心词汇</h2>
<p class="text-text-muted dark:text-gray-400 font-medium">Daily Mix · Level 12</p>
</div>
<div class="relative z-10 flex flex-col items-center justify-center py-8">
<div class="w-48 h-48 md:w-56 md:h-56 relative">
<div class="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
<div class="relative w-full h-full bg-gradient-to-br from-primary to-green-400 rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 overflow-hidden border-4 border-white dark:border-gray-800">
<img class="w-full h-full object-cover opacity-90 mix-blend-overlay" data-alt="抽象书籍学习概念图" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbzKCx2AWp_v_oo8TZa97jF4HnbF7VuwxFKsGMNpj4oUWGdtXRCYXpBo2zfM1iXA1iDWeh8AN6ItyNGD6ppsuFVREzq8mCyCe8i2PKyPSK-xNm-R74JC9dQKKdKB-1oww7kQwH4jVdsUTsViSFP-A3HZ4GxwRVTSSrjBtmA4anIbJQPAmcJ-dHHbDnDuWEBEDaO0aybjWcnUJOG48CXMvoO3UJLPMB9GGCrcfvxApiKNGV_lR0--Ko2V-1oWPsr1Fjiq337zLcrmMM"/>
<span class="material-symbols-outlined text-white text-6xl absolute z-20 drop-shadow-md">play_arrow</span>
</div>
</div>
</div>
<div class="relative z-10 mt-auto">
<div class="flex justify-between items-end mb-4 px-2">
<div>
<p class="text-sm font-medium text-gray-500 dark:text-gray-400">今日目标</p>
<p class="text-2xl font-bold text-text-main dark:text-white">20 <span class="text-lg text-gray-400 font-normal">/ 50 词</span></p>
</div>
<div class="text-right">
<p class="text-primary font-bold text-xl">+40%</p>
</div>
</div>
<button class="w-full bg-primary hover:bg-primary-dark text-text-main font-bold text-xl py-4 rounded-full shadow-lg shadow-primary/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 group-hover:gap-4">
<span>开启冒险</span>
<span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
</button>
</div>
</div>
</div>
<!-- Right Stats Grid (Bento Box) -->
<div class="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 h-full content-start">
<!-- Daily Goal Progress -->
<div class="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 bento-card flex flex-col justify-between">
<div class="flex justify-between items-start mb-4">
<div class="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl text-blue-600 dark:text-blue-400">
<span class="material-symbols-outlined">target</span>
</div>
<span class="text-xs font-bold text-gray-400 uppercase tracking-wider">今日目标</span>
</div>
<div class="flex items-center gap-6">
<div class="relative size-24 shrink-0">
<svg class="size-full -rotate-90" viewbox="0 0 36 36">
<path class="text-gray-100 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4"></path>
<path class="text-blue-500 drop-shadow-md" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="40, 100" stroke-linecap="round" stroke-width="4"></path>
</svg>
<div class="absolute inset-0 flex items-center justify-center flex-col">
<span class="text-lg font-bold text-text-main dark:text-white">40%</span>
</div>
</div>
<div class="flex flex-col gap-1">
<p class="text-3xl font-bold text-text-main dark:text-white">20</p>
<p class="text-sm text-gray-500">已学单词</p>
<p class="text-xs text-blue-500 font-medium mt-1">保持专注!</p>
</div>
</div>
</div>
<!-- Streak Card -->
<div class="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-6 shadow-sm border border-orange-100 dark:border-orange-900/30 bento-card flex flex-col justify-between relative overflow-hidden">
<div class="absolute -right-4 -top-4 text-orange-200 dark:text-orange-900/20 opacity-50">
<span class="material-symbols-outlined text-[120px]">local_fire_department</span>
</div>
<div class="flex justify-between items-start mb-4 relative z-10">
<div class="bg-orange-100 dark:bg-orange-900/40 p-2 rounded-xl text-orange-600 dark:text-orange-400">
<span class="material-symbols-outlined fill-1">local_fire_department</span>
</div>
<span class="text-xs font-bold text-orange-400 uppercase tracking-wider">连击</span>
</div>
<div class="relative z-10">
<div class="flex items-baseline gap-2">
<span class="text-5xl font-black text-text-main dark:text-white tracking-tighter">12</span>
<span class="text-xl font-medium text-orange-600 dark:text-orange-400">天</span>
</div>
<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">太棒了！再坚持 3 天获得 <span class="font-bold text-orange-500">双倍经验卡</span></p>
</div>
</div>
<!-- Book Progress (Wide) -->
<div class="md:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 bento-card">
<div class="flex items-center justify-between mb-6">
<div class="flex items-center gap-3">
<div class="bg-primary/20 p-2 rounded-xl text-primary-dark dark:text-primary">
<span class="material-symbols-outlined">library_books</span>
</div>
<div>
<h3 class="font-bold text-lg leading-none">词书进度</h3>
<p class="text-xs text-gray-500 mt-1">GRE 核心词汇 · 3000词版</p>
</div>
</div>
<div class="text-right">
<span class="text-2xl font-black text-text-main dark:text-white">120</span>
<span class="text-gray-400 text-sm font-medium">/ 1000</span>
</div>
</div>
<div class="relative w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
<div class="absolute top-0 left-0 h-full bg-primary w-[12%] rounded-full shadow-[0_0_10px_rgba(37,244,106,0.5)]"></div>
<!-- Milestone markers -->
<div class="absolute top-0 bottom-0 left-[25%] w-0.5 bg-white/50 dark:bg-black/20"></div>
<div class="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white/50 dark:bg-black/20"></div>
<div class="absolute top-0 bottom-0 left-[75%] w-0.5 bg-white/50 dark:bg-black/20"></div>
</div>
<div class="flex justify-between mt-2 text-xs font-medium text-gray-400">
<span>Level 1</span>
<span>Level 5</span>
<span>Level 10</span>
</div>
</div>
<!-- Leaderboard (Wide) -->
<div class="md:col-span-2 bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 bento-card">
<div class="flex justify-between items-center mb-4">
<div class="flex items-center gap-2">
<div class="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-xl text-yellow-600 dark:text-yellow-400">
<span class="material-symbols-outlined">trophy</span>
</div>
<h3 class="font-bold text-lg">好友排行</h3>
</div>
<a class="text-sm font-bold text-primary hover:underline" href="#">查看全部</a>
</div>
<div class="flex flex-col gap-3">
<!-- Rank 1 -->
<div class="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
<span class="text-yellow-500 font-black text-lg w-6 text-center">1</span>
<div class="size-10 rounded-full bg-cover bg-center ring-2 ring-yellow-400" data-alt="Alice Avatar" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAedkvPiCovjtk-iOh3w8O8SRKncNla5NhefVljQkrymH_dmXrr6sLatvKU7ZL5RM0sVqWpl1cY7UKwS1jaN6olA8X3K2BmSBBKjbfGTL4preyxJ_XJEg0XQeRswIS-WQzKzzMDvgBhOwPwnf3Nm1jUApxA4BLjQzoJ4NTdn6z2LR2aSqwzMSzjFIi2Ps32yhbztR834ZR0GOYByRgB4VrxDnabGFm7B140sfabjAbwZX67aKByYEad_uxOp-66_3-_bxzpTuw4xW-B');"></div>
<div class="flex-1">
<p class="font-bold text-text-main dark:text-white text-sm">Alice Wang</p>
<p class="text-xs text-gray-500">Lv. 15 大师</p>
</div>
<div class="font-bold text-text-main dark:text-white">12,450 XP</div>
</div>
<!-- Rank 2 -->
<div class="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
<span class="text-gray-400 font-black text-lg w-6 text-center">2</span>
<div class="size-10 rounded-full bg-cover bg-center ring-2 ring-gray-300" data-alt="You Avatar" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBtCQWnWbfqF1yy6Vetyrn6YYPXBVY1tjcUuVitm6pyQY8TX_lwdlZWRBv_sQnex0zzE4IEiCl95XSoN9Z7tUHqcpRPmWknhIb0yPC30_oaV1V_jWuIN4iF8gJAIFqGhQSeGLQbQb1ZcSuHzU5klQwGDT_ScF6ow6uMED0rqCwjMnQeSwt-vvJw6a28jDbUavegZ8xC2yCoW_D_xPYAC-m6trin9FDWOaVgutVo8aQhgz-OU8hiaSlDuzL5bZpLrRiyOc4aEG7IwZ7Q');"></div>
<div class="flex-1">
<p class="font-bold text-text-main dark:text-white text-sm">You (我)</p>
<p class="text-xs text-gray-500">Lv. 12 进阶</p>
</div>
<div class="font-bold text-text-main dark:text-white">9,820 XP</div>
</div>
<!-- Rank 3 -->
<div class="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
<span class="text-orange-700/60 font-black text-lg w-6 text-center">3</span>
<div class="size-10 rounded-full bg-cover bg-center ring-2 ring-orange-700/40" data-alt="Bob Avatar" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDsnZGPCkRWuCUR0HNpaXuaCqmDVXAft7mGKne0oytIKy_4-3ZUUYx_m5ysvK52T-NRqK9leGliGFUJ5m7OdNGLK1WL6Mc56VnYf0evA0jReBjNOziUASNN1btDBeUQV5yt6tg9oZc7SGvaA6CAyFllp-GbhYFgLddsOK7EX6JEX_D9LWHcaEAFRsfsTgD0QbS7ayPdPh7nOeNk4_JEd42R4glxb9OSf9su116-RnGB3meAz83rqRz5G3amZh3FyrbsuWLYnSk90sV-');"></div>
<div class="flex-1">
<p class="font-bold text-text-main dark:text-white text-sm">Bob Chen</p>
<p class="text-xs text-gray-500">Lv. 11 进阶</p>
</div>
<div class="font-bold text-text-main dark:text-white">8,100 XP</div>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Floating Action Button (Optional for Tablet context if needed, currently using rail) -->
<!-- <button class="fixed bottom-6 right-6 md:hidden size-14 bg-primary text-text-main rounded-full shadow-xl flex items-center justify-center z-40">
            <span class="material-symbols-outlined">play_arrow</span>
        </button> -->
</div>
</body></html>

<!-- 平板端互动学习竞技场 -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Vocab Master 2.0 - Learning Arena</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&amp;family=Noto+Sans+SC:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#25f46a",
                        "primary-dark": "#1ec655",
                        "background-light": "#f5f8f6",
                        "background-dark": "#102216",
                        "card-light": "#ffffff",
                        "card-dark": "#1a3322",
                        "text-main": "#0d1c12",
                        "text-light": "#ffffff",
                    },
                    fontFamily: {
                        "display": ["Lexend", "Noto Sans SC", "sans-serif"],
                        "body": ["Lexend", "Noto Sans SC", "sans-serif"],
                    },
                    borderRadius: {"DEFAULT": "1rem", "lg": "2rem", "xl": "3rem", "2xl": "4rem", "full": "9999px"},
                    boxShadow: {
                        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                        'glow': '0 0 15px rgba(37, 244, 106, 0.3)',
                    }
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Lexend', 'Noto Sans SC', sans-serif;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
        .dark .glass-panel {
            background: rgba(16, 34, 22, 0.7);
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display text-text-main dark:text-text-light transition-colors duration-300">
<!-- Top HUD Area -->
<header class="w-full px-6 py-4 md:px-12 md:py-6 flex items-center justify-between sticky top-0 z-50 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
<!-- Left: Context -->
<div class="flex items-center gap-3">
<button class="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
<span class="material-symbols-outlined text-2xl">arrow_back</span>
</button>
<div class="hidden md:flex flex-col">
<span class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Lesson</span>
<span class="text-sm font-bold">Unit 3: Personality</span>
</div>
</div>
<!-- Center: Progress Bar -->
<div class="flex-1 max-w-lg mx-8 flex flex-col gap-2">
<div class="flex justify-between text-xs font-bold px-1 text-gray-500 dark:text-gray-400">
<span>Progress</span>
<span>3/10</span>
</div>
<div class="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
<div class="h-full bg-primary shadow-[0_0_10px_rgba(37,244,106,0.5)] transition-all duration-500 ease-out rounded-full" style="width: 30%;"></div>
</div>
</div>
<!-- Right: Stats & Controls -->
<div class="flex items-center gap-3 md:gap-4">
<!-- Streak Badge -->
<div class="flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/50">
<span class="text-lg">🔥</span>
<span class="text-sm font-bold text-orange-600 dark:text-orange-400">12</span>
</div>
<!-- Pause/Settings -->
<button class="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-card-dark shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-300">
<span class="material-symbols-outlined text-[20px]">pause</span>
</button>
</div>
</header>
<!-- Main Game Area -->
<main class="flex-1 flex flex-col items-center justify-center px-4 py-6 md:px-8 w-full max-w-6xl mx-auto">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full h-full items-stretch min-h-[600px]">
<!-- Left Column: The Word Card (Hero) -->
<div class="lg:col-span-5 flex flex-col h-full">
<div class="relative flex flex-col justify-center items-center h-full bg-card-light dark:bg-card-dark rounded-3xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-800 p-8 md:p-12 overflow-hidden group">
<!-- Decorative Background Blobs -->
<div class="absolute top-[-20%] right-[-20%] w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>
<div class="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-blue-400/10 rounded-full blur-3xl"></div>
<!-- Card Content -->
<div class="relative z-10 flex flex-col items-center text-center w-full">
<!-- Word & Audio -->
<div class="flex flex-col items-center gap-4 mb-8">
<button class="w-14 h-14 flex items-center justify-center rounded-full bg-primary text-black shadow-glow hover:scale-110 active:scale-95 transition-all duration-200 mb-2">
<span class="material-symbols-outlined text-3xl font-variation-settings-FILL">volume_up</span>
</button>
<h1 class="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Persistent</h1>
<p class="text-xl md:text-2xl text-primary font-medium font-mono">/pərˈsɪstənt/</p>
</div>
<!-- Divider -->
<div class="w-16 h-1 bg-gray-100 dark:bg-gray-700 rounded-full mb-8"></div>
<!-- Context Sentence -->
<div class="bg-background-light dark:bg-background-dark/50 p-6 rounded-2xl w-full border border-transparent hover:border-primary/30 transition-colors">
<p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                                "She has been <span class="text-primary font-bold bg-primary/10 px-1 rounded">persistent</span> in pursuing the job."
                            </p>
</div>
<!-- Image Hint (Optional Toggle) -->
<div class="mt-6 w-full max-w-[200px] aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative group/image cursor-pointer">
<img alt="A person climbing a steep mountain representing persistence" class="w-full h-full object-cover opacity-80 group-hover/image:opacity-100 transition-opacity" data-alt="Person climbing mountain persistence concept" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm3svxGJvxSkAq6xsOBXHhKlhr9bCYkShTwaj_7B464IQN_ZjBCbMV7we2jyPCx4RmEr3kiiFxNl96UkWKci8p5RRf6WPPf8o6qBsGTK6j4nLlo-UJD7XMDjNkPyIXilSEWabZiVxtA-dUa7CVWfNAXMxKPbn9hzsM-to2WSrPJkKFqMUr-VS8ZMIVsSfS46SN7e6xl4gA8Z07VCnFsJYlXJhh8Wp_PGgal_XIiVgaOKqN772YSKgtf9SwJVdHl1ICJss4yMANdkkg"/>
<div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity">
<span class="material-symbols-outlined text-white drop-shadow-lg">zoom_in</span>
</div>
</div>
</div>
</div>
</div>
<!-- Right Column: Interactive Zone -->
<div class="lg:col-span-7 flex flex-col justify-center h-full gap-6 py-4 lg:pl-8">
<div class="flex items-center justify-between mb-2">
<h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">Select the correct meaning</h2>
<span class="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Multiple Choice</span>
</div>
<!-- Answer Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
<!-- Option A -->
<button class="group relative flex items-center p-1 rounded-xl bg-white dark:bg-card-dark border-2 border-transparent hover:border-primary shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
<div class="absolute left-4 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-black transition-colors">A</div>
<div class="w-full py-6 pl-16 pr-6 text-left">
<span class="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">坚持不懈的</span>
</div>
<div class="absolute right-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity">
<span class="material-symbols-outlined">check_circle</span>
</div>
</button>
<!-- Option B -->
<button class="group relative flex items-center p-1 rounded-xl bg-white dark:bg-card-dark border-2 border-transparent hover:border-primary shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
<div class="absolute left-4 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-black transition-colors">B</div>
<div class="w-full py-6 pl-16 pr-6 text-left">
<span class="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">犹豫不决的</span>
</div>
</button>
<!-- Option C -->
<button class="group relative flex items-center p-1 rounded-xl bg-white dark:bg-card-dark border-2 border-transparent hover:border-primary shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
<div class="absolute left-4 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-black transition-colors">C</div>
<div class="w-full py-6 pl-16 pr-6 text-left">
<span class="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">临时的</span>
</div>
</button>
<!-- Option D -->
<button class="group relative flex items-center p-1 rounded-xl bg-white dark:bg-card-dark border-2 border-transparent hover:border-primary shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]">
<div class="absolute left-4 w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-black transition-colors">D</div>
<div class="w-full py-6 pl-16 pr-6 text-left">
<span class="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">复杂的</span>
</div>
</button>
</div>
<!-- Footer Actions -->
<div class="mt-4 flex flex-col items-center gap-4">
<button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium text-sm flex items-center gap-2 transition-colors px-6 py-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
<span class="material-symbols-outlined text-[18px]">help</span>
                        I don't know this word
                    </button>
</div>
</div>
</div>
</main>
<!-- Bottom Mobile Nav (Only visible on very small screens, usually hidden for tablet focus mode) -->
<div class="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-card-dark border-t border-gray-100 dark:border-gray-800 p-4 flex justify-between items-center z-40">
<button class="flex flex-col items-center gap-1 text-primary">
<span class="material-symbols-outlined font-variation-settings-FILL">school</span>
<span class="text-[10px] font-bold">Learn</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400">
<span class="material-symbols-outlined">menu_book</span>
<span class="text-[10px] font-medium">Review</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400">
<span class="material-symbols-outlined">leaderboard</span>
<span class="text-[10px] font-medium">Rank</span>
</button>
<button class="flex flex-col items-center gap-1 text-gray-400">
<span class="material-symbols-outlined">person</span>
<span class="text-[10px] font-medium">Profile</span>
</button>
</div>
</body></html>

<!-- 平板端响应式主页 -->
<!DOCTYPE html>
<html class="light" lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>成就墙 - Vocab Master 2.0</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&amp;family=Noto+Sans+SC:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#25f46a",
                        "primary-dark": "#1bc452",
                        "secondary": "#e7f4eb",
                        "background-light": "#f5f8f6",
                        "background-dark": "#102216",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1a3322",
                        "text-main": "#0d1c12",
                        "text-muted": "#499c65",
                        "gold": "#FFD700",
                        "gold-dark": "#B8860B",
                        "silver": "#C0C0C0",
                        "bronze": "#CD7F32",
                    },
                    fontFamily: {
                        "display": ['Lexend', 'Noto Sans SC', 'sans-serif'],
                        "body": ['Noto Sans SC', 'sans-serif'],
                    },
                    borderRadius: {
                        "DEFAULT": "1rem",
                        "lg": "1.5rem",
                        "xl": "2rem",
                        "2xl": "2.5rem",
                        "full": "9999px"
                    },
                    boxShadow: {
                        'glow': '0 0 20px rgba(37, 244, 106, 0.5)',
                        'medal': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 2px 4px rgba(255,255,255,0.3)',
                    }
                },
            },
        }
    </script>
<style>
        body {
            font-family: 'Lexend', 'Noto Sans SC', sans-serif;
        }::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        ::-webkit-scrollbar-track {
            background: transparent; 
        }
        ::-webkit-scrollbar-thumb {
            background: #d1d5db; 
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #9ca3af; 
        }
        .medal-card {
            transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .medal-card:hover {
            transform: scale(1.05) translateY(-5px);
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        .dark .glass-panel {
            background: rgba(26, 51, 34, 0.7);
        }
        .medal-shine {
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent);
            transform: skewX(-25deg);
            transition: 0.5s;
        }
        .group:hover .medal-shine {
            left: 200%;
            transition: 0.7s;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark text-text-main dark:text-white transition-colors duration-200 overflow-hidden">
<div class="flex h-screen w-full overflow-hidden">
<nav class="hidden md:flex flex-col w-24 h-full bg-surface-light dark:bg-surface-dark border-r border-gray-100 dark:border-gray-800 items-center py-8 z-20 shadow-sm shrink-0">
<div class="mb-8">
<div class="size-12 rounded-2xl bg-primary flex items-center justify-center text-text-main font-bold text-2xl shadow-lg shadow-primary/30">
                    V
                </div>
</div>
<div class="flex flex-col gap-6 flex-1 w-full px-4">
<a class="group flex flex-col items-center justify-center p-3 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white transition-all" href="#">
<span class="material-symbols-outlined text-[28px]">home</span>
<span class="text-xs font-medium mt-1">主页</span>
</a>
<a class="group flex flex-col items-center justify-center p-3 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white transition-all" href="#">
<span class="material-symbols-outlined text-[28px]">book_2</span>
<span class="text-xs font-medium mt-1">词书</span>
</a>
<a class="group flex flex-col items-center justify-center p-3 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white transition-all" href="#">
<span class="material-symbols-outlined text-[28px]">sports_esports</span>
<span class="text-xs font-medium mt-1">复习</span>
</a>
<a class="group flex flex-col items-center justify-center p-3 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white transition-all" href="#">
<span class="material-symbols-outlined text-[28px]">leaderboard</span>
<span class="text-xs font-medium mt-1">排行</span>
</a>
<a class="group flex flex-col items-center justify-center p-3 rounded-2xl bg-secondary dark:bg-primary/20 text-primary-dark dark:text-primary transition-all" href="#">
<span class="material-symbols-outlined text-[28px] fill-1">military_tech</span>
<span class="text-xs font-medium mt-1">成就</span>
</a>
</div>
<div class="mt-auto flex flex-col gap-4 w-full px-4">
<a class="group flex flex-col items-center justify-center p-3 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white transition-all" href="#">
<span class="material-symbols-outlined text-[28px]">settings</span>
</a>
<div class="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-gray-700 shadow-sm" data-alt="用户头像" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAMqUWxY6AY8Es9NuDxDp9dyyTnRXdAU44hYR6hk8gXFm-lWsRZjOfvhzmqahoVzUz31jyINkY0cNt3V7jykK-w_eqZY6wAO3eiYrdSARBBtHKP8gU4W59uzHYv0pvVIlC1XMHg_WMymEN6n6f6LOYUaGeyTNOFCjYc6oV92IbWqpGifbjebmQO87f3LUs8ihUBqXVRvv6716sncJVepKPGPbEZGhnaadEzAylnn-KFsm34unCXgN4_h2_Nki8BARbFA9sbY4dmLawj');"></div>
</div>
</nav>
<nav class="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 flex justify-around items-center px-4 z-50">
<a class="flex flex-col items-center justify-center text-gray-400" href="#">
<span class="material-symbols-outlined text-[28px]">home</span>
<span class="text-[10px] font-medium mt-1">主页</span>
</a>
<a class="flex flex-col items-center justify-center text-gray-400" href="#">
<span class="material-symbols-outlined text-[28px]">book_2</span>
<span class="text-[10px] font-medium mt-1">词书</span>
</a>
<a class="flex flex-col items-center justify-center text-primary-dark dark:text-primary" href="#">
<span class="material-symbols-outlined text-[28px] fill-1">military_tech</span>
<span class="text-[10px] font-medium mt-1">成就</span>
</a>
<a class="flex flex-col items-center justify-center text-gray-400" href="#">
<span class="material-symbols-outlined text-[28px]">person</span>
<span class="text-[10px] font-medium mt-1">我的</span>
</a>
</nav>
<main class="flex-1 h-full overflow-hidden p-4 md:p-6 lg:p-8">
<div class="max-w-7xl mx-auto h-full flex flex-col gap-6">
<header class="flex justify-between items-center shrink-0">
<div class="flex flex-col">
<h1 class="text-3xl md:text-4xl font-black tracking-tight text-text-main dark:text-white flex items-center gap-3">
<span class="material-symbols-outlined text-4xl text-yellow-500 fill-1">trophy</span>
                        荣誉殿堂
                    </h1>
<p class="text-text-muted dark:text-gray-400 mt-1 text-base md:text-lg">记录你每一次的进步与辉煌时刻</p>
</div>
<div class="hidden md:flex items-center gap-4">
<div class="flex items-center gap-2 bg-surface-light dark:bg-surface-dark px-4 py-2 rounded-full shadow-sm border border-gray-100 dark:border-gray-800">
<div class="w-24 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
<div class="h-full bg-yellow-400 w-3/4 rounded-full"></div>
</div>
<span class="text-xs font-bold text-gray-500 dark:text-gray-400">Lv.12</span>
</div>
<div class="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-bold bg-yellow-50 dark:bg-yellow-900/20 px-4 py-2 rounded-full">
<span class="material-symbols-outlined fill-1">workspace_premium</span>
<span class="text-lg">24</span>
<span class="text-xs font-normal opacity-80 ml-1">枚勋章</span>
</div>
</div>
</header>
<div class="flex flex-col lg:flex-row gap-6 h-full overflow-hidden pb-20 md:pb-4">
<aside class="lg:w-80 shrink-0 flex flex-col gap-4 overflow-y-auto">
<div class="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-lg shadow-gray-100/50 dark:shadow-none border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center relative overflow-hidden">
<div class="absolute top-0 w-full h-24 bg-gradient-to-b from-primary/20 to-transparent"></div>
<div class="relative z-10 size-24 p-1 rounded-full border-4 border-yellow-400 bg-white dark:bg-surface-dark mb-4 shadow-xl">
<img class="w-full h-full rounded-full object-cover" data-alt="User Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtCQWnWbfqF1yy6Vetyrn6YYPXBVY1tjcUuVitm6pyQY8TX_lwdlZWRBv_sQnex0zzE4IEiCl95XSoN9Z7tUHqcpRPmWknhIb0yPC30_oaV1V_jWuIN4iF8gJAIFqGhQSeGLQbQb1ZcSuHzU5klQwGDT_ScF6ow6uMED0rqCwjMnQeSwt-vvJw6a28jDbUavegZ8xC2yCoW_D_xPYAC-m6trin9FDWOaVgutVo8aQhgz-OU8hiaSlDuzL5bZpLrRiyOc4aEG7IwZ7Q"/>
<div class="absolute -bottom-2 -right-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white dark:border-gray-800 shadow-sm">
                                Lv.12
                            </div>
</div>
<h2 class="text-xl font-bold text-text-main dark:text-white">单词探险家</h2>
<p class="text-sm text-text-muted dark:text-gray-400 mb-6">下一等级: 词汇大师 (还差 450 XP)</p>
<div class="w-full grid grid-cols-2 gap-4">
<div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
<div class="text-2xl font-black text-text-main dark:text-white">12</div>
<div class="text-xs text-gray-500">已解锁</div>
</div>
<div class="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
<div class="text-2xl font-black text-gray-400">48</div>
<div class="text-xs text-gray-500">待解锁</div>
</div>
</div>
</div>
<div class="bg-gradient-to-br from-text-main to-surface-dark text-white rounded-2xl p-6 shadow-lg flex flex-col relative overflow-hidden group">
<div class="absolute right-0 top-0 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-400/30 transition-all"></div>
<h3 class="text-lg font-bold mb-4 flex items-center gap-2">
<span class="material-symbols-outlined text-yellow-400">star</span>
                            稀有收藏
                        </h3>
<div class="flex -space-x-3 overflow-hidden py-2 pl-2">
<div class="size-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center shadow-lg relative z-30" title="百词斩">
<span class="text-xl">⚔️</span>
</div>
<div class="size-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center shadow-lg relative z-20" title="坚持不懈">
<span class="text-xl">🔥</span>
</div>
<div class="size-10 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center shadow-lg relative z-10" title="夜猫子">
<span class="text-xl">🦉</span>
</div>
<div class="size-10 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center shadow-lg text-xs font-bold text-gray-400 relative z-0">
                                +2
                            </div>
</div>
<button class="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm border border-white/10">
                            查看详情
                        </button>
</div>
</aside>
<div class="flex-1 bg-surface-light dark:bg-surface-dark rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 overflow-y-auto custom-scrollbar relative">
<div class="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
<div class="relative z-10 flex flex-col gap-10">
<section>
<div class="flex items-center gap-3 mb-6">
<div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
<span class="material-symbols-outlined">school</span>
</div>
<h3 class="text-xl font-bold text-text-main dark:text-white">学习里程碑</h3>
<div class="h-px bg-gray-200 dark:bg-gray-700 flex-1 ml-4"></div>
</div>
<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
<div class="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-medal hover:shadow-xl transition-all cursor-pointer medal-card overflow-hidden">
<div class="medal-shine"></div>
<div class="absolute top-3 right-3 text-yellow-500">
<span class="material-symbols-outlined fill-1 text-lg">check_circle</span>
</div>
<div class="aspect-square flex items-center justify-center mb-2">
<div class="text-6xl drop-shadow-lg filter hue-rotate-15">📚</div>
</div>
<div class="text-center">
<h4 class="font-bold text-text-main dark:text-white">初出茅庐</h4>
<p class="text-xs text-gray-500 mt-1">完成首个词书单元</p>
<div class="mt-2 text-xs font-bold text-primary bg-primary/10 py-1 px-2 rounded-full inline-block">2023.10.15</div>
</div>
</div>
<div class="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 border-2 border-yellow-400/30 shadow-medal hover:shadow-xl transition-all cursor-pointer medal-card overflow-hidden">
<div class="medal-shine"></div>
<div class="absolute top-0 left-0 bg-yellow-400 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg z-10">RARE</div>
<div class="aspect-square flex items-center justify-center mb-2 relative">
<div class="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full scale-75 animate-pulse"></div>
<div class="text-7xl drop-shadow-2xl z-10 transform group-hover:scale-110 transition-transform">🏆</div>
</div>
<div class="text-center relative z-10">
<h4 class="font-bold text-text-main dark:text-white">百词斩</h4>
<p class="text-xs text-gray-500 mt-1">单日掌握100个新词</p>
<div class="mt-2 text-xs font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 py-1 px-2 rounded-full inline-block">2023.11.02</div>
</div>
</div>
<div class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 opacity-60 hover:opacity-100 transition-opacity cursor-pointer border-dashed">
<div class="absolute top-3 right-3 text-gray-400">
<span class="material-symbols-outlined text-lg">lock</span>
</div>
<div class="aspect-square flex items-center justify-center mb-2 grayscale group-hover:grayscale-0 transition-all duration-500">
<div class="text-6xl opacity-50">🎓</div>
</div>
<div class="text-center">
<h4 class="font-bold text-gray-500 dark:text-gray-400">学富五车</h4>
<p class="text-xs text-gray-400 mt-1">累计掌握5000词</p>
<div class="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
<div class="bg-primary h-full rounded-full" style="width: 45%"></div>
</div>
<p class="text-[10px] text-right text-gray-400 mt-1">2250/5000</p>
</div>
</div>
<div class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 opacity-60 hover:opacity-100 transition-opacity cursor-pointer border-dashed">
<div class="absolute top-3 right-3 text-gray-400">
<span class="material-symbols-outlined text-lg">lock</span>
</div>
<div class="aspect-square flex items-center justify-center mb-2 grayscale group-hover:grayscale-0 transition-all duration-500">
<div class="text-6xl opacity-50">🧠</div>
</div>
<div class="text-center">
<h4 class="font-bold text-gray-500 dark:text-gray-400">记忆大师</h4>
<p class="text-xs text-gray-400 mt-1">连续复习30天</p>
<div class="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
<div class="bg-primary h-full rounded-full" style="width: 10%"></div>
</div>
<p class="text-[10px] text-right text-gray-400 mt-1">3/30</p>
</div>
</div>
</div>
</section>
<section>
<div class="flex items-center gap-3 mb-6">
<div class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
<span class="material-symbols-outlined">diversity_3</span>
</div>
<h3 class="text-xl font-bold text-text-main dark:text-white">社交达人</h3>
<div class="h-px bg-gray-200 dark:bg-gray-700 flex-1 ml-4"></div>
</div>
<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
<div class="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-medal hover:shadow-xl transition-all cursor-pointer medal-card overflow-hidden">
<div class="medal-shine"></div>
<div class="aspect-square flex items-center justify-center mb-2">
<div class="text-6xl drop-shadow-md">🤝</div>
</div>
<div class="text-center">
<h4 class="font-bold text-text-main dark:text-white">友谊之手</h4>
<p class="text-xs text-gray-500 mt-1">添加10位好友</p>
<div class="mt-2 text-xs font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 py-1 px-2 rounded-full inline-block">已获得</div>
</div>
</div>
<div class="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-medal hover:shadow-xl transition-all cursor-pointer medal-card overflow-hidden">
<div class="medal-shine"></div>
<div class="aspect-square flex items-center justify-center mb-2">
<div class="text-6xl drop-shadow-md">📢</div>
</div>
<div class="text-center">
<h4 class="font-bold text-text-main dark:text-white">分享大使</h4>
<p class="text-xs text-gray-500 mt-1">分享学习进度5次</p>
<div class="mt-2 text-xs font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/30 py-1 px-2 rounded-full inline-block">已获得</div>
</div>
</div>
<div class="group relative bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 opacity-60 border-dashed">
<div class="absolute top-3 right-3 text-gray-400">
<span class="material-symbols-outlined text-lg">lock</span>
</div>
<div class="aspect-square flex items-center justify-center mb-2 grayscale">
<div class="text-6xl opacity-50">👑</div>
</div>
<div class="text-center">
<h4 class="font-bold text-gray-500 dark:text-gray-400">榜上有名</h4>
<p class="text-xs text-gray-400 mt-1">进入排行榜前3名</p>
<div class="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
<div class="bg-primary h-full rounded-full" style="width: 80%"></div>
</div>
<p class="text-[10px] text-right text-gray-400 mt-1">Rank 4</p>
</div>
</div>
</div>
</section>
<section>
<div class="flex items-center gap-3 mb-6">
<div class="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
<span class="material-symbols-outlined">swords</span>
</div>
<h3 class="text-xl font-bold text-text-main dark:text-white">竞技之王</h3>
<div class="h-px bg-gray-200 dark:bg-gray-700 flex-1 ml-4"></div>
</div>
<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
<div class="group relative bg-gradient-to-b from-red-50 to-white dark:from-red-900/10 dark:to-gray-800 rounded-2xl p-4 border-2 border-red-200 dark:border-red-900/30 shadow-medal hover:shadow-xl transition-all cursor-pointer medal-card overflow-hidden">
<div class="medal-shine"></div>
<div class="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10">EPIC</div>
<div class="aspect-square flex items-center justify-center mb-2 relative">
<div class="absolute inset-0 bg-red-500/10 blur-xl rounded-full scale-75 animate-pulse"></div>
<div class="text-7xl drop-shadow-2xl z-10">🥊</div>
</div>
<div class="text-center relative z-10">
<h4 class="font-bold text-text-main dark:text-white">不败战神</h4>
<p class="text-xs text-gray-500 mt-1">PK 连胜10场</p>
<div class="mt-2 text-xs font-bold text-red-600 bg-red-100 dark:bg-red-900/30 py-1 px-2 rounded-full inline-block">2023.12.01</div>
</div>
</div>
<div class="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-medal hover:shadow-xl transition-all cursor-pointer medal-card overflow-hidden">
<div class="medal-shine"></div>
<div class="aspect-square flex items-center justify-center mb-2">
<div class="text-6xl drop-shadow-md">⚡</div>
</div>
<div class="text-center">
<h4 class="font-bold text-text-main dark:text-white">极速反应</h4>
<p class="text-xs text-gray-500 mt-1">10秒内完成挑战</p>
<div class="mt-2 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 py-1 px-2 rounded-full inline-block">已获得</div>
</div>
</div>
</div>
</section>
<div class="h-10"></div>
</div>
</div>
</div>
</div>
</main>
</div>

</body></html>

<!-- 平板端响应式主页 -->
<!DOCTYPE html>
<html class="light" lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>PK 竞技场 (Q版对战版) - 单词大师</title>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800&amp;family=Noto+Sans+SC:wght@400;500;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#58cc02",
                        "primary-dark": "#46a302",
                        "primary-light": "#89e219",
                        "secondary": "#ce82ff",
                        "secondary-dark": "#a568cc",
                        "danger": "#ff4b4b",
                        "danger-dark": "#ea2b2b",
                        "warning": "#ffc800",
                        "warning-dark": "#e5b100",
                        "background": "#f0f4f8",
                        "surface": "#ffffff",
                        "text-main": "#3c3c3c",
                        "text-muted": "#777777",
                        "vs-blue": "#1cb0f6",
                        "vs-blue-dark": "#1899d6",
                        "vs-red": "#ff4b4b",
                        "vs-red-dark": "#ea2b2b",
                        "card-border": "#e5e5e5",
                        "btn-shadow": "rgba(0,0,0,0.2)"
                    },
                    fontFamily: {
                        "display": ['Lexend', 'Noto Sans SC', 'sans-serif'],
                        "body": ['Noto Sans SC', 'sans-serif'],
                    },
                    boxShadow: {
                        'cartoon': '0 4px 0 0 rgba(0,0,0,0.1)',
                        'cartoon-hover': '0 2px 0 0 rgba(0,0,0,0.1)',
                        'btn': '0 4px 0 0',
                        'card': '0 4px 0 0 #e5e5e5',
                    },
                    borderRadius: {
                        'xl': '1rem',
                        '2xl': '1.25rem',
                        '3xl': '1.5rem',
                    }
                },
            },
        }
    </script>
<style>
body {
    font-family: "Lexend", "Noto Sans SC", sans-serif;
    background-color: #f0f4f8;
    background-image: 
        radial-gradient(circle at 10% 20%, rgba(88, 204, 2, 0.05) 0%, transparent 20%),
        radial-gradient(circle at 90% 80%, rgba(28, 176, 246, 0.05) 0%, transparent 20%);
}
.btn-3d {
    transition: all 0.1s ease;
    transform: translateY(0);
}
.btn-3d:active {
    transform: translateY(4px);
    box-shadow: none !important;
    border-bottom-width: 0 !important;
    margin-top: 4px;
}
.battle-progress-stripe {
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
    );
    background-size: 1rem 1rem;
}
.vs-badge-pop {
    animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite alternate;
}
@keyframes pop {
    0% { transform: scale(1) rotate(-5deg); }
    100% { transform: scale(1.1) rotate(5deg); }
}
</style>
</head>
<body class="bg-[#f0f4f8] text-text-main h-screen flex flex-col overflow-hidden">
<header class="h-20 shrink-0 flex items-center justify-between px-6 bg-white border-b-2 border-gray-200 relative z-20 shadow-sm">
<div class="flex items-center gap-4">
<button class="btn-3d w-10 h-10 rounded-2xl bg-white border-2 border-gray-200 shadow-[0_4px_0_0_#e5e5e5] text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center justify-center">
<span class="material-symbols-outlined font-bold">close</span>
</button>
<div class="h-4 w-48 bg-gray-200 rounded-full overflow-hidden relative border-2 border-gray-200">
<div class="absolute top-0 left-0 h-full bg-warning rounded-full" style="width: 60%">
<div class="absolute top-1 right-2 w-full h-1 bg-white/30 rounded-full"></div>
</div>
</div>
</div>
<div class="absolute left-1/2 -translate-x-1/2 top-4">
<div class="bg-white border-2 border-gray-200 rounded-2xl px-6 py-2 shadow-[0_4px_0_0_#e5e5e5] flex items-center gap-2">
<span class="material-symbols-outlined text-warning text-3xl font-bold animate-pulse" style="font-variation-settings: 'FILL' 1;">timer</span>
<span class="text-3xl font-black font-mono text-warning">08</span>
</div>
</div>
<div class="flex items-center gap-4">
<div class="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-xl border-2 border-blue-100">
<span class="material-symbols-outlined text-vs-blue text-sm">wifi</span>
<span class="text-sm font-bold text-vs-blue">24ms</span>
</div>
<button class="btn-3d w-10 h-10 rounded-2xl bg-white border-2 border-gray-200 shadow-[0_4px_0_0_#e5e5e5] text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center justify-center">
<span class="material-symbols-outlined font-bold">pause</span>
</button>
</div>
</header>
<main class="flex-1 flex flex-col relative overflow-hidden bg-[#f0f4f8]">
<div class="h-[40%] min-h-[220px] flex items-center justify-center relative px-8 py-4 bg-gradient-to-b from-blue-50 to-transparent">
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
<div class="w-16 h-16 bg-gradient-to-b from-warning to-warning-dark rounded-full flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.1)] border-4 border-white transform scale-125 vs-badge-pop">
<span class="text-3xl font-black italic text-white drop-shadow-md stroke-black" style="-webkit-text-stroke: 1px rgba(0,0,0,0.1);">VS</span>
</div>
</div>
<div class="flex-1 flex flex-col items-center justify-center relative z-10 pr-12">
<div class="relative group">
<div class="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-vs-blue bg-white relative z-10 overflow-hidden shadow-[0_6px_0_0_#1899d6]">
<img alt="Player Avatar" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtCQWnWbfqF1yy6Vetyrn6YYPXBVY1tjcUuVitm6pyQY8TX_lwdlZWRBv_sQnex0zzE4IEiCl95XSoN9Z7tUHqcpRPmWknhIb0yPC30_oaV1V_jWuIN4iF8gJAIFqGhQSeGLQbQb1ZcSuHzU5klQwGDT_ScF6ow6uMED0rqCwjMnQeSwt-vvJw6a28jDbUavegZ8xC2yCoW_D_xPYAC-m6trin9FDWOaVgutVo8aQhgz-OU8hiaSlDuzL5bZpLrRiyOc4aEG7IwZ7Q"/>
</div>
<div class="absolute -bottom-3 -right-2 bg-vs-blue text-white text-xs font-bold px-3 py-1 rounded-xl border-2 border-white shadow-sm transform rotate-3">
                    Lv.12
                </div>
</div>
<div class="mt-4 text-center">
<h3 class="text-xl font-extrabold text-slate-700">我 (You)</h3>
<div class="flex flex-col items-center gap-1 mt-1">
<div class="h-3 w-28 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-100">
<div class="h-full bg-vs-blue w-[85%] rounded-full"></div>
</div>
<span class="text-sm text-vs-blue font-bold">1240 XP</span>
</div>
</div>
<div class="absolute left-0 top-0 transform -rotate-12 animate-bounce bg-warning border-2 border-warning-dark rounded-2xl p-2 shadow-[0_4px_0_0_#e5b100]">
<div class="text-2xl font-black text-white drop-shadow-sm leading-none">x5</div>
<div class="text-[10px] font-black text-white/90 uppercase tracking-wide text-center leading-none">Combo</div>
</div>
</div>
<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-8 bg-gray-200 rounded-full border-4 border-white shadow-[0_4px_0_0_rgba(0,0,0,0.05)] overflow-hidden z-0">
<div class="absolute left-0 top-0 bottom-0 bg-vs-blue battle-progress-stripe transition-all duration-500 ease-out border-r-4 border-white flex items-center justify-end pr-2" style="width: 55%">
<span class="material-symbols-outlined text-white/50 text-xl font-black animate-pulse">chevron_right</span>
</div>
<div class="absolute right-0 top-0 bottom-0 bg-vs-red battle-progress-stripe transition-all duration-500 ease-out border-l-4 border-white flex items-center justify-start pl-2" style="width: 45%">
<span class="material-symbols-outlined text-white/50 text-xl font-black animate-pulse">chevron_left</span>
</div>
<div class="absolute left-1/2 top-0 bottom-0 w-1 bg-white/50 z-10 transform -translate-x-1/2"></div>
</div>
<div class="flex-1 flex flex-col items-center justify-center relative z-10 pl-12">
<div class="relative">
<div class="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-vs-red bg-white relative z-10 overflow-hidden shadow-[0_6px_0_0_#ea2b2b] grayscale-[30%]">
<img alt="Opponent Avatar" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsnZGPCkRWuCUR0HNpaXuaCqmDVXAft7mGKne0oytIKy_4-3ZUUYx_m5ysvK52T-NRqK9leGliGFUJ5m7OdNGLK1WL6Mc56VnYf0evA0jReBjNOziUASNN1btDBeUQV5yt6tg9oZc7SGvaA6CAyFllp-GbhYFgLddsOK7EX6JEX_D9LWHcaEAFRsfsTgD0QbS7ayPdPh7nOeNk4_JEd42R4glxb9OSf9su116-RnGB3meAz83rqRz5G3amZh3FyrbsuWLYnSk90sV-"/>
</div>
<div class="absolute -bottom-3 -left-2 bg-vs-red text-white text-xs font-bold px-3 py-1 rounded-xl border-2 border-white shadow-sm transform -rotate-3">
                    Lv.11
                </div>
</div>
<div class="mt-4 text-center">
<h3 class="text-xl font-extrabold text-slate-700">Bob Chen</h3>
<div class="flex flex-col items-center gap-1 mt-1">
<div class="h-3 w-28 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-100">
<div class="h-full bg-vs-red w-[70%] rounded-full"></div>
</div>
<span class="text-sm text-vs-red font-bold">1150 XP</span>
</div>
</div>
</div>
</div>
<div class="flex-1 bg-white rounded-t-[3rem] p-6 md:p-8 flex flex-col gap-6 shadow-[0_-8px_0_0_rgba(0,0,0,0.05)] border-t-2 border-gray-100 relative z-20">
<div class="flex flex-col items-center justify-center pt-2 pb-4 relative">
<span class="text-xs font-black text-gray-400 tracking-widest uppercase mb-3 bg-gray-100 px-3 py-1 rounded-full">单词释义</span>
<div class="bg-white border-2 border-gray-200 rounded-3xl p-6 w-full max-w-2xl text-center shadow-[0_4px_0_0_#e5e5e5] relative">
<h2 class="text-4xl md:text-5xl font-black text-slate-700 mb-3 tracking-tight">Ambiguous</h2>
<div class="flex items-center justify-center gap-3 text-gray-400">
<span class="bg-blue-100 text-vs-blue px-2 py-1 rounded-lg text-sm font-bold">adj.</span>
<button class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-blue-100 hover:text-vs-blue transition-colors">
<span class="material-symbols-outlined text-xl">volume_up</span>
</button>
<span class="font-mono text-base font-medium text-slate-500">/æmˈbɪɡjuəs/</span>
</div>
</div>
</div>
<div class="grid grid-cols-2 gap-4 md:gap-6 w-full max-w-4xl mx-auto h-full pb-6">
<button class="group relative flex items-center p-4 md:p-5 rounded-2xl bg-white border-2 border-gray-200 shadow-[0_4px_0_0_#e5e5e5] hover:bg-green-50 hover:border-primary hover:shadow-[0_4px_0_0_#58cc02] active:translate-y-[4px] active:shadow-none active:border-b-2 transition-all duration-200">
<div class="size-10 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-400 font-bold flex items-center justify-center mr-4 text-xl group-hover:bg-primary group-hover:text-white group-hover:border-primary-dark transition-colors">A</div>
<span class="text-lg md:text-xl font-bold text-slate-600 group-hover:text-primary-dark">模棱两可的</span>
<div class="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
<span class="material-symbols-outlined text-3xl font-bold">check_circle</span>
</div>
</button>
<button class="group relative flex items-center p-4 md:p-5 rounded-2xl bg-white border-2 border-gray-200 shadow-[0_4px_0_0_#e5e5e5] hover:bg-red-50 hover:border-danger hover:shadow-[0_4px_0_0_#ff4b4b] active:translate-y-[4px] active:shadow-none active:border-b-2 transition-all duration-200">
<div class="size-10 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-400 font-bold flex items-center justify-center mr-4 text-xl group-hover:bg-danger group-hover:text-white group-hover:border-danger-dark transition-colors">B</div>
<span class="text-lg md:text-xl font-bold text-slate-600 group-hover:text-danger-dark">雄心勃勃的</span>
<div class="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity text-danger">
<span class="material-symbols-outlined text-3xl font-bold">cancel</span>
</div>
</button>
<button class="group relative flex items-center p-4 md:p-5 rounded-2xl bg-white border-2 border-gray-200 shadow-[0_4px_0_0_#e5e5e5] hover:bg-gray-50 hover:border-gray-300 hover:shadow-[0_4px_0_0_#d1d5db] active:translate-y-[4px] active:shadow-none active:border-b-2 transition-all duration-200">
<div class="size-10 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-400 font-bold flex items-center justify-center mr-4 text-xl group-hover:bg-gray-200 group-hover:text-gray-600 transition-colors">C</div>
<span class="text-lg md:text-xl font-bold text-slate-600">友好的</span>
</button>
<button class="group relative flex items-center p-4 md:p-5 rounded-2xl bg-white border-2 border-gray-200 shadow-[0_4px_0_0_#e5e5e5] hover:bg-gray-50 hover:border-gray-300 hover:shadow-[0_4px_0_0_#d1d5db] active:translate-y-[4px] active:shadow-none active:border-b-2 transition-all duration-200">
<div class="size-10 rounded-xl bg-gray-100 border-2 border-gray-200 text-gray-400 font-bold flex items-center justify-center mr-4 text-xl group-hover:bg-gray-200 group-hover:text-gray-600 transition-colors">D</div>
<span class="text-lg md:text-xl font-bold text-slate-600">巨大的</span>
</button>
</div>
<div class="w-full max-w-4xl mx-auto flex items-center justify-between px-2 pb-2">
<div class="flex gap-4">
<button class="relative btn-3d p-3 rounded-2xl bg-vs-blue border-b-4 border-vs-blue-dark text-white hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale">
<span class="material-symbols-outlined text-2xl drop-shadow-md">bolt</span>
<span class="absolute -top-2 -right-2 bg-warning text-white text-xs font-black px-2 py-0.5 rounded-lg border-2 border-white shadow-sm transform rotate-12">3</span>
<span class="sr-only">Freeze Time</span>
</button>
<button class="relative btn-3d p-3 rounded-2xl bg-secondary border-b-4 border-secondary-dark text-white hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale" disabled="">
<span class="material-symbols-outlined text-2xl drop-shadow-md">visibility_off</span>
<span class="absolute -top-2 -right-2 bg-gray-400 text-white text-xs font-black px-2 py-0.5 rounded-lg border-2 border-white shadow-sm transform -rotate-6">0</span>
<span class="sr-only">Hide Options</span>
</button>
</div>
<div class="text-right">
<p class="text-xs text-gray-400 font-extrabold uppercase tracking-wider mb-1">连胜 Streak</p>
<div class="flex gap-2 bg-gray-100 p-2 rounded-xl border border-gray-200">
<span class="material-symbols-outlined text-lg text-primary" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
<span class="material-symbols-outlined text-lg text-primary" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
<span class="material-symbols-outlined text-lg text-primary" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
<span class="material-symbols-outlined text-lg text-primary animate-bounce" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
<span class="material-symbols-outlined text-lg text-gray-300">local_fire_department</span>
</div>
</div>
</div>
</div>
</main>

</body></html>

<!-- Word Collection Backpack -->
<!DOCTYPE html>
<html class="light" lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>平板端错题本 (简约版) - Vocab Master 2.0</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Lexend:wght@100..900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#25f46a",
                        "primary-dark": "#1bc452",
                        "background-light": "#f5f8f6",
                        "background-dark": "#102216",
                        "surface-light": "#ffffff",
                        "surface-dark": "#1a2e22",
                        "text-main-light": "#0d1c12",
                        "text-main-dark": "#f0fdf4",
                        "text-sub-light": "#499c65",
                        "text-sub-dark": "#86efac",
                        "error-light": "#fee2e2",
                        "error-text": "#ef4444",
                    },
                    fontFamily: {
                        "display": ["Lexend", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "1rem", "lg": "1.5rem", "xl": "2rem", "2xl": "3rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
</head>
<body class="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col transition-colors duration-200 pb-24 md:pb-0">
<header class="sticky top-0 z-50 w-full border-b border-[#e7f4eb] dark:border-[#1f3526] bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md px-6 py-4">
<div class="max-w-7xl mx-auto flex items-center justify-between">
<div class="flex items-center gap-3 text-text-main-light dark:text-text-main-dark">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors md:hidden">
<span class="material-symbols-outlined">arrow_back</span>
</button>
<div class="size-8 text-primary">
<svg class="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_6_535)">
<path clip-rule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fill-rule="evenodd"></path>
</g>
<defs>
<clipPath id="clip0_6_535"><rect fill="white" height="48" width="48"></rect></clipPath>
</defs>
</svg>
</div>
<h2 class="text-xl font-bold tracking-tight hidden sm:block">Vocab Master</h2>
</div>
<div class="flex items-center gap-4">
<div class="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-1.5 rounded-full border border-red-100 dark:border-red-900/30">
<span class="material-symbols-outlined text-red-500 text-[20px]">error_circle_rounded</span>
<span class="text-red-600 dark:text-red-400 font-bold text-sm">待攻克: 12 题</span>
</div>
<div class="size-10 rounded-full bg-gray-100 dark:bg-surface-dark overflow-hidden ring-2 ring-primary">
<div class="w-full h-full bg-cover bg-center" style='background-image: url("https://lh3.googleusercontent.com/aida-public/AB6AXuCOcPYkbHybQtEi0ECIuC0ZFpHYHHftBB8--sC3A9pThj6yUiw7yIseROT9j4cODf4TIZ6FKl2_MwnmMQ8_mMD6BT-wt1wjqUI6UTsULVcQNu89pc61lIVv5rngCmt6U1H6_9vXuGd-CiSD_1hclLcOZWyeNp85fOIJmxiCFqccKMaO8EAqhx5R_D5j5YVV4Uydm1xlkB2PE4T9PzBskIkgQdRPLMPiu4b92ui78xRtGScX2uiW6MavlUK8-1nymJZTFobuPsAftcrv");'></div>
</div>
</div>
</div>
</header>
<main class="flex-1 flex flex-col w-full px-4 py-6 md:px-8 max-w-5xl mx-auto space-y-6">
<div class="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h1 class="text-text-main-light dark:text-text-main-dark text-3xl md:text-4xl font-black tracking-tight mb-2">错题本</h1>
<p class="text-text-sub-light dark:text-text-sub-dark font-medium">针对薄弱环节进行专项强化。</p>
</div>
<div class="flex gap-2">
<button class="bg-primary hover:bg-primary-dark text-text-main-light font-bold py-2.5 px-6 rounded-xl shadow-sm shadow-primary/30 transition-all flex items-center gap-2">
<span class="material-symbols-outlined">play_circle</span>
                    开始专项练习
                </button>
</div>
</div>
<section class="w-full bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-6 items-center">
<div class="flex-1 w-full space-y-2">
<div class="flex justify-between items-center mb-1">
<span class="text-sm font-bold text-gray-500 dark:text-gray-400">错题攻克进度</span>
<span class="text-lg font-black text-text-main-light dark:text-text-main-dark">12 <span class="text-gray-400 text-sm font-normal">/ 45</span></span>
</div>
<div class="h-4 w-full bg-gray-100 dark:bg-background-dark rounded-full overflow-hidden">
<div class="h-full bg-red-500 rounded-full transition-all duration-500 ease-out relative" style="width: 26%">
<div class="absolute inset-0 bg-white/20"></div>
</div>
</div>
<p class="text-xs text-text-sub-light dark:text-text-sub-dark mt-2">加油！消灭这些错题，你的词汇量将更上一层楼。</p>
</div>
<div class="flex gap-4 shrink-0">
<div class="text-center px-4 py-2 bg-background-light dark:bg-background-dark rounded-2xl">
<div class="text-red-500 font-black text-xl">8</div>
<div class="text-xs font-bold text-gray-500 dark:text-gray-400">高频错误</div>
</div>
<div class="text-center px-4 py-2 bg-background-light dark:bg-background-dark rounded-2xl">
<div class="text-orange-500 font-black text-xl">4</div>
<div class="text-xs font-bold text-gray-500 dark:text-gray-400">易混淆</div>
</div>
</div>
</section>
<section class="w-full flex flex-col gap-4">
<div class="sticky top-[80px] z-30 bg-background-light dark:bg-background-dark pb-2 pt-1">
<div class="flex gap-2 overflow-x-auto no-scrollbar pb-2">
<button class="whitespace-nowrap px-4 py-2 rounded-xl bg-text-main-light dark:bg-white text-white dark:text-text-main-light font-bold text-sm shadow-sm">
                        全部错题
                    </button>
<button class="whitespace-nowrap px-4 py-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        听力错误
                    </button>
<button class="whitespace-nowrap px-4 py-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        拼写错误
                    </button>
<button class="whitespace-nowrap px-4 py-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        释义错误
                    </button>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
<article class="group bg-surface-light dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden">
<div class="absolute top-0 right-0 p-0">
<div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl">错误 3 次</div>
</div>
<div class="flex flex-col gap-2 mb-4">
<div class="flex items-baseline gap-2">
<h3 class="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Ambiguous</h3>
</div>
<div class="flex items-center gap-2">
<span class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-md">adj.</span>
<p class="text-text-sub-light dark:text-text-sub-dark text-base font-medium">模棱两可的，含糊不清的</p>
</div>
</div>
<div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
<button class="size-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-background-dark text-primary hover:bg-primary/10 transition-colors" title="发音">
<span class="material-symbols-outlined">volume_up</span>
</button>
<button class="h-9 px-6 rounded-full bg-white dark:bg-surface-dark border-2 border-primary text-primary hover:bg-primary hover:text-text-main-light font-bold text-sm transition-all shadow-sm flex items-center gap-1">
<span>练习</span>
</button>
</div>
</article>
<article class="group bg-surface-light dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden">
<div class="absolute top-0 right-0 p-0">
<div class="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl">错误 2 次</div>
</div>
<div class="flex flex-col gap-2 mb-4">
<div class="flex items-baseline gap-2">
<h3 class="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Notorious</h3>
</div>
<div class="flex items-center gap-2">
<span class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-md">adj.</span>
<p class="text-text-sub-light dark:text-text-sub-dark text-base font-medium">声名狼藉的，臭名昭著的</p>
</div>
</div>
<div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
<button class="size-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-background-dark text-primary hover:bg-primary/10 transition-colors" title="发音">
<span class="material-symbols-outlined">volume_up</span>
</button>
<button class="h-9 px-6 rounded-full bg-white dark:bg-surface-dark border-2 border-primary text-primary hover:bg-primary hover:text-text-main-light font-bold text-sm transition-all shadow-sm flex items-center gap-1">
<span>练习</span>
</button>
</div>
</article>
<article class="group bg-surface-light dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden">
<div class="absolute top-0 right-0 p-0">
<div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl">错误 5 次</div>
</div>
<div class="flex flex-col gap-2 mb-4">
<div class="flex items-baseline gap-2">
<h3 class="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Subtle</h3>
</div>
<div class="flex items-center gap-2">
<span class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-md">adj.</span>
<p class="text-text-sub-light dark:text-text-sub-dark text-base font-medium">微妙的，不易察觉的</p>
</div>
</div>
<div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
<button class="size-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-background-dark text-primary hover:bg-primary/10 transition-colors" title="发音">
<span class="material-symbols-outlined">volume_up</span>
</button>
<button class="h-9 px-6 rounded-full bg-white dark:bg-surface-dark border-2 border-primary text-primary hover:bg-primary hover:text-text-main-light font-bold text-sm transition-all shadow-sm flex items-center gap-1">
<span>练习</span>
</button>
</div>
</article>
<article class="group bg-surface-light dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden">
<div class="absolute top-0 right-0 p-0">
<div class="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl">错误 1 次</div>
</div>
<div class="flex flex-col gap-2 mb-4">
<div class="flex items-baseline gap-2">
<h3 class="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Conscious</h3>
</div>
<div class="flex items-center gap-2">
<span class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-md">adj.</span>
<p class="text-text-sub-light dark:text-text-sub-dark text-base font-medium">有意识的，神志清醒的</p>
</div>
</div>
<div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
<button class="size-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-background-dark text-primary hover:bg-primary/10 transition-colors" title="发音">
<span class="material-symbols-outlined">volume_up</span>
</button>
<button class="h-9 px-6 rounded-full bg-white dark:bg-surface-dark border-2 border-primary text-primary hover:bg-primary hover:text-text-main-light font-bold text-sm transition-all shadow-sm flex items-center gap-1">
<span>练习</span>
</button>
</div>
</article>
<article class="group bg-surface-light dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden">
<div class="absolute top-0 right-0 p-0">
<div class="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl">错误 4 次</div>
</div>
<div class="flex flex-col gap-2 mb-4">
<div class="flex items-baseline gap-2">
<h3 class="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Acquire</h3>
</div>
<div class="flex items-center gap-2">
<span class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-md">v.</span>
<p class="text-text-sub-light dark:text-text-sub-dark text-base font-medium">获得，取得，学到</p>
</div>
</div>
<div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
<button class="size-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-background-dark text-primary hover:bg-primary/10 transition-colors" title="发音">
<span class="material-symbols-outlined">volume_up</span>
</button>
<button class="h-9 px-6 rounded-full bg-white dark:bg-surface-dark border-2 border-primary text-primary hover:bg-primary hover:text-text-main-light font-bold text-sm transition-all shadow-sm flex items-center gap-1">
<span>练习</span>
</button>
</div>
</article>
<article class="group bg-surface-light dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden">
<div class="absolute top-0 right-0 p-0">
<div class="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl">错误 2 次</div>
</div>
<div class="flex flex-col gap-2 mb-4">
<div class="flex items-baseline gap-2">
<h3 class="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Mischievous</h3>
</div>
<div class="flex items-center gap-2">
<span class="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold px-2 py-0.5 rounded-md">adj.</span>
<p class="text-text-sub-light dark:text-text-sub-dark text-base font-medium">淘气的，恶作剧的</p>
</div>
</div>
<div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 dark:border-gray-800">
<button class="size-10 rounded-full flex items-center justify-center bg-gray-50 dark:bg-background-dark text-primary hover:bg-primary/10 transition-colors" title="发音">
<span class="material-symbols-outlined">volume_up</span>
</button>
<button class="h-9 px-6 rounded-full bg-white dark:bg-surface-dark border-2 border-primary text-primary hover:bg-primary hover:text-text-main-light font-bold text-sm transition-all shadow-sm flex items-center gap-1">
<span>练习</span>
</button>
</div>
</article>
</div>
<div class="flex justify-center pb-8">
<div class="flex gap-2 items-center text-text-sub-light dark:text-text-sub-dark font-medium animate-pulse">
<span class="material-symbols-outlined animate-spin">refresh</span>
                    加载更多错题...
                </div>
</div>
</section>
</main>
<nav class="fixed bottom-0 left-0 w-full bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 z-50 px-6 py-2 pb-5 md:pb-2">
<div class="max-w-xl mx-auto flex justify-between items-center">
<button class="flex flex-col items-center justify-center gap-1 p-2 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[28px]">home</span>
<span class="text-[10px] font-bold">主页</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 p-2 text-primary">
<span class="material-symbols-outlined text-[28px] fill-current">menu_book</span>
<span class="text-[10px] font-bold">错题本</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 p-2 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[28px]">leaderboard</span>
<span class="text-[10px] font-bold">排行榜</span>
</button>
<button class="flex flex-col items-center justify-center gap-1 p-2 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[28px]">person</span>
<span class="text-[10px] font-bold">我的</span>
</button>
</div>
</nav>

</body></html>