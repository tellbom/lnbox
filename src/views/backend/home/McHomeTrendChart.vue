<template>
    <div class="trend-card">
        <div class="trend-card__header">
            <div>
                <div class="trend-card__title">消息趋势</div>
                <div class="trend-card__sub">近 7 天每日消息量</div>
            </div>
            <div class="trend-card__legend">
                <span class="trend-legend-item trend-legend-item--blue">总消息</span>
                <span class="trend-legend-item trend-legend-item--green">已读</span>
            </div>
        </div>

        <div v-if="loading" class="trend-card__placeholder">
            <div class="trend-skeleton" />
        </div>

        <div v-else-if="empty" class="trend-card__placeholder trend-card__empty">
            <el-icon :size="28"><TrendCharts /></el-icon>
            <span>暂无趋势数据</span>
        </div>

        <!-- 固定高度容器，确保 ECharts 有明确尺寸 -->
        <div v-show="!loading && !empty" ref="chartEl" class="trend-card__chart" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { TrendCharts } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

export interface TrendPoint {
    date:  string
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
        grid: { top: 12, right: 12, bottom: 24, left: 36, containLabel: true },
        xAxis: {
            type: 'category',
            data: dates,
            axisLine:  { show: false },
            axisTick:  { show: false },
            axisLabel: { color: '#86868b', fontSize: 11, fontFamily: 'SF Pro Text, system-ui, sans-serif' },
            splitLine: { show: false },
        },
        yAxis: {
            type: 'value',
            minInterval: 1,
            axisLine:  { show: false },
            axisTick:  { show: false },
            axisLabel: { color: '#86868b', fontSize: 11, fontFamily: 'SF Pro Text, system-ui, sans-serif' },
            splitLine: { lineStyle: { color: '#f0f0f3', type: 'dashed' } },
        },
        series: [
            {
                name: '总消息',
                type: 'line',
                data: totals,
                smooth: 0.5,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { color: '#0066cc', width: 2.5 },
                itemStyle: { color: '#0066cc', borderWidth: 2.5, borderColor: '#fff' },
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(0,102,204,0.18)' },
                            { offset: 1, color: 'rgba(0,102,204,0.01)' },
                        ],
                    },
                },
            },
            {
                name: '已读',
                type: 'line',
                data: reads,
                smooth: 0.5,
                symbol: 'circle',
                symbolSize: 5,
                lineStyle: { color: '#34c759', width: 2, type: 'dashed' },
                itemStyle: { color: '#34c759', borderWidth: 2, borderColor: '#fff' },
            },
        ],
    }
}

async function initChart() {
    if (props.loading || empty.value) return
    await nextTick()
    if (!chartEl.value) return
    // 销毁旧实例，强制重建，避免尺寸缓存问题
    if (chart) { chart.dispose(); chart = null }
    chart = echarts.init(chartEl.value)
    chart.setOption(buildOption(props.data))
}

watch(() => props.loading, (v) => { if (!v) initChart() })
watch(() => props.data,    () => { if (!props.loading) initChart() }, { deep: true })

onMounted(() => { if (!props.loading) initChart() })

let ro: ResizeObserver | null = null
watch(chartEl, (el) => {
    if (!el) return
    ro = new ResizeObserver(() => chart?.resize())
    ro.observe(el)
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
    border-radius: 16px;
    padding: 22px 24px 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    /* 不用 height:100%，由父级 grid 行高控制 */
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
}

.trend-card__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-shrink: 0;
}

.trend-card__title {
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    letter-spacing: -0.2px;
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
}

.trend-card__sub {
    font-size: 12px;
    color: #86868b;
    margin-top: 2px;
}

.trend-card__legend {
    display: flex;
    gap: 12px;
    align-items: center;
}

.trend-legend-item {
    font-size: 12px;
    color: #86868b;
    display: flex;
    align-items: center;
    gap: 5px;

    &::before {
        content: '';
        display: inline-block;
        width: 22px;
        height: 2.5px;
        border-radius: 2px;
    }

    &--blue::before  { background: #0066cc; }
    &--green::before { background: #34c759; border-top: 1px dashed #34c759; background: none; height: 0; border-width: 2px; }
}

/* 固定高度，ECharts 必须有明确像素高度才能渲染 */
.trend-card__chart {
    height: 180px;
    flex-shrink: 0;
}

.trend-card__placeholder {
    height: 180px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.trend-card__empty {
    flex-direction: column;
    gap: 10px;
    color: #86868b;
    font-size: 13px;
}

.trend-skeleton {
    width: 100%;
    height: 140px;
    border-radius: 10px;
    background: linear-gradient(90deg, #f5f5f7 25%, #ebebed 50%, #f5f5f7 75%);
    background-size: 400% 100%;
    animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
    0%   { background-position: 100% 0; }
    100% { background-position: -100% 0; }
}
</style>
