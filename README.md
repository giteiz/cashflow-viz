# CashFlow Viz - 现金流可视化应用

个人财务规划工具，帮助用户可视化未来现金流，支持多场景管理和分期还款模拟。

## 功能特性

- 📊 **现金流可视化**：ECharts 折线图展示累计余额或当期净现金流
- 💰 **收支管理**：支持多种周期（每天/每周/每月/隔月/自定义等）
- 💳 **分期还款**：支持单利/复利计算，等额本金/等额本息
- 📁 **多场景保存**：家庭开支、创业计划等多方案独立管理
- 📤 **数据导出**：CSV 数据导出、PNG 图表导出
- 🔒 **用户系统**：后端支持用户注册和场景持久化

## 技术栈

- **前端**：React + TypeScript + Vite + ECharts
- **后端**：FastAPI + SQLite
- **包管理**：pnpm / uv

## 快速开始

### 安装依赖

```bash
# 前端
cd cashflow-viz
pnpm install

# 后端
cd backend
uv pip install -r requirements.txt
```

### 启动开发服务器

```bash
# 后端（端口 8000）
cd backend
uvicorn main:app --reload

# 前端（端口 3000）
cd cashflow-viz
pnpm dev
```

### 构建部署

```bash
# 前端构建
pnpm build

# 后端直接运行
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 项目结构

```
cashflow-viz/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── utils/             # 工具函数
│   ├── types.ts           # TypeScript 类型
│   └── pages/             # 页面组件
├── backend/               # 后端 API
│   ├── main.py           # FastAPI 入口
│   └── cashflow_engine.py # 现金流计算引擎
└── package.json
```

## License

MIT
