import type { Look } from "../shared/types";

const DEFAULT_BASE_URL = "https://yce-api-01.makeupar.com";
type ProviderResponse = { status?: number; data?: any; error?: string; error_code?: string };
type ImageBytes = { bytes: ArrayBuffer; contentType: string; fileName: string; kind: "user" | "garment" };

export interface VtoTaskInput { userImageUrl: string; userFileId?: string; look: Look; }
export interface VtoTaskResult { taskId: string; status: "queued" | "processing" | "ready" | "error"; previewUrl?: string; provider: "perfect-corp" | "mock"; message?: string; }
export interface VtoProvider {
  uploadImage(input: { url: string; kind: "user" | "garment" }): Promise<{ fileId: string }>;
  uploadImageBytes(input: ImageBytes): Promise<{ fileId: string }>;
  createTask(input: VtoTaskInput): Promise<VtoTaskResult>;
  getTask(taskId: string): Promise<VtoTaskResult>;
}

function requireRemoteUrl(url: string) { if (!/^https?:\/\//i.test(url)) throw new Error("The VTO provider requires a public image URL; upload the photo before trying on."); }
export function normalizeStatus(status: string | undefined): VtoTaskResult["status"] { if (status === "success" || status === "completed") return "ready"; if (status === "failed" || status === "error") return "error"; if (status === "processing" || status === "running") return "processing"; return "queued"; }

export class MockVtoProvider implements VtoProvider {
  async uploadImage(input: { url: string; kind: "user" | "garment" }) { return { fileId: `mock-${input.kind}-${Date.now()}` }; }
  async uploadImageBytes(input: ImageBytes) { return { fileId: `mock-${input.kind}-${Date.now()}` }; }
  async createTask(input: VtoTaskInput): Promise<VtoTaskResult> { return { taskId: `mock-task-${Date.now()}`, status: "ready", provider: "mock", previewUrl: input.userImageUrl || input.look.items[0]?.imageUrl, message: "Mock adapter active. Configure the Perfect Corp adapter server-side for live VTO." }; }
  async getTask(taskId: string): Promise<VtoTaskResult> { return { taskId, status: "ready", provider: "mock", message: "Mock task complete." }; }
}

export class PerfectCorpVtoProvider implements VtoProvider {
  private readonly baseUrl: string;
  constructor(private readonly apiKey: string, baseUrl = process.env.PERFECT_CORP_API_BASE_URL || DEFAULT_BASE_URL) { this.baseUrl = baseUrl.replace(/\/$/, ""); }
  private async request(path: string, init: RequestInit): Promise<ProviderResponse> { const response = await fetch(`${this.baseUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${this.apiKey}`, "content-type": "application/json", ...(init.headers || {}) } }); const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(`Perfect Corp request failed (${response.status}): ${body?.error || body?.error_code || "unknown provider error"}`); return body; }
  async uploadImage(input: { url: string; kind: "user" | "garment" }) { requireRemoteUrl(input.url); const source = await fetch(input.url); if (!source.ok) throw new Error(`Unable to download ${input.kind} image for VTO`); const bytes = await source.arrayBuffer(); return this.uploadImageBytes({ bytes, contentType: source.headers.get("content-type") || "image/jpeg", fileName: `${input.kind}-${Date.now()}.jpg`, kind: input.kind }); }
  async uploadImageBytes(input: ImageBytes): Promise<{ fileId: string }> {
    if (!/^image\/(jpeg|jpg|png)$/i.test(input.contentType)) throw new Error("VTO images must be JPEG or PNG");
    if (input.bytes.byteLength > 10 * 1024 * 1024) throw new Error("VTO images must be smaller than 10 MB");
    const allocation = await this.request("/s2s/v2.0/file", { method: "POST", body: JSON.stringify({ files: [{ content_type: input.contentType, file_name: input.fileName, file_size: input.bytes.byteLength }] }) });
    const file = allocation.data?.files?.[0]; const upload = file?.requests?.find((request: { method?: string }) => request.method === "PUT") || file?.requests?.[0];
    if (!file?.file_id || !upload?.url) throw new Error("Perfect Corp file allocation response was incomplete");
    const put = await fetch(upload.url, { method: "PUT", headers: { "Content-Type": input.contentType, "Content-Length": String(input.bytes.byteLength) }, body: input.bytes });
    if (!put.ok) throw new Error(`Perfect Corp image upload failed (${put.status})`);
    return { fileId: file.file_id };
  }
  async createTask(input: VtoTaskInput): Promise<VtoTaskResult> { if (!input.userFileId) requireRemoteUrl(input.userImageUrl); const referenceUrl = input.look.items.find((item) => item.category === "dress" || item.category === "top")?.imageUrl || input.look.items[0]?.imageUrl; requireRemoteUrl(referenceUrl); const response = await this.request("/s2s/v2.0/task/cloth-v4", { method: "POST", body: JSON.stringify({ ...(input.userFileId ? { src_file_id: input.userFileId } : { src_file_url: input.userImageUrl }), ref_file_url: referenceUrl, garment_category: "full_body" }) }); const taskId = response.data?.task_id; if (!taskId) throw new Error("Perfect Corp task response did not include task_id"); return { taskId, status: "queued", provider: "perfect-corp" }; }
  async getTask(taskId: string): Promise<VtoTaskResult> { const response = await this.request(`/s2s/v2.0/task/cloth-v4/${encodeURIComponent(taskId)}`, { method: "GET" }); const data = response.data || {}; return { taskId, status: data.error ? "error" : normalizeStatus(data.task_status), provider: "perfect-corp", previewUrl: data.results?.url, message: data.error?.message || data.error || undefined }; }
}

export function getVtoProvider(): VtoProvider { return process.env.PERFECT_CORP_API_KEY ? new PerfectCorpVtoProvider(process.env.PERFECT_CORP_API_KEY) : new MockVtoProvider(); }
