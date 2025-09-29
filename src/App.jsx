// src/App.jsx — Auction-grade UI with routing, detail page, dark mode, animations
// Requires: tailwind (already set), framer-motion, lucide-react, react-router-dom
// If you haven't yet: npm install react-router-dom framer-motion lucide-react

import React, { useMemo, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Search, Clock, MapPin, Sun, Moon, ChevronLeft, CheckCircle2, Mail, Lock, Eye, EyeOff } from "lucide-react";


// ---- Mock data (expandable / replace with API later) ----
const MOCK_LISTINGS = [
    {
        id: "EX2001",
        title: "2014 Komatsu PC210-8 Excavator",
        location: "Riga, Latvia",
        coords: { lat: 56.9496, lng: 24.1052 },
        images: [
            "/images/komatsu/img1.jpg",
            "/images/komatsu/img2.jpg",
            "/images/komatsu/img3.png",
        ],
        year: 2014,
        hours: 8200,
        condition: "Used",
        hasDefects: false,
        currentBid: 28000,
        reserve: true,
        buyNow: 34000,
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Excavator",
        seller: "Baltic Machinery O\u00DC",
        specs: { weight: "22,000 kg", engine: "Komatsu SAA6D107E-1", power: "123 kW" },
        description: "Well maintained PC210 with full service records. New tracks in 2022. Ready to work.",
        documents: ["Service history", "CE certificate"],
    },
    {
        id: "WL453",
        title: "2018 Volvo L120 Wheel Loader",
        location: "Vilnius, Lithuania",
        coords: { lat: 54.6872, lng: 25.2797 },
        images: [
            "/images/volvo/img1.jpg",
            "/images/volvo/img2.jpg",
            "/images/volvo/img3.jpg",
        ],
        year: 2018,
        hours: 5400,
        condition: "Used",
        hasDefects: true,
        currentBid: 42000,
        reserve: false,
        buyNow: 52000,
        endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Wheel loader",
        seller: "Nordic Plant",
        specs: { weight: "20,700 kg", engine: "Volvo D8J", power: "191 kW" },
        description: "Low hours L120. Stage V, aircon, hydraulic quick coupler.",
        documents: ["User manual"],
    },
    {
        id: "CR300",
        title: "2016 Caterpillar D6 Bulldozer",
        location: "Tallinn, Estonia",
        coords: { lat: 59.4370, lng: 24.7536 },
        images: [
            "/images/catd6/img1.jpg",
            "/images/catd6/img2.webp",
        ],
        year: 2016,
        hours: 12500,
        condition: "Used",
        hasDefects: false,
        currentBid: 65000,
        reserve: true,
        buyNow: 78000,
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Bulldozer",
        seller: "Estonian Earthworks",
        specs: { weight: "23,000 kg", engine: "Cat C9.3", power: "153 kW" },
        description: "Strong D6 with ripper and blade; recent hydraulics check.",
        documents: ["CE certificate", "Inspection report"],
    },
    {
        id: "TR555",
        title: "Hadrian X bricklayer",
        location: "Berlin, Germany",
        coords: { lat: 52.5200, lng: 13.4050 }, 
        images: [
            "/images/hadrianx/img1.png",
            "/images/hadrianx/img2.jpg",
           "/images/hadrianx/img3.jpg",
        ],
        year: 2024,
        hours: 0,
        condition: "New",
        hasDefects: false,
        currentBid: 3000000,
        reserve: false,
        buyNow: 4000000,
        endsAt: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Miscellaneous",
        seller: "FBR",
        specs: { weight: "23,000 kg", engine: "Volvo 555", power: "250 kW" },
        description: "Brand new, factory warranty, new in Europe",
        documents: ["CE certificate", "Inspection report", "Customs clearance", "5 year factory warranty"],
    },

];

// Build your custom step sequence up to a given max
function buildPriceSteps(max) {
    const steps = [0, 150, 300, 500];
    const pushRange = (start, end, step) => { for (let v = start; v <= end; v += step) steps.push(v); };
    pushRange(1000, 3000, 500);     // 1000..3000 by 500
    pushRange(4000, 5000, 1000);    // 4k, 5k
    pushRange(6000, 15000, 1000);   // 6k..15k by 1k
    pushRange(17500, 30000, 2500);  // 17.5k..30k by 2.5k
    pushRange(35000, 50000, 5000);  // 35k..50k by 5k
    pushRange(60000, 100000, 10000);// 60k..100k by 10k
    let v = 120000; while (v <= max) { steps.push(v); v += 20000; }
    if (steps[steps.length - 1] < max) steps.push(max);
    return Array.from(new Set(steps)).sort((a, b) => a - b);
}


function formatCurrency(n) { return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(n); }
function msLeft(iso) { return new Date(iso) - new Date(); }
function pad2(n) {
    const s = Math.floor(Math.max(0, n)).toString();
    return s.length === 1 ? "0" + s : s;
}

