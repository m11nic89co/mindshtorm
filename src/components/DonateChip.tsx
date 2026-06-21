import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from '../i18n/LocaleProvider';
import { DONATE_LINK, DONATE_WALLETS, hasDonateOptions } from '../config/donate';

export function DonateChip() {
  const { m } = useLocale();
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const copyWallet = useCallback(
    async (id: string, wallet: string) => {
      try {
        await navigator.clipboard.writeText(wallet);
        setCopiedId(id);
        window.setTimeout(() => setCopiedId(null), 2000);
      } catch {
        /* fallback: select not implemented — user can copy manually */
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    const onPointer = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  if (!hasDonateOptions()) return null;

  const wallets = DONATE_WALLETS.filter((item) => item.wallet.trim());

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[8px] font-medium text-amber-100/85 transition hover:border-amber-400/35 hover:bg-amber-400/20 hover:text-amber-50 sm:text-[9px]"
        title={m.footer.donateTitle}
        aria-expanded={open}
      >
        {m.footer.donate}
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="pointer-events-auto absolute bottom-full left-1/2 z-30 mb-2 w-[min(calc(100vw-2rem),18rem)] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#12182a]/95 p-3 shadow-2xl backdrop-blur-xl"
          role="dialog"
          aria-label={m.footer.donateTitle}
        >
          <p className="mb-2 text-[11px] font-medium text-white/90">{m.footer.donateTitle}</p>
          <p className="mb-3 text-[9px] leading-relaxed text-white/45">{m.footer.donateHint}</p>

          <div className="flex flex-col gap-2">
            {wallets.map((item) => {
              const id = `${item.label}-${item.wallet.slice(0, 8)}`;
              return (
                <div
                  key={id}
                  className="rounded-xl border border-white/8 bg-black/25 p-2.5"
                >
                  <div className="mb-1 text-[9px] font-medium uppercase tracking-wide text-white/35">
                    {item.label}
                  </div>
                  <div className="mb-2 break-all font-mono text-[10px] leading-snug text-cyan-100/90">
                    {item.wallet}
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyWallet(id, item.wallet)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
                  >
                    {copiedId === id ? m.footer.donateCopied : m.footer.donateCopy}
                  </button>
                </div>
              );
            })}

            {DONATE_LINK ? (
              <a
                href={DONATE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-indigo-400/25 bg-indigo-500/15 px-3 py-2 text-center text-[10px] font-medium text-indigo-100 transition hover:bg-indigo-500/25"
              >
                {m.footer.donateLink}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
