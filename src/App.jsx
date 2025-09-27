// src/App.jsx — Auction-grade UI with routing, detail page, dark mode, animations
// Requires: tailwind (already set), framer-motion, lucide-react, react-router-dom
// If you haven't yet: npm install react-router-dom framer-motion lucide-react

import React, { useMemo, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Search, Clock, MapPin, Sun, Moon, ChevronLeft, CheckCircle2 } from "lucide-react";

// ---- Mock data (expandable / replace with API later) ----
const MOCK_LISTINGS = [
    {
        id: "EX2001",
        title: "2014 Komatsu PC210-8 Excavator",
        location: "Riga, Latvia",
        images: [
            "/images/komatsu/img1.jpg",
            "/images/komatsu/img2.jpg",
             "/images/komatsu/img3.png",
        ],
        year: 2014,
        hours: 8200,
        condition: "Used",
        currentBid: 28000,
        reserve: true,
        buyNow: 34000,
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Excavator",
        seller: "Baltic Machinery OÜ",
        specs: { weight: "22,000 kg", engine: "Komatsu SAA6D107E-1", power: "123 kW" },
        description: "Well maintained PC210 with full service records. New tracks in 2022. Ready to work.",
        documents: ["Service history", "CE certificate"],
    },
    {
        id: "WL453",
        title: "2018 Volvo L120 Wheel Loader",
        location: "Vilnius, Lithuania",
        images: [
            "/images/volvo/img1.jpg",
            "/images/volvo/img2.jpg",
            "/images/volvo/img3.jpg",
        ],
        year: 2018,
        hours: 5400,
        condition: "Used",
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
        images: [
            "/images/catd6/img1.jpg",
            "/images/catd6/img2.webp",
        ],
        year: 2016,
        hours: 12500,
        condition: "Used",
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
];

function formatCurrency(num) { return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(num); }
function msLeft(iso) { return new Date(iso) - new Date(); }
function prettyLeft(iso) {
    const diff = msLeft(iso); if (diff <= 0) return "Closed";
    const d = Math.floor(diff / 86400000), h = Math.floor((diff / 3600000) % 24), m = Math.floor((diff / 60000) % 60);
    return `${d}d ${h}h ${m}m`;
}
// ---- Layout & shared UI ----
function Header({ query, setQuery, dark, setDark }) {
    return (
        <header className={`sticky top-0 z-30 border-b ${dark ? "bg-neutral-900/80 text-white" : "bg-white/80"} backdrop-blur supports-[backdrop-filter]:bg-white/60`}>
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
                <Link to="/" className={`w-10 h-10 rounded-2xl grid place-items-center font-extrabold ${dark ? "bg-blue-500 text-white" : "bg-blue-600 text-white"}`}>HB</Link>
                <div className="mr-auto">
                    <div className="text-xl font-extrabold leading-5">HeavyBid</div>
                    <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>Heavy machinery auctions · EU</div>
                </div>

                <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-6">
                    <div className="relative w-full">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search model, location, seller…"
                            className={`w-full border ${dark ? "border-neutral-700 bg-neutral-800 text-white placeholder-neutral-400" : "border-gray-200"} focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-xl pl-9 pr-3 py-2 text-sm`}
                        />
                        <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-neutral-400" : "text-gray-400"}`} />
                    </div>
                </div>

                <button onClick={() => setDark(!dark)} className={`p-2 rounded-xl border ${dark ? "border-neutral-700" : "border-gray-200"}`} aria-label="Toggle theme">
                    {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                <div className="flex items-center gap-2">
                    <button className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm">Sell equipment</button>
                    <button className={`px-3 py-2 rounded-xl border text-sm ${dark ? "border-neutral-700" : ""}`}>Sign in</button>
                </div>
            </div>
        </header>
    );
}

function Filters({ categories, category, setCategory, sortBy, setSortBy, query, setQuery, dark }) {
    return (
        <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"} rounded-2xl shadow-sm border p-4 sticky top-20`}>
            <div>
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
            <div className="mt-4">
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Sort</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}>
                    <option value="endingSoon">Ending soon</option>
                    <option value="priceHigh">Highest bid</option>
                    <option value="priceLow">Lowest bid</option>
                </select>
            </div>
            <div className="mt-4">
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Quick search</label>
                <div className="relative">
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Komatsu, Riga, seller…"
                        className={`mt-1 w-full border rounded-xl pl-9 pr-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white placeholder-neutral-400" : ""}`} />
                    <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-neutral-400" : "text-gray-400"}`} />
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

function Card({ lot, dark }) {
    return (
        <Link to={`/lot/${lot.id}`}>
            <Motion.article
                whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0,0,0,0.06)" }}
                className={`group rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-shadow ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}
            >
                <div className="relative">
                    <ImageWithFallback src={lot.images[0]} alt={lot.title} loading="lazy" className="w-full h-44 object-cover" />
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-semibold ${dark ? "bg-neutral-800/90" : "bg-white/90"}`}>{lot.category}</div>
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-md text-xs flex items-center gap-1 ${dark ? "bg-neutral-800/90" : "bg-white/90"}`}>
                        <Clock size={14} /> {prettyLeft(lot.endsAt)}
                    </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-base leading-snug line-clamp-2">{lot.title}</h3>
                    <p className={`text-sm mt-1 flex items-center gap-1 ${dark ? "text-neutral-400" : "text-gray-500"}`}><MapPin size={14} /> {lot.location} · {lot.seller}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className={`rounded-xl border p-3 ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"}`}>
                            <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>Current bid</div>
                            <div className="text-lg font-bold">{formatCurrency(lot.currentBid)}</div>
                        </div>
                        <div className={`rounded-xl border p-3 text-right ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"}`}>
                            <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>Buy now</div>
                            <div className="text-lg font-semibold">{formatCurrency(lot.buyNow)}</div>
                        </div>
                    </div>
                </div>
            </Motion.article>
        </Link>
    );
}

// ---- Pages ----
function Home({ lots, query, setQuery, category, setCategory, sortBy, setSortBy, dark }) {
    const categories = useMemo(() => ["All", ...new Set(lots.map((l) => l.category))], [lots]);
    const [nowTick, setNowTick] = useState(Date.now());
    useEffect(() => { const t = setInterval(() => setNowTick(Date.now()), 30000); return () => clearInterval(t); }, []);

    const filtered = useMemo(() => {
        let out = lots.filter((l) => `${l.title} ${l.location} ${l.seller}`.toLowerCase().includes(query.toLowerCase()));
        if (category !== "All") out = out.filter((l) => l.category === category);
        if (sortBy === "endingSoon") out = out.sort((a, b) => msLeft(a.endsAt) - msLeft(b.endsAt));
        if (sortBy === "priceHigh") out = out.sort((a, b) => b.currentBid - a.currentBid);
        if (sortBy === "priceLow") out = out.sort((a, b) => a.currentBid - b.currentBid);
        return out;
    }, [lots, query, category, sortBy, nowTick]);

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <aside className="md:col-span-1"><Filters {...{ categories, category, setCategory, sortBy, setSortBy, query, setQuery, dark }} /></aside>
            <section className="md:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Live auctions</h2>
                    <span className={`text-sm ${dark ? "text-neutral-400" : "text-gray-600"}`}>{filtered.length} results</span>
                </div>
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
                    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-8 p-6 rounded-2xl border text-center ${dark ? "bg-neutral-900 border-neutral-800 text-neutral-300" : "bg-white text-gray-600"}`}>
                        No listings match your filters. <button onClick={() => { setQuery(""); setCategory("All"); }} className="underline">Reset filters</button>
                    </Motion.div>
                )}
            </section>
        </main>
    );
}

function LotDetail({ lots, dark }) {
    const { id } = useParams();
    const nav = useNavigate();
    const lot = lots.find((l) => l.id === id);
    const [bid, setBid] = useState(lot ? lot.currentBid + 1000 : 0);

    if (!lot) return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 mb-6"><ChevronLeft size={16} /> Back</button>
            <div className={`p-8 rounded-2xl border ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>Lot not found.</div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 mb-6"><ChevronLeft size={16} /> Back</button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gallery */}
                <div className={`lg:col-span-2 rounded-2xl overflow-hidden border ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>
                    <ImageWithFallback src={lot.images[0]} alt={lot.title} className="w-full h-[380px] object-cover" />
                    <div className="grid grid-cols-3 gap-2 p-3">
                        {lot.images.map((src, i) => (
                            <ImageWithFallback key={i} src={src} alt="thumb" loading="lazy" className="w-full h-24 object-cover rounded-lg" />
                        ))}
                    </div>
                </div>

                {/* Side panel */}
                <div className={`rounded-2xl border p-4 h-max ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>
                    <h1 className="text-2xl font-semibold leading-tight">{lot.title}</h1>
                    <p className={`mt-1 text-sm flex items-center gap-1 ${dark ? "text-neutral-400" : "text-gray-500"}`}><MapPin size={14} /> {lot.location}</p>

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
                        <Clock size={14} /> Ends in {prettyLeft(lot.endsAt)} {lot.reserve && (<span className="inline-flex items-center gap-1 ml-2"><CheckCircle2 size={14} /> Reserve</span>)}
                    </div>

                    <div className="mt-4">
                        <label className={`text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>Your bid (EUR)</label>
                        <input type="number" value={bid} min={lot.currentBid + 1} onChange={(e) => setBid(Number(e.target.value))}
                            className={`mt-1 w-full border rounded-xl px-3 py-2 ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                        <div className="mt-3 flex gap-2">
                            <button className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">Place bid</button>
                            <button className="py-2 px-3 rounded-xl border" onClick={() => alert("Buy now (mock)")}>Buy now</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specs & description */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`rounded-2xl border p-4 ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>
                    <h3 className="font-semibold mb-3">Specifications</h3>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <dt className="text-gray-500 dark:text-neutral-400">Year</dt><dd>{lot.year}</dd>
                        <dt className="text-gray-500 dark:text-neutral-400">Hours</dt><dd>{lot.hours.toLocaleString()}</dd>
                        <dt className="text-gray-500 dark:text-neutral-400">Condition</dt><dd>{lot.condition}</dd>
                        {Object.entries(lot.specs).map(([k, v]) => (
                            <React.Fragment key={k}><dt className="text-gray-500 dark:text-neutral-400 capitalize">{k}</dt><dd>{v}</dd></React.Fragment>
                        ))}
                    </dl>
                </div>
                <div className={`rounded-2xl border p-4 lg:col-span-2 ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-sm leading-relaxed opacity-90">{lot.description}</p>
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
        </div>
    );
}

// ---- App root ----
export default function App() {
    const [lots] = useState(MOCK_LISTINGS);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [sortBy, setSortBy] = useState("endingSoon");
    const [dark, setDark] = useState(false);


    // ? Ensure Tailwind dark mode works: add/remove the 'dark' class on <html>
    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
    }, [dark]);


    return (
        <div className={dark ? "bg-neutral-950 text-white min-h-screen" : "bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900 min-h-screen"}>
            <BrowserRouter>
                <Header {...{ query, setQuery, dark, setDark }} />
                <Routes>
                    <Route path="/" element={<Home {...{ lots, query, setQuery, category, setCategory, sortBy, setSortBy, dark }} />} />
                    <Route path="/lot/:id" element={<LotDetail lots={lots} dark={dark} />} />
                    <Route path="*" element={<div className="max-w-5xl mx-auto px-4 py-12">Not found</div>} />
                </Routes>
                <footer className={`${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"} border-t mt-8`}>
                    <div className="max-w-7xl mx-auto px-4 py-6 text-sm flex flex-col sm:flex-row gap-2 sm:justify-between">
                        <div>© {new Date().getFullYear()} HeavyBid — Heavy machinery auctions</div>
                        <div>Contact: info@heavybid.example</div>
                    </div>
                </footer>
            </BrowserRouter>
        </div>
    );
}