function prettyLeft(iso) {
    const diff = new Date(iso) - new Date();
    if (diff <= 0) return "Closed";

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${pad2(hours)}h ${pad2(minutes)}m ${pad2(seconds)}s`;
}

// ---- Layout & shared UI ----
function Header({ query, setQuery, dark, setDark, user, setUser }) {
    return (
        <header className={`sticky top-0 z-30 border-b ${dark ? "bg-neutral-900/80 text-white" : "bg-white/80"} backdrop-blur supports-[backdrop-filter]:bg-white/60`}>
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
                <Link to="/" className={`w-10 h-10 rounded-2xl grid place-items-center font-extrabold ${dark ? "bg-blue-500 text-white" : "bg-blue-600 text-white"}`}>HB</Link>
                <div className="mr-auto">
                    <div className="text-xl font-extrabold leading-5">HeavyBid</div>
                    <div className="text-xs ...">Heavy machinery auctions {"\u00B7"} EU</div>
                </div>

                <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-6">
                    <div className="relative w-full">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={"Search model, location, seller\u2026"}
                            className={`w-full border ${dark ? "border-neutral-700 bg-neutral-800 text-white placeholder-neutral-400" : "border-gray-200"} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-xl pl-9 pr-3 py-2 text-sm`}
                        />
                        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-neutral-400" : "text-gray-400"}`} />
                    </div>
                </div>

                <button onClick={() => setDark(!dark)} className={`p-2 rounded-xl border ${dark ? "border-neutral-700" : "border-gray-200"}`} aria-label="Toggle theme">
                    {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                <div className="flex items-center gap-2">
                    <button className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm">
                        Sell equipment
                    </button>

                    {user ? (
                        <>
                            <span className={`text-xs px-2 py-1 rounded-lg border ${dark ? "border-neutral-700" : "border-gray-200"}`}>
                                Signed in as {user.email}
                            </span>
                            <button
                                onClick={() => setUser(null)}
                                className={`px-3 py-2 rounded-xl border text-sm ${dark ? "border-neutral-700" : ""}`}
                            >
                                Sign out
                            </button>
                        </>
                    ) : (
                        <Link to="/signin" className={`px-3 py-2 rounded-xl border text-sm ${dark ? "border-neutral-700" : ""}`}>
                            Sign in
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}

function Filters({
    dark,
    // search/sort
    sortBy, setSortBy,
    query, setQuery,
    // country/category (interdependent)
    countries, country, setCountry, countryCounts,
    categories, category, setCategory, categoryCounts,
    // condition / defects (interdependent)
    conditions, condition, setCondition, conditionCounts,
    defectsList, defects, setDefects, defectsCounts,
    // price
    priceSteps, priceMin, priceMax, setPriceMin, setPriceMax,
}) {
    const Count = ({ map }) => Array.from(map.values()).reduce((a, b) => a + b, 0);

    return (
        <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"} rounded-2xl shadow-sm border p-4 sticky top-20`}>

            {/* Country */}
            <div>
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Country</label>
                <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                >
                    <option value="All">All ({<Count map={countryCounts} />})</option>
                    {countries.filter(c => c !== "All").map((c) => (
                        <option key={c} value={c}>{c} ({countryCounts.get(c) || 0})</option>
                    ))}
                </select>
            </div>

            {/* Category */}
            <div className="mt-4">
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                >
                    <option value="All">All ({<Count map={categoryCounts} />})</option>
                    {categories.filter(c => c !== "All").map((c) => (
                        <option key={c} value={c}>{c} ({categoryCounts.get(c) || 0})</option>
                    ))}
                </select>
            </div>

            {/* Condition */}
            <div className="mt-4">
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Condition</label>
                <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                >
                    <option value="All">All ({<Count map={conditionCounts} />})</option>
                    {conditions.filter(c => c !== "All").map((c) => (
                        <option key={c} value={c}>{c} ({conditionCounts.get(c) || 0})</option>
                    ))}
                </select>
            </div>

            {/* Defects */}
            <div className="mt-4">
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Defects</label>
                <select
                    value={defects}
                    onChange={(e) => setDefects(e.target.value)}
                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                >
                    <option value="All">All ({<Count map={defectsCounts} />})</option>
                    {defectsList.filter(c => c !== "All").map((c) => (
                        <option key={c} value={c}>{c} ({defectsCounts.get(c) || 0})</option>
                    ))}
                </select>
            </div>

            {/* Sort */}
            <div className="mt-4">
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Sort</label>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                >
                    <option value="endingSoon">Ending soon</option>
                    <option value="priceHigh">Highest bid</option>
                    <option value="priceLow">Lowest bid</option>
                </select>
            </div>

            {/* Search */}
            <div className="mt-4">
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Quick search</label>
                <div className="relative">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Komatsu, Riga, seller..."
                        className={`mt-1 w-full border rounded-xl pl-9 pr-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" : ""}`}
                    />
                    <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-neutral-400" : "text-gray-400"}`} />
                </div>
            </div>

            {/* Price range */}
            <div className="mt-4">
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Price range (current bid)</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                    <select
                        value={priceMin}
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            setPriceMin(v);
                            if (v > priceMax) setPriceMax(v);
                        }}
                        className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                    >
                        {priceSteps.map((v) => (
                            <option key={`min-${v}`} value={v}>{"\u20AC"}{v.toLocaleString()}</option>
                        ))}
                    </select>
                    <select
                        value={priceMax}
                        onChange={(e) => {
                            const v = Number(e.target.value);
                            setPriceMax(v);
                            if (v < priceMin) setPriceMin(v);
                        }}
                        className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                    >
                        {priceSteps.filter(v => v >= priceMin).map((v) => (
                            <option key={`max-${v}`} value={v}>{"\u20AC"}{v.toLocaleString()}</option>
                        ))}
                    </select>
                </div>
            </div>
        </Motion.div>
    );
}






