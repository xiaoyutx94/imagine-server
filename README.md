# Imagine Server

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)

基于 Hono 构建的统一 AI 图像生成 API 服务，支持多个 AI 提供商（Hugging Face、Gitee AI、ModelScope），提供文生图、图生图、图生视频、图像放大等功能。

## ✨ 特性

- 🎨 **多模型支持** - 集成 FLUX、Qwen、Z-Image、Gemini、Grok、OpenAI、ModelsLab 等多个先进的 AI 模型
- 🖼️ **Web UI 界面** - 集成 [Peinture](https://github.com/Amery2010/peinture) 提供友好的图形界面
- 🔌 **插件化架构** - 模块化的 Provider 系统，轻松扩展新的 AI 服务提供商
- 🔄 **智能 Token 管理** - 自动切换和管理多个 API Token，配额耗尽时自动切换
- 💾 **统一存储抽象** - 使用 Unstorage 支持 Redis、Cloudflare KV 等多种存储后端
- ☁️ **S3 兼容存储托管** - 原生支持 AWS S3 / Cloudflare R2 自动化对象存取、Presigned 预签名以及 CDN 取代临时外链
- 🌐 **多平台部署** - 支持 Cloudflare Workers、Vercel、Node.js 等多种部署环境
- 🔐 **Bearer Token 认证** - 可选的 API 访问控制
- 📊 **Token 统计** - 实时查看各提供商的 Token 使用情况
- ⚡ **高性能** - 基于 Hono 框架，轻量且快速
- 🛡️ **类型安全** - 完整的 TypeScript 支持
- 📚 **完善文档** - 详细的开发指南和 API 文档

## 📦 支持的功能

### 图像生成 (Text-to-Image)

- FLUX.1/FLUX.2 系列
- Qwen Image
- Z-Image Turbo
- Ovis Image

### 图像编辑 (Image-to-Image)

- Qwen Image Edit

### 图生视频 (Image-to-Video)

- Wan2.2 I2V

### 图像放大 (Upscaler)

- RealESRGAN x4 Plus

### 文本生成 (Text-to-Text)

- DeepSeek V3.2
- Qwen 3
- OpenAI GPT (via Pollinations)
- Gemini (Pro/Flash)
- Grok 4 系列
- OpenAI GPT-5.4 系列

## 🚀 快速开始

> 💡 **5 分钟快速开始（API）**: 查看 [QUICKSTART.md](docs/QUICKSTART.md) 快速启动 API 服务

### 前置要求

- Node.js >= 18.0.0
- pnpm (推荐) 或 npm

### 安装

```bash
# 克隆仓库
git clone https://github.com/Amery2010/imagine-server.git
cd imagine-server

# 安装依赖
pnpm install

# 构建前端界面
pnpm run build:frontend

# 或使用快速设置脚本
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 环境变量配置

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# API 访问控制（可选）
API_TOKEN=your-secret-token-1,your-secret-token-2

# AI 提供商 Token（逗号分隔多个 Token）
HUGGINGFACE_TOKENS=hf_token1,hf_token2,hf_token3
GITEE_TOKENS=gitee_token1,gitee_token2
MODELSCOPE_TOKENS=ms_token1,ms_token2
GEMINI_TOKENS=gemini_token1,gemini_token2
MODELSLAB_TOKENS=modelslab_token1,modelslab_token2
GROK_TOKENS=grok_token1,grok_token2
OPENAI_TOKENS=openai_token1,openai_token2

# 可选的 API Base 配置 (若不填则使用默认官方地址)
# GEMINI_API_BASE=https://generativelanguage.googleapis.com/v1beta
# GROK_API_BASE=https://api.x.ai/v1
# OPENAI_API_BASE=https://api.openai.com/v1

# S3 兼容存储配置（可选）
# S3_ENDPOINT=https://<your-account-id>.r2.cloudflarestorage.com
# S3_REGION=auto
# S3_ACCESS_KEY_ID=your-access-key
# S3_SECRET_ACCESS_KEY=your-secret-key
# S3_BUCKET_NAME=your-bucket-name
# S3_CDN_URL=https://cdn.yourdomain.com

# 存储配置（选择其一）
# Vercel KV (Upstash Redis)
KV_REST_API_URL=https://your-redis.upstash.io
KV_REST_API_TOKEN=your-upstash-token

# 或标准 Redis
REDIS_URL=redis://localhost:6379
```

### 本地开发

```bash
# 开发模式（热重载）
pnpm run dev

# 服务器将在 http://localhost:3000 启动
# 访问 Web UI 界面
open http://localhost:3000

# 访问健康检查端点
open http://localhost:3000/api/health

# 查看可用模型
open http://localhost:3000/api/v1/models
```

开发服务器会自动监听文件变化并重新加载。

### 类型检查

```bash
pnpm run type-check
```

### 生产模式启动

```bash
pnpm start
```

## 🌐 部署

详细的部署指南请查看 [DEPLOYMENT.md](docs/DEPLOYMENT.md)

### GitHub Actions 自动部署

本项目已配置 GitHub Actions 工作流，可自动部署到 Cloudflare Workers、Vercel 和 GitHub Container Registry。

**部署方式**：

推送版本标签即可触发自动部署：

```bash
# 创建版本标签
git tag v1.0.0

# 推送标签
git push origin v1.0.0

# 自动触发：
# - Docker 镜像构建并推送到 ghcr.io
# - 部署到 Cloudflare Workers
# - 部署到 Vercel
```

**配置步骤**：

1. 在 GitHub 仓库的 **Settings** → **Secrets and variables** → **Actions** 中添加必要的 Secrets
2. 推送版本标签即可自动触发部署
3. 也可以在 **Actions** 标签页手动触发部署

详细配置指南请查看 [GitHub Actions 部署文档](docs/GITHUB_ACTIONS_DEPLOYMENT.md)

### 快速部署

#### Vercel（推荐）

1. **安装 Vercel CLI**

```bash
npm install -g vercel
```

2. **本地开发**

```bash
pnpm run vercel:dev
```

3. **部署**

```bash
# 预览部署
pnpm run vercel:deploy

# 生产部署
pnpm run vercel:prod
```

4. **配置 Vercel KV**

在 Vercel 项目设置中：

- 创建 KV 存储（基于 Upstash Redis）
- 环境变量会自动注入 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN`
- 添加其他环境变量（API_TOKEN、HUGGINGFACE_TOKENS 等）

### 部署到 Cloudflare Workers

1. **创建 KV Namespaces**

```bash
# 创建 Token 状态存储
pnpm run wrangler kv:namespace create "TOKEN_STATUS_KV"
pnpm run wrangler kv:namespace create "TOKEN_STATUS_KV" --preview

# 创建视频任务存储
pnpm run wrangler kv:namespace create "VIDEO_TASK_KV"
pnpm run wrangler kv:namespace create "VIDEO_TASK_KV" --preview
```

2. **更新 wrangler.toml**

将生成的 KV namespace ID 填入 `wrangler.toml`

3. **本地开发**

```bash
pnpm run wrangler:dev
```

4. **部署**

```bash
pnpm run wrangler:deploy
```

5. **查看日志**

```bash
pnpm run wrangler:tail
```

### Node.js 部署

```bash
# 构建
pnpm run build

# 启动
pnpm start

# 或使用 PM2
pm2 start ecosystem.config.js
```

### Docker 部署

```bash
# 使用 docker-compose
cd docker
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止
docker-compose down
```

详细的部署指南请查看 [DEPLOYMENT.md](docs/DEPLOYMENT.md)

## 🖼️ Web UI 界面

本项目集成了 [Peinture](https://github.com/Amery2010/peinture) 作为 Web UI 界面，提供友好的图形化操作体验。

### 访问界面

启动服务器后，访问根路径即可使用 Web UI：

```
http://localhost:3000
```

### 构建前端

前端静态文件需要单独构建：

```bash
# 构建前端（首次使用或更新时）
pnpm run build:frontend
```

此命令会自动：

1. 克隆 Peinture 项目
2. 安装依赖并构建
3. 将构建产物复制到 `public/` 目录

### 路由说明

- `/` - Web UI 界面（Peinture）
- `/api/*` - 后端 API 接口

详细说明请查看 [FRONTEND_INTEGRATION.md](docs/FRONTEND_INTEGRATION.md)

## 📖 API 文档

### 认证

如果配置了 `API_TOKEN`，所有 `/api/v1/*` 端点都需要认证。

**请求头格式：**

```bash
Authorization: Bearer your-secret-token
```

**示例：**

```bash
# 不带 token（返回 401）
curl http://localhost:3000/api/v1/models

# 带正确 token（返回 200）
curl -H "Authorization: Bearer your-secret-token" \
  http://localhost:3000/api/v1/models
```

**注意：**

- `/api/health` 端点不需要认证
- 可以配置多个 token（逗号分隔）：`API_TOKEN=token1,token2,token3`
- 如果不配置 `API_TOKEN`，所有端点都可以公开访问

完整的 API 文档请查看 [在线文档](https://amery2010.github.io/imagine-server/)

#### 健康检查

```bash
GET /api/health
```

响应：

```json
{
  "status": "ok",
  "timestamp": "2025-12-29T12:00:00.000Z",
  "version": "1.0.0"
}
```

#### 获取可用模型

```bash
GET /api/v1/models
```

#### 文生图

```bash
POST /api/v1/generate
Content-Type: application/json

{
  "model": "gitee/flux-2",
  "prompt": "a beautiful sunset over mountains",
  "ar": "16:9",
  "steps": 20,
  "guidance": 3.5,
  "seed": 12345
}
```

#### 图生图

```bash
POST /api/v1/edit
Content-Type: multipart/form-data

model: gitee/qwen-image-edit
prompt: add a rainbow in the sky
image: [file]
steps: 16
guidance: 4
```

#### 图生视频

```bash
POST /api/v1/video
Content-Type: application/json

{
  "model": "gitee/wan2.2-i2v",
  "imageUrl": "https://...",
  "prompt": "make this image come alive",
  "duration": 3,
  "steps": 10,
  "guidance": 4
}
```

#### 图像放大

```bash
POST /api/v1/upscaler
Content-Type: application/json

{
  "imageUrl": "https://..."
}
```

#### Prompt 优化

```bash
POST /api/v1/text
Content-Type: application/json

{
  "model": "gitee/deepseek-v3",
  "prompt": "a cat"
}
```

#### Token 统计

```bash
# 单个提供商
GET /api/v1/token-stats?provider=gitee

# 所有提供商
GET /api/v1/token-stats/all
```

#### 重置 Token 状态

```bash
POST /api/v1/token-reset
Content-Type: application/json

{
  "provider": "gitee"
}
```

#### 数据清理

```bash
DELETE /v1/storage/cleanup?startDate=2024-01-01T00:00:00.000Z&endDate=2024-12-31T23:59:59.999Z
```

## 🎨 支持的模型

### Google Gemini

| 模型 ID                  | 名称            | 类型        |
| ------------------------ | --------------- | ----------- |
| `gemini/nano-banana-2`   | Nano Banana 2   | image2image |
| `gemini/nano-banana-pro` | Nano Banana Pro | image2image |
| `gemini/nano-banana`     | Nano Banana     | image2image |
| `gemini/gemini-3.1-pro`  | Gemini 3.1 Pro  | text2text   |
| `gemini/gemini-3-flash`  | Gemini 3 Flash  | text2text   |
| `gemini/gemini-2.5-pro`  | Gemini 2.5 Pro  | text2text   |
| `gemini/veo-3.1`         | Veo 3.1         | text2video  |
| `gemini/veo-3`           | Veo 3           | text2video  |

### ModelsLab

| 模型 ID                      | 名称                 | 类型       |
| ---------------------------- | -------------------- | ---------- |
| `modelslab/flux`             | Flux (ModelsLab)     | text2image |
| `modelslab/flux-dev`         | Flux Dev (ModelsLab) | text2image |
| `modelslab/sdxl`             | Stable Diffusion XL  | text2image |
| `modelslab/realistic-vision` | Realistic Vision v6  | text2image |
| `modelslab/cogvideox-5b`     | CogVideoX-5B         | text2video |

### xAI (Grok)

| 模型 ID                             | 名称                    | 类型        |
| ----------------------------------- | ----------------------- | ----------- |
| `grok/grok-imagine-image`           | Grok Imagine Image      | image2image |
| `grok/grok-imagine-image-pro`       | Grok Imagine Image Pro  | image2image |
| `grok/grok-4.20-0309-reasoning`     | Grok 4.2 Reasoning      | text2text   |
| `grok/grok-4.20-0309-non-reasoning` | Grok 4.2                | text2text   |
| `grok/grok-4-1-fast-reasoning`      | Grok 4.1 Fast Reasoning | text2text   |
| `grok/grok-4-1-fast-non-reasoning`  | Grok 4.1 Fast           | text2text   |
| `grok/grok-imagine-video`           | Grok Imagine Video      | text2video  |

### OpenAI

| 模型 ID                           | 名称             | 类型        |
| --------------------------------- | ---------------- | ----------- |
| `openai/gpt-image-1.5-2025-12-16` | GPT Image 1.5    | image2image |
| `openai/gpt-image-1-mini`         | GPT Image 1 Mini | image2image |
| `openai/gpt-5.4`                  | GPT-5.4          | text2text   |
| `openai/gpt-5.4-mini`             | GPT-5.4 mini     | text2text   |
| `openai/gpt-5.4-nano`             | GPT-5.4 nano     | text2text   |
| `openai/sora-2`                   | Sora 2           | text2video  |
| `openai/sora-2-pro`               | Sora 2 Pro       | text2video  |

### Gitee AI

| 模型 ID                 | 名称            | 类型        |
| ----------------------- | --------------- | ----------- |
| `gitee/z-image-turbo`   | Z-Image Turbo   | text2image  |
| `gitee/qwen-image`      | Qwen Image      | text2image  |
| `gitee/flux-2`          | FLUX.2          | text2image  |
| `gitee/flux-1-schnell`  | FLUX.1 Schnell  | text2image  |
| `gitee/flux-1-krea`     | FLUX.1 Krea     | text2image  |
| `gitee/flux-1`          | FLUX.1          | text2image  |
| `gitee/qwen-image-edit` | Qwen Image Edit | image2image |
| `gitee/wan2.2-i2v`      | Wan2.2 I2V      | image2video |
| `gitee/deepseek-v3`     | DeepSeek V3.2   | text2text   |
| `gitee/qwen-3`          | Qwen 3          | text2text   |

### Hugging Face

| 模型 ID                           | 名称                | 类型        |
| --------------------------------- | ------------------- | ----------- |
| `huggingface/z-image-turbo`       | Z-Image Turbo       | text2image  |
| `huggingface/qwen-image`          | Qwen Image          | text2image  |
| `huggingface/ovis-image`          | Ovis Image          | text2image  |
| `huggingface/flux-1-schnell`      | FLUX.1 Schnell      | text2image  |
| `huggingface/qwen-image-edit`     | Qwen Image Edit     | image2image |
| `huggingface/realesrgan`          | RealESRGAN x4 Plus  | upscaler    |
| `huggingface/wan2_2-i2v`          | Wan2.2 I2V          | image2video |
| `huggingface/openai-gpt-4_1-nano` | OpenAI GPT-4.1 Nano | text2text   |
| `huggingface/openai-gpt-5-nano`   | OpenAI GPT-5 Nano   | text2text   |

### ModelScope

| 模型 ID                      | 名称            | 类型        |
| ---------------------------- | --------------- | ----------- |
| `modelscope/z-image-turbo`   | Z-Image Turbo   | text2image  |
| `modelscope/flux-2`          | FLUX.2          | text2image  |
| `modelscope/flux-1-krea`     | FLUX.1 Krea     | text2image  |
| `modelscope/flux-1`          | FLUX.1          | text2image  |
| `modelscope/qwen-image-edit` | Qwen Image Edit | image2image |
| `modelscope/deepseek-v3`     | DeepSeek V3.2   | text2text   |
| `modelscope/qwen-3`          | Qwen 3          | text2text   |

## 💾 存储配置

项目使用 [Unstorage](https://unstorage.unjs.io/) 作为统一的 KV 存储抽象层。

### 存储选择优先级

1. **Upstash Redis** (Vercel KV) - `KV_REST_API_URL` + `KV_REST_API_TOKEN`
2. **标准 Redis** - `REDIS_URL`
3. **Cloudflare KV** - `TOKEN_STATUS_KV` binding
4. **内存存储** - 开发环境回退（数据不持久化）

### Vercel 部署

Vercel 会自动注入 KV 环境变量，无需手动配置。

### Cloudflare Workers

在 `wrangler.toml` 中配置 KV namespace。

### 自建 Redis

```bash
# Docker 运行 Redis
docker run -d -p 6379:6379 redis:7-alpine

# 配置环境变量
REDIS_URL=redis://localhost:6379
```

## 🛠️ 开发

### 项目结构

```
imagine-server/
├── src/                        # 源代码
│   ├── api/                    # API 路由
│   │   ├── imagine.ts          # 统一 API 入口
│   │   └── token-manager.ts    # Token 管理
│   ├── providers/              # Provider 插件系统
│   │   ├── base.ts             # Provider 基类和接口
│   │   ├── utils.ts            # 通用工具函数
│   │   ├── registry.ts         # Provider 注册器
│   │   ├── gitee.ts            # Gitee AI Provider
│   │   ├── huggingface.ts      # Hugging Face Provider
│   │   └── modelscope.ts       # Model Scope Provider
│   ├── index.ts                # 应用入口
│   ├── storage.ts              # 存储配置
│   └── types.d.ts              # 类型定义
├── server/                     # 本地服务器
│   ├── server.ts               # Node.js 服务器入口
│   └── ecosystem.config.js     # PM2 配置
├── docker/                     # Docker 配置
│   ├── Dockerfile              # Docker 镜像配置
│   ├── docker-compose.yml      # Docker Compose 配置
│   └── README.md               # Docker 部署指南
├── docs/                       # 文档（VitePress）
│   ├── .vitepress/             # VitePress 配置
│   ├── index.md                # 文档首页
│   ├── QUICKSTART.md           # 快速开始
│   ├── DEPLOYMENT.md           # 部署指南
│   ├── QUICK_REFERENCE.md      # 快速参考
│   ├── ARCHITECTURE_OVERVIEW.md      # 架构概览
│   ├── PROVIDER_ARCHITECTURE.md      # Provider 架构
│   ├── PROVIDER_PLUGIN_GUIDE.md      # Provider 开发指南
│   ├── CONTRIBUTING.md         # 贡献指南
│   └── CHANGELOG.md            # 更新日志
├── scripts/                    # 脚本工具
│   └── setup.sh                # 快速设置脚本
├── .github/                    # GitHub 配置
│   └── workflows/              # GitHub Actions
│       └── deploy-docs.yml     # 文档自动部署
├── .env.example                # 环境变量模板
├── package.json                # 项目配置
├── tsconfig.json               # TypeScript 配置
├── vercel.json                 # Vercel 配置
├── wrangler.toml               # Cloudflare Workers 配置
└── README.md                   # 项目文档
```

### 插件化架构

本项目采用模块化的 Provider 插件系统，每个 AI 服务提供商都是一个独立的插件。

**核心优势**：

- 🎯 代码组织清晰，易于维护
- 🚀 添加新 Provider 只需创建新文件
- 🧪 独立测试，互不影响
- 👥 支持团队并行开发

**添加新 Provider**：

1. 复制 Provider 模板：

   ```bash
   cp docs/PROVIDER_TEMPLATE.ts.example src/providers/myprovider.ts
   ```

2. 实现 Provider 类：

   ```typescript
   export class MyProvider extends BaseProvider {
     readonly name = "myprovider";
     readonly supportedActions = ["generate"];

     getModelConfigs() {
       /* ... */
     }
     async handleRequest(c, action, params) {
       /* ... */
     }
   }
   ```

3. 注册 Provider：
   ```typescript
   // 在 src/providers/registry.ts
   providerRegistry.register(new MyProvider());
   ```

**详细文档**：

- [Provider 插件开发指南](docs/PROVIDER_PLUGIN_GUIDE.md) - 完整的开发教程
- [Provider 架构说明](docs/PROVIDER_ARCHITECTURE.md) - 架构设计详解
- [快速参考](docs/QUICK_REFERENCE.md) - 常用代码片段

### 可用脚本

```bash
# 开发
pnpm run dev              # 开发模式（热重载）
pnpm run start            # 生产启动
pnpm run build            # TypeScript 编译
pnpm run type-check       # 类型检查

