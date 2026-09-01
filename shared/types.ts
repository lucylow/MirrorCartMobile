export type StylingMode = "occasion" | "closet" | "fix_outfit";
export type LookCategory = "dress" | "top" | "bottom" | "shoes" | "bag" | "accessory";
export type OrchestrationStatus =
  | "draft"
  | "uploading"
  | "searching"
  | "composing"
  | "trying_on"
  | "ready"
  | "refining"
  | "cart_ready"
  | "error";

export interface StylingIntent {
  mode: StylingMode;
  request: string;
  occasion: string;
  aesthetic: string;
  budgetCents: number;
  ownedItems: string[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: LookCategory;
  priceCents: number;
  imageUrl: string;
  merchantUrl: string;
  color: string;
  currency?: string;
  sizes?: string[];
  availability?: "in_stock" | "limited" | "unavailable" | "unknown";
  availabilityReason?: string;
  dataSource?: "api" | "cache" | "seed";
  sourceName?: string;
  lastCheckedAt?: string;
  owned?: boolean;
}

export interface Look {
  id: string;
  title: string;
  subtitle: string;
  rationale: string;
  items: Product[];
  totalCents: number;
  previewUrl?: string;
  provider?: "perfect-corp" | "mock";
  status: "draft" | "processing" | "ready" | "error";
}

export interface ProgressEvent {
  id: string;
  label: string;
  detail: string;
  done: boolean;
}

export interface StylingSession {
  id: string;
  intent: StylingIntent;
  photoUri?: string;
  status: OrchestrationStatus;
  progress: ProgressEvent[];
  looks: Look[];
  selectedLookId?: string;
  refinement?: string;
  vtoTaskId?: string;
  vtoProvider?: "perfect-corp" | "mock";
  vtoPreviewUrl?: string;
  archivedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DraftCartStatus = "draft" | "awaiting_approval" | "approved" | "submitted";

export interface CartState {
  id?: string;
  lookId: string;
  items: CartItem[];
  totalCents: number;
  status?: DraftCartStatus;
  approvalExpiresAt?: string;
}