function ImageWithFallback({ src, alt, className }) {
    const [failed, setFailed] = React.useState(false);
    const placeholder = `https://placehold.co/1200x800?text=${encodeURIComponent(alt || 'Heavy machinery')}`;
    return (
        <img
            src={failed ? placeholder : src}
            alt={alt}
            loading="lazy"
            onError={() => setFailed(true)}
            className={className}
        />
    );
}
function FactPill({ label, value, dark }) {
    if (!value) return null;
    return (
        <div className={`text-[11px] leading-none px-2 py-1 rounded-lg border ${dark ? "border-neutral-700 bg-neutral-800 text-neutral-200" : "border-gray-200 bg-gray-50 text-gray-700"
            }`}>
            <span className={`${dark ? "text-neutral-400" : "text-gray-500"}`}>{label}: </span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

function Card({ lot, dark }) {
    return (
        <Link to={`/lot/${lot.id}`}>
            <Motion.article
                whileHover={{ y: -4, boxShadow: "0 12px 28px rgba(0,0,0,0.08)" }}
                className={`group rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-shadow ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"
                    }`}
            >
                {/* Image */}
                <div className="relative">
                    <img
                        src={lot.images[0]}
                        alt={lot.title}
                        loading="lazy"
                        className="w-full h-64 object-cover"  // ?? was h-44, now taller (16rem)
                    />
                    <div
                        className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-semibold ${dark ? "bg-neutral-800/90" : "bg-white/90"
                            }`}
                    >
                        {lot.category}
                    </div>
                    <div
                        className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs flex items-center gap-1 ${dark ? "bg-neutral-800/90" : "bg-white/90"
                            }`}
                    >
                        <Clock size={14} /> {prettyLeft(lot.endsAt)}
                    </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg leading-snug line-clamp-2">{lot.title}</h3>
                    <p
                        className={`text-sm mt-1 flex items-center gap-1 ${dark ? "text-neutral-400" : "text-gray-500"
                            }`}
                    >
                        <MapPin size={14} /> {lot.location} {" \u00B7 "} {lot.seller}
                    </p>

                    {/* Quick facts row */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <FactPill label="Year" value={lot.year} dark={dark} />
                        <FactPill label="Hours" value={lot.hours?.toLocaleString?.()} dark={dark} />
                        <FactPill label="Weight" value={lot.specs?.weight} dark={dark} />
                        <FactPill label="Power" value={lot.specs?.power} dark={dark} />
                        <FactPill label="Cond." value={lot.condition} dark={dark} />
                        <FactPill label="Defects" value={lot.hasDefects ? "With defects" : "Without defects"} dark={dark} />
                    </div>

                    {/* Bids */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div
                            className={`rounded-xl border p-3 ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"
                                }`}
                        >
                            <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                                Current bid
                            </div>
                            <div className="text-xl font-bold">{formatCurrency(lot.currentBid)}</div>
                        </div>
                        <div
                            className={`rounded-xl border p-3 text-right ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"
                                }`}
                        >
                            <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                                Buy now
                            </div>
                            <div className="text-xl font-semibold">{formatCurrency(lot.buyNow)}</div>
                        </div>
                    </div>
                </div>
            </Motion.article>
        </Link>
    );
}

function getCountry(location = "") {
    const parts = location.split(",").map(s => s.trim());
    return parts[parts.length - 1] || "";
}

// ---- Pages ----
function Home({
    lots, query, setQuery, category, setCategory, sortBy, setSortBy, dark,
    country, setCountry,
    condition, setCondition,
    defects, setDefects,
    priceSteps, priceMin, priceMax, setPriceMin, setPriceMax
}) {
    const [_tick, setTick] = useState(0);
    useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 1000); return () => clearInterval(t); }, []);

    // Base list: only text + price filters
    const baseFiltered = useMemo(() => {
        let out = lots.filter((l) =>
            `${l.title} ${l.location} ${l.seller}`.toLowerCase().includes(query.toLowerCase())
        );
        out = out.filter((l) => l.currentBid >= priceMin && l.currentBid <= priceMax);
        return out;
    }, [lots, query, priceMin, priceMax]);


    // Build a source set based on all current selections EXCEPT the dimension we’re counting
    const byCountrySource = useMemo(() => baseFiltered
        .filter(l => (category === "All" ? true : l.category === category))
        .filter(l => (condition === "All" ? true : l.condition === condition))
        .filter(l => (defects === "All" ? true : (l.hasDefects ? "With defects" : "Without defects") === defects))
        , [baseFiltered, category, condition, defects]);

    const byCategorySource = useMemo(() => baseFiltered
        .filter(l => (country === "All" ? true : getCountry(l.location) === country))
        .filter(l => (condition === "All" ? true : l.condition === condition))
        .filter(l => (defects === "All" ? true : (l.hasDefects ? "With defects" : "Without defects") === defects))
        , [baseFiltered, country, condition, defects]);

    const byConditionSource = useMemo(() => baseFiltered
        .filter(l => (country === "All" ? true : getCountry(l.location) === country))
        .filter(l => (category === "All" ? true : l.category === category))
        .filter(l => (defects === "All" ? true : (l.hasDefects ? "With defects" : "Without defects") === defects))
        , [baseFiltered, country, category, defects]);

    const byDefectsSource = useMemo(() => baseFiltered
        .filter(l => (country === "All" ? true : getCountry(l.location) === country))
        .filter(l => (category === "All" ? true : l.category === category))
        .filter(l => (condition === "All" ? true : l.condition === condition))
        , [baseFiltered, country, category, condition]);

    // Counts (Maps) for each dimension, from its respective source
    const countryCounts = useMemo(() => {
        const m = new Map();
        for (const l of byCountrySource) {
            const c = getCountry(l.location);
            m.set(c, (m.get(c) || 0) + 1);
        }
        return m;
    }, [byCountrySource]);

    const categoryCounts = useMemo(() => {
        const m = new Map();
        for (const l of byCategorySource) {
            m.set(l.category, (m.get(l.category) || 0) + 1);
        }
        return m;
    }, [byCategorySource]);

    const conditionCounts = useMemo(() => {
        const m = new Map();
        for (const l of byConditionSource) {
            m.set(l.condition, (m.get(l.condition) || 0) + 1); // "Used" / "New"
        }
        return m;
    }, [byConditionSource]);

    const defectsCounts = useMemo(() => {
        const m = new Map();
        for (const l of byDefectsSource) {
            const key = l.hasDefects ? "With defects" : "Without defects";
            m.set(key, (m.get(key) || 0) + 1);
        }
        return m;
    }, [byDefectsSource]);

    // Option arrays (All + sorted keys from maps)
    const countries = useMemo(() => ["All", ...Array.from(countryCounts.keys()).sort()], [countryCounts]);
    const categories = useMemo(() => ["All", ...Array.from(categoryCounts.keys()).sort()], [categoryCounts]);
    const conditions = useMemo(() => {
        const keys = Array.from(conditionCounts.keys());
        const order = ["Used", "New"];
        const sorted = order.filter(k => keys.includes(k));
        return ["All", ...sorted];
    }, [conditionCounts]);
    const defectsList = useMemo(() => {
        const keys = Array.from(defectsCounts.keys());
        const order = ["With defects", "Without defects"];
        const sorted = order.filter(k => keys.includes(k));
        return ["All", ...sorted];
    }, [defectsCounts]);

    // Auto-correct invalid selections when the available options change
    useEffect(() => {
        if (country !== "All" && !countryCounts.has(country)) {
            const first = countries[1]; setCountry(first ?? "All");
        }
    }, [countries, country, countryCounts, setCountry]);

    useEffect(() => {
        if (category !== "All" && !categoryCounts.has(category)) {
            const first = categories[1]; setCategory(first ?? "All");
        }
    }, [categories, category, categoryCounts, setCategory]);

    useEffect(() => {
        if (condition !== "All" && !conditionCounts.has(condition)) {
            const first = conditions[1]; setCondition(first ?? "All");
        }
    }, [conditions, condition, conditionCounts, setCondition]);

    useEffect(() => {
        if (defects !== "All" && !defectsCounts.has(defects)) {
            const first = defectsList[1]; setDefects(first ?? "All");
        }
    }, [defectsList, defects, defectsCounts, setDefects]);

    // Final list applies ALL four filters + sort
    const filtered = useMemo(() => {
        let out = baseFiltered;
        if (country !== "All") out = out.filter(l => getCountry(l.location) === country);
        if (category !== "All") out = out.filter(l => l.category === category);
        if (condition !== "All") out = out.filter(l => l.condition === condition);
        if (defects !== "All") out = out.filter(l => (l.hasDefects ? "With defects" : "Without defects") === defects);

        if (sortBy === "endingSoon") out = out.slice().sort((a, b) => msLeft(a.endsAt) - msLeft(b.endsAt));
        if (sortBy === "priceHigh") out = out.slice().sort((a, b) => b.currentBid - a.currentBid);
        if (sortBy === "priceLow") out = out.slice().sort((a, b) => a.currentBid - b.currentBid);
        return out;
    }, [baseFiltered, country, category, condition, defects, sortBy]);

    // …return markup (your existing JSX is fine) …
    // Just make sure you pass the new props down to <Filters /> below:
    return (
        <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <aside className="md:col-span-1">
                <Filters
                    {...{ dark, sortBy, setSortBy, query, setQuery }}
                    categories={categories}
                    category={category}
                    setCategory={setCategory}
                    categoryCounts={categoryCounts}
                    countries={countries}
                    country={country}
                    setCountry={setCountry}
                    countryCounts={countryCounts}
                    conditions={conditions}
                    condition={condition}
                    setCondition={setCondition}
                    conditionCounts={conditionCounts}
                    defectsList={defectsList}
                    defects={defects}
                    setDefects={setDefects}
                    defectsCounts={defectsCounts}
                    priceSteps={priceSteps}
                    priceMin={priceMin}
                    priceMax={priceMax}
                    setPriceMin={setPriceMin}
                    setPriceMax={setPriceMax}
                />
            </aside>

            <section className="md:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Live auctions</h2>
                    <span className={`text-sm ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                        {filtered.length} results
                    </span>
                </div>

                <p className={`text-xs -mt-2 mb-4 ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                    Showing bids between {"\u20AC"}{priceMin.toLocaleString()} and {"\u20AC"}{priceMax.toLocaleString()}.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {filtered.map((l) => (
                            <Motion.div
                                key={l.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <Card lot={l} dark={dark} />
                            </Motion.div>
                        ))}
                    </AnimatePresence>
                </div>


                {filtered.length === 0 && (
                    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className={`mt-8 p-6 rounded-2xl border text-center ${dark ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-white text-gray-600"}`}>
                        No listings match your filters{" "}
                        <button
                            onClick={() => {
                                setQuery(""); setCategory("All"); setCountry("All"); setCondition("All"); setDefects("All"); setPriceMin(0); setPriceMax(priceSteps[priceSteps.length - 1] || 0); }}
                            className="underline"
                        >
                            Reset filters
                        </button>
                    </Motion.div>
                )}
            </section>
        </main>
    );
}




// ===== Lightbox (zoom, pan, pinch, nav, blur-up, fallback) =====
function Lightbox({ images, index, alt, onClose, onPrev, onNext }) {
    const [scale, setScale] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [start, setStart] = useState({ x: 0, y: 0 });
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    // Pinch support
    const [pinching, setPinching] = useState(false);
    const [pinchDist, setPinchDist] = useState(0);

    const src = failed
        ? `https://placehold.co/1600x1000?text=${encodeURIComponent(alt || "Image")}`
        : images[index];

    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") onPrev();
            if (e.key === "ArrowRight") onNext();
            if (e.key === "+") setScale((s) => Math.min(4, s + 0.2));
            if (e.key === "-") setScale((s) => Math.max(1, s - 0.2));
            if (e.key === "0") { setScale(1); setPos({ x: 0, y: 0 }); }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, onPrev, onNext]);

    // Helpers
    const startDrag = (clientX, clientY) => {
        setDragging(true);
        setStart({ x: clientX - pos.x, y: clientY - pos.y });
    };
    const doDrag = (clientX, clientY) => {
        if (!dragging) return;
        setPos({ x: clientX - start.x, y: clientY - start.y });
    };
    const endDrag = () => setDragging(false);

    // Touch handlers (drag + pinch)
    const onTouchStart = (e) => {
        if (e.touches.length === 1) {
            const t = e.touches[0];
            startDrag(t.clientX, t.clientY);
            setPinching(false);
        } else if (e.touches.length === 2) {
            setDragging(false);
            setPinching(true);
            const d = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            setPinchDist(d);
        }
    };
    const onTouchMove = (e) => {
        if (pinching && e.touches.length === 2) {
            const d = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const delta = (d - pinchDist) / 300; // sensitivity
            setPinchDist(d);
            setScale((s) => Math.min(4, Math.max(1, s + delta)));
        } else if (e.touches.length === 1) {
            const t = e.touches[0];
            doDrag(t.clientX, t.clientY);
        }
    };
    const onTouchEnd = () => { setDragging(false); setPinching(false); };

    return (
        <div className="fixed inset-0 z-50 bg-black/90" onClick={onClose}>
            {/* Top-right controls */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button
                    onClick={(e) => { e.stopPropagation(); setScale((s) => Math.max(1, s - 0.2)); }}
                    className="px-3 py-1 rounded-md bg-white/10 text-white"
                >-</button>
                <button
                    onClick={(e) => { e.stopPropagation(); setScale((s) => Math.min(4, s + 0.2)); }}
                    className="px-3 py-1 rounded-md bg-white/10 text-white"
                >+</button>
                <button
                    onClick={(e) => { e.stopPropagation(); setScale(1); setPos({ x: 0, y: 0 }); }}
                    className="px-3 py-1 rounded-md bg-white/10 text-white"
                >Reset</button>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="p-2 rounded-md bg-white/10 text-white"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Prev / Next */}
            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Previous image"
            >
                <ChevronLeft />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Next image"
            >
                <ChevronRight />
            </button>

            {/* Image stage */}
            <div
                className={`w-full h-full flex items-center justify-center overflow-hidden ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
                onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
                onMouseMove={(e) => doDrag(e.clientX, e.clientY)}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.12 : 0.12;
                    setScale((s) => Math.min(4, Math.max(1, s + delta)));
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {/* Blur-up while loading */}
                <img
                    src={src}
                    alt={alt}
                    onLoad={() => setLoaded(true)}
                    onError={() => setFailed(true)}
                    className={`max-w-none select-none transition-[filter] duration-300 ${loaded ? "blur-0" : "blur-sm"}`}
                    style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`, transition: dragging ? "none" : "transform 120ms ease" }}
                    draggable={false}
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
}

