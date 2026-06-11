<template>
    <div class="dist-card">
        <div class="dist-card__header">
            <div class="dist-card__title">消息分布</div>
            <div class="dist-card__sub">已读 / 未读比例</div>
        </div>

        <div v-if="loading" class="dist-card__placeholder">
            <div class="dist-skeleton" />
        </div>

        <div v-else-if="total === 0" class="dist-card__placeholder dist-card__empty">
            <el-icon :size="26"><PieChart /></el-icon>
            <span>暂无数据</span>
        </div>

        <div v-else class="dist-card__body">
            <!-- 固定高度，ECharts 必须有明确像素高度 -->
            <div v-show="!loading && total > 0" ref="chartEl" class="dist-card__chart" />
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
        { name: '已读', value: props.read,   pct: Math.round(props.read   / t * 100), color: '#34c759' },
        { name: '未读', value: props.unread, pct: Math.round(props.unread / t * 100), color: '#0066cc' },
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
            radius: ['52%', '78%'],
            center: ['50%', '50%'],
            avoidLabelOverlap: false,
            label: { show: false },
            emphasis: { scale: true, scaleSize: 4, label: { show: false } },
            data: [
                { value: props.read,   name: '已读', itemStyle: { color: '#34c759', borderRadius: 5, borderWidth: 2, borderColor: '#fff' } },
                { value: props.unread, name: '未读', itemStyle: { color: '#0066cc', borderRadius: 5, borderWidth: 2, borderColor: '#fff' } },
            ],
        }],
    }
}

async function initChart() {
    if (props.loading || total.value === 0) return
    await nextTick()
    if (!chartEl.value) return
    if (chart) { chart.dispose(); chart = null }
    chart = echarts.init(chartEl.value)
    chart.setOption(buildOption())
}

watch(() => [props.read, props.unread, props.loading], () => {
    if (!props.loading && total.value > 0) initChart()
}, { deep: true })

onMounted(() => { if (!props.loading && total.value > 0) initChart() })

let ro: ResizeObserver | null = null
watch(chartEl, (el) => {
    if (!el) return
    ro = new ResizeObserver(() => chart?.resize())
    ro.observe(el)
})

onBeforeUnmount(() => { ro?.disconnect(); chart?.dispose(); chart = null })
</script>

<style scoped lang="scss">
.dist-card {
    background: #ffffff;
    border-radius: 16px;
    padding: 22px 24px 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
}

.dist-card__header { flex-shrink: 0; }

.dist-card__title {
    font-size: 15px;
    font-weight: 600;
    color: #1d1d1f;
    letter-spacing: -0.2px;
    font-family: 'SF Pro Text', system-ui, -apple-system, sans-serif;
}

.dist-card__sub { font-size: 12px; color: #86868b; margin-top: 2px; }

.dist-card__body {
    display: flex;
    align-items: center;
    gap: 16px;
}

.dist-card__chart {
    width: 120px;
    height: 120px;
    flex-shrink: 0;
}

.dist-card__placeholder {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dist-card__empty {
    flex-direction: column;
    gap: 10px;
    color: #86868b;
    font-size: 13px;
}

.dist-skeleton {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: linear-gradient(90deg, #f5f5f7 25%, #ebebed 50%, #f5f5f7 75%);
    background-size: 400% 100%;
    animation: shimmer 1.4s infinite;
}

.dist-card__legend {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.dist-legend-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 0;
    border-bottom: 1px solid #f5f5f7;

    &:last-child { border-bottom: none; }
}

.dist-legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 3px;
    flex-shrink: 0;
}

.dist-legend-name { flex: 1; font-size: 13px; color: #37373a; }

.dist-legend-val {
    font-size: 16px;
    font-weight: 600;
    color: #1d1d1f;
    font-feature-settings: "tnum" 1;
    min-width: 28px;
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
