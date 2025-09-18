<template>
  <div class="chart-container h-full w-full">
    <canvas ref="chartContainer"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
    default: () => []
  },
  currentPrice: {
    type: String,
    required: false,
    default: ''
  }
})

const chartContainer = ref(null)
let chart = null

// Prepare chart data
const prepareChartData = () => {
  // Sort transactions by date
  const sortedTransactions = [...props.transactions].sort((a, b) => {
    return new Date(a.purchase_date) - new Date(b.purchase_date)
  })
  
  // Extract labels (dates) and data (prices)
  const labels = sortedTransactions.map(t => {
    // Format date for display
    const date = new Date(t.purchase_date.replace(', ', ' '))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })
  
  // Purchase prices
  const purchasePrices = sortedTransactions.map(t => {
    // Extract number from price string
    return parseFloat(t.purchase_price_per_gram.replace(/[^\d.]/g, ''))
  })
  
  // Current values
  const currentValues = sortedTransactions.map(t => {
    return parseFloat(t.current_price_per_gram.replace(/[^\d.]/g, ''))
  })
  
  return {
    labels,
    purchasePrices,
    currentValues
  }
}

// Create or update chart
const createChart = async () => {
  if (props.transactions.length === 0 || !chartContainer.value) return
  
  try {
    // Wait for DOM to update
    await nextTick()
    
    // Dynamically import Chart.js to avoid SSR issues
    const { default: Chart } = await import('chart.js/auto')
    
    const { labels, purchasePrices, currentValues } = prepareChartData()
    
    // Get current price as number
    const currentPriceValue = props.currentPrice ? 
      parseFloat(props.currentPrice.replace(/[^\d.]/g, '')) : 
      Math.max(...currentValues)
    
    // Destroy existing chart if it exists
    if (chart) {
      chart.destroy()
    }
    
    // Create new chart
    const ctx = chartContainer.value.getContext('2d')
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Purchase Price',
            data: purchasePrices,
            borderColor: '#d97706',
            backgroundColor: 'rgba(217, 119, 6, 0.1)',
            tension: 0.2,
            pointRadius: 4,
            pointBackgroundColor: '#d97706'
          },
          {
            label: 'Current Value',
            data: currentValues,
            borderColor: '#059669',
            backgroundColor: 'rgba(5, 150, 105, 0.1)',
            tension: 0.2,
            pointRadius: 4,
            pointBackgroundColor: '#059669'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                label += new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'LAK'
                }).format(context.parsed.y);
                return label;
              }
            }
          },
          legend: {
            position: 'top',
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'LAK',
                  maximumFractionDigits: 0
                }).format(value);
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
  if (props.transactions.length > 0) {
    createChart()
  }
})

watch(() => props.transactions, () => {
  createChart()
}, { deep: true })

// Clean up chart when component is unmounted
onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>