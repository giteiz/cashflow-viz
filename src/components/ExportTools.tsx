import React from 'react'
import { CashFlowData, Scenario } from '../types'

interface ExportToolsProps {
  data: CashFlowData | null
  scenario: Scenario
}

const ExportTools: React.FC<ExportToolsProps> = ({ data, scenario }) => {
  const handleExportCSV = () => {
    if (!data) return

    const headers = ['日期', '标签', '累计余额', '当期净现金流', '收入', '支出']
    const rows = data.points.map(p => [
      p.date,
      p.label,
      p.cumulativeBalance,
      p.periodicNet,
      p.income,
      p.expense
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `现金流_${scenario.name}_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleExportPNG = () => {
    const chartCanvas = document.querySelector('canvas')
    if (!chartCanvas) {
      alert('请先生成图表')
      return
    }

    const link = document.createElement('a')
    link.href = (chartCanvas as HTMLCanvasElement).toDataURL('image/png')
    link.download = `现金流图表_${scenario.name}_${new Date().toISOString().split('T')[0]}.png`
    link.click()
  }

  return (
    <div className="card">
      <div className="card-title">📤 导出数据</div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          className="btn btn-secondary"
          onClick={handleExportCSV}
          disabled={!data}
        >
          导出 CSV
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleExportPNG}
          disabled={!data}
        >
          导出图表 PNG
        </button>
      </div>
    </div>
  )
}

export default ExportTools