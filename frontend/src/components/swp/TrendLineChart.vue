<template>
  <div class="trend-chart-wrap">
    <h3 class="chart-title">Visualisasi Trend Kinerja</h3>
    <div class="chart-container">
      <Line
        :data="chartData"
        :options="chartOptions"
        v-if="chartData.labels.length > 0"
      />
      <div v-else class="empty-chart">
        Belum ada data untuk ditampilkan dalam grafik
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useSwpStore } from '@/stores/swp.store';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const store = useSwpStore();

const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  tahun: {
    type: Number,
    required: true
  }
});

// Nama-nama bulan
const bulanNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// ── KALKULASI TREND PER BULAN ──────────────────────────────
function calculateMonthlyTrend(rows, tahun) {
  const trendsByMonth = {};

  // Inisialisasi untuk setiap bulan
  for (let i = 0; i < 12; i++) {
    trendsByMonth[i] = {
      trend8: [], // Trend RKAP
      trend9: [], // Trend Bulan Terakhir
      trend10: [] // Trend Tahun Lalu
    };
  }

  // Proses setiap row/indikator
  rows.forEach(row => {
    if (!row.period_data) return;

    for (let month = 1; month <= 12; month++) {
      const monthKey = `${tahun}-${String(month).padStart(2, '0')}`;
      const currentMonthValue = row.period_data[monthKey];

      if (!currentMonthValue) continue;

      // Trend 8: Current Month / RKAP
      if (row.rkap_tahun_ini && row.rkap_tahun_ini !== 0) {
        const trend8 = currentMonthValue / row.rkap_tahun_ini;
        trendsByMonth[month - 1].trend8.push(trend8);
      }

      // Trend 9: Current Month / Previous Month (same year)
      if (month > 1) {
        const prevMonthKey = `${tahun}-${String(month - 1).padStart(2, '0')}`;
        const prevMonthValue = row.period_data[prevMonthKey];
        if (prevMonthValue && prevMonthValue !== 0) {
          const trend9 = currentMonthValue / prevMonthValue;
          trendsByMonth[month - 1].trend9.push(trend9);
        }
      } else {
        // Jika bulan 1 (Januari), bandingkan dengan Desember tahun lalu
        const prevMonthKey = `${tahun - 1}-12`;
        const prevMonthValue = row.period_data[prevMonthKey];
        if (prevMonthValue && prevMonthValue !== 0) {
          const trend9 = currentMonthValue / prevMonthValue;
          trendsByMonth[month - 1].trend9.push(trend9);
        }
      }

      // Trend 10: Current Month / Same Month Last Year
      const sameMonthLastYearKey = `${tahun - 1}-${String(month).padStart(2, '0')}`;
      const sameMonthLastYearValue = row.period_data[sameMonthLastYearKey];
      if (sameMonthLastYearValue && sameMonthLastYearValue !== 0) {
        const trend10 = currentMonthValue / sameMonthLastYearValue;
        trendsByMonth[month - 1].trend10.push(trend10);
      }
    }
  });

  // Hitung rata-rata untuk setiap trend tiap bulan
  const averageTrends = {};
  for (let i = 0; i < 12; i++) {
    const trend8Values = trendsByMonth[i].trend8;
    const trend9Values = trendsByMonth[i].trend9;
    const trend10Values = trendsByMonth[i].trend10;

    averageTrends[i] = {
      trend8: trend8Values.length > 0 
        ? trend8Values.reduce((a, b) => a + b, 0) / trend8Values.length 
        : null,
      trend9: trend9Values.length > 0 
        ? trend9Values.reduce((a, b) => a + b, 0) / trend9Values.length 
        : null,
      trend10: trend10Values.length > 0 
        ? trend10Values.reduce((a, b) => a + b, 0) / trend10Values.length 
        : null
    };
  }

  return averageTrends;
}

const trendData = computed(() => {
  return calculateMonthlyTrend(props.rows, props.tahun);
});

// ── CHART DATA & OPTIONS ───────────────────────────────────
const chartData = computed(() => {
  const trend8Data = [];
  const trend9Data = [];
  const trend10Data = [];

  for (let i = 0; i < 12; i++) {
    trend8Data.push(trendData.value[i]?.trend8 ?? null);
    trend9Data.push(trendData.value[i]?.trend9 ?? null);
    trend10Data.push(trendData.value[i]?.trend10 ?? null);
  }

  return {
    labels: bulanNames,
    datasets: [
      {
        label: ['Trend: Realisasi (Bulan Saat ini)', ': RKAP (tahun saat ini)'],
        data: trend8Data,
        borderColor: '#3b82f6', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#1e40af',
        pointBorderWidth: 2,
        pointHoverRadius: 7
      },
      {
        label: ['Trend: Realisasi (Bulan Saat ini)', ': Realisasi (Bulan Terakhir)'],
        data: trend9Data,
        borderColor: '#ef4444', // Red
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#b91c1c',
        pointBorderWidth: 2,
        pointHoverRadius: 7
      },
      {
        label: ['Trend: Realisasi (Bulan Saat ini)', ': Realisasi (Bulan Saat ini,', 'tahun lalu)'],
        data: trend10Data,
        borderColor: '#10b981', // Green
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#047857',
        pointBorderWidth: 2,
        pointHoverRadius: 7
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: {
      right: 20
    }
  },
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: {
        font: { size: 12, weight: '500' },
        padding: 20,
        usePointStyle: true,
        pointStyle: 'line',
        boxWidth: 20,
        boxHeight: 3
      }
    },
    title: {
      display: false
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 13, weight: 'bold' },
      bodyFont: { size: 12 },
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) label += ': ';
          if (context.parsed.y !== null) {
            label += context.parsed.y.toFixed(3);
          }
          return label;
        }
      }
    }
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Bulan',
        font: { size: 13, weight: 'bold' },
        color: '#374151'
      },
      ticks: {
        font: { size: 11 }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: true
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Nilai Trend',
        font: { size: 13, weight: 'bold' },
        color: '#374151'
      },
      beginAtZero: false,
      ticks: {
        font: { size: 11 },
        callback: function(value) {
          return value.toFixed(2);
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: true
      }
    }
  }
};
</script>

<style scoped>
.trend-chart-wrap {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e3a5f;
  margin-bottom: 16px;
}

.chart-container {
  position: relative;
  width: 100%;
  height: 400px;
}

.empty-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  font-size: 14px;
  background: #f9fafb;
  border-radius: 6px;
}
</style>
