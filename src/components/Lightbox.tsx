import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type LightboxItem = { src: string; alt?: string };

type LightboxApi = {
  open: (src: string, alt?: string) => void;
};

const LightboxContext = createContext<LightboxApi | null>(null);

export function useLightbox(): LightboxApi {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used within <LightboxProvider>");
  return ctx;
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [item, setItem] = useState<LightboxItem | null>(null);

  const open = useCallback((src: string, alt?: string) => {
    setItem({ src, alt });
  }, []);
  const close = useCallback(() => setItem(null), []);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [item, close]);

  return (
    <LightboxContext.Provider value={{ open }}>
      {children}
      {item && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged image"
          onClick={close}
        >
          <button type="button" className="lightbox-close" aria-label="Close">
            ✕
          </button>
          <img className="lightbox-img" src={item.src} alt={item.alt ?? ""} />
        </div>
      )}
    </LightboxContext.Provider>
  );
}
