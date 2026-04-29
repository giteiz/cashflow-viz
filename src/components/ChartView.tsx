import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { CashFlowData } from '../types'

interface ChartViewProps {
  data: CashFlowData | null
  mode: 'cumulative' | 'periodic'
  timeUnit: 'day' | 'week' | 'month' | 'year'
}

const ChartView: React.FC<ChartViewProps> = ({ data, mode, timeUnit }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    if (!data || data.points.length === 0) {
      chartInstance.current.setOption({
        title: { text: '暂无数据', left: 'center', top: 'center' }
      }, true)
      return
    }

    const isCumulative = mode === 'cumulative'
    const xData = data.points.map(p => p.label)
    const seriesData = isCumulative 
      ? data.points.map(p => p.cumulativeBalance)
      : data.points.map(p => p.periodicNet)

    const option: echarts.EChartsOption = {
      title: {
        text: isCumulative ? '累计现金余额' : '当期净现金流',
        subtext: `单位：元 | 时间单位：${formatTimeUnit(timeUnit)}`,
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const idx = params[0].dataIndex
          const point = data.points[idx]
          return `
            <div style="padding:8px">
              <div style="font-weight:bold;margin-bottom:4px">${point.label}</div>
              <div style="color:#166534">收入：¥${point.income.toLocaleString()}</div>
              <div style="color:#991b1b">支出：¥${point.expense.toLocaleString()}</div>
              <div style="color:#4f46e5;font-weight:bold;margin-top:4px">
                ${isCumulative ? '余额' : '净现金流'}：¥${params[0].value.toLocaleString()}
              </div>
            </div>
          `
        }
      },
      legend: {
        data: [isCumulative ? '累计余额' : '净现金流', '收入', '支出'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: {
          rotate: xData.length > 20 ? 45 : 0,
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        name: '金额（元）',
        axisLabel: {
          formatter: (value: number) => {
            if (Math.abs(value) >= 10000) {
              return (value / 10000).toFixed(1) + '万'
            }
            return value.toLocaleString()
          }
        }
      },
      dataZoom: xData.length > 30 ? [
        { type: 'inside', start: 0, end: 30 },
        { type: 'slider', start: 0, end: 30 }
      ] : undefined,
      series: [
        {
          name: isCumulative ? '累计余额' : '净现金流',
          type: 'line',
          data: seriesData,
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 3,
            color: isCumulative ? '#4f46e5' : '#0891b2'
          },
          itemStyle: {
            color: isCumulative ? '#4f46e5' : '#0891b2'
          },
          areaStyle: isCumulative ? {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(79, 70, 229, 0.3)' },
              { offset: 1, color: 'rgba(79, 70, 229, 0.05)' }
            ])
          } : undefined,
          markLine: isCumulative ? {
            silent: true,
            data: [{ yAxis: 0, lineStyle: { color: '#ef4444', type: 'dashed' } }]
          } : undefined
        },
        {
          name: '收入',
          type: 'bar',
          data: data.points.map(p => p.income),
          itemStyle: { color: '#22c55e' },
          barWidth: '30%',
          opacity: 0.3
        },
        {
          name: '支出',
          type: 'bar',
          data: data.points.map(p => -p.expense),
          itemStyle: { color: '#ef4444' },
          barWidth: '30%',
          opacity: 0.3
        }
      ]
    }

    chartInstance.current.setOption(option, true)
  }, [data, mode, timeUnit])

  useEffect(() => {
    const handleResize = () => chartInstance.current?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="card">
      <div className="card-title">📈 现金流图表</div>
      {data && (
        <div style={{ display: 'flex', gap: '24px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>最终余额</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#4f46e5' }}>
              ¥{data.finalBalance.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>最低余额</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: data.minBalance < 0 ? '#ef4444' : '#22c55e' }}>
              ¥{data.minBalance.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>总收入</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
              ¥{data.totalIncome.toLocaleString()}
            </div>
          </div>
          <div>
            <span style={{ color: '#6b7280', fontSize: '12px' }}>总支出</span>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#ef4444' }}>
              ¥{data.totalExpense.toLocaleString()}
            </div>
          </div>
        </div>
      )}
      <div ref={chartRef} className="chart-container" />
    </div>
  )
}

function formatTimeUnit(unit: string): string {
  const map: Record<string, string> = {
    day: '天',
    week: '周',
    month: '月',
    year: '年'
  }
  return map[unit] || unit
}

export default ChartView