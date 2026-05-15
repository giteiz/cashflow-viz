import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import { CashFlowItem, Installment, Scenario, CashFlowData } from './types'
import { calculateCashFlow } from './utils/cashflow'

const defaultScenario: Scenario = {
  id: 'default',
  name: '默认场景',
  initialBalance: 10000,
  items: [
    { id: '1', name: '工资', type: 'income', amount: 15000, period: 'monthly', periodDay: 1, startDate: '2025-05-01', occurrences: 12 },
    { id: '2', name: '房租', type: 'expense', amount: 3000, period: 'monthly', periodDay: 5, startDate: '2025-05-01', occurrences: 12 },
    { id: '3', name: '餐饮', type: 'expense', amount: 2000, period: 'monthly', periodDay: 1, startDate: '2025-05-01', occurrences: 12 },
  ],
  installments: [],
  chartMode: 'cumulative',
  timeUnit: 'month',
  timeRange: 12,
}

function App() {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario)
  const [cashFlowData, setCashFlowData] = useState<CashFlowData | null>(null)
  const [scenarios, setScenarios] = useState<Scenario[]>([defaultScenario])
  const [currentScenarioId, setCurrentScenarioId] = useState('default')

  useEffect(() => {
    const data = calculateCashFlow(scenario)
    setCashFlowData(data)
  }, [scenario])

  const handleUpdateScenario = (updates: Partial<Scenario>) => {
    const updated = { ...scenario, ...updates }
    setScenario(updated)
    setScenarios(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  const handleAddItem = (item: CashFlowItem) => {
    handleUpdateScenario({ items: [...scenario.items, item] })
  }

  const handleUpdateItem = (id: string, updates: Partial<CashFlowItem>) => {
    handleUpdateScenario({
      items: scenario.items.map(item => item.id === id ? { ...item, ...updates } : item)
    })
  }

  const handleDeleteItem = (id: string) => {
    handleUpdateScenario({ items: scenario.items.filter(item => item.id !== id) })
  }

  const handleAddInstallment = (installment: Installment) => {
    handleUpdateScenario({ installments: [...scenario.installments, installment] })
  }

  const handleUpdateInstallment = (id: string, updates: Partial<Installment>) => {
    handleUpdateScenario({
      installments: scenario.installments.map(i => i.id === id ? { ...i, ...updates } : i)
    })
  }

  const handleDeleteInstallment = (id: string) => {
    handleUpdateScenario({ installments: scenario.installments.filter(i => i.id !== id) })
  }

  const handleCreateScenario = (name: string) => {
    const newScenario: Scenario = {
      ...defaultScenario,
      id: Date.now().toString(),
      name,
      items: [],
      installments: [],
    }
    setScenarios([...scenarios, newScenario])
    setCurrentScenarioId(newScenario.id)
    setScenario(newScenario)
  }

  const handleSwitchScenario = (id: string) => {
    const found = scenarios.find(s => s.id === id)
    if (found) {
      setCurrentScenarioId(id)
      setScenario(found)
    }
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          <Dashboard
            scenario={scenario}
            scenarios={scenarios}
            currentScenarioId={currentScenarioId}
            cashFlowData={cashFlowData}
            onUpdateScenario={handleUpdateScenario}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onAddInstallment={handleAddInstallment}
            onUpdateInstallment={handleUpdateInstallment}
            onDeleteInstallment={handleDeleteInstallment}
            onCreateScenario={handleCreateScenario}
            onSwitchScenario={handleSwitchScenario}
          />
        } />
      </Routes>
    </div>
  )
}

export default App