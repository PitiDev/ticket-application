<template>
  <div class="chart-container h-full w-full relative">
    <!-- Canvas for the chart -->
    <canvas ref="chartContainer"></canvas>
    
    <!-- Fallback content that shows when chart fails to load -->
    <div v-if="chartError" class="absolute inset-0 flex flex-col items-center justify-center">
      <div class="text-xl font-bold">{{ props.totalGold.toFixed(2) }}g</div>
      <div class="text-xs text-gray-500">total</div>
      <div class="flex items-center gap-4 mt-3">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
          <span class="text-sm">Profitable</span>
        </div>
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span class="text-sm">Non-Profitable</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'

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
const chartError = ref(false)
let chart = null

const createChart = async () => {
  if (props.totalGold === 0 || !chartContainer.value) {
    chartError.value = true
    return
  }
  
  chartError.value = false
  
  try {
    // Make sure the canvas is properly sized
    const container = chartContainer.value.parentElement
    if (container) {
      chartContainer.value.width = container.clientWidth
      chartContainer.value.height = container.clientHeight
    }
    
    // Dynamically import Chart.js to avoid SSR issues
    const { default: Chart } = await import('chart.js/auto')
    
    // Register the center text plugin
    Chart.register({
      id: 'centerText',
      beforeDraw: function(chart) {
        if (chart.config.type !== 'doughnut') return
        
        const width = chart.width
        const height = chart.height
        const ctx = chart.ctx
        
        ctx.restore()
        
        // Font settings for Total
        const fontSize = Math.min(width, height) / 12
        ctx.font = `bold ${fontSize}px Arial`
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'center'
        
        // Total gold weight in center
        ctx.fillStyle = '#4b5563'
        const text = `${props.totalGold.toFixed(2)}g`
        const textX = width / 2
        const textY = height / 2 - fontSize / 2
        ctx.fillText(text, textX, textY)
        
        // Smaller "Total" text
        ctx.font = `${fontSize * 0.6}px Arial`
        ctx.fillStyle = '#9ca3af'
        ctx.fillText('total', textX, textY + fontSize * 0.9)
        
        ctx.save()
      }
    })
    
    // Calculate percentages
    const profitablePercentage = (props.profitableWeight / props.totalGold) * 100
    const nonProfitablePercentage = 100 - profitablePercentage
    
    // Destroy existing chart if it exists
    if (chart) {
      chart.destroy()
    }
    
    // Wait for DOM to update
    await nextTick()
    
    // Get context for chart
    const ctx = chartContainer.value.getContext('2d')
    
    // Create new chart with simplified styling for better compatibility
    chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Profitable', 'Non-Profitable'],
        datasets: [{
          data: [profitablePercentage, nonProfitablePercentage],
          backgroundColor: [
            'rgba(16, 185, 129, 0.9)',  // Emerald
            'rgba(239, 68, 68, 0.9)'    // Red
          ],
          borderColor: [
            'rgb(5, 150, 105)',
            'rgb(220, 38, 38)'
          ],
          borderWidth: 2,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',  // Thinner donut for modern look
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 10,
              boxWidth: 8,
              boxHeight: 8,
              color: '#4b5563',
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || ''
                const value = context.raw.toFixed(1) + '%'
                const weightValue = (context.raw / 100 * props.totalGold).toFixed(2) + ' grams'
                return [`${label}: ${value}`, `Weight: ${weightValue}`]
              }
            }
          },
          centerText: true // Enable our custom plugin
        }
      }
    })
  } catch (error) {
    console.error('Error creating chart:', error)
    chartError.value = true
  }
}

// Initialize and update chart when props change
onMounted(async () => {
  // Wait for DOM to be fully rendered
  await nextTick()
  createChart()
  
  // Add resize handler to make chart responsive
  window.addEventListener('resize', handleResize)
})

// Resize handler
const handleResize = () => {
  if (chartContainer.value) {
    // Redraw chart on window resize
    createChart()
  }
}

watch([() => props.totalGold, () => props.profitableWeight], () => {
  createChart()
})

// Clean up chart when component is unmounted
onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
  window.removeEventListener('resize', handleResize)
})
</script>