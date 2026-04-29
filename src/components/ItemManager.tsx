import React, { useState } from 'react'
import { CashFlowItem } from '../types'

interface ItemManagerProps {
  items: CashFlowItem[]
  onAdd: (item: CashFlowItem) => void
  onUpdate: (id: string, updates: Partial<CashFlowItem>) => void
  onDelete: (id: string) => void
}

const emptyItem: Omit<CashFlowItem, 'id'> = {
  name: '',
  type: 'income',
  amount: 0,
  period: 'monthly',
  periodDay: 1,
  startDate: new Date().toISOString().split('T')[0],
  occurrences: 12,
}

const ItemManager: React.FC<ItemManagerProps> = ({ items, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState(emptyItem)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAdd = () => {
    if (newItem.name && newItem.amount > 0) {
      onAdd({ ...newItem, id: Date.now().toString() })
      setNewItem(emptyItem)
      setIsAdding(false)
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="card-title" style={{ margin: 0 }}>📋 收支项目</div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
          + 添加项目
        </button>
      </div>

      {isAdding && (
        <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">项目名称</label>
              <input
                type="text"
                className="form-input"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="如：工资、房租"
              />
            </div>
            <div className="form-group">
              <label className="form-label">类型</label>
              <select
                className="form-select"
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as 'income' | 'expense' })}
              >
                <option value="income">收入</option>
                <option value="expense">支出</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">金额（元）</label>
              <input
                type="number"
                className="form-input"
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">周期</label>
              <select
                className="form-select"
                value={newItem.period}
                onChange={(e) => setNewItem({ ...newItem, period: e.target.value as CashFlowItem['period'] })}
              >
                <option value="daily">每天</option>
                <option value="weekly">每周</option>
                <option value="biweekly">隔周</option>
                <option value="monthly">每月</option>
                <option value="bimonthly">隔月</option>
                <option value="quarterly">每季度</option>
                <option value="yearly">每年</option>
                <option value="custom">自定义天数</option>
              </select>
            </div>
            {newItem.period === 'custom' && (
              <div className="form-group">
                <label className="form-label">间隔天数</label>
                <input
                  type="number"
                  className="form-input"
                  value={newItem.customDays || ''}
                  onChange={(e) => setNewItem({ ...newItem, customDays: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}
            {newItem.period === 'monthly' && (
              <div className="form-group">
                <label className="form-label">每月几号</label>
                <input
                  type="number"
                  className="form-input"
                  value={newItem.periodDay}
                  min={1}
                  max={31}
                  onChange={(e) => setNewItem({ ...newItem, periodDay: parseInt(e.target.value) || 1 })}
                />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">开始日期</label>
              <input
                type="date"
                className="form-input"
                value={newItem.startDate}
                onChange={(e) => setNewItem({ ...newItem, startDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">发生次数（可选）</label>
              <input
                type="number"
                className="form-input"
                value={newItem.occurrences || ''}
                placeholder="留空表示无限"
                onChange={(e) => setNewItem({ ...newItem, occurrences: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <button className="btn btn-primary" onClick={handleAdd}>添加</button>
            <button className="btn btn-secondary" onClick={() => setIsAdding(false)}>取消</button>
          </div>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>名称</th>
            <th>类型</th>
            <th>金额</th>
            <th>周期</th>
            <th>开始日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>
                <span className={`badge badge-${item.type}`}>
                  {item.type === 'income' ? '收入' : '支出'}
                </span>
              </td>
              <td>¥{item.amount.toLocaleString()}</td>
              <td>{formatPeriod(item)}</td>
              <td>{item.startDate}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}>
                  删除
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="empty-state">暂无收支项目，点击上方按钮添加</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function formatPeriod(item: CashFlowItem): string {
  const map: Record<string, string> = {
    daily: '每天',
    weekly: '每周',
    biweekly: '隔周',
    monthly: `每月${item.periodDay || 1}号`,
    bimonthly: '隔月',
    quarterly: '每季度',
    yearly: '每年',
    custom: `每${item.customDays}天`,
  }
  return map[item.period] || item.period
}

export default ItemManager