import { AwsClient } from "aws4fetch";
import type { Bindings } from "../types";

export class S3Service {
  private aws: AwsClient;
  private endpoint: string;
  private bucket: string;
  private region: string;
  private cdnUrl?: string;

  public isActive: boolean;

  constructor(env: Bindings) {
    const {
      S3_ENDPOINT,
      S3_REGION,
      S3_ACCESS_KEY_ID,
      S3_SECRET_ACCESS_KEY,
      S3_BUCKET_NAME,
      S3_CDN_URL,
    } = env;

    if (
      !S3_ENDPOINT ||
      !S3_ACCESS_KEY_ID ||
      !S3_SECRET_ACCESS_KEY ||
      !S3_BUCKET_NAME
    ) {
      this.isActive = false;
      // 初始化空 AWS Client，防止外部直接访问属性导致崩溃
      this.aws = new AwsClient({ accessKeyId: "", secretAccessKey: "" });
      this.endpoint = "";
      this.bucket = "";
      this.region = "";
      return;
    }

    this.isActive = true;
    this.endpoint = S3_ENDPOINT.replace(/\/$/, "");
    this.bucket = S3_BUCKET_NAME;
    this.region = S3_REGION || "auto";
    this.cdnUrl = S3_CDN_URL ? S3_CDN_URL.replace(/\/$/, "") : undefined;

    this.aws = new AwsClient({
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
      service: "s3",
      region: this.region,
    });
  }

  /**
   * 构造标准 S3 R2 Path-Style URL
   */
  private getBlobUrl(key: string): string {
    return `${this.endpoint}/${this.bucket}/${key}`;
  }

  /**
   * 上传文件并返回最终带有 24 小时预签名的访问 URL
   */
  async uploadFile(
    data: ArrayBuffer | Uint8Array | string | Blob | Buffer,
    extension: string = "png",
    contentType?: string,
  ): Promise<{ key: string; url: string }> {
    if (!this.isActive) throw new Error("S3 Service is not configured.");

    const date = new Date();
    const folder = `${date.getFullYear()}${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getDate().toString().padStart(2, "0")}`;
    const filename = `${crypto.randomUUID()}.${extension}`;
    const key = `uploads/${folder}/${filename}`;

    const rawUrl = this.getBlobUrl(key);
    
    const headers: Record<string, string> = {};
    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    // AWS PUT
    const response = await this.aws.fetch(rawUrl, {
      method: "PUT",
      headers,
      body: data as any,
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to upload to S3: ${response.status} ${errText}`);
    }

    // 生成 URL (CDN 或 Presigned)
    const url = await this.getPresignedUrl(key);

    return { key, url };
  }

  /**
   * 获取文件预签名 URL，限制 24 小时访问
   */
  async getPresignedUrl(
    key: string,
    expiresIn: number = 86400,
  ): Promise<string> {
    if (!this.isActive) return "";

    const rawUrl = this.getBlobUrl(key);
    const urlObj = new URL(rawUrl);
    urlObj.searchParams.set("X-Amz-Expires", expiresIn.toString());

    const signedRequest = await this.aws.sign(urlObj.toString(), {
      aws: { signQuery: true },
    });

    let finalUrl = signedRequest.url;

    // 当配置了 CDN URL，我们替换原 S3 的端点+桶名为 CDN 的域名
    // CDN 需要具备透传 Query 参数签名或者为公共桶才有效
    if (this.cdnUrl) {
      const s3Base = `${this.endpoint}/${this.bucket}`;
      finalUrl = finalUrl.replace(s3Base, this.cdnUrl);
    }

    return finalUrl;
  }

  /**
   * 清理过期文件
   */
  async cleanupOldFiles(startDate: Date, endDate: Date): Promise<number> {
    if (!this.isActive) throw new Error("S3 Service is not configured.");

    let deletedCount = 0;
    let isTruncated = true;
    let continuationToken: string | undefined;

    while (isTruncated) {
      const listUrl = new URL(`${this.endpoint}/${this.bucket}`);
      listUrl.searchParams.set("list-type", "2");
      if (continuationToken) {
        listUrl.searchParams.set("continuation-token", continuationToken);
      }

      const response = await this.aws.fetch(listUrl.toString(), {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error(`S3 List failed: ${await response.text()}`);
      }

      const xmlText = await response.text();

      // Cloudflare/Edge 环境中缺少原生 XML Parser，采用正则安全提取即可 (AWS S3 标准结构稳定)
      const objects = [...xmlText.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)];

      const keysToDelete: string[] = [];

      for (const objMatch of objects) {
        const content = objMatch[1];
        const keyMatch = content.match(/<Key>(.*?)<\/Key>/);
        const dateMatch = content.match(/<LastModified>(.*?)<\/LastModified>/);

        if (keyMatch && dateMatch) {
          const key = keyMatch[1];
          const lastModified = new Date(dateMatch[1]);

          if (lastModified >= startDate && lastModified <= endDate) {
            keysToDelete.push(key);
          }
        }
      }

      if (keysToDelete.length > 0) {
        // Batch Delete
        let deleteXml = `<?xml version="1.0" encoding="UTF-8"?><Delete><Quiet>true</Quiet>`;
        for (const key of keysToDelete) {
          deleteXml += `<Object><Key>${key}</Key></Object>`;
        }
        deleteXml += `</Delete>`;

        const deleteUrl = `${this.endpoint}/${this.bucket}?delete`;
        const delRes = await this.aws.fetch(deleteUrl, {
          method: "POST",
          headers: { "Content-Type": "application/xml" },
          body: deleteXml,
        });

        if (!delRes.ok) {
          const err = await delRes.text();
          throw new Error(`Batch delete failed: ${err}`);
        }
        
        deletedCount += keysToDelete.length;
      }

      const isTruncatedMatch = xmlText.match(
        /<IsTruncated>(txt|true|false)<\/IsTruncated>/i,
      );
      isTruncated = isTruncatedMatch
        ? isTruncatedMatch[1].toLowerCase() === "true"
        : false;
      const nextTokenMatch = xmlText.match(
        /<NextContinuationToken>(.*?)<\/NextContinuationToken>/,
      );
      continuationToken = nextTokenMatch ? nextTokenMatch[1] : undefined;
    }

    return deletedCount;
  }
}
