import React from "react";
// ISO two-letter country codes for EU + EEA
const EU_EEA_CODES = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT",
    "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO"
];
/** Build a friendly "City, Country" label from a Nominatim result */
function toLabel(item) {
    const a = item.address || {};
    const city =
        a.city ||
        a.town ||
        a.village ||
        a.locality ||
        a.municipality ||
        a.county ||
        a.state_district ||
        a.state;
    const country = a.country;
    if (!country && !city) return item.display_name;
    if (!city) return country || item.display_name;
    if (!country) return city;
    return `${city}, ${country}`;
}

/**
 * Free OpenStreetMap/Nominatim autocomplete with debounce + 1 req/sec throttle.
 *
 * Props:
 * - value: string (controlled text value)
 * - onChange: (string) -> void
 * - onSelect: ({ label, coords:{lat,lng}, raw }) -> void
 * - dark: boolean (for styling)
 * - placeholder: string
 * - countryCodes: string[] ISO-2 (e.g. ["ee","lv","lt","de"]) to restrict results (optional)
 */
export default function LocationAutocompleteOSM({
    value,
    onChange,
    onSelect,
    dark,
    placeholder = "City, Country",
    countryCodes = [EU_EEA_CODES],
}) {
    const [q, setQ] = React.useState(value || "");
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const [highlight, setHighlight] = React.useState(-1);

    const rootRef = React.useRef(null);
    const lastFetchRef = React.useRef(0);
    const abortRef = React.useRef(null);


    // Keep local input synced with parent
    React.useEffect(() => {
        setQ(value || "");
    }, [value]);

    // Close dropdown on outside click / ESC
    React.useEffect(() => {
        function onDocDown(e) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target)) setOpen(false);
        }
        function onEsc(e) {
            if (e.key === "Escape") setOpen(false);
        }
        document.addEventListener("mousedown", onDocDown);
        document.addEventListener("keydown", onEsc);
        return () => {
            document.removeEventListener("mousedown", onDocDown);
            document.removeEventListener("keydown", onEsc);
        };
    }, []);

    // Stable string for dependency array (ESLint-safe)
    const countryCodesStr = React.useMemo(() => countryCodes.join(","), [countryCodes]);

    // Debounced + throttled query to Nominatim (policy: <= 1 req/sec)
    React.useEffect(() => {
        const query = q.trim();
        if (!query) {
            setItems([]);
            setOpen(false);
            return;
        }

        const handle = setTimeout(async () => {
            // throttle 1 req/sec
            const now = Date.now();
            const since = now - lastFetchRef.current;
            if (since < 1000) {
                await new Promise((r) => setTimeout(r, 1000 - since));
            }
            lastFetchRef.current = Date.now();

            // abort previous request
            if (abortRef.current) abortRef.current.abort();
            abortRef.current = new AbortController();

            const params = new URLSearchParams({
                q: query,
                format: "jsonv2",
                addressdetails: "1",
                dedupe: "1",
                limit: "6",
            });
            if (countryCodesStr) params.set("countrycodes", countryCodesStr);

            const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

            try {
                setLoading(true);
                const res = await fetch(url, { signal: abortRef.current.signal });
                if (!res.ok) throw new Error("HTTP " + res.status);
                const json = await res.json();
                const list = (Array.isArray(json) ? json : []).map((it) => {
                    const label = toLabel(it);
                    const lat = Number(it.lat);
                    const lng = Number(it.lon);
                    return { id: it.place_id, label, coords: { lat, lng }, raw: it };
                });
                setItems(list);
                setOpen(true);
            } catch (err) {
                if (err?.name !== "AbortError") {
                    // swallow errors; keep previous suggestions hidden
                    setOpen(false);
                }
            } finally {
                setLoading(false);
            }
        }, 350); // debounce

        return () => clearTimeout(handle);
    }, [q, countryCodesStr]);

    function handleChange(e) {
        const v = e.target.value;
        setQ(v);
        onChange?.(v);
        setOpen(true);
        setHighlight(-1);
    }

    function choose(item) {
        onChange?.(item.label);
        onSelect?.(item);
        setQ(item.label);
        setOpen(false);
        setHighlight(-1);
    }

    function onKeyDown(e) {
        if (!open || items.length === 0) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(items.length - 1, h + 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(0, h - 1));
        } else if (e.key === "Enter") {
            if (highlight >= 0) {
                e.preventDefault();
                choose(items[highlight]);
            }
        }
    }

    return (
        <div className="relative" ref={rootRef}>
            <input
                value={q}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""
                    }`}
                aria-autocomplete="list"
                aria-expanded={open}
                aria-controls="osm-location-list"
            />

            {loading && (
                <div className={`absolute right-3 top-2 text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>…</div>
            )}

            {open && items.length > 0 && (
                <ul
                    id="osm-location-list"
                    role="listbox"
                    className={`absolute z-40 mt-1 w-full max-h-64 overflow-auto rounded-xl border shadow-lg ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"
                        }`}
                >
                    {items.map((it, i) => (
                        <li
                            key={it.id}
                            role="option"
                            aria-selected={i === highlight}
                            onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                            onClick={() => choose(it)}
                            className={`px-3 py-2 text-sm cursor-pointer ${i === highlight ? (dark ? "bg-neutral-800" : "bg-gray-100") : ""
                                }`}
                        >
                            {it.label}
                        </li>
                    ))}
                    {/* Attribution required by OSM policy */}
                    <li className={`px-3 py-2 text-[11px] ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                        Powered by OpenStreetMap contributors
                    </li>
                </ul>
            )}
        </div>
    );
}