// src/App.jsx — polished UI with animations & icons (uses framer-motion + lucide-react)
// Paste this into your project's src/App.jsx and save.

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Clock, MapPin } from "lucide-react";

const MOCK_LISTINGS = [
    {
        id: "EX2001",
        title: "2014 Komatsu PC210-8 Excavator",
        location: "Riga, Latvia",
        images: [
            "https://images.unsplash.com/photo-1593941707882-a5bba14938c2?q=80&w=1200&auto=format&fit=crop",
        ],
        year: 2014,
        hours: 8200,
        condition: "Used",
        currentBid: 28000,
        buyNow: 34000,
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Excavator",
        seller: "Baltic Machinery OÜ",
        description:
            "Well maintained Komatsu PC210 with full service records. New tracks in 2022.",
    },
    {
        id: "WL453",
        title: "2018 Volvo L120 Wheel Loader",
        location: "Vilnius, Lithuania",
        images: [
            "https://images.unsplash.com/photo-1622040065448-3ae9561d7e77?q=80&w=1200&auto=format&fit=crop",
        ],
        year: 2018,
        hours: 5400,
        condition: "Used",
        currentBid: 42000,
        buyNow: 52000,
        endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Wheel loader",
        seller: "Nordic Plant",
        description: "Low hours, Stage V, good hydraulic condition.",
    },
    {
        id: "CR300",
        title: "2016 Caterpillar D6 Bulldozer",
        location: "Tallinn, Estonia",
        images: [
            "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200&auto=format&fit=crop",
        ],
        year: 2016,
        hours: 12500,
        condition: "Used",
        currentBid: 65000,
        buyNow: 78000,
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Bulldozer",
        seller: "Estonian Earthworks",
        description: "D6 with ripper, blade; recent hydraulics check.",
    },
];

function formatCurrency(num) {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(num);
}

