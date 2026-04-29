import React from 'react'
import { Scenario, CashFlowData } from '../types'
import ScenarioSelector from '../components/ScenarioSelector'
import BalanceCard from '../components/BalanceCard'
import ItemManager from '../components/ItemManager'
import InstallmentManager from '../components/InstallmentManager'
import ChartView from '../components/ChartView'
import ExportTools from '../components/ExportTools'

interface DashboardProps {
  scenario: Scenario
  scenarios: Scenario[]
  currentScenarioId: string
  cashFlowData: CashFlowData | null
  onUpdateScenario: (updates: Partial<Scenario>) => void
  onAddItem: (item: any) => void
  onUpdateItem: (id: string, updates: any) => void
  onDeleteItem: (id: string) => void
  onAddInstallment: (installment: any) => void
  onDeleteInstallment: (id: string) => void
  onCreateScenario: (name: string) => void
  onSwitchScenario: (id: string) => void
}

const Dashboard: React.FC<DashboardProps> = ({
  scenario,
  scenarios,
  currentScenarioId,
  cashFlowData,
  onUpdateScenario,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onAddInstallment,
  onDeleteInstallment,
  onCreateScenario,
  onSwitchScenario,
}) => {
  return (
    <div className="container">
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e' }}>
          💰 现金流可视化
        </h1>
        <p style={{ color: '#6b7280', marginTop: '4px' }}>
          规划你的财务未来，让收支一目了然
        </p>
      </header>

      <ScenarioSelector
        scenarios={scenarios}
        currentId={currentScenarioId}
        onSwitch={onSwitchScenario}
        onCreate={onCreateScenario}
      />

      <BalanceCard
        initialBalance={scenario.initialBalance}
        onChange={(val) => onUpdateScenario({ initialBalance: val })}
      />

      <div className="card">
        <div className="card-title">📊 图表设置</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">图表模式</label>
            <select
              className="form-select"
              value={scenario.chartMode}
              onChange={(e) => onUpdateScenario({ chartMode: e.target.value as 'cumulative' | 'periodic' })}
            >
              <option value="cumulative">累计现金余额</option>
              <option value="periodic">当期净现金流</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">时间单位</label>
            <select
              className="form-select"
              value={scenario.timeUnit}
              onChange={(e) => onUpdateScenario({ timeUnit: e.target.value as 'day' | 'week' | 'month' | 'year' })}
            >
              <option value="day">天</option>
              <option value="week">周</option>
              <option value="month">月</option>
              <option value="year">年</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">时间范围</label>
            <input
              type="number"
              className="form-input"
              value={scenario.timeRange}
              min={1}
              max={120}
              onChange={(e) => onUpdateScenario({ timeRange: parseInt(e.target.value) || 1 })}
            />
          </div>
        </div>
      </div>

      <ChartView
        data={cashFlowData}
        mode={scenario.chartMode}
        timeUnit={scenario.timeUnit}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <ItemManager
          items={scenario.items}
          onAdd={onAddItem}
          onUpdate={onUpdateItem}
          onDelete={onDeleteItem}
        />
        <InstallmentManager
          installments={scenario.installments}
          onAdd={onAddInstallment}
          onDelete={onDeleteInstallment}
        />
      </div>

      <ExportTools data={cashFlowData} scenario={scenario} />
    </div>
  )
}

export default Dashboard
