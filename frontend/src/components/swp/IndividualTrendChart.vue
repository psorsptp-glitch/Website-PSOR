<template>
  <div class="individual-chart-wrap">
    <div class="accordion-container">
      <div
        v-for="row in rows"
        :key="row.id"
        class="accordion-item"
      >
        <button
          class="accordion-header"
          @click="toggleAccordion(row.id)"
          :class="{ 'accordion-header--open': expandedId === row.id }"
        >
          <span class="accordion-icon">▶</span>
          <span class="accordion-label">
            {{ row.indikator }}
            <span v-if="row.satuan" class="accordion-unit">({{ row.satuan }})</span>
          </span>
        </button>

        <transition name="accordion-expand">
          <div v-if="expandedId === row.id" class="accordion-content">
            <Line
              :data="getChartData(row)"
              :options="chartOptions"
            />
          </div>
        </transition>
      </div>

      <div v-if="rows.length === 0" class="empty-accordion">
        Belum ada indikator untuk ditampilkan
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
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

const expandedId = ref(null);

const bulanNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function toggleAccordion(id) {
  expandedId.value = expandedId.value === id ? null : id;
}

function getChartData(row) {
  const trend8Data = [];
  const trend9Data = [];
  const trend10Data = [];

  for (let month = 1; month <= 12; month++) {
    const monthKey = `${props.tahun}-${String(month).padStart(2, '0')}`;
    const currentMonthValue = row.period_data?.[monthKey];

    // Trend 8: Current Month / RKAP
    if (currentMonthValue && row.rkap_tahun_ini && row.rkap_tahun_ini !== 0) {
      trend8Data.push(currentMonthValue / row.rkap_tahun_ini);
    } else {
      trend8Data.push(null);
    }

    // Trend 9: Current Month / Previous Month
    let trend9Value = null;
    if (currentMonthValue) {
      let prevMonthValue;
      if (month > 1) {
        const prevMonthKey = `${props.tahun}-${String(month - 1).padStart(2, '0')}`;
        prevMonthValue = row.period_data?.[prevMonthKey];
      } else {
        const prevMonthKey = `${props.tahun - 1}-12`;
        prevMonthValue = row.period_data?.[prevMonthKey];
      }
      if (prevMonthValue && prevMonthValue !== 0) {
        trend9Value = currentMonthValue / prevMonthValue;
      }
    }
    trend9Data.push(trend9Value);

    // Trend 10: Current Month / Same Month Last Year
    let trend10Value = null;
    if (currentMonthValue) {
      const sameMonthLastYearKey = `${props.tahun - 1}-${String(month).padStart(2, '0')}`;
      const sameMonthLastYearValue = row.period_data?.[sameMonthLastYearKey];
      if (sameMonthLastYearValue && sameMonthLastYearValue !== 0) {
        trend10Value = currentMonthValue / sameMonthLastYearValue;
      }
    }
    trend10Data.push(trend10Value);
  }

  return {
    labels: bulanNames,
    datasets: [
      {
        label: ['Trend: Realisasi (Bulan Saat ini)', ': RKAP (tahun saat ini)'],
        data: trend8Data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#1e40af',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      },
      {
        label: ['Trend: Realisasi (Bulan Saat ini)', ': Realisasi (Bulan Terakhir)'],
        data: trend9Data,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#b91c1c',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      },
      {
        label: ['Trend: Realisasi (Bulan Saat ini)', ': Realisasi (Bulan Saat ini,', 'tahun lalu)'],
        data: trend10Data,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#047857',
        pointBorderWidth: 2,
        pointHoverRadius: 6
      }
    ]
  };
}

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
        font: { size: 11, weight: '500' },
        padding: 15,
        usePointStyle: true,
        pointStyle: 'line',
        boxWidth: 15,
        boxHeight: 2
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 10,
      titleFont: { size: 12, weight: 'bold' },
      bodyFont: { size: 11 },
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
      ticks: {
        font: { size: 10 }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.03)',
        drawBorder: true
      }
    },
    y: {
      display: true,
      beginAtZero: false,
      ticks: {
        font: { size: 10 },
        callback: function(value) {
          return value.toFixed(2);
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.03)',
        drawBorder: true
      }
    }
  }
};
</script>

<style scoped>
.individual-chart-wrap {
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.accordion-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.accordion-item {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  background: #f9fafb;
}

.accordion-header {
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: none;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.2s ease;
}

.accordion-header:hover {
  background: #f8fafc;
}

.accordion-header--open {
  background: #eff6ff;
  border-bottom-color: #3b82f6;
}

.accordion-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 11px;
  color: #64748b;
  transition: transform 0.3s ease;
}

.accordion-header--open .accordion-icon {
  transform: rotate(90deg);
}

.accordion-label {
  flex: 1;
  text-align: left;
}

.accordion-unit {
  font-size: 11px;
  color: #94a3b8;
  margin-left: 4px;
  font-weight: normal;
}

.accordion-content {
  position: relative;
  height: 320px;
  padding: 16px;
  background: white;
}

.empty-accordion {
  padding: 24px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
}

/* Transition untuk accordion expand */
.accordion-expand-enter-active,
.accordion-expand-leave-active {
  transition: all 0.3s ease;
}

.accordion-expand-enter-from {
  opacity: 0;
  max-height: 0;
}

.accordion-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.accordion-expand-enter-to,
.accordion-expand-leave-from {
  opacity: 1;
  max-height: 600px;
}
</style>
