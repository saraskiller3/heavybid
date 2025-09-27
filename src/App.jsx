// src/App.jsx — Auction-grade UI with routing, detail page, dark mode, animations
// Requires: tailwind (already set), framer-motion, lucide-react, react-router-dom
// If you haven't yet: npm install react-router-dom framer-motion lucide-react

import React, { useMemo, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Search, Clock, MapPin, Sun, Moon, ChevronLeft, ChevronRight, X, CheckCircle2 } from "lucide-react";

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
                className={`group rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-shadow ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"
                    }`}
            >
                <div className="relative">
                    <div
                        className={`${dark ? "bg-neutral-900" : "bg-white"} w-full`}
                        style={{ aspectRatio: "16 / 9" }}
                    >
                        <img
                            src={lot.images[0]}
                            alt={lot.title}
                            loading="lazy"
                            className="w-full h-full object-contain"
                        />
                    </div>

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

                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-base leading-snug line-clamp-2">
                        {lot.title}
                    </h3>

                    {/* NOTE: use a safe middle dot */}
                    <p
                        className={`text-sm mt-1 flex items-center gap-1 ${dark ? "text-neutral-400" : "text-gray-500"
                            }`}
                    >
                        <MapPin size={14} /> {lot.location} {" · "} {lot.seller}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <div
                            className={`rounded-xl border p-3 ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"
                                }`}
                        >
                            <div className={dark ? "text-xs text-neutral-400" : "text-xs text-gray-500"}>
                                Current bid
                            </div>
                            <div className="text-lg font-bold">
                                {formatCurrency(lot.currentBid)}
                            </div>
                        </div>

                        <div
                            className={`rounded-xl border p-3 text-right ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"
                                }`}
                        >
                            <div className={dark ? "text-xs text-neutral-400" : "text-xs text-gray-500"}>
                                Buy now
                            </div>
                            <div className="text-lg font-semibold">
                                {formatCurrency(lot.buyNow)}
                            </div>
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
    useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
    }, []);

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
function LotDetail({ lots, dark }) {
    const { id } = useParams();
    const nav = useNavigate();
    const lot = lots.find((l) => l.id === id);
    const [bid, setBid] = useState(lot ? lot.currentBid + 1000 : 0);
    const [activeIdx, setActiveIdx] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [tick, setTick] = useState(0);
    useEffect(() => {
        const t = setInterval(() => setTick((x) => x + 1), 1000);
        return () => clearInterval(t);
    }, []);
    if (!lot) {
        return (
            <div className="max-w-5xl mx-auto px-4 py-12">
                <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 mb-6"><ChevronLeft size={16} /> Back</button>
                <div className={`p-8 rounded-2xl border ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>Lot not found.</div>
            </div>
        );
    }

    const openLightbox = () => setLightbox(true);
    const closeLightbox = () => setLightbox(false);
    const prevImage = () => setActiveIdx((i) => (i - 1 + lot.images.length) % lot.images.length);
    const nextImage = () => setActiveIdx((i) => (i + 1) % lot.images.length);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 mb-6"><ChevronLeft size={16} /> Back</button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gallery */}
                <div className={`lg:col-span-2 rounded-2xl overflow-hidden border ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>
                    {/* Main (contain, click to zoom) */}
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

                    {/* Thumbs */}
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

                {/* Side panel (unchanged UI) */}
                <div className={`rounded-2xl border p-4 h-max ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>
                    <h1 className="text-2xl font-semibold leading-tight">{lot.title}</h1>
                    <p className={`mt-1 text-sm flex items-center gap-1 ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                        <MapPin size={14} /> {lot.location}
                    </p>

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
                        <Clock size={14} /> Ends in {prettyLeft(lot.endsAt)}({tick})
                        {lot.reserve && <span className="inline-flex items-center gap-1 ml-2"><CheckCircle2 size={14} /> Reserve</span>}
                    </div>

                    <div className="mt-4">
                        <label className={`text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>Your bid (EUR)</label>
                        <input
                            type="number"
                            value={bid}
                            min={lot.currentBid + 1}
                            onChange={(e) => setBid(Number(e.target.value))}
                            className={`mt-1 w-full border rounded-xl px-3 py-2 ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        />
                        <div className="mt-3 flex gap-2">
                            <button className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">Place bid</button>
                            <button className="py-2 px-3 rounded-xl border" onClick={() => alert("Buy now (mock)")}>Buy now</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Specs & description (unchanged) */}
            {/* ... keep your existing specs/description blocks ... */}

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