import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  proxyRequest,
  getAvailableModels,
  getAvailableModelsFiltered,
} from "./api/imagine";
import {
  getTokenStatsHandler,
  getAllTokenStatsHandler,
  resetTokenStatusHandler,
} from "./api/token-manager";
import { createAutoStorage } from "./storage";
import type { Bindings } from "./types";
import { S3Service } from "./services/s3";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const app = new Hono<{ Bindings: Bindings }>();
export const webApp = new Hono<{ Bindings: Bindings }>();

// 初始化存储（应用启动时）
let globalStorage: any = null;

// 存储中间件：为每个请求注入 storage
app.use("*", async (c, next) => {
  // 在无服务器环境中，每次请求都可能是新的实例
  // 所以我们需要检查是否已经初始化
  if (!globalStorage) {
    globalStorage = createAutoStorage(c.env);
  }
  c.env.storage = globalStorage;
  await next();
});

// 全局 CORS 配置（在认证之前）
app.use("/*", async (c, next) => {
  const allowedConfig = c.env.ALLOWED_ORIGINS;
  const allowedOrigins = allowedConfig
    ? allowedConfig.split(",").map((o: string) => o.trim())
    : ["*"];

  return cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length", "Content-Type"],
    maxAge: 86400,
    credentials: true,
  })(c, next);
});
app.use(logger());

// 应用认证中间件到需要认证的 API 路由
app.use("/v1/*", async (c, next) => {
  const tokens = c.env.API_TOKEN;

  // 如果没有配置 API_TOKEN，则跳过认证
  if (!tokens) {
    return next();
  }

  // 获取 Authorization 头
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json(
      { error: "Unauthorized", message: "Missing Authorization header" },
      401,
    );
  }

  // 检查是否是 Bearer token
  if (!authHeader.startsWith("Bearer ")) {
    return c.json(
      { error: "Unauthorized", message: "Invalid Authorization format" },
      401,
    );
  }

  // 提取 token
  const token = authHeader.substring(7); // 移除 "Bearer " 前缀

  // 简单的固定时间比较函数（减缓时序攻击）
  const timingSafeEqual = (a: string, b: string) => {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  };

  // 验证 token
  const validTokens = tokens.split(",").map((t) => t.trim());
  let isValid = false;

  for (const validToken of validTokens) {
    if (timingSafeEqual(validToken, token)) {
      isValid = true;
      break;
    }
  }

  if (!isValid) {
    return c.json({ error: "Unauthorized", message: "Invalid token" }, 401);
  }

  // Token 有效，继续处理请求
  await next();
});

// 获取可用模型列表（根据 token 可用性动态过滤）
app.get("/v1/models", async (c) => {
  const models = await getAvailableModelsFiltered(c.env);
  return c.json(models);
});

// 获取所有模型列表（不过滤，用于管理和调试）
app.get("/v1/models/all", (c) => {
  const models = getAvailableModels();
  return c.json(models);
});

// RESTful 风格的 AI 服务代理 API
app.post("/v1/:action", proxyRequest);

// 获取 Token 统计信息
app.get("/v1/token-stats", getTokenStatsHandler);

// 获取所有 Provider 的 Token 统计信息
app.get("/v1/token-stats/all", getAllTokenStatsHandler);

// 重置 Token 状态（管理接口）
app.post("/v1/token-reset", resetTokenStatusHandler);

// 清理 S3 早期文件
app.delete(
  "/v1/storage/cleanup",
  zValidator(
    "query",
    z.object({
      startDate: z.string().datetime({ message: "Invalid ISO 8601 startDate" }),
      endDate: z.string().datetime({ message: "Invalid ISO 8601 endDate" }),
    })
  ),
  async (c) => {
    try {
      const s3 = new S3Service(c.env);
      if (!s3.isActive) {
        return c.json({ error: "S3 service is not enabled" }, 400);
      }
      const { startDate, endDate } = c.req.valid("query");
      const deletedCount = await s3.cleanupOldFiles(
        new Date(startDate),
        new Date(endDate)
      );
      return c.json({ status: "success", deletedCount });
    } catch (e: any) {
      return c.json({ error: "Cleanup failed", message: e.message }, 500);
    }
  }
);

// 健康检查
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.2.0",
  });
});

// 挂载 API 路由
webApp.route("/api", app);

// 挂载 API 路由
webApp.get("/", (c) => c.redirect("/index.html"));

export default webApp;
