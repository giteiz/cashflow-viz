import React from 'react'

interface BalanceCardProps {
  initialBalance: number
  onChange: (value: number) => void
}

const BalanceCard: React.FC<BalanceCardProps> = ({ initialBalance, onChange }) => {
  return (
    <div className="card">
      <div className="card-title">💵 初始本金</div>
      <div className="form-row">
        <div className="form-group" style={{ maxWidth: '300px' }}>
          <label className="form-label">当前现金余额（元）</label>
          <input
            type="number"
            className="form-input"
            value={initialBalance}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            step="100"
            min="0"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '16px' }}>
          <span style={{ fontSize: '24px', fontWeight: 700, color: '#4f46e5' }}>
            ¥{initialBalance.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default BalanceCard