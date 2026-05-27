import type { DocumentKind } from "@/lib/types";

export const documentKinds: DocumentKind[] = [
  "General",
  "Loan Estimate",
  "Closing Disclosure",
  "Pre-Approval Letter",
  "Purchase Agreement",
  "Inspection Report"
];

export const documentReviewInstructions: Record<DocumentKind, string> = {
  General:
    "Summarize the document, explain why it matters, identify deadlines, obligations, fees, unusual terms, and questions the buyer should ask.",
  "Loan Estimate":
    "Review loan amount, interest rate, APR, projected payment, cash to close, origination charges, lender credits, rate lock status, escrow items, and whether anything conflicts with THDA Great Choice expectations.",
  "Closing Disclosure":
    "Compare final payment, cash to close, loan costs, prepaid items, escrow setup, seller credits, due dates, and anything the buyer should question before signing.",
  "Pre-Approval Letter":
    "Review loan type, approval amount, conditions, expiration date, assumptions, required documents, and questions the buyer should ask before making offers.",
  "Purchase Agreement":
    "Review offer price, earnest money, inspection/appraisal/financing contingencies, seller concessions, closing date, repair terms, possession, and deadlines.",
  "Inspection Report":
    "Identify major safety, structural, electrical, plumbing, roof, moisture, pest, HVAC, and repair-cost concerns; separate urgent issues from normal maintenance."
};
