<!-- Home Dashboard (Red Style) -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Vocab Master 2.0 - Home Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#2badee",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101c22",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
                    boxShadow: {
                        'soft': '0 4px 20px -2px rgba(43, 173, 238, 0.1)',
                        'card': '0 2px 12px -2px rgba(0, 0, 0, 0.05)',
                    }
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar hide for cleaner UI */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        body {
            font-family: 'Inter', sans-serif;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 min-h-screen flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl">
<!-- Status Bar Area (Visual Shim) -->
<div class="h-12 w-full bg-transparent flex items-end justify-between px-6 pb-2 text-xs font-medium text-slate-500 z-50">
<span>9:41</span>
<div class="flex gap-1.5 items-center">
<span class="material-icons-round text-sm">signal_cellular_alt</span>
<span class="material-icons-round text-sm">wifi</span>
<span class="material-icons-round text-sm">battery_full</span>
</div>
</div>
<!-- Main Content Area -->
<main class="flex-1 px-5 pt-4 pb-24 overflow-y-auto no-scrollbar flex flex-col gap-6">
<!-- Top Header & Profile -->
<header class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="relative">
<div class="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
<img alt="Smiling user avatar profile picture" class="w-full h-full object-cover" data-alt="User profile avatar smiling woman" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7xRs0Xoiz4MFLHSUQd6IEVmw0MFyCpn9Yt-jSOe7ffAHGMNdqgObBgtwtVChZZnv8qd8_GyrJigBaBqt0e5HRwFbThua-lnFB8DXbHLtSGd1-tukbQCTGE-BEZ7hEPYkdW_AbZaQFHXK5tDvHsphOFWhSbrMow-fw47a8Q8_2Nynncorj0N9T6udOOVhsiVg2EwigzyvpEMkFJvPzwZU7JizG2SOXvNpxZ9eAaa774kJJy3i7OOO4UrhaaandzdE9xVL2C5NY418"/>
</div>
<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white">
                        5
                    </div>
</div>
<div>
<h1 class="font-display font-bold text-lg leading-tight">Hi, Sarah</h1>
<p class="font-display text-xs text-slate-400 font-medium">Ready to learn?</p>
</div>
</div>
<!-- Streak Badge -->
<div class="bg-white dark:bg-slate-800 rounded-full px-3 py-1.5 shadow-card flex items-center gap-1.5">
<span class="material-icons-round text-orange-500 text-lg">local_fire_department</span>
<span class="font-display font-bold text-sm text-slate-700 dark:text-slate-200">7 Days</span>
</div>
</header>
<!-- Progress Card -->
<section class="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-soft border border-slate-100 dark:border-slate-700">
<div class="flex justify-between items-end mb-2">
<div>
<span class="text-xs font-semibold text-primary uppercase tracking-wider">Daily Goal</span>
<h2 class="text-2xl font-display font-bold mt-1">15/20 <span class="text-base font-medium text-slate-400">words</span></h2>
</div>
<div class="text-right">
<span class="text-sm font-medium text-slate-500 dark:text-slate-400">75%</span>
</div>
</div>
<div class="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
<div class="h-full bg-primary rounded-full w-3/4 shadow-[0_0_10px_rgba(43,173,238,0.5)]"></div>
</div>
<p class="mt-3 text-xs text-slate-400 text-center font-medium">Keep it up! You're almost there.</p>
</section>
<!-- Main Action: Start Learning -->
<section class="flex flex-col items-center">
<button class="group relative w-full aspect-[2/1] bg-gradient-to-br from-primary to-[#5bcbf5] rounded-2xl shadow-lg shadow-primary/30 active:scale-95 transition-all duration-200 overflow-hidden flex flex-col items-center justify-center text-white">
<div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
<div class="absolute top-0 right-0 p-20 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
<span class="material-icons-round text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">play_circle_filled</span>
<span class="font-display font-bold text-xl tracking-wide">Start Learning</span>
<span class="text-sm font-medium text-white/80 mt-1">Unit 4: Travel &amp; Lifestyle</span>
</button>
</section>
<!-- Feature Grid -->
<section class="grid grid-cols-2 gap-4">
<!-- PK Arena -->
<div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-card border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
<div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
<span class="material-icons-round text-primary text-2xl">swords</span>
</div>
<span class="font-display font-semibold text-sm">PK Arena</span>
</div>
<!-- Stats -->
<div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-card border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
<div class="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
<span class="material-icons-round text-purple-500 text-2xl">bar_chart</span>
</div>
<span class="font-display font-semibold text-sm">Stats</span>
</div>
<!-- Review -->
<div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-card border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
<div class="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-colors">
<span class="material-icons-round text-amber-500 text-2xl">history</span>
</div>
<span class="font-display font-semibold text-sm">Review</span>
</div>
<!-- Achievements -->
<div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-card border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer group">
<div class="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
<span class="material-icons-round text-pink-500 text-2xl">emoji_events</span>
</div>
<span class="font-display font-semibold text-sm">Awards</span>
</div>
</section>
<!-- Quick Word Card -->
<section class="mt-2">
<h3 class="font-display font-bold text-base mb-3 px-1">Word of the Day</h3>
<div class="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-soft border border-slate-100 dark:border-slate-700 relative overflow-hidden">
<div class="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
<div class="flex justify-between items-start">
<div>
<h4 class="text-2xl font-bold font-display text-primary">Serendipity</h4>
<p class="text-slate-400 text-sm italic mb-2">/ˌser.ənˈdɪp.ə.t̬i/</p>
</div>
<button class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
<span class="material-icons-round text-lg">volume_up</span>
</button>
</div>
<p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    The occurrence and development of events by chance in a happy or beneficial way.
                </p>
</div>
</section>
</main>
<!-- Bottom Navigation -->
<nav class="absolute bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-3 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-50">
<ul class="flex justify-between items-center">
<li>
<a class="flex flex-col items-center gap-1 text-primary" href="#">
<span class="material-icons-round text-2xl">home</span>
<span class="text-[10px] font-medium">Home</span>
</a>
</li>
<li>
<a class="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">
<span class="material-icons-round text-2xl">explore</span>
<span class="text-[10px] font-medium">Explore</span>
</a>
</li>
<li>
<div class="w-12 h-12 -mt-8 bg-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center border-4 border-white dark:border-slate-900 cursor-pointer hover:scale-105 transition-transform">
<span class="material-icons-round text-white text-2xl">add</span>
</div>
</li>
<li>
<a class="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">
<span class="material-icons-round text-2xl">leaderboard</span>
<span class="text-[10px] font-medium">Rank</span>
</a>
</li>
<li>
<a class="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" href="#">
<span class="material-icons-round text-2xl">person</span>
<span class="text-[10px] font-medium">Me</span>
</a>
</li>
</ul>
</nav>
</body></html>

<!-- Real-time PK Arena -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Real-time PK Arena</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script>
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    colors: {
                        "primary": "#2badee",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101c22",
                    },
                    fontFamily: {
                        "display": ["Inter", "sans-serif"]
                    },
                    borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "2xl": "2rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom styles for specific gradient texts or shadows not covered by default tailwind utilities */
        .text-gradient {
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            background-image: linear-gradient(to right, #2badee, #38bdf8);
        }
        .text-gradient-danger {
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
            background-image: linear-gradient(to right, #ef4444, #f87171);
        }
        .soft-shadow {
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col justify-center items-center text-slate-800 dark:text-slate-100 overflow-hidden relative">
<!-- Decorative background blobs -->
<div class="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
<div class="absolute bottom-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
<!-- Main Game Container (Mobile Form Factor) -->
<main class="w-full max-w-md h-screen max-h-[900px] flex flex-col relative bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sm:rounded-2xl sm:h-[90vh] sm:border sm:border-slate-200 sm:dark:border-slate-800 shadow-2xl overflow-hidden">
<!-- Header: Battle Status -->
<header class="pt-6 pb-2 px-6 flex justify-between items-start relative z-10">
<!-- User Profile (Left) -->
<div class="flex flex-col items-center gap-2 group">
<div class="relative">
<div class="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-primary to-blue-300">
<img alt="Smiling young woman avatar" class="w-full h-full object-cover rounded-full border-2 border-white dark:border-slate-800" data-alt="User avatar smiling woman" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBG60Ibr4Bw_CGtyMUgXGYLGzXibwNHEazsBfkBZf43Sj6xTPneEPviEeWOoNBs68vJsYkmpsceo_UhnsgYV7WgsYxO5pK0LpuCpg2FNEdI2grFnSgUcHc-LfNNaZBGJfQXZcYfWyuhMCUxsZwewPdF5Y0AcDJ6R9kLzMr-GtIelbUFFwP_HU-yxsetYglHR9ardZ2dtBCmx9bFqtOb53mVTU7eKi_9F5Hsm9vzKt2VAyeRAPHe08fGzHbVzizGZerBVp5fYjMHwlo"/>
</div>
<div class="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white dark:border-slate-800">YOU</div>
</div>
<div class="text-center">
<h3 class="font-bold text-slate-800 dark:text-white text-sm">Sarah</h3>
<div class="mt-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 w-16 overflow-hidden">
<div class="h-full bg-primary w-3/4 rounded-full"></div>
</div>
<p class="text-primary font-black text-xl mt-1 tracking-tight">120</p>
</div>
</div>
<!-- VS / Timer Center -->
<div class="flex flex-col items-center justify-center pt-2">
<div class="relative w-20 h-20 flex items-center justify-center">
<!-- Progress Ring SVG -->
<svg class="w-full h-full -rotate-90" viewbox="0 0 100 100">
<circle class="text-slate-200 dark:text-slate-800" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" stroke-width="6"></circle>
<circle class="text-primary transition-all duration-1000 ease-linear" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" stroke-dasharray="264" stroke-dashoffset="66" stroke-linecap="round" stroke-width="6"></circle>
</svg>
<div class="absolute inset-0 flex flex-col items-center justify-center">
<span class="text-2xl font-black text-slate-800 dark:text-white">10</span>
<span class="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Sec</span>
</div>
</div>
<div class="mt-2 px-3 py-1 bg-primary/10 rounded-full">
<span class="text-primary text-xs font-bold">Round 4/10</span>
</div>
</div>
<!-- Opponent Profile (Right) -->
<div class="flex flex-col items-center gap-2">
<div class="relative">
<div class="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-orange-400 to-red-400 grayscale-[0.3]">
<img alt="Young man avatar opponent" class="w-full h-full object-cover rounded-full border-2 border-white dark:border-slate-800" data-alt="Opponent avatar young man" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbzDm3lwOz--033yTTjN_w_MLzdH9i7JAA2eRxQPZ_jWxdg9Q4SonIWVNeQvwxl8ZNs0GcmWLtq1Lut8LpjsgtIA9ryDrfBdoyLcmOyxZD609LOeis_504AoM24NvFyHfAYPngqhRjW7PBSaNYiUBkc1f0qE6Ujj4UmalYWC3BL9MkdDYfWrAOLgNwLCftUAyyx0n5QPI2lT4W_sOUxHCQA4Yw6QboOjzXand3Rvb8tpIoNtIvd9MGYkVf7xX27aEdnuH6yvpgIEk"/>
</div>
</div>
<div class="text-center opacity-80">
<h3 class="font-bold text-slate-800 dark:text-white text-sm">Alex</h3>
<div class="mt-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 w-16 overflow-hidden">
<div class="h-full bg-orange-400 w-1/2 rounded-full"></div>
</div>
<p class="text-orange-400 font-black text-xl mt-1 tracking-tight">85</p>
</div>
</div>
</header>
<!-- Main Content Area: Question -->
<section class="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
<!-- Question Card -->
<div class="w-full bg-white dark:bg-slate-800 rounded-2xl p-8 soft-shadow text-center transform transition-transform hover:scale-[1.02] duration-300 border border-slate-100 dark:border-slate-700/50 mb-8 relative overflow-hidden">
<!-- Subtle decorative shine -->
<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
<span class="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold mb-4 tracking-wide uppercase">Adjective</span>
<h1 class="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Ambiguous</h1>
<div class="flex items-center justify-center gap-3 text-slate-400 dark:text-slate-500 mb-2">
<span class="font-mono text-lg">[æmˈbɪɡjuəs]</span>
<button class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
<span class="material-icons text-xl text-primary">volume_up</span>
</button>
</div>
</div>
<!-- Answer Grid -->
<div class="w-full grid grid-cols-2 gap-4">
<!-- Option A -->
<button class="group relative overflow-hidden bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95 text-left">
<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200 dark:bg-slate-600 group-hover:bg-primary transition-colors"></div>
<span class="text-xs font-bold text-slate-400 mb-1 block">A</span>
<span class="text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">Happy</span>
</button>
<!-- Option B (Correct) -->
<button class="group relative overflow-hidden bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95 text-left ring-2 ring-transparent focus:ring-primary">
<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200 dark:bg-slate-600 group-hover:bg-primary transition-colors"></div>
<span class="text-xs font-bold text-slate-400 mb-1 block">B</span>
<span class="text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">Unclear</span>
</button>
<!-- Option C -->
<button class="group relative overflow-hidden bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95 text-left">
<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200 dark:bg-slate-600 group-hover:bg-primary transition-colors"></div>
<span class="text-xs font-bold text-slate-400 mb-1 block">C</span>
<span class="text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">Large</span>
</button>
<!-- Option D -->
<button class="group relative overflow-hidden bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95 text-left">
<div class="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-200 dark:bg-slate-600 group-hover:bg-primary transition-colors"></div>
<span class="text-xs font-bold text-slate-400 mb-1 block">D</span>
<span class="text-lg font-bold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">Funny</span>
</button>
</div>
</section>
<!-- Footer / Bottom Status -->
<footer class="p-6 relative z-10">
<div class="flex justify-between items-end">
<!-- Combo Streak Badge -->
<div class="flex items-center gap-3">
<div class="relative group">
<div class="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-600 rounded-lg blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
<div class="relative px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center gap-2 shadow-lg transform -rotate-2">
<span class="material-icons text-white text-lg animate-pulse">local_fire_department</span>
<div>
<p class="text-[10px] text-white/80 font-bold uppercase leading-none">Streak</p>
<p class="text-white font-black text-lg leading-none">x3</p>
</div>
</div>
</div>
</div>
<!-- Tools -->
<div class="flex gap-3">
<button class="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-colors shadow-sm">
<span class="material-icons text-xl">lightbulb</span>
</button>
<button class="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500 transition-colors shadow-sm">
<span class="material-icons text-xl">flag</span>
</button>
</div>
</div>
</footer>
<!-- Background texture overlay for paper feel -->
<div class="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E');"></div>
</main>
</body></html>

<!-- Vocabulary Stats & Library -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Vocab Master 2.0 - Settings &amp; Profile</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            colors: {
              "primary": "#2badee",
              "background-light": "#f6f7f8",
              "background-dark": "#101c22",
            },
            fontFamily: {
              "display": ["Inter", "sans-serif"]
            },
            borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "2xl": "2rem", "full": "9999px"},
            boxShadow: {
                'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
            }
          },
        },
      }
    </script>
