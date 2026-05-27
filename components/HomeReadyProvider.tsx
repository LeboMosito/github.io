"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { BuyerPhase, ChecklistState, PrivacyClearTarget, StoredDocument } from "@/lib/types";

type HomeReadyContext = {
  phase: BuyerPhase;
  setPhase: (phase: BuyerPhase) => void;
  documents: StoredDocument[];
  addDocument: (document: StoredDocument) => Promise<void>;
  checklist: ChecklistState;
  setChecklistItem: (id: string, checked: boolean) => Promise<void>;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  userEmail: string | null;
  authMode: "guest" | "signed-in";
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  saveConversation: (messages: unknown[]) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  clearPrivacyData: (target: PrivacyClearTarget) => Promise<void>;
};

const HomeReadyContext = createContext<HomeReadyContext | null>(null);
const supabase = createClient();

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

export function HomeReadyProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhaseState] = useState<BuyerPhase>("Prep");
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [darkMode, setDarkModeState] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setPhaseState(readLocal("homeready.phase", "Prep"));
    setDocuments(readLocal("homeready.documents", []));
    setChecklist(readLocal("homeready.checklist", {}));
    setDarkModeState(readLocal("homeready.darkMode", false));

    supabase?.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  async function loadCloudData(userId: string) {
    if (!supabase) return;
    const [{ data: savedDocuments }, { data: savedChecklist }] = await Promise.all([
      supabase.from("documents").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("checklist_items").select("*").eq("user_id", userId)
    ]);

    if (savedDocuments) {
      const mapped = savedDocuments.map((doc) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        kind: doc.kind,
        size: doc.size_bytes,
        text: doc.extracted_text,
        warnings: doc.redaction_warnings,
        createdAt: doc.created_at,
        retentionUntil: doc.retention_until
      }));
      setDocuments(mapped);
      writeLocal("homeready.documents", mapped);
    }

    if (savedChecklist) {
      const mapped = Object.fromEntries(savedChecklist.map((item) => [item.item_id, item.checked]));
      setChecklist(mapped);
      writeLocal("homeready.checklist", mapped);
    }
  }

  const setPhase = (nextPhase: BuyerPhase) => {
    setPhaseState(nextPhase);
    writeLocal("homeready.phase", nextPhase);
  };

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    writeLocal("homeready.darkMode", value);
  };

  const addDocument = async (document: StoredDocument) => {
    const nextDocuments = [document, ...documents];
    setDocuments(nextDocuments);
    writeLocal("homeready.documents", nextDocuments);

    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(document)
        });
      }
    }
  };

  const deleteDocument = async (id: string) => {
    const nextDocuments = documents.filter((document) => document.id !== id);
    setDocuments(nextDocuments);
    writeLocal("homeready.documents", nextDocuments);

    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await fetch("/api/documents", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });
      }
    }
  };

  const setChecklistItem = async (id: string, checked: boolean) => {
    const nextChecklist = { ...checklist, [id]: checked };
    setChecklist(nextChecklist);
    writeLocal("homeready.checklist", nextChecklist);

    if (supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await fetch("/api/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, checked })
        });
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabase) return "Supabase is not configured yet.";
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    setUserEmail(data.user.email ?? email);
    await loadCloudData(data.user.id);
    return null;
  };

  const signUp = async (email: string, password: string) => {
    if (!supabase) return "Supabase is not configured yet.";
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    setUserEmail(data.user?.email ?? email);
    if (data.user) await loadCloudData(data.user.id);
    return null;
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setUserEmail(null);
  };

  const saveConversation = async (messages: unknown[]) => {
    writeLocal("homeready.messages", messages);
    if (!supabase) return;

    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const conversationId =
      readLocal<string | null>("homeready.conversationId", null) ?? crypto.randomUUID();
    writeLocal("homeready.conversationId", conversationId);

    await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: conversationId, messages })
    });
  };

  const clearPrivacyData = async (target: PrivacyClearTarget) => {
    if (target === "guest") {
      window.localStorage.removeItem("homeready.messages");
      window.localStorage.removeItem("homeready.documents");
      window.localStorage.removeItem("homeready.checklist");
      window.localStorage.removeItem("homeready.conversationId");
      setDocuments([]);
      setChecklist({});
      return;
    }

    if (target === "documents") {
      await Promise.all(documents.map((document) => deleteDocument(document.id)));
      return;
    }

    if (target === "chat") {
      window.localStorage.removeItem("homeready.messages");
      const conversationId = readLocal<string | null>("homeready.conversationId", null);
      window.localStorage.removeItem("homeready.conversationId");

      if (supabase && conversationId) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          await fetch("/api/conversations", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: conversationId })
          });
        }
      }
    }
  };

  const value = useMemo(
    () => ({
      phase,
      setPhase,
      documents,
      addDocument,
      checklist,
      setChecklistItem,
      darkMode,
      setDarkMode,
      userEmail,
      authMode: userEmail ? ("signed-in" as const) : ("guest" as const),
      signIn,
      signUp,
      signOut,
      saveConversation,
      deleteDocument,
      clearPrivacyData
    }),
    [phase, documents, checklist, darkMode, userEmail]
  );

  return <HomeReadyContext.Provider value={value}>{children}</HomeReadyContext.Provider>;
}

export function useHomeReady() {
  const context = useContext(HomeReadyContext);
  if (!context) throw new Error("useHomeReady must be used inside HomeReadyProvider");
  return context;
}
