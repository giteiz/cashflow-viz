import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import { CashFlowItem, Installment, Scenario, CashFlowData } from './types'
import { calculateCashFlow } from './utils/cashflow'
import { api } from './utils/api'

const todayStr = (() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})()

const defaultScenario: Scenario = {
  id: 'default',
  name: '默认场景',
  initialBalance: 10000,
  items: [
    { id: '1', name: '工资', type: 'income', amount: 15000, period: 'monthly', startDate: todayStr },
    { id: '2', name: '房租', type: 'expense', amount: 3000, period: 'monthly', startDate: todayStr },
    { id: '3', name: '餐饮', type: 'expense', amount: 2000, period: 'monthly', startDate: todayStr },
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
  const [isLoading, setIsLoading] = useState(true)

  // 初始化：从后端加载场景
  useEffect(() => {
    const load = async () => {
      try {
        const list = await api.getScenarios()
        if (list.length > 0) {
          setScenarios(list)
          setCurrentScenarioId(list[0].id)
          setScenario(list[0])
        } else {
          const newId = await api.createScenario(defaultScenario)
          const saved = await api.getScenario(newId)
          setScenarios([saved])
          setCurrentScenarioId(saved.id)
          setScenario(saved)
        }
      } catch (err) {
        console.error('加载场景失败:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // 本地计算现金流
  useEffect(() => {
    const data = calculateCashFlow(scenario)
    setCashFlowData(data)
  }, [scenario])

  const handleUpdateScenario = (updates: Partial<Scenario>) => {
    const updated = { ...scenario, ...updates }
    setScenario(updated)
    setScenarios(prev => prev.map(s => s.id === updated.id ? updated : s))

    // 异步保存到后端
    api.updateScenario(updated).catch(err => {
      console.error('保存场景失败:', err)
    })
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

  const handleCreateScenario = async (name: string) => {
    const newScenario: Scenario = {
      ...defaultScenario,
      id: Date.now().toString(),
      name,
      items: [],
      installments: [],
    }

    try {
      const newId = await api.createScenario(newScenario)
      const saved = await api.getScenario(newId)
      setScenarios(prev => [...prev, saved])
      setCurrentScenarioId(saved.id)
      setScenario(saved)
    } catch (err) {
      console.error('创建场景失败:', err)
    }
  }

  const handleSwitchScenario = async (id: string) => {
    try {
      const found = await api.getScenario(id)
      setCurrentScenarioId(id)
      setScenario(found)
    } catch (err) {
      console.error('切换场景失败:', err)
    }
  }

  const handleDeleteScenario = async (id: string) => {
    try {
      await api.deleteScenario(id)
      const remaining = scenarios.filter(s => s.id !== id)
      setScenarios(remaining)
      if (currentScenarioId === id) {
        const next = remaining[0] || defaultScenario
        setCurrentScenarioId(next.id)
        setScenario(next)
      }
    } catch (err) {
      console.error('删除场景失败:', err)
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>加载中...</div>
      </div>
    )
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
            onDeleteScenario={handleDeleteScenario}
          />
        } />
      </Routes>
    </div>
  )
}

export default App