<style>
        /* Custom Toggle Switch Style */
        .toggle-checkbox:checked {
            right: 0;
            border-color: #2badee;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #2badee;
        }
        /* Hide scrollbar for clean look */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-100 min-h-screen antialiased flex flex-col items-center">
<!-- Mobile Container -->
<main class="w-full max-w-md mx-auto min-h-screen bg-background-light dark:bg-background-dark pb-24 relative shadow-2xl overflow-hidden">
<!-- Header / Nav Area (Simulating iOS + WeChat Capsule spacing) -->
<header class="pt-14 pb-4 px-6 sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md flex justify-between items-center">
<h1 class="text-xl font-bold tracking-tight">Me</h1>
<!-- Simulated WeChat Capsule Space -->
<div class="w-20"></div>
</header>
<!-- Content Scroll Area -->
<div class="px-5 space-y-6">
<!-- 1. Profile Card -->
<section class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-soft flex items-center justify-between relative overflow-hidden group">
<!-- Decorative background blob -->
<div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
<div class="flex items-center gap-4 z-10">
<div class="relative">
<div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl shadow-sm border-2 border-white dark:border-gray-700">
                            😎
                        </div>
<div class="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white dark:border-gray-800">
                            LVL 12
                        </div>
</div>
<div>
<h2 class="text-lg font-bold text-gray-900 dark:text-white leading-tight">Learning Legend</h2>
<p class="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">450 Words Mastered</p>
</div>
</div>
<button class="z-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-200 text-xs font-semibold py-2 px-4 rounded-full transition-colors duration-200">
                    Edit Profile
                </button>
