import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  acceptAllCookies,
  hasCookieConsentChoice,
  loadCookieConsent,
  rejectNonEssentialCookies,
  revokePreferenceStorage,
  saveCookieConsent,
  type CookieCategoryDraft,
  type CookieConsentRecord,
} from "@/frontend/lib/cookieConsent";

type CookieConsentContextValue = {
  consent: CookieConsentRecord | null;
  bannerVisible: boolean;
  modalOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (draft: CookieCategoryDraft) => void;
};

const CookieConsentCtx = createContext<CookieConsentContextValue | undefined>(undefined);

function applyConsentSideEffects(record: CookieConsentRecord) {
  if (!record.preferences) {
    revokePreferenceStorage();
  }
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentRecord | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = loadCookieConsent();
    setConsent(saved);
    setBannerVisible(!hasCookieConsentChoice());
    setHydrated(true);
  }, []);

  const commit = useCallback((record: CookieConsentRecord) => {
    applyConsentSideEffects(record);
    setConsent(record);
    setBannerVisible(false);
    setModalOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    commit(acceptAllCookies());
  }, [commit]);

  const rejectNonEssential = useCallback(() => {
    commit(rejectNonEssentialCookies());
  }, [commit]);

  const savePreferences = useCallback(
    (draft: CookieCategoryDraft) => {
      commit(saveCookieConsent(draft));
    },
    [commit],
  );

  const openPreferences = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setModalOpen(false);
  }, []);

  return (
    <CookieConsentCtx.Provider
      value={{
        consent,
        bannerVisible,
        modalOpen,
        openPreferences,
        closePreferences,
        acceptAll,
        rejectNonEssential,
        savePreferences,
      }}
    >
      {children}
    </CookieConsentCtx.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentCtx);
  if (!ctx) throw new Error("useCookieConsent must be used inside CookieConsentProvider");
  return ctx;
}
