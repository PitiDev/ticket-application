<template>
  <div class="chart-container h-full w-full">
    <canvas ref="chartContainer"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'

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
    
    // Modern gradient backgrounds
    const ctx = chartContainer.value.getContext('2d')
    
    // Create purchase price gradient
    const purchaseGradient = ctx.createLinearGradient(0, 0, 0, 400)
    purchaseGradient.addColorStop(0, 'rgba(234, 179, 8, 0.6)')  // Amber
    purchaseGradient.addColorStop(1, 'rgba(234, 179, 8, 0.05)')
    
    // Create current value gradient
    const valueGradient = ctx.createLinearGradient(0, 0, 0, 400)
    valueGradient.addColorStop(0, 'rgba(16, 185, 129, 0.6)')  // Emerald
    valueGradient.addColorStop(1, 'rgba(16, 185, 129, 0.05)')
    
    // Create new chart with enhanced styling
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Purchase Price',
            data: purchasePrices,
            borderColor: '#eab308',
            backgroundColor: purchaseGradient,
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#eab308',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: '#eab308',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2,
            pointShadowOffsetX: 1,
            pointShadowOffsetY: 1,
            pointShadowBlur: 5,
            pointShadowColor: 'rgba(0, 0, 0, 0.2)'
          },
          {
            label: 'Current Value',
            data: currentValues,
            borderColor: '#10b981',
            backgroundColor: valueGradient,
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#10b981',
            pointBorderWidth: 2,
            pointHoverBackgroundColor: '#10b981',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2,
            pointShadowOffsetX: 1,
            pointShadowOffsetY: 1,
            pointShadowBlur: 5,
            pointShadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(17, 24, 39, 0.9)',
            titleColor: '#ffffff',
            titleFont: {
              size: 13,
              weight: 'bold'
            },
            bodyColor: '#ffffff',
            bodyFont: {
              size: 12
            },
            padding: 12,
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            usePointStyle: true,
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
            align: 'end',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15,
              boxWidth: 8,
              boxHeight: 8,
              color: '#4b5563',
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 11
              },
              padding: 8
            }
          },
          y: {
            beginAtZero: false,
            grid: {
              color: 'rgba(226, 232, 240, 0.6)',
              drawBorder: false
            },
            ticks: {
              color: '#6b7280',
              font: {
                size: 11
              },
              padding: 8,
              callback: function(value) {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'LAK',
                  maximumFractionDigits: 0,
                  notation: 'compact'
                }).format(value);
              }
            }
          }
        },
        elements: {
          line: {
            borderJoinStyle: 'round'
          }
        },
        layout: {
          padding: {
            top: 10,
            right: 10,
            bottom: 10,
            left: 10
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