</section>
<!-- 2. Learning Preferences -->
<section class="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden">
<div class="px-6 py-4 border-b border-gray-50 dark:border-gray-700/50">
<h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Preferences</h3>
</div>
<!-- Toggle Item -->
<div class="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-primary">
<span class="material-icons-round text-lg">volume_up</span>
</div>
<span class="text-sm font-medium">Sound Effects</span>
</div>
<div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input checked="" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-200 dark:border-gray-600 checked:right-0 checked:border-primary transition-all duration-300 left-0 top-0.5 z-10" id="toggle-sound" name="toggle" type="checkbox"/>
<label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer transition-colors duration-300" for="toggle-sound"></label>
</div>
</div>
<!-- Toggle Item -->
<div class="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500">
<span class="material-icons-round text-lg">notifications_active</span>
</div>
<span class="text-sm font-medium">Push Reminders</span>
</div>
<div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-200 dark:border-gray-600 transition-all duration-300 left-0 top-0.5 z-10" id="toggle-push" name="toggle" type="checkbox"/>
<label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-200 dark:bg-gray-700 cursor-pointer transition-colors duration-300" for="toggle-push"></label>
</div>
</div>
<!-- Navigation Item -->
<button class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
<span class="material-icons-round text-lg">flag</span>
</div>
<span class="text-sm font-medium">Daily Goal</span>
</div>
<div class="flex items-center gap-2 text-gray-400">
<span class="text-xs font-semibold text-primary">20 Words</span>
<span class="material-icons-round text-lg">chevron_right</span>
</div>
</button>
</section>
<!-- 3. Appearance (Theme) -->
<section class="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6">
<div class="flex items-center justify-between mb-4">
<h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Theme</h3>
</div>
<div class="grid grid-cols-3 gap-3">
<!-- Option 1: Academic -->
<button class="relative flex flex-col items-center gap-2 group">
<div class="w-full aspect-[4/3] rounded-xl border-2 border-transparent group-hover:border-primary/30 bg-gray-50 dark:bg-gray-700 overflow-hidden relative shadow-sm transition-all">
<div class="absolute inset-0 bg-white/50 dark:bg-gray-600/50 m-2 rounded-lg"></div>
<div class="absolute bottom-2 left-2 w-8 h-2 bg-gray-200 dark:bg-gray-500 rounded-full"></div>
</div>
<span class="text-xs font-medium text-gray-500 dark:text-gray-400">Academic</span>
</button>
<!-- Option 2: Vibrant (Active) -->
<button class="relative flex flex-col items-center gap-2">
<div class="w-full aspect-[4/3] rounded-xl border-2 border-primary bg-primary/5 dark:bg-primary/20 overflow-hidden relative shadow-sm">
<div class="absolute inset-0 bg-gradient-to-br from-primary/40 to-primary/10 m-2 rounded-lg"></div>
<div class="absolute bottom-2 left-2 w-8 h-2 bg-primary/40 rounded-full"></div>
<!-- Checkmark Badge -->
<div class="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
<span class="material-icons-round text-[12px]">check</span>
</div>
</div>
<span class="text-xs font-bold text-primary">Vibrant</span>
</button>
<!-- Option 3: Dark -->
<button class="relative flex flex-col items-center gap-2 group">
<div class="w-full aspect-[4/3] rounded-xl border-2 border-transparent group-hover:border-primary/30 bg-gray-900 overflow-hidden relative shadow-sm transition-all">
<div class="absolute inset-0 bg-gray-800 m-2 rounded-lg"></div>
<div class="absolute bottom-2 left-2 w-8 h-2 bg-gray-700 rounded-full"></div>
</div>
<span class="text-xs font-medium text-gray-500 dark:text-gray-400">Dark</span>
</button>
</div>
</section>
<!-- 4. Support & Actions -->
<section class="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden">
<button class="w-full flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
<span class="text-sm font-medium">About Vocab Master</span>
<span class="material-icons-round text-lg text-gray-400">chevron_right</span>
</button>
<button class="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
<span class="text-sm font-medium">Help &amp; Feedback</span>
<span class="material-icons-round text-lg text-gray-400">chevron_right</span>
</button>
</section>
<!-- Log Out Button -->
<div class="pt-2 pb-6 flex justify-center">
<button class="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors py-2 px-6">
                    Log Out
                </button>
