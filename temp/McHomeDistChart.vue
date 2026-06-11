<template>
    <div class="dist-card">
        <div class="dist-card__header">
            <div class="dist-card__title">消息分布</div>
            <div class="dist-card__sub">已读 / 未读比例</div>
        </div>

        <div v-if="loading" class="dist-card__skeleton" />

        <div v-else-if="total === 0" class="dist-card__empty">
            <el-icon :size="26"><PieChart /></el-icon>
            <span>暂无数据</span>
        </div>

        <div v-else class="dist-card__body">
            <div ref="chartEl" class="dist-card__chart" />

            <div class="dist-card__legend">
                <div class="dist-legend-row" v-for="item in legend" :key="item.name">
                    <span class="dist-legend-dot" :style="{ background: item.color }" />
                    <span class="dist-legend-name">{{ item.name }}</span>
                    <span class="dist-legend-val">{{ item.value }}</span>
                    <span class="dist-legend-pct">{{ item.pct }}%</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { PieChart } from '@element-plus/icons-vue'
import * as echarts from 'echarts/core'
import { PieChart as EPieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([EPieChart, TooltipComponent, CanvasRenderer])

const props = defineProps<{
    read:    number
    unread:  number
    loading: boolean
}>()

const chartEl = ref<HTMLElement | null>(null)
let chart: echarts.ECharts | null = null

const total = computed(() => props.read + props.unread)

const legend = computed(() => {
    const t = total.value || 1
    return [
        {
            name:  '已读',
            value: props.read,
            pct:   Math.round(props.read  / t * 100),
            color: '#34c759',
        },
        {
            name:  '未读',
            value: props.unread,
            pct:   Math.round(props.unread / t * 100),
            color: '#0066cc',
        },
    ]
})

function buildOption() {
    return {
        tooltip: {
            trigger: 'item',
            backgroundColor: '#fff',
            borderColor: '#e3e3e6',
            borderWidth: 1,
            textStyle: { color: '#1d1d1f', fontSize: 13 },
            formatter: '{b}: {c} ({d}%)',
        },
        series: [{
            type: 'pie',
            radius: ['55%', '80%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            label: { show: false },
            emphasis: {
                scale: true,
                scaleSize: 4,
                label: { show: false },
            },
            data: [
                { value: props.read,   name: '已读',  itemStyle: { color: '#34c759', borderRadius: 4 } },
                { value: props.unread, name: '未读',  itemStyle: { color: '#0066cc', borderRadius: 4 } },
            ],
        }],
    }
}

async function initChart() {
    if (!chartEl.value || total.value === 0) return
    await nextTick()
    if (!chart) chart = echarts.init(chartEl.value)
    chart.setOption(buildOption())
}

watch(() => [props.read, props.unread, props.loading], () => {
    if (!props.loading && total.value > 0) initChart()
}, { deep: true })

onMounted(initChart)

const ro = typeof ResizeObserver !== 'undefined'
    ? new ResizeObserver(() => chart?.resize())
    : null

watch(chartEl, (el) => { if (el && ro) ro.observe(el) })

onBeforeUnmount(() => {
    ro?.disconnect()
    chart?.dispose()
    chart = null
})
</script>

<style scoped lang="scss">
.dist-card {
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

.dist-card__header {
    flex-shrink: 0;
}

.dist-card__title {
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    letter-spacing: -0.2px;
}

.dist-card__sub {
    font-size: 12px;
    color: #86868b;
    margin-top: 2px;
}

.dist-card__body {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 0;
}

.dist-card__chart {
    width: 140px;
    height: 140px;
    flex-shrink: 0;
}

.dist-card__skeleton {
    flex: 1;
    min-height: 140px;
    border-radius: 8px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 400% 100%;
    animation: shimmer 1.4s infinite;
}

.dist-card__empty {
    flex: 1;
    min-height: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: #86868b;
    font-size: 13px;
}

.dist-card__legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.dist-legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px dashed #f0f0f0;

    &:last-child { border-bottom: none; }
}

.dist-legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 3px;
    flex-shrink: 0;
}

.dist-legend-name {
    flex: 1;
    font-size: 13px;
    color: #37373a;
}

.dist-legend-val {
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    font-feature-settings: "tnum" 1;
    min-width: 32px;
    text-align: right;
}

.dist-legend-pct {
    font-size: 12px;
    color: #86868b;
    min-width: 36px;
    text-align: right;
}

@keyframes shimmer {
    0%   { background-position: 100% 0; }
    100% { background-position: -100% 0; }
}
</style>
