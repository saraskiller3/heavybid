import React from "react";
// --- helpers (inline to avoid path issues) ---
const NAME_TO_CODE = {
    Austria: "AT", Belgium: "BE", Bulgaria: "BG", Croatia: "HR", Cyprus: "CY",
    "Czech Republic": "CZ", Czechia: "CZ", Denmark: "DK", Estonia: "EE",
    Finland: "FI", France: "FR", Germany: "DE", Greece: "GR", Hungary: "HU",
    Ireland: "IE", Italy: "IT", Latvia: "LV", Lithuania: "LT", Luxembourg: "LU",
    Malta: "MT", Netherlands: "NL", Poland: "PL", Portugal: "PT", Romania: "RO",
    Slovakia: "SK", Slovenia: "SI", Spain: "ES", Sweden: "SE",
    Iceland: "IS", Liechtenstein: "LI", Norway: "NO"
};

function countryNameToCode(name) {
    if (!name || name === "All") return "";
    return NAME_TO_CODE[name] || "";
}

function Flag({ cc, className = "" }) {
    if (!cc || cc.length !== 2) return null;
    const lower = cc.toLowerCase();
    return (
        <img
            src={`https://flagcdn.com/24x18/${lower}.png`}
            srcSet={`https://flagcdn.com/48x36/${lower}.png 2x, https://flagcdn.com/72x54/${lower}.png 3x`}
            width="24" height="18" alt={cc}
            className={`inline-block rounded-[2px] ${className}`}
            loading="lazy"
            referrerPolicy="no-referrer"
        />
    );
}
// --- end helpers ---
export function CountrySelect({ dark, countries, country, setCountry, countryCounts }) {
    const [open, setOpen] = React.useState(false);
    const [highlight, setHighlight] = React.useState(-1);
    const btnRef = React.useRef(null);
    const listRef = React.useRef(null);

    // Build visible options with code + count
    const options = React.useMemo(() => {
        return countries.map((label) => {
            const code = countryNameToCode(label);
            const count = label === "All" ? [...countryCounts.values()].reduce((a, b) => a + b, 0) : (countryCounts.get(label) || 0);
            return { label, code, count };
        });
    }, [countries, countryCounts]);

    // Close on outside click
    React.useEffect(() => {
        function onDocDown(e) {
            if (!open) return;
            if (!btnRef.current || !listRef.current) return;
            if (!btnRef.current.contains(e.target) && !listRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", onDocDown);
        return () => document.removeEventListener("mousedown", onDocDown);
    }, [open]);

    function selectAt(idx) {
        const opt = options[idx];
        if (!opt) return;
        setCountry(opt.label);
        setOpen(false);
        // return focus to button for a11y
        requestAnimationFrame(() => btnRef.current?.focus());
    }

    function onKeyDown(e) {
        if (!open) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setHighlight(h => Math.min(options.length - 1, h + 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight(h => Math.max(0, h - 1)); }
        else if (e.key === "Enter") { e.preventDefault(); if (highlight >= 0) selectAt(highlight); }
        else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
    }

    const current = options.find(o => o.label === country) || options[0];

    return (
        <div className="relative">
            <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Country</label>

            {/* Trigger */}
            <button
                type="button"
                ref={btnRef}
                onClick={() => { setOpen(o => !o); setHighlight(options.findIndex(o => o.label === country)); }}
                className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm flex items-center justify-between ${dark ? "bg-neutral-800 border-neutral-700 text-white" : "border-gray-200"
                    }`}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className="flex items-center gap-2 truncate">
                    {current?.label !== "All" && <Flag cc={current?.code} />}
                    <span className="truncate">
                        {current?.label} {typeof current?.count === "number" ? `(${current.count})` : ""}
                    </span>
                </span>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className={`${dark ? "text-neutral-400" : "text-gray-500"}`}>
                    <path d="M5 7l5 6 5-6H5z" />
                </svg>
            </button>

            {/* Menu */}
            {open && (
                <div
                    ref={listRef}
                    className={`absolute z-50 mt-1 w-full rounded-xl border shadow-lg max-h-72 overflow-auto ${dark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white"
                        }`}
                    role="listbox"
                    tabIndex={-1}
                    onKeyDown={onKeyDown}
                >
                    {options.map((opt, i) => {
                        const active = i === highlight;
                        const selected = opt.label === country;
                        return (
                            <button
                                key={opt.label}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                className={`w-full px-3 py-2 text-sm flex items-center gap-2 justify-between ${active ? (dark ? "bg-neutral-800" : "bg-gray-100") : ""
                                    }`}
                                onMouseEnter={() => setHighlight(i)}
                                onClick={() => selectAt(i)}
                            >
                                <span className="flex items-center gap-2 truncate">
                                    {opt.label !== "All" && <Flag cc={opt.code} />}
                                    <span className="truncate">{opt.label}</span>
                                </span>
                                <span className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>{opt.count}</span>
                            </button>
                        );
                    })}
                    <div className={`px-3 py-2 text-[11px] ${dark ? "text-neutral-500" : "text-gray-500"}`}>
                        Filter by country
                    </div>
                </div>
            )}
        </div>
    );
}