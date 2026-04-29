from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import sqlite3
import json
import os

app = FastAPI(title="CashFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = os.path.expanduser("~/projects/cashflow-viz/backend/data.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS scenarios (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            user_id TEXT,
            initial_balance REAL DEFAULT 0,
            chart_mode TEXT DEFAULT 'cumulative',
            time_unit TEXT DEFAULT 'month',
            time_range INTEGER DEFAULT 12,
            items TEXT DEFAULT '[]',
            installments TEXT DEFAULT '[]',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Models
class CashFlowItem(BaseModel):
    id: str
    name: str
    type: str
    amount: float
    period: str
    periodDay: Optional[int] = None
    customDays: Optional[int] = None
    startDate: str
    endDate: Optional[str] = None
    occurrences: Optional[int] = None

class Installment(BaseModel):
    id: str
    name: str
    totalAmount: float
    periods: int
    startDate: str
    interestRate: Optional[float] = None
    interestType: Optional[str] = 'simple'

class ScenarioCreate(BaseModel):
    name: str
    initial_balance: float = 0
    chart_mode: str = 'cumulative'
    time_unit: str = 'month'
    time_range: int = 12
    items: List[CashFlowItem] = []
    installments: List[Installment] = []

class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    initial_balance: Optional[float] = None
    chart_mode: Optional[str] = None
    time_unit: Optional[str] = None
    time_range: Optional[int] = None
    items: Optional[List[CashFlowItem]] = None
    installments: Optional[List[Installment]] = None

@app.get("/api/scenarios")
def list_scenarios():
    conn = get_db()
    rows = conn.execute("SELECT * FROM scenarios ORDER BY updated_at DESC").fetchall()
    conn.close()
    return {
        "scenarios": [
            {
                "id": r["id"],
                "name": r["name"],
                "initial_balance": r["initial_balance"],
                "chart_mode": r["chart_mode"],
                "time_unit": r["time_unit"],
                "time_range": r["time_range"],
                "items": json.loads(r["items"]),
                "installments": json.loads(r["installments"]),
                "created_at": r["created_at"],
                "updated_at": r["updated_at"],
            }
            for r in rows
        ]
    }

@app.get("/api/scenarios/{scenario_id}")
def get_scenario(scenario_id: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM scenarios WHERE id = ?", (scenario_id,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return {
        "id": row["id"],
        "name": row["name"],
        "initial_balance": row["initial_balance"],
        "chart_mode": row["chart_mode"],
        "time_unit": row["time_unit"],
        "time_range": row["time_range"],
        "items": json.loads(row["items"]),
        "installments": json.loads(row["installments"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }

@app.post("/api/scenarios")
def create_scenario(scenario: ScenarioCreate):
    scenario_id = f"sc_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    conn = get_db()
    conn.execute(
        """INSERT INTO scenarios (id, name, initial_balance, chart_mode, time_unit, time_range, items, installments)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            scenario_id,
            scenario.name,
            scenario.initial_balance,
            scenario.chart_mode,
            scenario.time_unit,
            scenario.time_range,
            json.dumps([i.dict() for i in scenario.items]),
            json.dumps([i.dict() for i in scenario.installments]),
        )
    )
    conn.commit()
    conn.close()
    return {"id": scenario_id, "message": "Scenario created"}

@app.put("/api/scenarios/{scenario_id}")
def update_scenario(scenario_id: str, scenario: ScenarioUpdate):
    conn = get_db()
    existing = conn.execute("SELECT * FROM scenarios WHERE id = ?", (scenario_id,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    updates = []
    params = []
    if scenario.name is not None:
        updates.append("name = ?")
        params.append(scenario.name)
    if scenario.initial_balance is not None:
        updates.append("initial_balance = ?")
        params.append(scenario.initial_balance)
    if scenario.chart_mode is not None:
        updates.append("chart_mode = ?")
        params.append(scenario.chart_mode)
    if scenario.time_unit is not None:
        updates.append("time_unit = ?")
        params.append(scenario.time_unit)
    if scenario.time_range is not None:
        updates.append("time_range = ?")
        params.append(scenario.time_range)
    if scenario.items is not None:
        updates.append("items = ?")
        params.append(json.dumps([i.dict() for i in scenario.items]))
    if scenario.installments is not None:
        updates.append("installments = ?")
        params.append(json.dumps([i.dict() for i in scenario.installments]))
    
    updates.append("updated_at = CURRENT_TIMESTAMP")
    params.append(scenario_id)
    
    conn.execute(
        f"UPDATE scenarios SET {', '.join(updates)} WHERE id = ?",
        params
    )
    conn.commit()
    conn.close()
    return {"message": "Scenario updated"}

@app.delete("/api/scenarios/{scenario_id}")
def delete_scenario(scenario_id: str):
    conn = get_db()
    conn.execute("DELETE FROM scenarios WHERE id = ?", (scenario_id,))
    conn.commit()
    conn.close()
    return {"message": "Scenario deleted"}

@app.post("/api/calculate")
def calculate(scenario: ScenarioCreate):
    from cashflow_engine import calculate_cashflow
    result = calculate_cashflow(scenario.dict())
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