</div>
<!-- Version Number -->
<div class="text-center pb-8">
<p class="text-[10px] text-gray-300 dark:text-gray-600 font-mono">v2.0.4 (Build 892)</p>
</div>
</div>
<!-- 5. Bottom Navigation Bar -->
<nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe pt-2 px-6 z-30">
<div class="flex justify-between items-center h-16">
<button class="flex flex-col items-center gap-1 w-12 group">
<span class="material-icons-round text-2xl text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">school</span>
<span class="text-[10px] font-medium text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">Learn</span>
</button>
<button class="flex flex-col items-center gap-1 w-12 group">
<span class="material-icons-round text-2xl text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">leaderboard</span>
<span class="text-[10px] font-medium text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">Rank</span>
</button>
<!-- Floating FAB Action (Optional gamification element) -->
<div class="-mt-8">
<button class="w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/40 flex items-center justify-center text-white hover:scale-105 transition-transform">
<span class="material-icons-round text-3xl">play_arrow</span>
</button>
</div>
<button class="flex flex-col items-center gap-1 w-12 group">
<span class="material-icons-round text-2xl text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors">chat_bubble</span>
<span class="text-[10px] font-medium text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">Social</span>
</button>
<button class="flex flex-col items-center gap-1 w-12">
<span class="material-icons-round text-2xl text-primary animate-pulse">person</span>
<span class="text-[10px] font-bold text-primary">Me</span>
</button>
</div>
<!-- Safe area spacing for iOS home indicator -->
<div class="h-5 w-full"></div>
</nav>
</main>
<script>
        // Simple dark mode toggle for demonstration purpose
        // In a real app this would likely be handled by state management
        const toggleTheme = (theme) => {
            const html = document.documentElement;
            if (theme === 'dark') {
                html.classList.add('dark');
            } else {
                html.classList.remove('dark');
            }
        };

        // You could attach event listeners here to the theme buttons if needed for interactivity demo
    </script>
