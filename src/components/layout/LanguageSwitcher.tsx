"use client";

import * as React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Globe, ChevronDown, Check } from "lucide-react";
import type { Language } from "@/lib/i18n/landing-translations";

export function LanguageSwitcher() {
  const { language, setLanguage, languages, t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const currentOption =
    languages.find((l) => l.code === language) || languages[0];

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t.nav.selectLanguage}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#1f2533] bg-[#0d1017]/90 text-slate-300 hover:text-white hover:border-[#00ff66]/40 hover:bg-[#121622] transition-all text-xs font-mono select-none focus:outline-none focus:ring-1 focus:ring-[#00ff66]/40 cursor-pointer shadow-sm"
      >
        <span className="text-sm leading-none">{currentOption.flag}</span>
        <span className="font-bold text-slate-200">{currentOption.shortLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#00ff66]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl border border-[#21293a] bg-[#0c1018]/95 backdrop-blur-md shadow-[0_10px_35px_rgba(0,0,0,0.6)] z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-[#1b2230] text-[10px] font-mono uppercase tracking-wider text-slate-400">
            {t.nav.selectLanguage}
          </div>
          {languages.map((item) => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelect(item.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono text-left transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#00ff66]/10 text-[#00ff66] font-bold"
                    : "text-slate-300 hover:bg-[#141a27] hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{item.flag}</span>
                  <span>{item.name}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#00ff66]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
