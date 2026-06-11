<template>
    <div class="trend-card">
        <div class="trend-card__header">
            <div>
                <div class="trend-card__title">消息趋势</div>
                <div class="trend-card__sub">近 7 天每日消息量</div>
            </div>
        </div>

        <div v-if="loading" class="trend-card__skeleton" />

        <div v-else-if="empty" class="trend-card__empty">
            <el-icon :size="28"><TrendCharts /></el-icon>
            <span>暂无数据</span>
        </div>

        <div v-else ref="chartEl" class="trend-card__chart" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { TrendCharts } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

export interface TrendPoint {
    date:  string   // 'MM/DD'
    total: number
    read:  number
}

const props = defineProps<{
    data:    TrendPoint[]
    loading: boolean
}>()

const chartEl = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const empty = computed(() => !props.loading && props.data.every(d => d.total === 0))

function buildOption(data: TrendPoint[]) {
    const dates  = data.map(d => d.date)
    const totals = data.map(d => d.total)
    const reads  = data.map(d => d.read)

    return {
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#fff',
            borderColor: '#e3e3e6',
            borderWidth: 1,
            textStyle: { color: '#1d1d1f', fontSize: 13 },
            axisPointer: { lineStyle: { color: '#e3e3e6' } },
        },
        grid: { top: 16, right: 16, bottom: 28, left: 44, containLabel: false },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine:  { show: false },
            axisTick:  { show: false },
            axisLabel: { color: '#86868b', fontSize: 12, fontFamily: 'SF Pro Text, system-ui' },
            splitLine: { show: false },
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            axisLine:  { show: false },
            axisTick:  { show: false },
            axisLabel: { color: '#86868b', fontSize: 12, fontFamily: 'SF Pro Text, system-ui' },
            splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
        },
        series: [
            {
                name: '总消息',
                type: 'line',
                data: totals,
                smooth: 0.4,
                symbol: 'circle',
                symbolSize: 5,
                lineStyle: { color: '#0066cc', width: 2.5 },
                itemStyle: { color: '#0066cc', borderWidth: 2, borderColor: '#fff' },
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(0,102,204,0.15)' },
                            { offset: 1, color: 'rgba(0,102,204,0)' },
                        ],
                    },
                },
            },
            {
                name: '已读',
                type: 'line',
                data: reads,
                smooth: 0.4,
                symbol: 'circle',
                symbolSize: 4,
                lineStyle: { color: '#34c759', width: 2, type: 'dashed' },
                itemStyle: { color: '#34c759', borderWidth: 2, borderColor: '#fff' },
            },
        ],
    }
}

async function initChart() {
    if (!chartEl.value || props.loading || empty.value) return
    await nextTick()
    if (!chart) chart = echarts.init(chartEl.value)
    chart.setOption(buildOption(props.data))
}

watch(() => props.data, () => {
    if (!props.loading) initChart()
}, { deep: true })

watch(() => props.loading, (v) => {
    if (!v) initChart()
})

onMounted(initChart)

const ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => chart?.resize())
    : null

watch(chartEl, (el) => {
    if (el && ro) ro.observe(el)
})

onBeforeUnmount(() => {
    ro?.disconnect()
    chart?.dispose()
    chart = null
})
</script>

<style scoped lang="scss">
.trend-card {
    background: #ffffff;
    border: 1px solid #e3e3e6;
    border-radius: 14px;
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    box-sizing: border-box;
}

.trend-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.trend-card__title {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    letter-spacing: -0.2px;
}

.trend-card__sub {
    font-size: 12px;
    color: #86868b;
    margin-top: 2px;
}

.trend-card__chart {
    flex: 1;
    min-height: 180px;
}

.trend-card__skeleton {
    flex: 1;
    min-height: 180px;
    border-radius: 8px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 400% 100%;
    animation: shimmer 1.4s infinite;
}

.trend-card__empty {
    flex: 1;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #86868b;
    font-size: 13px;
}

@keyframes shimmer {
    0%   { background-position: 100% 0; }
    100% { background-position: -100% 0; }
}
</style>
