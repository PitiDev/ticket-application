<template>
  <div class="trading-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="title-area">
        <h1>LBI Gold Price</h1>
        <span class="live-badge">● LIVE</span>
      </div>
      
      <div class="price-display" v-if="latestPrice">
        <div class="current-price" :class="priceChangeClass">
          {{ formatPrice(latestPrice.close) }}
        </div>
        <div class="price-change" :class="priceChangeClass">
          {{ priceChange }}
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards" v-if="stats">
      <div class="stat-card">
        <div class="stat-label">High</div>
        <div class="stat-value">{{ formatPrice(stats.high) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Low</div>
        <div class="stat-value">{{ formatPrice(stats.low) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Buy Rate</div>
        <div class="stat-value green">{{ formatPrice(latestPrice?.buy_rate || 0) }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sell Rate</div>
        <div class="stat-value red">{{ formatPrice(latestPrice?.sell_rate || 0) }}</div>
      </div>
    </div>

    <!-- Chart Controls -->
    <div class="chart-controls">
      <div class="control-group">
        <label>Chart Type:</label>
        <div class="btn-group">
          <button 
            v-for="type in chartTypes" 
            :key="type.value"
            @click="changeChartType(type.value)"
            :class="{ active: selectedChartType === type.value }"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <div class="control-group">
        <label>Indicators:</label>
        <div class="checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="indicators.sma20" @change="updateChart" />
            <span>MA 20</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="indicators.sma50" @change="updateChart" />
            <span>MA 50</span>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="indicators.ema" @change="updateChart" />
            <span>EMA 12</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Chart Area -->
    <ClientOnly>
      <div class="chart-area">
        <div v-if="loading" class="loading-overlay">
          <div class="loader"></div>
          <p>Loading data...</p>
        </div>
        <div v-else-if="error" class="error-message">
          {{ error }}
        </div>
        <canvas ref="chartCanvas" :key="chartKey" v-else></canvas>
      </div>
      <template #fallback>
        <div class="chart-area">
          <div class="loading-overlay">
            <div class="loader"></div>
            <p>Initializing...</p>
          </div>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script>
export default {
  name: 'SimpleTradingView',
  
  data() {
    return {
      chartData: [],
      latestPrice: null,
      loading: true,
      error: null,
      chart: null,
      Chart: null,
      isRendering: false,
      chartKey: 0,
      selectedChartType: 'area',
      chartTypes: [
        // { label: 'Candlestick', value: 'candlestick' },
        { label: 'Line', value: 'line' },
        { label: 'Area', value: 'area' }
      ],
      indicators: {
        sma20: false,
        sma50: false,
        ema: false
      },
      stats: null
    };
  },

  computed: {
    priceChange() {
      if (!this.chartData || this.chartData.length < 2) return '0.00%';
      
      const current = this.latestPrice.close;
      const previous = this.chartData[this.chartData.length - 2].close;
      const change = ((current - previous) / previous * 100).toFixed(2);
      
      return `${change > 0 ? '+' : ''}${change}%`;
    },
    
    priceChangeClass() {
      if (!this.chartData || this.chartData.length < 2) return '';
      
      const current = this.latestPrice.close;
      const previous = this.chartData[this.chartData.length - 2].close;
      
      return current > previous ? 'up' : current < previous ? 'down' : '';
    }
  },

  async mounted() {
    if (process.client) {
      // Import Chart.js and date adapter
      const ChartModule = await import('chart.js/auto');
      await import('chartjs-adapter-date-fns');
      this.Chart = ChartModule.default;
      await this.fetchGoldPrices();
    }
  },

  beforeUnmount() {
    if (this.chart) {
      try {
        // Stop all animations
        this.chart.stop();
        // Then destroy
        this.chart.destroy();
      } catch (e) {
        console.error('Error destroying chart:', e);
      }
      this.chart = null;
    }
  },

  methods: {
    async fetchGoldPrices() {
      try {
        this.loading = true;
        this.error = null;
        
        const response = await fetch('http://172.16.0.46:3000/api/gold/all_price');
        const result = await response.json();
        
        if (result.success && result.data.prices) {
          this.chartData = result.data.prices
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(price => ({
              x: new Date(price.timestamp),
              open: price.open,
              high: price.high,
              low: price.low,
              close: price.close,
              buy_rate: price.buy_rate,
              sell_rate: price.sell_rate,
              mid_rate: price.mid_rate
            }));
          
          this.latestPrice = this.chartData[this.chartData.length - 1];
          this.calculateStats();
          
          await this.$nextTick();
          await this.renderChart();
        } else {
          this.error = 'Failed to load price data';
        }
      } catch (err) {
        this.error = `Error: ${err.message}`;
        console.error('Error:', err);
      } finally {
        this.loading = false;
      }
    },

    calculateStats() {
      if (!this.chartData.length) return;
      
      const closes = this.chartData.map(d => d.close);
      this.stats = {
        high: Math.max(...closes),
        low: Math.min(...closes),
        avg: closes.reduce((a, b) => a + b, 0) / closes.length,
        dataPoints: this.chartData.length
      };
    },

    calculateSMA(period) {
      const data = this.chartData.map(d => d.close);
      const sma = [];
      
      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
          sma.push(null);
        } else {
          const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
          sma.push(sum / period);
        }
      }
      
      return sma;
    },

    calculateEMA(period) {
      const data = this.chartData.map(d => d.close);
      const ema = [];
      const multiplier = 2 / (period + 1);
      
      ema[0] = data[0];
      
      for (let i = 1; i < data.length; i++) {
        ema[i] = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
      }
      
      return ema;
    },

    async renderChart() {
      if (!this.Chart || this.isRendering) return;
      
      this.isRendering = true;
      
      try {
        // Wait for DOM update
        await this.$nextTick();
        
        // Check if canvas ref exists
        if (!this.$refs.chartCanvas) {
          console.warn('Canvas not found');
          this.isRendering = false;
          return;
        }
        
        const canvas = this.$refs.chartCanvas;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.warn('Canvas context not available');
          this.isRendering = false;
          return;
        }
      
      const datasets = [];
      let chartType = 'line';
      
      // Main price dataset
      if (this.selectedChartType === 'candlestick') {
        chartType = 'bar';
        
        // Simplified candlestick using bars
        datasets.push({
          label: 'Price',
          data: this.chartData.map(d => {
            const isUp = d.close >= d.open;
            return {
              x: d.x,
              y: isUp ? [d.open, d.close] : [d.close, d.open],
              // Store additional data for tooltip
              o: d.open,
              h: d.high,
              l: d.low,
              c: d.close
            };
          }),
          backgroundColor: this.chartData.map(d => 
            d.close >= d.open ? '#0ECB81' : '#F6465D'
          ),
          borderColor: this.chartData.map(d => 
            d.close >= d.open ? '#0ECB81' : '#F6465D'
          ),
          borderWidth: 2,
          barPercentage: 0.9,
          categoryPercentage: 0.8,
          borderSkipped: false
        });
      } else if (this.selectedChartType === 'line') {
        chartType = 'line';
        datasets.push({
          label: 'Close Price',
          data: this.chartData.map(d => ({ x: d.x, y: d.close })),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.1,
          fill: false,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          order: 1
        });
      } else if (this.selectedChartType === 'area') {
        chartType = 'line';
        datasets.push({
          label: 'Close Price',
          data: this.chartData.map(d => ({ x: d.x, y: d.close })),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          order: 1
        });
      }

      // Add indicators
      if (this.indicators.sma20) {
        const sma20 = this.calculateSMA(20);
        datasets.push({
          label: 'MA 20',
          data: this.chartData.map((d, i) => ({ x: d.x, y: sma20[i] })),
          borderColor: '#F59E0B',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1,
          type: 'line',
          order: 3
        });
      }

      if (this.indicators.sma50) {
        const sma50 = this.calculateSMA(50);
        datasets.push({
          label: 'MA 50',
          data: this.chartData.map((d, i) => ({ x: d.x, y: sma50[i] })),
          borderColor: '#8B5CF6',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1,
          type: 'line',
          order: 4
        });
      }

      if (this.indicators.ema) {
        const ema12 = this.calculateEMA(12);
        datasets.push({
          label: 'EMA 12',
          data: this.chartData.map((d, i) => ({ x: d.x, y: ema12[i] })),
          borderColor: '#EF4444',
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0.1,
          type: 'line',
          order: 5
        });
      }

      this.chart = new this.Chart(ctx, {
        type: chartType,
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 400,
            onComplete: () => {
              // Ensure chart is still valid after animation
              if (!this.chart) return;
            }
          },
          elements: {
            bar: {
              borderWidth: 2
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          },
          plugins: {
            filler: {
              propagate: false
            },
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#6B7280',
                usePointStyle: true,
                padding: 15,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              titleColor: '#F3F4F6',
              bodyColor: '#E5E7EB',
              borderColor: '#374151',
              borderWidth: 1,
              padding: 12,
              displayColors: true,
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  
                  // For candlestick chart
                  if (label === 'Price' && context.raw.o !== undefined) {
                    return [
                      `Open: ${this.formatPrice(context.raw.o)}`,
                      `High: ${this.formatPrice(context.raw.h)}`,
                      `Low: ${this.formatPrice(context.raw.l)}`,
                      `Close: ${this.formatPrice(context.raw.c)}`
                    ];
                  }
                  
                  // For other charts
                  const value = Array.isArray(context.parsed.y) 
                    ? this.formatPrice(context.parsed.y[1]) 
                    : this.formatPrice(context.parsed.y);
                  return `${label}: ${value}`;
                },
                title: (items) => {
                  if (items.length && items[0].parsed.x) {
                    const date = new Date(items[0].parsed.x);
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }
                  return '';
                }
              }
            }
          },
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                displayFormats: {
                  day: 'MMM dd'
                }
              },
              grid: {
                color: '#E5E7EB',
                drawBorder: false
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 11
                }
              }
            },
            y: {
              position: 'right',
              beginAtZero: false,
              grid: {
                color: '#E5E7EB',
                drawBorder: false
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 11
                },
                callback: (value) => this.formatPrice(value)
              }
            }
          }
        }
      });
      } catch (error) {
        console.error('Error rendering chart:', error);
      } finally {
        this.isRendering = false;
      }
    },

    async changeChartType(type) {
      if (this.chart) {
        // Stop animations before destroying
        this.chart.stop();
        this.chart.destroy();
        this.chart = null;
      }
      
      this.selectedChartType = type;
      this.chartKey++; // Force new canvas element
      
      // Wait for new canvas to be created
      await this.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 150));
      await this.renderChart();
    },

    async updateChart() {
      if (this.chart) {
        // Stop animations before destroying
        this.chart.stop();
        this.chart.destroy();
        this.chart = null;
      }
      
      this.chartKey++; // Force new canvas
      await this.$nextTick();
      await new Promise(resolve => setTimeout(resolve, 150));
      await this.renderChart();
    },

    formatPrice(price) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(price);
    }
  }
};
</script>

