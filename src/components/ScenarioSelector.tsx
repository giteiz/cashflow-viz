import React, { useState } from 'react'
import { Scenario } from '../types'

interface ScenarioSelectorProps {
  scenarios: Scenario[]
  currentId: string
  onSwitch: (id: string) => void
  onCreate: (name: string) => void
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({ scenarios, currentId, onSwitch, onCreate }) => {
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState('')

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
          <button
            key={s.id}
            className={`btn ${s.id === currentId ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onSwitch(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ScenarioSelector
