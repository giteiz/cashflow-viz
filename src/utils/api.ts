import axios from 'axios'

const API_BASE = '/api'

export const api = {
  // 场景管理
  getScenarios: () => axios.get(`${API_BASE}/scenarios`),
  getScenario: (id: string) => axios.get(`${API_BASE}/scenarios/${id}`),
  createScenario: (data: any) => axios.post(`${API_BASE}/scenarios`, data),
  updateScenario: (id: string, data: any) => axios.put(`${API_BASE}/scenarios/${id}`, data),
  deleteScenario: (id: string) => axios.delete(`${API_BASE}/scenarios/${id}`),
  
  // 现金流计算
  calculate: (scenario: any) => axios.post(`${API_BASE}/calculate`, scenario),
  
  // 导出
  exportCSV: (data: any) => axios.post(`${API_BASE}/export/csv`, data, { responseType: 'blob' }),
  exportPNG: (data: any) => axios.post(`${API_BASE}/export/png`, data, { responseType: 'blob' }),
}
