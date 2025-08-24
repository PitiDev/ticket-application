<!-- components/TicketStatusChart.vue -->
<script setup>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, Title)

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
})

const chartData = computed(() => {
  return {
    labels: props.data.map(item => item.status),
    datasets: [
      {
        backgroundColor: [
          '#3B82F6', // blue for New
          '#F59E0B', // amber for In Progress
          '#10B981', // green for Resolved
          '#6B7280'  // gray for Closed
        ],
        data: props.data.map(item => item.count)
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    },
    title: {
      display: true,
      text: 'Tickets by Status'
    }
  }
}
</script>

<template>
  <Pie
    :data="chartData"
    :options="chartOptions"
    :height="200"
  />
</template>