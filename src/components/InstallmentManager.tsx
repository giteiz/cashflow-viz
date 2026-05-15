import { useState } from 'react'
import { Installment } from '../types'

interface InstallmentManagerProps {
  installments: Installment[]
  onAdd: (installment: Installment) => void
  onUpdate: (id: string, updates: Partial<Installment>) => void
  onDelete: (id: string) => void
}

const emptyInstallment: Omit<Installment, 'id'> = {
  name: '',
  totalAmount: 0,
  periods: 12,
  startDate: new Date().toISOString().split('T')[0],
  interestRate: 0,
  interestType: 'simple',
}

const InstallmentManager: React.FC<InstallmentManagerProps> = ({ installments, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [newInst, setNewInst] = useState(emptyInstallment)
  const [showInterest, setShowInterest] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Installment | null>(null)
  const [editShowInterest, setEditShowInterest] = useState(false)

  const handleAdd = () => {
    if (newInst.name && newInst.totalAmount > 0 && newInst.periods > 0) {
      onAdd({ ...newInst, id: Date.now().toString() })
      setNewInst(emptyInstallment)
      setIsAdding(false)
      setShowInterest(false)
    }
  }

  const handleEdit = (inst: Installment) => {
    setEditingId(inst.id)
    setEditForm({ ...inst })
    setEditShowInterest(!!inst.interestRate && inst.interestRate > 0)
  }

  const handleSaveEdit = () => {
    if (editForm && editForm.name && editForm.totalAmount > 0 && editForm.periods > 0) {
      onUpdate(editForm.id, editForm)
      setEditingId(null)
      setEditForm(null)
      setEditShowInterest(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
    setEditShowInterest(false)
  }

  const renderFormFields = (
    data: Omit<Installment, 'id'> | Installment,
    setData: (d: any) => void,
    showInterestFlag: boolean,
    setShowInterestFlag: (v: boolean) => void
  ) => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">分期名称</label>
          <input
            type="text"
            className="form-input"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="如：信用卡分期、车贷"
          />
        </div>
        <div className="form-group">
          <label className="form-label">总金额（元）</label>
          <input
            type="number"
            className="form-input"
            value={data.totalAmount}
            onChange={(e) => setData({ ...data, totalAmount: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">期数（月）</label>
          <input
            type="number"
            className="form-input"
            value={data.periods}
            min={1}
            max={360}
            onChange={(e) => setData({ ...data, periods: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">开始还款日期</label>
          <input
            type="date"
            className="form-input"
            value={data.startDate}
            onChange={(e) => setData({ ...data, startDate: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">是否含利息</label>
          <div className="switch">
            <input
              type="checkbox"
              checked={showInterestFlag}
              onChange={(e) => setShowInterestFlag(e.target.checked)}
            />
            <span className="switch-label">{showInterestFlag ? '是' : '否'}</span>
          </div>
        </div>
      </div>
      {showInterestFlag && (
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">年利率（%）</label>
            <input
              type="number"
              className="form-input"
              value={data.interestRate}
              step="0.01"
              min={0}
              onChange={(e) => setData({ ...data, interestRate: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">计息方式</label>
            <select
              className="form-select"
              value={data.interestType}
              onChange={(e) => setData({ ...data, interestType: e.target.value as 'simple' | 'compound' })}
            >
              <option value="simple">单利（等额本金）</option>
              <option value="compound">复利（等额本息）</option>
            </select>
          </div>
        </div>
      )}
    </>
  )

  const previewPayment = (data: Omit<Installment, 'id'> | Installment | null) => {
    if (!data || !data.totalAmount || !data.periods) return 0
    return calculatePayment(data as Installment)
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="card-title" style={{ margin: 0 }}>💳 分期还款</div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsAdding(true)}>
          + 添加分期
        </button>
      </div>

      {isAdding && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">添加分期还款</div>
              <button className="close-btn" onClick={() => setIsAdding(false)}>×</button>
            </div>
            {renderFormFields(newInst, setNewInst, showInterest, setShowInterest)}
            {newInst.totalAmount > 0 && newInst.periods > 0 && (
              <div style={{ marginBottom: '12px', padding: '12px', background: '#e0e7ff', borderRadius: '8px' }}>
                <strong>预计每月还款：¥{previewPayment(newInst).toFixed(2)}</strong>
                {showInterest && (newInst.interestRate ?? 0) > 0 && (
                  <span style={{ marginLeft: '12px', color: '#6b7280' }}>
                    （总还款：¥{(previewPayment(newInst) * newInst.periods).toFixed(2)}）
                  </span>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleAdd}>添加</button>
              <button className="btn btn-secondary" onClick={() => setIsAdding(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {editingId && editForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">编辑分期还款</div>
              <button className="close-btn" onClick={handleCancelEdit}>×</button>
            </div>
            {renderFormFields(editForm, setEditForm, editShowInterest, setEditShowInterest)}
            {editForm.totalAmount > 0 && editForm.periods > 0 && (
              <div style={{ marginBottom: '12px', padding: '12px', background: '#e0e7ff', borderRadius: '8px' }}>
                <strong>预计每月还款：¥{previewPayment(editForm).toFixed(2)}</strong>
                {editShowInterest && (editForm.interestRate ?? 0) > 0 && (
                  <span style={{ marginLeft: '12px', color: '#6b7280' }}>
                    （总还款：¥{(previewPayment(editForm) * editForm.periods).toFixed(2)}）
                  </span>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleSaveEdit}>保存</button>
              <button className="btn btn-secondary" onClick={handleCancelEdit}>取消</button>
            </div>
          </div>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>名称</th>
            <th>总金额</th>
            <th>期数</th>
            <th>月供</th>
            <th>开始日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {installments.map(inst => {
            const monthlyPayment = calculatePayment(inst)
            return (
              <tr key={inst.id}>
                <td>{inst.name}</td>
                <td>¥{inst.totalAmount.toLocaleString()}</td>
                <td>{inst.periods}期</td>
                <td>¥{monthlyPayment.toFixed(2)}/月</td>
                <td>{inst.startDate}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(inst)}>
                      编辑
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(inst.id)}>
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {installments.length === 0 && (
            <tr>
              <td colSpan={6} className="empty-state">暂无分期项目</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function calculatePayment(inst: Installment): number {
  let payment = inst.totalAmount / inst.periods

  if (inst.interestRate && inst.interestRate > 0) {
    if (inst.interestType === 'simple') {
      const totalInterest = inst.totalAmount * (inst.interestRate / 100)
      payment = (inst.totalAmount + totalInterest) / inst.periods
    } else {
      const monthlyRate = inst.interestRate / 100 / 12
      payment = inst.totalAmount *
                (monthlyRate * Math.pow(1 + monthlyRate, inst.periods)) /
                (Math.pow(1 + monthlyRate, inst.periods) - 1)
    }
  }

  return payment
}

export default InstallmentManager