// ===== LotDetail (uses Lightbox with full feature set) =====
// --- Add these helpers once (near your other helpers) ---
const MIN_BID = 250;
const STEP = 50;

function isStepAmount(value) {
    return value >= MIN_BID && value % STEP === 0;
}
function nextValidStep(value) {
    if (value < MIN_BID) return MIN_BID;
    const rem = value % STEP;
    return rem === 0 ? value : value + (STEP - rem);
}
function SpecCard({ label, value, dark }) {
    if (!value) return null;
    return (
        <div className={`rounded-xl border p-3 ${dark ? "bg-neutral-900/60 border-neutral-800" : "bg-white border-gray-200"} shadow-sm`}>
            <div className={`text-[11px] uppercase tracking-wide ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                {label}
            </div>
            <div className="mt-1 text-sm font-medium">{value}</div>
        </div>
    );
}

// Turn spec keys like "enginePower" or "power" into nice labels
function prettyLabel(key) {
    return key
        .replace(/[_-]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/^./, (c) => c.toUpperCase());
}

// Build ordered rows for the specs table
function buildSpecRows(lot) {
    const rows = [];
    // Defects label (derived)
     const defectsLabel = lot.hasDefects ? "With defects" : "Without defects";
    // Preferred order for key fields
    rows.push(["Category", lot.category]);
    rows.push(["Year", lot.year]);
    rows.push(["Hours", lot.hours != null ? lot.hours.toLocaleString() : null]);
    rows.push(["Condition", lot.condition]);
    rows.push(["Seller", lot.seller]);
    rows.push(["Defects", defectsLabel]);

    // Common technical fields (shown next if present)
    if (lot.specs) {
        const order = ["engine", "power", "weight"];
        order.forEach((k) => lot.specs[k] && rows.push([prettyLabel(k), lot.specs[k]]));

        // Any remaining spec keys (skip ones already added)
        const skipped = new Set(order);
        Object.entries(lot.specs).forEach(([k, v]) => {
            if (!skipped.has(k) && v != null && v !== "") {
                rows.push([prettyLabel(k), v]);
            }
        });
    }

    // Filter out empty values
    return rows.filter(([, v]) => v != null && v !== "");
}
function SpecTile({ label, value, dark }) {
    if (!value) return null;
    return (
        <div className={`rounded-xl border p-4 ${dark ? "bg-neutral-900/60 border-neutral-800" : "bg-white border-gray-200"}`}>
            <div className={`text-[11px] uppercase tracking-wide ${dark ? "text-neutral-400" : "text-gray-500"}`}>{label}</div>
            <div className="mt-1 text-sm font-medium break-words">{value}</div>
        </div>
    );
}

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function LotMap({ lot, dark }) {
    const pos = lot?.coords ? [lot.coords.lat, lot.coords.lng] : null;
    if (!pos) return null;

    return (
        <div className={`rounded-2xl border overflow-hidden ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white border-gray-200"}`}>
            <div className={`px-4 py-3 ${dark ? "border-b border-neutral-800" : "border-b border-gray-200"}`}>
                <h3 className="font-semibold">Location</h3>
            </div>
            <div className="h-72">
                <MapContainer
                    center={pos}
                    zoom={10}
                    scrollWheelZoom={false}
                    className="h-full w-full"
                    preferCanvas
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={pos}>
                        <Popup>
                            <div className="text-sm">
                                <div className="font-medium">{lot.title}</div>
                                <div className="opacity-80">{lot.location}</div>
                                <div className="opacity-80">Seller: {lot.seller}</div>
                            </div>
                        </Popup>
                    </Marker>
                </MapContainer>
            </div>
        </div>
    );
}

// ===== LotDetail (hooks first; bidding + lightbox) =====
function LotDetail({ lots, setLots, dark, user }) {
    const { id } = useParams();
    const nav = useNavigate();
    const lot = lots.find((l) => l.id === id);

    // Hooks must always be at the top (no conditionals)
    const [_tick, setTick] = useState(0); // just to re-render countdown each second
    useEffect(() => {
        const t = setInterval(() => setTick((x) => x + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const [activeIdx, setActiveIdx] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    // Bid state (initialize to next step above current bid, but at least MIN_BID)
    const [bid, setBid] = useState(
        Math.max(nextValidStep(((lot?.currentBid ?? 0) + STEP)), MIN_BID)
    );
    const [error, setError] = useState("");

    // Validate bid whenever it changes (safe: early-return if no lot)
    useEffect(() => {
        if (!lot) return;
        if (Number.isNaN(bid)) { setError("Enter a number."); return; }
        if (bid < MIN_BID) { setError(`Minimum bid is \u20AC${MIN_BID}.`); return; }
        if (!isStepAmount(bid)) { setError(`Bids must be in \u20AC${STEP} steps (e.g. 250, 300, 350).`); return; }
        if (bid <= lot.currentBid) { setError(`Your bid must be higher than the current bid (\u20AC${lot.currentBid}).`); return; }
        setError("");
    }, [bid, lot]);

    // Handlers
    function placeBid() {
        if (!lot || error) return;
        setLots((prev) =>
            prev.map((l) => (l.id === lot.id ? { ...l, currentBid: bid } : l))
        );
        alert(`Bid placed: \u20AC${bid.toLocaleString()}`);
    }
    function nudge(delta) {
        const next = Math.max(MIN_BID, bid + delta * STEP);
        setBid(nextValidStep(next));
    }
    const openLightbox = () => setLightbox(true);
    const closeLightbox = () => setLightbox(false);
    const prevImage = () => setActiveIdx((i) => (i - 1 + lot.images.length) % lot.images.length);
    const nextImage = () => setActiveIdx((i) => (i + 1) % lot.images.length);

    // After hooks: conditional render is fine
    if (!lot) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-12">
                <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 mb-6">
                    <ChevronLeft size={16} /> Back
                </button>
                <div className={`p-8 rounded-2xl border ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>
                    Lot not found.
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 mb-6">
                <ChevronLeft size={16} /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gallery */}
                <div className={`lg:col-span-2 rounded-2xl overflow-hidden border ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>
                    <button
                        onClick={openLightbox}
                        className={`${dark ? "bg-neutral-900" : "bg-white"} w-full cursor-zoom-in`}
                        style={{ aspectRatio: "16 / 9" }}
                        aria-label="Open image"
                    >
                        <img
                            src={lot.images[activeIdx]}
                            alt={lot.title}
                            className="w-full h-full object-contain"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.src = `https://placehold.co/1600x1000?text=${encodeURIComponent(lot.title)}`; }}
                        />
                    </button>

                    <div className="grid grid-cols-3 gap-2 p-3">
                        {lot.images.map((src, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIdx(i)}
                                className={`${dark ? "bg-neutral-900" : "bg-white"} w-full rounded-lg ring-offset-2 focus:outline-none focus:ring-2 ${i === activeIdx ? "ring-blue-500" : "ring-transparent"}`}
                                style={{ aspectRatio: "4 / 3" }}
                                aria-label={`Thumbnail ${i + 1}`}
                            >
                                <img
                                    src={src}
                                    alt={`thumb ${i + 1}`}
                                    loading="lazy"
                                    className="w-full h-full object-contain rounded-lg"
                                    onError={(e) => { e.currentTarget.src = `https://placehold.co/800x600?text=Image+${i + 1}`; }}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Side panel with bidding */}
                <div className={`rounded-2xl border p-4 h-max ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>
                    <h1 className="text-2xl font-semibold leading-tight">{lot.title}</h1>
                    <p className={`mt-1 text-sm flex items-center gap-1 ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                        <MapPin size={14} /> {lot.location} {" \u00B7 "} {lot.seller}

                    </p>
                    <div className="mt-2 flex gap-2">
                           <span className={`text-[11px] px-2 py-1 rounded-lg border ${+     lot.hasDefects
                                       ? (dark ? "border-red-700 text-red-300 bg-red-900/20" : "border-red-200 text-red-700 bg-red-50")
                                   : (dark ? "border-green-700 text-green-300 bg-green-900/20" : "border-green-200 text-green-700 bg-green-50")
                               }`}>
                                 {lot.hasDefects ? "With defects" : "Without defects"}
                              </span>
                    </div>
                    <div className="mt-6">
                        <LotMap lot={lot} dark={dark} />
                    </div>

                    {/* Key facts */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <FactPill label="Category" value={lot.category} dark={dark} />
                        <FactPill label="Year" value={lot.year} dark={dark} />
                        <FactPill label="Hours" value={lot.hours?.toLocaleString?.()} dark={dark} />
                        <FactPill label="Condition" value={lot.condition} dark={dark} />
                        <FactPill label="Seller" value={lot.seller} dark={dark} />
                        <FactPill label="Engine" value={lot.specs?.engine} dark={dark} />
                        <FactPill label="Power" value={lot.specs?.power} dark={dark} />
                        <FactPill label="Weight" value={lot.specs?.weight} dark={dark} />
                    </div>
                    {/* ? FULL-WIDTH SPECIFICATIONS — SINGLE LIST */}
                    <div className={`rounded-2xl border ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"} overflow-hidden`}>
                        <div className={`px-4 py-3 ${dark ? "border-b border-neutral-800" : "border-b border-gray-200"}`}>
                            <h3 className="font-semibold">Specifications</h3>
                        </div>

                        <dl className={`divide-y ${dark ? "divide-neutral-800" : "divide-gray-200"}`}>
                            {buildSpecRows(lot).map(([label, value]) => (
                                <div
                                    key={label}
                                    className="px-4 py-3 sm:grid sm:grid-cols-[180px_1fr] sm:gap-6"
                                >
                                    <dt className={`${dark ? "text-neutral-400" : "text-gray-600"} text-sm mb-1 sm:mb-0`}>
                                        {label}
                                    </dt>
                                    <dd className="text-sm font-medium break-words">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>


                    {/* ? DESCRIPTION BELOW, SIMPLE AND WIDE */}
                    <div className="mt-6">
                        <div className={`rounded-2xl border p-6 ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>
                            <h3 className="font-semibold text-lg">Description</h3>
                            <p className="mt-3 text-sm leading-relaxed opacity-90">{lot.description}</p>

                            {lot.documents?.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium mb-2">Documents</h4>
                                    <ul className="list-disc pl-5 text-sm opacity-90">
                                        {lot.documents.map((d) => <li key={d}>{d}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>



                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className={`rounded-xl border p-3 ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"}`}>
                            <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>Current bid</div>
                            <div className="text-xl font-bold">{formatCurrency(lot.currentBid)}</div>
                        </div>
                        <div className={`rounded-xl border p-3 text-right ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"}`}>
                            <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>Buy now</div>
                            <div className="text-xl font-semibold">{formatCurrency(lot.buyNow)}</div>
                        </div>
                    </div>

                    <div className={`mt-3 inline-flex items-center gap-1 text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                        <Clock size={14} /> Ends in {prettyLeft(lot.endsAt)}
                        {lot.reserve && <span className="inline-flex items-center gap-1 ml-2"><CheckCircle2 size={14} /> Reserve</span>}
                    </div>

                    {/* Bidding UI */}
                    <div className="mt-4">
                        <label className={`text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>Your bid (EUR)</label>
                        <div className="mt-1 flex items-stretch gap-2">
                            <button type="button" onClick={() => nudge(-1)} className="px-3 rounded-xl border" aria-label="Decrease by 50">-50</button>
                            <input
                                type="number"
                                inputMode="numeric"
                                min={MIN_BID}
                                step={STEP}
                                value={bid}
                                onChange={(e) => setBid(Number(e.target.value))}
                                onBlur={() => setBid(nextValidStep(bid))}
                                className={`flex-1 border rounded-xl px-3 py-2 ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                            />
                            <button type="button" onClick={() => nudge(1)} className="px-3 rounded-xl border" aria-label="Increase by 50">+50</button>
                        </div>

                        <p className={`mt-2 text-xs ${error ? "text-red-600" : dark ? "text-neutral-400" : "text-gray-500"}`}>
                            Minimum bid is {"\u20AC"}{MIN_BID}. Bids increase in {"\u20AC"}{STEP} steps (e.g. 250, 300, 350). Your bid must be higher than the current bid.
                        </p>
                        
                        {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

                        {/* Signed-out notice */}
                        {!user && (
                            <div
                                className={`mt-3 rounded-xl border p-3 text-sm ${dark
                                        ? "bg-neutral-900 border-neutral-800 text-neutral-200"
                                        : "bg-blue-50 border-blue-200 text-blue-900"
                                    }`}
                            >
                                You must be signed in to place bids or buy now.{" "}
                                <Link to="/signin" className="underline">Sign in</Link>
                            </div>
                        )}

                        {/* Action buttons — only show when signed in */}
                        {user && (
                            <div className="mt-3 flex gap-2">
                                <button
                                    className={`flex-1 py-2 rounded-xl text-white ${error ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                    onClick={placeBid}
                                    disabled={Boolean(error)}
                                >
                                    Place bid
                                </button>
                                <button
                                    className="py-2 px-3 rounded-xl border"
                                    onClick={() => alert("Buy now (mock)")}
                                >
                                    Buy now
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* (Keep your specs/description here) */}

            {/* Lightbox overlay */}
            {lightbox && (
                <Lightbox
                    images={lot.images}
                    index={activeIdx}
                    alt={lot.title}
                    onClose={closeLightbox}
                    onPrev={prevImage}
                    onNext={nextImage}
                />
            )}
        </div>
    );
}



function SignIn({ dark, setUser }) {
    const nav = useNavigate();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [showPw, setShowPw] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    const validate = () => {
        if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Please enter a valid email.";
        if (password.length < 6) return "Password must be at least 6 characters.";
        return "";
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setError("");
        setLoading(true);
        // ?? Mock sign-in flow — replace with your API later
        setTimeout(() => {
            setLoading(false);
            alert("Signed in (mock). You can replace this with your real auth later.");
            setUser({ email });
            nav("/"); // go back to home after sign-in
        }, 800);
    };

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className={`rounded-2xl border ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white border-gray-200"} p-6`}>
                <h1 className="text-2xl font-semibold">Sign in</h1>
                <p className={`text-sm mt-1 ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                    Access your HeavyBid account to place bids and manage listings.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    {/* Email */}
                    <div>
                        <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Email</label>
                        <div className="relative mt-1">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                placeholder="you@example.com"
                                className={`w-full border rounded-xl pl-9 pr-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" : ""}`}
                            />
                            <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-neutral-400" : "text-gray-400"}`} />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Password</label>
                        <div className="relative mt-1">
                            <input
                                type={showPw ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                placeholder="******"
                                className={`w-full border rounded-xl pl-9 pr-10 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" : ""}`}
                            />
                            <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-neutral-400" : "text-gray-400"}`} />
                            <button
                                type="button"
                                onClick={() => setShowPw((s) => !s)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${dark ? "hover:bg-neutral-800" : "hover:bg-gray-100"}`}
                                aria-label={showPw ? "Hide password" : "Show password"}
                            >
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className={`text-sm ${dark ? "text-red-300" : "text-red-600"}`}>{error}</div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-60"
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                        <button
                            type="button"
                            onClick={() => nav(-1)}
                            className={`px-3 py-2 rounded-xl border text-sm ${dark ? "border-neutral-700" : ""}`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                <div className={`mt-6 text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                    Don't have an account? <span className="underline cursor-pointer" onClick={() => alert("TODO: Sign up page")}>Sign up</span>
                </div>
            </div>
        </div>
    );
}

// ---- App root ----
export default function App() {
    // Lots
    const [lots, setLots] = useState(MOCK_LISTINGS);

    // Theme/search/sort
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [country, setCountry] = useState("All");
    const [condition, setCondition] = useState("All");   // ?? new
    const [defects, setDefects] = useState("All"); 
    const [sortBy, setSortBy] = useState("endingSoon");
    const [dark, setDark] = useState(false);
    // --- Auth (mock) ---
    // --- Auth (mock) ---
    const [user, setUser] = React.useState(() => {
        try { const raw = localStorage.getItem("hb_user"); return raw ? JSON.parse(raw) : null; }
        catch { return null; }
    });
    React.useEffect(() => {
        if (user) localStorage.setItem("hb_user", JSON.stringify(user));
        else localStorage.removeItem("hb_user");
    }, [user]);

    React.useEffect(() => {
        if (user) localStorage.setItem("hb_user", JSON.stringify(user));
        else localStorage.removeItem("hb_user");
    }, [user]);


    // Compute max bid and steps (always yields at least [0, max])
    const maxCurrentBid = useMemo(
        () => Math.max(0, ...lots.map((l) => l.currentBid)),
        [lots]
    );

    const priceSteps = useMemo(() => {
        const steps = buildPriceSteps(maxCurrentBid);
        return steps.length ? steps : [0, maxCurrentBid];
    }, [maxCurrentBid]);

    // ? Initialize AFTER steps exist; update if steps change
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(0);
    useEffect(() => {
        if (priceSteps.length) setPriceMax(priceSteps[priceSteps.length - 1]);
    }, [priceSteps]);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
    }, [dark]);


    return (
        <div className={dark ? "bg-neutral-950 text-white min-h-screen" : "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 min-h-screen"}>
            <BrowserRouter>
                <Header {...{ query, setQuery, dark, setDark, user, setUser }} />
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Home
                                {...{ lots, query, setQuery, category, setCategory, sortBy, setSortBy, dark }}
                                {...{ country, setCountry }}
                                {...{ condition, setCondition }}
                                {...{ defects, setDefects }} 
                                priceSteps={priceSteps}
                                priceMin={priceMin}
                                priceMax={priceMax}
                                setPriceMin={setPriceMin}
                                setPriceMax={setPriceMax}
                                dark={dark}
                            />
                        }
                    />
                    <Route path="/lot/:id" element={<LotDetail lots={lots} setLots={setLots} dark={dark} user={user} />} />
                    <Route path="/signin" element={<SignIn dark={dark} setUser={setUser} />} />
                    <Route path="*" element={<div className="max-w-5xl mx-auto px-4 py-12">Not found</div>} />
                </Routes>
                <footer className={`${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"} border-t mt-8`}>
                    <div className="max-w-7xl mx-auto px-4 py-6 text-sm flex flex-col sm:flex-row gap-2 sm:justify-between">
                        <div>{"\u00A9"} {new Date().getFullYear()} {" "} HeavyBid {" \u2014 "} Heavy machinery auctions</div>
                        <div>Contact: info@heavybid.example</div>
                    </div>
                </footer>
            </BrowserRouter>
        </div>
    );
}