</body></html>

<!-- Achievement Badge Wall -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Detailed Word Card - Vocab Master 2.0</title>
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet"/>
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
                        "primary": "#2badee",
                        "background-light": "#f6f7f8",
                        "background-dark": "#101c22",
                    },
                    fontFamily: {
                        "display": ["Newsreader", "serif"]
                    },
                    borderRadius: {"DEFAULT": "0.5rem", "lg": "1rem", "xl": "1.5rem", "full": "9999px"},
                },
            },
        }
    </script>
<style>
        /* Custom scrollbar hiding for cleaner look */
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        /* Soft shadow typical of Red-style posts */
        .red-shadow {
            box-shadow: 0 4px 20px -2px rgba(43, 173, 238, 0.15);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background-light dark:bg-background-dark font-display antialiased text-gray-800 dark:text-gray-100 min-h-screen flex justify-center items-center p-0 sm:p-4">
<!-- Mobile Container -->
<div class="w-full max-w-md h-[100dvh] sm:h-[850px] bg-white dark:bg-[#1a2c35] sm:rounded-[2.5rem] relative flex flex-col overflow-hidden shadow-2xl border-0 sm:border border-gray-100 dark:border-gray-800">
<!-- Decorative Background Element -->
<div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
<!-- 1. Top Navigation Bar -->
<header class="flex justify-between items-center p-6 z-10">
<button class="p-2 -ml-2 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-300">
<span class="material-icons-round text-3xl">chevron_left</span>
</button>
<div class="flex gap-2">
<button class="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-300">
<span class="material-icons-round">bookmark_border</span>
</button>
<button class="p-2 -mr-2 rounded-full hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-300">
<span class="material-icons-round">ios_share</span>
</button>
</div>
</header>
<!-- Main Content Scroll Area -->
<main class="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 z-10">
<!-- 2. Header Section: Word & Phonetics -->
<div class="mt-4 mb-8 relative">
<div class="flex items-start justify-between">
<div>
<h1 class="text-5xl font-medium tracking-tight text-gray-900 dark:text-white mb-3">
                            Perspective
                        </h1>
<div class="flex items-center gap-3">
<div class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
<span class="text-primary text-sm font-medium">/pərˈspektɪv/</span>
</div>
<button class="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform">
<span class="material-icons-round text-lg">volume_up</span>
</button>
</div>
</div>
<!-- Decorative Icon/Badge -->
<div class="hidden sm:block">
<span class="text-4xl filter grayscale opacity-50">🖼️</span>
</div>
</div>
<!-- Tags Row -->
<div class="flex flex-wrap gap-2 mt-6">
<span class="px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 rounded text-sm font-medium border border-orange-100 dark:border-orange-800/30">
                        Noun
                    </span>
<span class="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded text-sm font-medium border border-blue-100 dark:border-blue-800/30">
                        Academic
                    </span>
<span class="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded text-sm font-medium border border-purple-100 dark:border-purple-800/30">
                        HSK 6
                    </span>
</div>
</div>
<!-- Divider -->
<hr class="border-gray-100 dark:border-gray-800 mb-8"/>
<!-- 3. Meaning & Context Section (The "Post" Body) -->
<div class="space-y-8">
<!-- Definition Block 1 -->
<div class="group">
<div class="flex gap-3 mb-2">
<span class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mt-1">1</span>
<p class="text-xl text-gray-800 dark:text-gray-100 leading-relaxed font-medium">
                            A particular attitude toward or way of regarding something; a point of view.
                        </p>
</div>
<!-- Example Card -->
<div class="ml-9 mt-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
<div class="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
<p class="text-lg italic text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                            "Most literature is written from a male <span class="text-primary font-medium not-italic bg-primary/10 px-1 rounded">perspective</span>."
                        </p>
<div class="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-sans">
<span class="material-icons-round text-sm">translate</span> Translation
                        </div>
</div>
</div>
<!-- Definition Block 2 -->
<div class="group">
<div class="flex gap-3 mb-2">
<span class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mt-1">2</span>
<p class="text-xl text-gray-800 dark:text-gray-100 leading-relaxed font-medium">
                            True understanding of the relative importance of things.
                        </p>
</div>
<!-- Example Card -->
<div class="ml-9 mt-4 p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
<div class="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
<p class="text-lg italic text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                            "We must keep a sense of <span class="text-primary font-medium not-italic bg-primary/10 px-1 rounded">perspective</span> about these minor problems."
                        </p>
<div class="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-sans">
<span class="material-icons-round text-sm">translate</span> Translation
                       </div>
</div>
</div>
<!-- Image Context (Red-style aesthetic visual) -->
<div class="ml-9 mt-6 rounded-xl overflow-hidden relative aspect-video shadow-sm">
<img alt="Person looking through camera lens representing perspective" class="w-full h-full object-cover hover:scale-105 transition-transform duration-700" data-alt="Person looking through camera lens representing perspective" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC02lSgoba5tkJG4wL0ovXVqImrVHxBmoew7b_M08b-uq_QbASc__y1yqxLKH-Cuu4D3gmHDXqNjXvwu3_pzfIuT_RZogd0vWY7QNBkxJooJJoSLTRh0rIywkDbrLv8AJsDyq6zdD6vv3IOEszIqb83EM_VAKoaT4xw-aZNN6M93Mf7lrcrhZdEUJ73UyqQh1fFL4r5_fVrU_chYC4ehv9PMPAwYaUGDcil5wTGY6h0rcwrNEsWweg270wyL_f8xbBZL5Futaa8Asw"/>
<div class="absolute bottom-2 right-2 bg-black/40 backdrop-blur-md text-white text-xs px-2 py-1 rounded font-sans">
                        Visual Memory
                    </div>
</div>
<!-- Synonyms / Related -->
<div class="ml-9 pt-4">
<h3 class="text-sm uppercase tracking-widest text-gray-400 mb-3 font-sans font-semibold">Synonyms ✨</h3>
<div class="flex flex-wrap gap-2">
<button class="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:border-primary/50 transition-colors shadow-sm">
                            Viewpoint
                        </button>
<button class="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:border-primary/50 transition-colors shadow-sm">
                            Outlook
                        </button>
<button class="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm hover:border-primary/50 transition-colors shadow-sm">
                            Stance
                        </button>
</div>
</div>
</div>
</main>
<!-- 4. Bottom Action Bar (Sticky Footer) -->
<div class="absolute bottom-0 left-0 w-full bg-white/80 dark:bg-[#1a2c35]/90 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 p-4 pb-8 sm:pb-4 z-20">
<div class="flex items-center gap-4">
<!-- Secondary Action: Favorite -->
<button class="flex flex-col items-center gap-1 group">
<div class="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center group-active:scale-90 transition-transform border border-gray-100 dark:border-gray-700">
<span class="material-icons-round text-gray-400 group-hover:text-red-500 transition-colors text-2xl">favorite_border</span>
</div>
</button>
<!-- Primary Action: Mastered -->
<button class="flex-1 h-14 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group active:scale-[0.98] transition-all">
<span class="text-lg font-medium tracking-wide">Mark as Mastered</span>
<span class="material-icons-round group-hover:translate-x-1 transition-transform">check_circle</span>
</button>
</div>
</div>
</div>
</body></html>