function msLeft(iso) { return new Date(iso) - new Date(); }
function prettyLeft(iso) {
    const diff = msLeft(iso);
    if (diff <= 0) return "Closed";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}d ${hours}h ${mins}m`;
}

export default function App() {
    const [listings, setListings] = useState(MOCK_LISTINGS);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState("All");
    const [sortBy, setSortBy] = useState("endingSoon");
    const [selected, setSelected] = useState(null);
    const [bid, setBid] = useState(0);
    const [nowTick, setNowTick] = useState(Date.now());

    useEffect(() => {
        const t = setInterval(() => setNowTick(Date.now()), 30_000);
        return () => clearInterval(t);
    }, []);

    const categories = useMemo(() => ["All", ...new Set(listings.map((l) => l.category))], [listings]);

    const filtered = useMemo(() => {
        let out = listings.filter((l) =>
            `${l.title} ${l.location} ${l.seller}`.toLowerCase().includes(query.toLowerCase())
        );
        if (category !== "All") out = out.filter((l) => l.category === category);
        if (sortBy === "endingSoon") out = out.sort((a, b) => msLeft(a.endsAt) - msLeft(b.endsAt));
        if (sortBy === "priceHigh") out = out.sort((a, b) => b.currentBid - a.currentBid);
        if (sortBy === "priceLow") out = out.sort((a, b) => a.currentBid - b.currentBid);
        return out;
    }, [listings, query, category, sortBy, nowTick]);

    function openBid(l) { setSelected(l); setBid(l.currentBid + 1000); }
    function confirmBid() {
        setListings((prev) => prev.map((l) => (l.id === selected.id && bid > l.currentBid ? { ...l, currentBid: bid } : l)));
        setSelected(null);
    }

    const fadeIn = {
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold">HB</div>
                    <div className="mr-auto">
                        <div className="text-xl font-extrabold leading-5">HeavyBid</div>
                        <div className="text-xs text-gray-500">Heavy machinery auctions · EU</div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-6">
                        <div className="relative w-full">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search model, location, seller…"
                                className="w-full border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-xl pl-9 pr-3 py-2 text-sm"
                            />
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm">Sell equipment</button>
                        <button className="px-3 py-2 rounded-xl border text-sm">Sign in</button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Filters */}
                <aside className="md:col-span-1">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm border p-4 sticky top-20">
                        <div>
                            <label className="text-xs font-medium text-gray-600">Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm">
                                {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4">
                            <label className="text-xs font-medium text-gray-600">Sort</label>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="mt-1 w-full border rounded-xl px-3 py-2 text-sm">
                                <option value="endingSoon">Ending soon</option>
                                <option value="priceHigh">Highest bid</option>
                                <option value="priceLow">Lowest bid</option>
                            </select>
                        </div>
                        <div className="mt-4">
                            <label className="text-xs font-medium text-gray-600">Quick search</label>
                            <div className="relative">
                                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Komatsu, Riga, seller…" className="mt-1 w-full border rounded-xl pl-9 pr-3 py-2 text-sm" />
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                        </div>
                    </motion.div>
                </aside>

                {/* Listings */}
                <section className="md:col-span-3">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-semibold">Live auctions</h2>
                        <span className="text-sm text-gray-600">{filtered.length} results</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {filtered.map((l) => (
                                <motion.article
                                    key={l.id}
                                    variants={fadeIn}
                                    initial="hidden"
                                    animate="show"
                                    exit={{ opacity: 0, y: 10 }}
                                    whileHover={{ y: -3, boxShadow: "0 10px 25px rgba(0,0,0,0.06)" }}
                                    className="group bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-shadow"
                                >
                                    <div className="relative">
                                        <img src={l.images[0]} alt={l.title} className="w-full h-44 object-cover" />
                                        <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-md text-xs font-semibold">
                                            {l.category}
                                        </div>
                                        <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-md text-xs flex items-center gap-1">
                                            <Clock size={14} /> {prettyLeft(l.endsAt)}
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="font-semibold text-base leading-snug line-clamp-2">{l.title}</h3>
                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><MapPin size={14} /> {l.location} · {l.seller}</p>

                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            <div className="rounded-xl bg-gray-50 border p-3">
                                                <div className="text-xs text-gray-500">Current bid</div>
                                                <div className="text-lg font-bold">{formatCurrency(l.currentBid)}</div>
                                            </div>
                                            <div className="rounded-xl bg-gray-50 border p-3 text-right">
                                                <div className="text-xs text-gray-500">Buy now</div>
                                                <div className="text-lg font-semibold">{formatCurrency(l.buyNow)}</div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-2">
                                            <button onClick={() => openBid(l)} className="flex-1 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-sm">Place bid</button>
                                            <button onClick={() => alert("Buy Now flow (mock)")} className="py-2 px-3 rounded-xl border">Buy now</button>
                                        </div>
                                    </div>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filtered.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 bg-white p-6 rounded-2xl border shadow-sm text-center text-gray-600">
                            No listings match your filters. Try clearing search or selecting a different category.
                        </motion.div>
                    )}
                </section>
            </main>

            {/* Bid modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                            className="relative bg-white rounded-2xl p-6 shadow-xl max-w-md w-full z-10"
                        >
                            <h3 className="text-lg font-semibold">Place a bid</h3>
                            <p className="text-sm text-gray-500 mt-1">{selected.title}</p>
                            <p className="text-sm text-gray-500 mt-1">Current bid: {formatCurrency(selected.currentBid)}</p>

                            <div className="mt-4">
                                <label className="text-xs text-gray-600">Your bid (EUR)</label>
                                <input
                                    type="number"
                                    value={bid}
                                    min={selected.currentBid + 1}
                                    onChange={(e) => setBid(Number(e.target.value))}
                                    className="mt-1 w-full border rounded-xl px-3 py-2"
                                />
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button className="flex-1 py-2 rounded-xl bg-blue-600 text-white" onClick={confirmBid}>Confirm bid</button>
                                <button className="py-2 px-4 rounded-xl border" onClick={() => setSelected(null)}>Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="bg-white border-t mt-8">
                <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-600 flex flex-col sm:flex-row gap-2 sm:justify-between">
                    <div>© {new Date().getFullYear()} HeavyBid — Heavy machinery auctions</div>
                    <div>Contact: info@heavybid.example</div>
                </div>
            </footer>
        </div>
    );
}

