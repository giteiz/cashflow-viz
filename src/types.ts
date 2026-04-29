export interface CashFlowItem {
  id: string
  name: string
  type: 'income' | 'expense'
  amount: number
  period: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'yearly' | 'custom'
  periodDay?: number
  customDays?: number
  startDate: string
  endDate?: string
  occurrences?: number
}

export interface Installment {
  id: string
  name: string
  totalAmount: number
  periods: number
  startDate: string
  interestRate?: number
  interestType?: 'simple' | 'compound'
}

export interface Scenario {
  id: string
  name: string
  initialBalance: number
  items: CashFlowItem[]
  installments: Installment[]
  chartMode: 'cumulative' | 'periodic'
  timeUnit: 'day' | 'week' | 'month' | 'year'
  timeRange: number
}

export interface CashFlowPoint {
  date: string
  label: string
  cumulativeBalance: number
  periodicNet: number
  income: number
  expense: number
}

export interface CashFlowData {
  points: CashFlowPoint[]
  minBalance: number
  maxBalance: number
  finalBalance: number
  totalIncome: number
  totalExpense: number
}
