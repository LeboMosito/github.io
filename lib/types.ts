export type BuyerPhase = "Prep" | "Pre-Approval" | "Search" | "Closing";

export type DocumentKind =
  | "General"
  | "Loan Estimate"
  | "Closing Disclosure"
  | "Pre-Approval Letter"
  | "Purchase Agreement"
  | "Inspection Report";

export type StoredDocument = {
  id: string;
  name: string;
  type: string;
  kind?: DocumentKind;
  size?: number;
  text: string;
  warnings?: string[];
  createdAt: string;
  retentionUntil?: string;
};

export type ChecklistState = Record<string, boolean>;

export type PrivacyClearTarget = "guest" | "chat" | "documents";
