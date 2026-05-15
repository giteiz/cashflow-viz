import React, { useState } from 'react'
import { Scenario } from '../types'

interface ScenarioSelectorProps {
  scenarios: Scenario[]
  currentId: string
  onSwitch: (id: string) => void
  onCreate: (name: string) => void
  onDelete: (id: string) => void
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ scenarios, currentId, onSwitch, onCreate, onDelete }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<Scenario | null>(null)

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim())
      setNewName('')
      setIsCreating(false)
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className="card-title" style={{ margin: 0 }}>📁 场景管理</div>
        <button className="btn btn-primary btn-sm" onClick={() => setIsCreating(true)}>
          + 新建场景
        </button>
      </div>

      {isCreating && (
        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <input
              type="text"
              className="form-input"
              placeholder="场景名称，如：家庭开支、创业计划"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <button className="btn btn-primary" onClick={handleCreate}>创建</button>
          <button className="btn btn-secondary" onClick={() => setIsCreating(false)}>取消</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {scenarios.map(s => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className={`btn ${s.id === currentId ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onSwitch(s.id)}
            >
              {s.name}
            </button>
            {scenarios.length > 1 && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setDeleteTarget(s)}
                title="删除场景"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {/* 删除确认模态框 */}
      {deleteTarget && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <div className="modal-header">
              <div className="modal-title">🗑️ 删除场景</div>
              <button className="close-btn" onClick={() => setDeleteTarget(null)}>×</button>
            </div>
            <div className="modal-body">
              确定要删除场景「<strong>{deleteTarget.name}</strong>」吗？<br />
              此操作不可恢复，场景内的所有收支项目和分期数据都将被删除。
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteTarget(null)}>
                取消
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  onDelete(deleteTarget.id)
                  setDeleteTarget(null)
                }}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScenarioSelector
