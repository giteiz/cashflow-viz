import { Scenario, CashFlowItem, Installment, CashFlowData, CashFlowPoint } from '../types'

export function calculateCashFlow(scenario: Scenario): CashFlowData {
  const { initialBalance, items, installments, timeUnit, timeRange } = scenario
  
  const startDate = new Date()
  const endDate = new Date(startDate)
  
  switch (timeUnit) {
    case 'day':
      endDate.setDate(endDate.getDate() + timeRange)
      break
    case 'week':
      endDate.setDate(endDate.getDate() + timeRange * 7)
      break
    case 'month':
      endDate.setMonth(endDate.getMonth() + timeRange)
      break
    case 'year':
      endDate.setFullYear(endDate.getFullYear() + timeRange)
      break
  }

  const points: CashFlowPoint[] = []
  let currentDate = new Date(startDate)
  
  // 生成时间点
  while (currentDate <= endDate) {
    const dateStr = formatDate(currentDate)
    const label = formatLabel(currentDate, timeUnit)
    
    let income = 0
    let expense = 0
    
    // 确定当前周期的结束日期（不包含）
    const periodEnd = new Date(currentDate)
    advanceDate(periodEnd, timeUnit)
    
    // 遍历周期内的每一天，汇总该周期内所有收支
    const d = new Date(currentDate)
    while (d < periodEnd && d <= endDate) {
      // 计算常规项目
      items.forEach(item => {
        const amount = calculateItemAmount(item, d)
        if (amount > 0) {
          if (item.type === 'income') {
            income += amount
          } else {
            expense += amount
          }
        }
      })
      
      // 计算分期还款
      installments.forEach(inst => {
        const payment = calculateInstallmentPayment(inst, d)
        if (payment > 0) {
          expense += payment
        }
      })
      
      d.setDate(d.getDate() + 1)
    }
    
    const periodicNet = income - expense
    
    // 计算累计余额
    const prevBalance = points.length > 0 
      ? points[points.length - 1].cumulativeBalance 
      : initialBalance
    const cumulativeBalance = prevBalance + periodicNet
    
    points.push({
      date: dateStr,
      label,
      cumulativeBalance,
      periodicNet,
      income,
      expense,
    })
    
    // 推进日期
    advanceDate(currentDate, timeUnit)
  }

  const balances = points.map(p => p.cumulativeBalance)
  const totalIncome = points.reduce((sum, p) => sum + p.income, 0)
  const totalExpense = points.reduce((sum, p) => sum + p.expense, 0)

  return {
    points,
    minBalance: Math.min(...balances),
    maxBalance: Math.max(...balances),
    finalBalance: points[points.length - 1]?.cumulativeBalance ?? initialBalance,
    totalIncome,
    totalExpense,
  }
}

function calculateItemAmount(item: CashFlowItem, currentDate: Date): number {
  const itemStart = new Date(item.startDate)
  
  if (currentDate < itemStart) return 0
  if (item.endDate && currentDate > new Date(item.endDate)) return 0
  if (item.occurrences !== undefined) {
    const occurrences = countOccurrences(item, currentDate)
    if (occurrences > item.occurrences) return 0
  }
  
  // 检查当前日期是否是该项目的发生日
  if (isOccurrenceDate(item, currentDate)) {
    return item.amount
  }
  
  return 0
}

function isOccurrenceDate(item: CashFlowItem, date: Date): boolean {
  const start = new Date(item.startDate)
  
  switch (item.period) {
    case 'daily':
      return true
    case 'weekly':
      return date.getDay() === start.getDay()
    case 'biweekly':
      return isBiweeklyMatch(start, date)
    case 'monthly':
      return date.getDate() === (item.periodDay || start.getDate())
    case 'bimonthly':
      return isBimonthlyMatch(start, date, item.periodDay)
    case 'quarterly':
      return isQuarterlyMatch(start, date, item.periodDay)
    case 'yearly':
      return date.getMonth() === start.getMonth() && 
             date.getDate() === (item.periodDay || start.getDate())
    case 'custom':
      if (!item.customDays) return false
      const daysDiff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff >= 0 && daysDiff % item.customDays === 0
    default:
      return false
  }
}

function countOccurrences(item: CashFlowItem, untilDate: Date): number {
  let count = 0
  const start = new Date(item.startDate)
  const current = new Date(start)
  
  while (current <= untilDate) {
    if (isOccurrenceDate(item, current)) {
      count++
    }
    advanceDate(current, 'day')
  }
  
  return count
}

function isBiweeklyMatch(start: Date, date: Date): boolean {
  const weekDiff = Math.floor((date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7))
  return weekDiff >= 0 && weekDiff % 2 === 0 && date.getDay() === start.getDay()
}

function isBimonthlyMatch(start: Date, date: Date, periodDay?: number): boolean {
  const monthDiff = (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth()
  return monthDiff >= 0 && monthDiff % 2 === 0 && 
         date.getDate() === (periodDay || start.getDate())
}

function isQuarterlyMatch(start: Date, date: Date, periodDay?: number): boolean {
  const monthDiff = (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth()
  return monthDiff >= 0 && monthDiff % 3 === 0 && 
         date.getDate() === (periodDay || start.getDate())
}

function calculateInstallmentPayment(installment: Installment, currentDate: Date): number {
  const start = new Date(installment.startDate)
  if (currentDate < start) return 0
  
  const monthDiff = (currentDate.getFullYear() - start.getFullYear()) * 12 + 
                    currentDate.getMonth() - start.getMonth()
  
  if (monthDiff < 0 || monthDiff >= installment.periods) return 0
  
  // 检查是否是还款日（每月同一天）
  if (currentDate.getDate() !== start.getDate()) return 0
  
  let payment = installment.totalAmount / installment.periods
  
  if (installment.interestRate && installment.interestRate > 0) {
    if (installment.interestType === 'simple') {
      const totalInterest = installment.totalAmount * (installment.interestRate / 100)
      payment = (installment.totalAmount + totalInterest) / installment.periods
    } else {
      // 复利计算（等额本息）
      const monthlyRate = installment.interestRate / 100 / 12
      payment = installment.totalAmount * 
                (monthlyRate * Math.pow(1 + monthlyRate, installment.periods)) /
                (Math.pow(1 + monthlyRate, installment.periods) - 1)
    }
  }
  
  return payment
}

function advanceDate(date: Date, unit: string): void {
  switch (unit) {
    case 'day':
      date.setDate(date.getDate() + 1)
      break
    case 'week':
      date.setDate(date.getDate() + 7)
      break
    case 'month':
      date.setMonth(date.getMonth() + 1)
      break
    case 'year':
      date.setFullYear(date.getFullYear() + 1)
      break
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

function formatLabel(date: Date, unit: string): string {
  switch (unit) {
    case 'day':
      return `${date.getMonth() + 1}/${date.getDate()}`
    case 'week':
      return `${date.getFullYear()}年${date.getMonth() + 1}月第${Math.ceil(date.getDate() / 7)}周`
    case 'month':
      return `${date.getFullYear()}年${date.getMonth() + 1}月`
    case 'year':
      return `${date.getFullYear()}年`
    default:
      return formatDate(date)
  }
}
