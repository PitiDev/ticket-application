<template>
  <div class="chart-container h-full w-full">
    <canvas ref="chartContainer"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  totalGold: {
    type: Number,
    required: true,
    default: 0
  },
  profitableWeight: {
    type: Number,
    required: true,
    default: 0
  }
})

const chartContainer = ref(null)
let chart = null

const createChart = async () => {
  if (props.totalGold === 0 || !chartContainer.value) return
  
  try {
    // Dynamically import Chart.js to avoid SSR issues
    const { default: Chart } = await import('chart.js/auto')
    
    // Calculate percentages
    const profitablePercentage = (props.profitableWeight / props.totalGold) * 100
    const nonProfitablePercentage = 100 - profitablePercentage
    
    // Destroy existing chart if it exists
    if (chart) {
      chart.destroy()
    }
    
    // Wait for DOM to update
    await nextTick()
    
    // Create new chart
    const ctx = chartContainer.value.getContext('2d')
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Profitable', 'Non-Profitable'],
        datasets: [{
          data: [profitablePercentage, nonProfitablePercentage],
          backgroundColor: [
            'rgba(5, 150, 105, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ],
          borderColor: [
            'rgb(5, 150, 105)',
            'rgb(239, 68, 68)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw.toFixed(1) + '%';
                return `${label}: ${value}`;
              }
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Error creating chart:', error)
  }
}

// Initialize and update chart when props change
onMounted(async () => {
  // Wait for DOM to be fully rendered
  await nextTick()
  createChart()
})

watch([() => props.totalGold, () => props.profitableWeight], () => {
  createChart()
})

// Clean up chart when component is unmounted
onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>