<style scoped>
.trading-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: #F9FAFB;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.title-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-area h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
}

.live-badge {
  background: #10B981;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.price-display {
  text-align: right;
}

.current-price {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.current-price.up {
  color: #10B981;
}

.current-price.down {
  color: #EF4444;
}

.price-change {
  font-size: 18px;
  font-weight: 600;
}

.price-change.up {
  color: #10B981;
}

.price-change.down {
  color: #EF4444;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.stat-value.green {
  color: #10B981;
}

.stat-value.red {
  color: #EF4444;
}

/* Chart Controls */
.chart-controls {
  display: flex;
  gap: 32px;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-group > label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.btn-group button {
  padding: 8px 16px;
  background: #F3F4F6;
  color: #374151;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-group button:hover {
  background: #E5E7EB;
}

.btn-group button.active {
  background: #3B82F6;
  color: white;
  border-color: #3B82F6;
}

.checkbox-group {
  display: flex;
  gap: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #3B82F6;
}

/* Chart Area */
.chart-area {
  position: relative;
  height: 500px;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

canvas {
  width: 100% !important;
  height: 100% !important;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  gap: 16px;
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid #E5E7EB;
  border-top-color: #3B82F6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #6B7280;
  font-size: 14px;
  margin: 0;
}

.error-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #EF4444;
  font-size: 16px;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .trading-container {
    padding: 16px;
  }

  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .price-display {
    text-align: left;
    width: 100%;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .chart-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .control-group {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }

  .chart-area {
    height: 400px;
    padding: 16px;
  }
}
</style>