# Vercel
pnpm run vercel:dev       # Vercel 本地开发
pnpm run vercel:build     # Vercel 构建
pnpm run vercel:deploy    # Vercel 部署
pnpm run vercel:prod      # Vercel 生产部署

# Cloudflare Workers
pnpm run wrangler:dev     # Cloudflare 本地开发
pnpm run wrangler:deploy  # Cloudflare 部署
pnpm run wrangler:tail    # Cloudflare 日志查看
```

### 添加新模型

#### 为现有 Provider 添加模型

在对应的 Provider 文件中更新 `getModelConfigs()` 方法：

```typescript
// src/providers/gitee.ts
getModelConfigs() {
  return {
    // ... 现有模型
    "new-model": {
      apiId: "API-Model-ID",
      config: {
        id: "gitee/new-model",
        name: "New Model Name",
        type: ["text2image"],
        steps: { range: [1, 20], default: 10 },
      },
    },
  };
}
```

#### 添加新的 Provider

查看详细指南：[Provider 插件开发指南](docs/PROVIDER_PLUGIN_GUIDE.md)

或参考：[贡献指南](CONTRIBUTING.md)

## 🐛 故障排查

### Token 没有自动切换

1. 检查存储是否正确配置（查看启动日志）
2. 确认 Token 环境变量格式正确（逗号分隔）
3. 查看控制台日志确认 Token 耗尽检测

### Redis 连接失败

1. 检查 `REDIS_URL` 或 `KV_REST_API_URL` 格式
2. 确认 Redis 服务正在运行
3. 检查网络连接和防火墙设置

### Cloudflare KV 不工作

1. 检查 `wrangler.toml` 中 KV binding 配置
2. 确认 KV namespace 已创建
3. 部署时确保包含了 KV binding

### Vercel 部署问题

1. 确认已创建 Vercel KV 存储
2. 检查环境变量是否正确设置
3. 查看 Vercel 部署日志

## 📝 更新日志

查看 [CHANGELOG.md](docs/CHANGELOG.md) 了解版本变更。

### 最新版本 v1.1.0

- 🔌 重构为插件化架构
- 📚 完善的文档系统
- 🛠️ 降低贡献门槛
- ✅ 保持完全向后兼容

详见 [CHANGELOG.md](docs/CHANGELOG.md)

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](docs/CONTRIBUTING.md) 了解如何参与项目。

**贡献新 Provider**：

1. 阅读 [Provider 插件开发指南](docs/PROVIDER_PLUGIN_GUIDE.md)
2. 使用 [Provider 模板](docs/PROVIDER_TEMPLATE.ts.example)
3. 参考 [快速参考](docs/QUICK_REFERENCE.md)
4. 提交 Pull Request

**发布新版本**：

查看 [版本发布指南](docs/RELEASE_GUIDE.md) 了解如何发布新版本并触发自动部署。

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

## 🙏 致谢

- [Hono](https://hono.dev/) - 轻量级 Web 框架
- [Unstorage](https://unstorage.unjs.io/) - 统一存储抽象层
- [Hugging Face](https://huggingface.co/) - AI 模型平台
- [Gitee AI](https://ai.gitee.com/) - AI 服务平台
- [ModelScope](https://modelscope.cn/) - AI 模型社区

## 📧 联系

如有问题或建议，请提交 [Issue](https://github.com/yourusername/imagine-server/issues)。

---

Made with ❤️ by the u14.app Team
