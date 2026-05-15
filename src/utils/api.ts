import axios from 'axios'
import { Scenario } from '../types'

const API_BASE = '/api'

// camelCase -> snake_case（仅场景级别字段）
function toBackendScenario(scenario: Scenario): any {
  return {
    id: scenario.id,
    name: scenario.name,
    initial_balance: scenario.initialBalance,
    chart_mode: scenario.chartMode,
    time_unit: scenario.timeUnit,
    time_range: scenario.timeRange,
    items: scenario.items,
    installments: scenario.installments,
  }
}

// snake_case -> camelCase（仅场景级别字段）
function toFrontendScenario(data: any): Scenario {
  return {
    id: data.id,
    name: data.name,
    initialBalance: data.initial_balance,
    chartMode: data.chart_mode,
    timeUnit: data.time_unit,
    timeRange: data.time_range,
    items: data.items || [],
    installments: data.installments || [],
  }
}

export const api = {
  // 场景管理
  getScenarios: async (): Promise<Scenario[]> => {
    const res = await axios.get(`${API_BASE}/scenarios`)
    return (res.data.scenarios || []).map(toFrontendScenario)
  },

  getScenario: async (id: string): Promise<Scenario> => {
    const res = await axios.get(`${API_BASE}/scenarios/${id}`)
    return toFrontendScenario(res.data)
  },

  createScenario: async (scenario: Scenario): Promise<string> => {
    const payload = toBackendScenario(scenario)
    delete payload.id // 后端自动生成 id
    const res = await axios.post(`${API_BASE}/scenarios`, payload)
    return res.data.id as string
  },

  updateScenario: async (scenario: Scenario): Promise<void> => {
    const payload = toBackendScenario(scenario)
    delete payload.id
    await axios.put(`${API_BASE}/scenarios/${scenario.id}`, payload)
  },

  deleteScenario: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE}/scenarios/${id}`)
  },

  // 现金流计算
  calculate: (scenario: Scenario) => axios.post(`${API_BASE}/calculate`, toBackendScenario(scenario)),

  // 导出
  exportCSV: (scenario: Scenario) => axios.post(`${API_BASE}/export/csv`, toBackendScenario(scenario), { responseType: 'blob' }),
  exportPNG: (data: any) => axios.post(`${API_BASE}/export/png`, data, { responseType: 'blob' }),
}
