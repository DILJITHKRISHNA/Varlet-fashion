import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface AppCtaContextValue {
  openRegister: () => void;
  openDownload: () => void;
  registerOpen: boolean;
  downloadOpen: boolean;
  setRegisterOpen: (v: boolean) => void;
  setDownloadOpen: (v: boolean) => void;
}

const AppCtaContext = createContext<AppCtaContextValue | null>(null);

export function AppCtaProvider({ children }: { children: ReactNode }) {
  const [registerOpen, setRegisterOpen] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const value = useMemo<AppCtaContextValue>(
    () => ({
      registerOpen,
      downloadOpen,
      setRegisterOpen,
      setDownloadOpen,
      openRegister: () => setRegisterOpen(true),
      openDownload: () => setDownloadOpen(true),
    }),
    [registerOpen, downloadOpen],
  );

  return <AppCtaContext.Provider value={value}>{children}</AppCtaContext.Provider>;
}

export function useAppCta(): AppCtaContextValue {
  const ctx = useContext(AppCtaContext);
  if (!ctx) throw new Error("useAppCta must be used inside <AppCtaProvider>");
  return ctx;
}
