# CashFlow Viz - AI Agent 项目指南

## 项目概述

CashFlow Viz（现金流可视化）是一个个人财务规划工具，帮助用户可视化未来现金流。支持多场景管理、收支项目配置、分期还款模拟，以及数据导出功能。项目界面和注释主要使用中文。

## 技术栈

- **前端**：React 19 + TypeScript + Vite 6 + ECharts 5 + react-router-dom 7 + axios
- **后端**：FastAPI + SQLite + Pydantic + uvicorn
- **包管理器**：前端使用 pnpm，后端使用 uv（推荐）或 pip

## 项目结构

```
cashflow-viz/
├── src/                          # 前端源码
│   ├── components/               # React 组件
│   │   ├── BalanceCard.tsx       # 初始本金设置卡片
│   │   ├── ChartView.tsx         # ECharts 图表展示
│   │   ├── ExportTools.tsx       # CSV/PNG 导出功能
│   │   ├── InstallmentManager.tsx # 分期还款管理
│   │   ├── ItemManager.tsx       # 收支项目管理
│   │   └── ScenarioSelector.tsx  # 场景切换/创建
│   ├── pages/
│   │   └── Dashboard.tsx         # 主仪表盘页面
│   ├── utils/
│   │   ├── api.ts                # 后端 API 调用封装（axios）
│   │   └── cashflow.ts           # 前端本地现金流计算引擎
│   ├── types.ts                  # TypeScript 类型定义
│   ├── App.tsx                   # 根组件，管理全局状态
│   ├── main.tsx                  # 入口文件
│   └── index.css                 # 全局样式（手写 CSS，无 UI 框架）
├── backend/                      # 后端 API
│   ├── main.py                   # FastAPI 入口，路由和 SQLite 操作
│   ├── cashflow_engine.py        # 后端现金流计算引擎
│   └── requirements.txt          # Python 依赖
├── package.json                  # 前端依赖和脚本
├── vite.config.ts                # Vite 配置（含开发代理）
├── tsconfig.json                 # TypeScript 配置（严格模式）
├── pnpm-workspace.yaml           # pnpm 工作区配置
└── index.html                    # HTML 入口
```

## 启动与构建命令

### 前端

```bash
# 安装依赖
pnpm install

# 开发服务器（端口 3000，自动代理 /api 到 localhost:8000）
pnpm dev

# 生产构建
pnpm build

# 预览构建产物
pnpm preview
```

### 后端

```bash
cd backend

# 安装依赖（推荐用 uv）
uv pip install -r requirements.txt
# 或 pip install -r requirements.txt

# 启动开发服务器（端口 8000，热重载）
uvicorn main:app --reload

# 生产启动
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 架构说明

### 前后端通信
- 前端 Vite 开发服务器配置了代理：`/api` -> `http://localhost:8000`
- 生产环境需自行配置反向代理
- 后端启用了 CORS，`allow_origins=["*"]`（见安全注意事项）

### 数据流现状
- **前端本地计算**：`App.tsx` 使用 `src/utils/cashflow.ts` 进行现金流计算，状态完全在客户端管理
- **后端 API 存在但未对接**：`main.py` 提供了完整的场景 CRUD 接口和计算接口，`src/utils/api.ts` 也封装了 axios 调用，但 `App.tsx` 当前并未调用这些 API（场景数据仅存于前端内存，刷新丢失）
- **导出功能**：CSV 导出由 `ExportTools.tsx` 纯前端实现；PNG 导出通过直接抓取页面上的 ECharts canvas 实现。`api.ts` 中定义的 `exportCSV`/`exportPNG` 后端端点目前**不存在**

### 数据库
- SQLite，文件路径硬编码为 `~/projects/cashflow-viz/backend/data.db`
- 启动 `main.py` 时会自动创建表（`scenarios`、`users`）
- `users` 表目前仅定义了结构，没有任何 API 使用它

### 双计算引擎
项目维护了两份**逻辑相同**的现金流计算代码：
- `src/utils/cashflow.ts`（前端 TypeScript）
- `backend/cashflow_engine.py`（后端 Python）

两者支持的周期类型、分期计算逻辑（单利/复利）保持一致。修改计算逻辑时**必须同步修改两份代码**。

## 代码风格

### 前端
- 使用单引号字符串，省略分号
- 2 空格缩进
- 函数式组件 + React Hooks（`useState`、`useEffect`、`useRef`）
- 类型定义集中在 `src/types.ts`
- 样式使用纯 CSS（`index.css`），无 Tailwind / MUI 等框架，采用 BEM-like 的类名约定（如 `.form-input`、`.btn-primary`）

### 后端
- 标准 Python 风格，4 空格缩进
- 使用 Pydantic 模型做请求校验
- SQLite 通过原生 `sqlite3` 模块操作（无 ORM）
- 日期序列化使用 `datetime.strftime` / `json.dumps`

### TypeScript 配置
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- 构建命令 `tsc && vite build` 会先进行类型检查，类型错误会阻断构建

## 测试

**当前项目没有任何测试。** 没有单元测试、集成测试或端到端测试框架的配置。

## 安全注意事项

1. **CORS 完全开放**：后端 `allow_origins=["*"]`，允许任意来源访问 API
2. **无身份验证**：虽然数据库有 `users` 表，但所有 API 都是公开的，没有任何认证/授权中间件
3. **数据库路径硬编码**：`DB_PATH` 指向 `~/projects/cashflow-viz/backend/data.db`，在部分环境下可能不存在
4. **SQL 注入风险较低**：后端使用参数化查询（`?` 占位符），但存在一处动态 SQL 拼接（`UPDATE scenarios SET {', '.join(updates)}`），尽管参数通过 Pydantic 校验，仍需注意

## 已知问题与注意事项

- `App.tsx` 中的场景数据仅保存在 React 状态里，页面刷新后所有自定义场景和修改都会丢失（后端 API 已就绪但未接入）
- `src/utils/api.ts` 中声明了 `exportCSV` 和 `exportPNG` API，但 `backend/main.py` 没有实现对应路由
- 后端 `users` 表和 `user_id` 字段已预留，但没有任何业务逻辑使用
- 前端和后端的计算引擎逻辑需要保持同步，目前没有自动化手段验证一致性
- 项目没有 ESLint、Prettier、Black、Ruff 等代码格式化/检查工具配置
- `pnpm-workspace.yaml` 内容极简，仅允许 esbuild 构建，未配置其他工作区包
