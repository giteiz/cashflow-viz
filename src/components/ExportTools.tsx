import React from 'react'
import { CashFlowData, Scenario } from '../types'
import { api } from '../utils/api'

interface ExportToolsProps {
  data: CashFlowData | null
  scenario: Scenario
}

const ExportTools: React.FC<ExportToolsProps> = ({ data, scenario }) => {
  const handleExportCSV = async () => {
    if (!data) return
    try {
      const res = await api.exportCSV(scenario)
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `现金流_${scenario.name}_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
    } catch (err) {
      console.error('导出 CSV 失败:', err)
      alert('导出失败，请稍后重试')
    }
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
