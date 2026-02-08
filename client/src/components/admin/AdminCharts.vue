<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar } from 'vue-chartjs'
import { computed } from 'vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// --- User Growth Data (Line Chart) ---
const userGrowthData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'New Users',
      backgroundColor: (ctx) => {
          const canvas = ctx.chart.ctx;
          const gradient = canvas.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
          return gradient;
      },
      borderColor: '#6366f1', // Indigo-500
      pointBackgroundColor: '#6366f1',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#6366f1',
      fill: true,
      tension: 0.4,
      data: [12, 19, 15, 25, 22, 30, 45]
    }
  ]
}

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: false
    }
  },
  scales: {
    y: {
        grid: { color: '#f1f5f9', drawBorder: false }, // light-slate-100
        ticks: { font: { size: 11 }, color: '#94a3b8' } // slate-400
    },
    x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#94a3b8' }
    }
  }
}

// --- Activity Distribution (Bar Chart) ---
const activityData = {
  labels: ['General', 'TOEFL', 'GRE', 'Business'],
  datasets: [
    {
      label: 'Words Learnt Today',
      backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'],
      borderRadius: 6,
      data: [120, 85, 40, 65]
    }
  ]
}

const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    },
    scales: {
        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8' } },
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
}
</script>

<template>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
        <!-- User Growth -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-black text-xl text-slate-800 dark:text-white flex items-center gap-3">
                    <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <i class="fas fa-chart-area text-indigo-500 text-sm"></i>
                    </div>
                    用户增长趋势
                </h3>
                <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">Last 7 Days</div>
            </div>
            <div class="h-64">
                <Line :data="userGrowthData" :options="lineOptions" />
            </div>
        </div>

        <!-- Category Activity -->
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
            <div class="flex justify-between items-center mb-6">
                <h3 class="font-black text-xl text-slate-800 dark:text-white flex items-center gap-3">
                    <div class="p-2 bg-pink-50 dark:bg-pink-900/30 rounded-lg">
                        <i class="fas fa-chart-bar text-pink-500 text-sm"></i>
                    </div>
                    学习类别分布
                </h3>
                 <div class="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">Live Data</div>
            </div>
            <div class="h-64">
                <Bar :data="activityData" :options="barOptions" />
            </div>
        </div>
    </div>
</template>
