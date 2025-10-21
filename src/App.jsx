// src/App.jsx — Auction-grade UI with routing, detail page, dark mode, animations
// Requires: tailwind (already set), framer-motion, lucide-react, react-router-dom
// If you haven't yet: npm install react-router-dom framer-motion lucide-react

import React, { useMemo, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Navigate, useLocation } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Search, Clock, MapPin, Sun, Moon, ChevronLeft, CheckCircle2, Mail, Lock, Eye, EyeOff, ChevronRight, X, Menu } from "lucide-react";
import LocationAutocompleteOSM from "./components/LocationAutocompleteOSM";
import { CountrySelect } from "./components/CountrySelect";
import { categoryStructure } from "./data/categories";  


// ---- Mock data (expandable / replace with API later) ----
const MOCK_LISTINGS = [
    {
        id: "EX2001",
        type: "auction",
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
        reservePrice: 34000,
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Excavators",
        subcategory: "Track excavator",
        sellerType: "Company",
        companyName: "Baltic Machinery O\u00DC",
        sellerEmail: "seller1@example.com",
        specs: { weight: "22,000 kg", engine: "Komatsu SAA6D107E-1", power: "123 kW" },
        description: "Well maintained PC210 with full service records. New tracks in 2022. Ready to work.",
        documents: ["Service history", "CE certificate"],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "WL453",
        type: "auction",
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
        reservePrice: 52000,
        endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Loaders",
        subcategory: "Wheel loader",
        sellerType: "Company",
        companyName: "Nordic Plant",
        sellerEmail: "seller2@example.com",
        specs: { weight: "20,700 kg", engine: "Volvo D8J", power: "191 kW" },
        description: "Low hours L120. Stage V, aircon, hydraulic quick coupler.",
        documents: ["User manual"],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "CR300",
        type: "auction",
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
        reserve: false,
        reservePrice: 78000,
        endsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Dozers",
        subcategory: "Crawler dozer",
        sellerType: "Company",
        companyName: "Estonian Earthworks",
        sellerEmail: "seller3@example.com",
        specs: { weight: "23,000 kg", engine: "Cat C9.3", power: "153 kW" },
        description: "Strong D6 with ripper and blade; recent hydraulics check.",
        documents: ["CE certificate", "Inspection report"],
        createdAt: new Date(Date.now() -  4 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: "TR555",
        type: "auction",
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
        reservePrice: 4000000,
        endsAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Miscellaneous",
        subcategory: "Other",
        sellerType: "Company",  
        companyName: "FBR",
        sellerEmail: "seller4@example.com",
        specs: { weight: "23,000 kg", engine: "Volvo 555", power: "250 kW" },
        description: "Brand new, factory warranty, new in Europe",
        documents: ["CE certificate", "Inspection report", "Customs clearance", "5 year factory warranty"],
        createdAt: new Date().toISOString(),
    },
    {
        id: "FS1001",
        type: "sale",                    // ?? fixed-price listing
        title: "2020 JCB 3CX Backhoe Loader",
        location: "Alytus, Lithuania",
        coords: { lat: 54.3964, lng: 24.0349 },
        images: [
            "/images/jcb/img1.jpg",
            "/images/jcb/img2.jpg",
            "/images/jcb/img3.jpg",
        ],
        year: 2020,
        hours: 3200,
        condition: "Used",
        hasDefects: false,
        askingPrice: 48000,              // ?? price for sale
        endsAt: null,                    // no countdown
        category: "Loaders",
        subcategory: "Backhoe loader",
        sellerType: "Company",
        companyName: "UAB Forestas",
        sellerEmail: "seller5@example.com",
        specs: { engine: "JCB 444", power: "68 kW", weight: "8,000 kg" },
        description: "Clean 3CX, quick coupler, 4-in-1 bucket.",
        documents: ["CE certificate"],
        createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString(),
    },


];
function isoToDateInput(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}
function dateInputToIso(v) {
    // v like "2025-10-18"; keep as-is or convert to ISO if you prefer:
    return v || "";
}
function Breadcrumbs({ lot, dark }) {
    if (!lot) return null;
    const hasSub = !!lot.subcategory && lot.subcategory !== "";

    return (
        <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm">
                {/* Home */}
                <li>
                    <Link to="/" className="underline">Home</Link>
                </li>

                {/* › */}
                <li className={dark ? "text-neutral-500" : "text-gray-500"}>{"\u203A"}</li>

                {/* Category */}
                <li>
                    <Link
                        to="/"
                        state={{ category: lot.category }}
                        className="underline"
                    >
                        {lot.category}
                    </Link>
                </li>

                {/* Optional subcategory */}
                {hasSub && (
                    <>
                        <li className={dark ? "text-neutral-500" : "text-gray-500"}>{"\u203A"}</li>
                        <li>
                            <Link
                                to="/"
                                state={{ category: lot.category, subcategory: lot.subcategory }}
                                className="underline"
                            >
                                {lot.subcategory}
                            </Link>
                        </li>
                    </>
                )}

                {/* Final separator + Title */}
                <li className={dark ? "text-neutral-500" : "text-gray-500"}>{"\u203A"}</li>
                <li className="font-medium truncate max-w-[60vw] sm:max-w-none">
                    {lot.title}
                </li>
            </ol>
        </nav>
    );
}
// --- EU money helpers ---
function formatEUIntegerString(digits) {
  // "42000" -> "42.000"
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
function parseEUToNumber(text) {
  // "42.000" -> 42000 (number)
  const digits = String(text || "").replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number(digits);
}
function nearestStepAbove(n, step) {
  if (!step) return n;
  const m = n % step;
  return m === 0 ? n : n + (step - m);
}

/**
 * EuroInput — formats with EU dots while typing, returns Number via onValue.
 * Props:
 *  - value: number
 *  - onValue: (number) => void
 *  - min?: number
 *  - step?: number
 *  - placeholder?: string
 *  - disabled?: boolean
 *  - className?: string
 *  - dark?: boolean
 */
function EuroInput({
  value,
  onValue,
  min = 0,
  step = 0,
  placeholder = "",
  disabled = false,
  className = "",
  dark = false,
}) {
  const [text, setText] = React.useState(formatEUIntegerString(String(Math.max(0, Math.round(value || 0)))));

  // Keep text in sync if parent value changes from the outside
  React.useEffect(() => {
    const clean = formatEUIntegerString(String(Math.max(0, Math.round(value || 0))));
    if (clean !== text) setText(clean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function onChange(e) {
    // Keep only digits; add grouping dots
    const digits = e.target.value.replace(/[^\d]/g, "");
    const pretty = formatEUIntegerString(digits);
    setText(pretty);
    onValue?.(parseEUToNumber(pretty));
  }

  function onBlur() {
    let n = parseEUToNumber(text);
    if (n < min) n = min;
    if (step > 0) n = nearestStepAbove(n, step);
    onValue?.(n);
    setText(formatEUIntegerString(String(n)));
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9.]*"
      value={text}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={`${className} ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
      aria-label="Amount in euros"
    />
  );
}
// --- end EU money input ---
// Map common EU/EEA country names ? ISO-2 codes (lowercased keys)
const NAME_TO_CODE = {
    "austria": "AT", "belgium": "BE", "bulgaria": "BG", "croatia": "HR", "cyprus": "CY", "czech republic": "CZ", "czechia": "CZ",
    "denmark": "DK", "estonia": "EE", "finland": "FI", "france": "FR", "germany": "DE", "greece": "GR", "hungary": "HU", "ireland": "IE",
    "italy": "IT", "latvia": "LV", "lithuania": "LT", "luxembourg": "LU", "malta": "MT", "netherlands": "NL", "poland": "PL",
    "portugal": "PT", "romania": "RO", "slovakia": "SK", "slovenia": "SI", "spain": "ES", "sweden": "SE",
    "iceland": "IS", "liechtenstein": "LI", "norway": "NO"
};

// Turn "DE" ? ????
function Flag({ cc, className = "" }) {
    if (!cc || cc.length !== 2) return null;
    const lower = cc.toLowerCase();
    return (
        <img
            src={`https://flagcdn.com/24x18/${lower}.png`}
            srcSet={`https://flagcdn.com/48x36/${lower}.png 2x, https://flagcdn.com/72x54/${lower}.png 3x`}
            width="24"
            height="18"
            alt={cc}
            className={`inline-block align-[2px] rounded-[2px] ${className}`}
            loading="lazy"
            referrerPolicy="no-referrer"
        />
    );
}

// Best-effort country code for a lot: prefer saved code; else parse from location
function getCountryCodeFromLot(lot) {
    if (lot?.countryCode && typeof lot.countryCode === "string") return lot.countryCode.toUpperCase();
    const loc = (lot?.location || "").trim();
    if (!loc) return null;
    // take the last comma-part as country name
    const parts = loc.split(",");
    const countryName = parts[parts.length - 1].trim().toLowerCase();
    return NAME_TO_CODE[countryName] || null;
}
function reserveInfo(lot) {
    const has = typeof lot?.reservePrice === "number" && Number.isFinite(lot.reservePrice);
    const met = has ? Number(lot.currentBid ?? 0) >= lot.reservePrice : false;
    return { has, met };
}
function formatDateTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    // European: DD/MM/YYYY, 24h HH:MM
    return d.toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}
function SellerDashboard({ lots, user, dark }) {
    const location = useLocation?.() ?? { pathname: "/my-listings" }; // safe fallback
    if (!user) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className={`rounded-2xl border p-6 ${dark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white"}`}>
                    <h1 className="text-xl font-semibold">My listings</h1>
                    <p className={`mt-2 text-sm ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                        You must be signed in to view your listings.
                    </p>
                    <Link
                        to="/signin"
                        state={{ from: location }}
                        className="inline-block mt-4 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm"
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        );
    }

    const mine = (lots || []).filter(l => (l.sellerEmail && l.sellerEmail === user.email) || (l.seller && l.seller === user.email));

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-4">My listings</h1>

            {mine.length === 0 ? (
                <div className={`rounded-2xl border p-6 ${dark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white"}`}>
                    <p className={dark ? "text-neutral-300" : "text-gray-700"}>
                        You haven't created any listings yet.
                    </p>
                    <Link to="/sell" className="inline-block mt-4 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">
                        Create a listing
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border">
                    <table className={`min-w-full text-sm ${dark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white"}`}>
                        <thead className={dark ? "bg-neutral-800" : "bg-gray-50"}>
                            <tr>
                                <th className="text-left px-4 py-3">Title</th>
                                <th className="text-left px-4 py-3">Type</th>
                                <th className="text-left px-4 py-3">Price</th>
                                <th className="text-left px-4 py-3">Added</th>
                                <th className="text-right px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={dark ? "divide-y divide-neutral-800" : "divide-y divide-gray-200"}>
                            {mine.map(l => (
                                <tr key={l.id}>
                                    <td className="px-4 py-3">
                                        <Link to={`/lot/${l.id}`} className="underline">{l.title}</Link>
                                        <div className={dark ? "text-neutral-400" : "text-gray-500"}>
                                            {(l.category || "—")}{l.subcategory ? ` / ${l.subcategory}` : ""}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 capitalize">{(l.type || "auction")}</td>
                                    <td className="px-4 py-3">
                                        {(l.type || "auction") === "auction"
                                            ? formatCurrency(l.currentBid)
                                            : (l.askingPrice != null ? formatCurrency(l.askingPrice) : "—")}
                                    </td>
                                    <td className="px-4 py-3">{l.createdAt ? formatDateTime(l.createdAt) : "—"}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            to={`/edit/${l.id}`}
                                            className="inline-flex items-center px-3 py-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/10"
                                        >
                                            Edit
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


// ————————————————————————————————————————————
// Edit Listing: simple inline editor for title/desc/location/prices
// ————————————————————————————————————————————
function EditListing({ lots, setLots, user, dark }) {
    const { id } = useParams();
    const nav = useNavigate();
    const location = useLocation?.() ?? { pathname: `/edit/${id}` };

    const lot = (lots || []).find(l => l.id === id);
    // Local form state
    const [title, setTitle] = useState(lot.title || "");
    const [description, setDescription] = useState(lot.description || "");
    const [locationText, setLocationText] = useState(lot.location || "");
    const [type, setType] = useState(lot.type || "auction");
    const [category, setCategory] = useState(lot.category || "");
    // Prices based on type
    const [currentBid, setCurrentBid] = useState(lot.currentBid ?? 0);
    const [reservePrice, setReservePrice] = useState(lot.reservePrice ?? "");
    const [askingPrice, setAskingPrice] = useState(lot.askingPrice ?? "");

    const [error, setError] = useState("");
    const [hasDefects, setHasDefects] = useState(Boolean(lot?.hasDefects));
    const [engine, setEngine] = useState(lot?.specs?.engine || "");
    const [weight, setWeight] = useState(lot?.specs?.weight || "");
    const [power, setPower] = useState(lot?.specs?.power || "");
    const [hours, setHours] = useState(typeof lot?.hours === "number" ? String(lot.hours) : (lot?.hours || ""));
    const [_files, setFiles] = useState([]); // File objects
    const [previews, setPreviews] = useState(Array.isArray(lot?.images) ? lot.images.slice() : []);
    // Truck-specific
    const [make, setMake] = useState(lot.specs?.make ?? "");
    const [model, setModel] = useState(lot.specs?.model ?? "");
    const [vin, setVin] = useState(lot.specs?.vin ?? "");
    const [mileageKm, setMileageKm] = useState(
        lot.specs?.mileageKm != null ? String(lot.specs.mileageKm) : ""
    );
    const [emptyWeight, setEmptyWeight] = useState(
        lot.specs?.emptyWeight != null ? String(lot.specs.emptyWeight) : ""
    );
    const [maxLoadWeight, setMaxLoadWeight] = useState(
        lot.specs?.maxLoadWeight != null ? String(lot.specs.maxLoadWeight) : ""
    );
    const [axleConfig, setAxleConfig] = useState(lot.specs?.axleConfig ?? "");
    const [emission, setEmission] = useState(lot.specs?.emission ?? "");
    const [transmission, setTransmission] = useState(lot.specs?.transmission ?? "");
    const [inspectionValidUntil, setInspectionValidUntil] = useState(
        isoToDateInput(lot.specs?.inspectionValidUntil)
    );
    function handleFileChange(e) {
        const list = Array.from(e.target.files || []);
        const images = list.filter((f) => f.type.startsWith("image/"));

        // Build URLs for new files only
        const newUrls = images.map((f) => URL.createObjectURL(f));

        // Append (don’t replace)
        setFiles((prev) => [...prev, ...images]);
        setPreviews((prev) => [...prev, ...newUrls]);

        // Allow re-selecting the same file names
        e.target.value = "";
    }

    function removePhoto(idx) {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
        setPreviews((prev) => {
            const url = prev[idx];
            if (url) URL.revokeObjectURL(url);
            return prev.filter((_, i) => i !== idx);
        });
    }

    // Minimal validators (reuse yours if you have them)
    const MIN = 250, STEP = 50;
    const isStepAmount = (n) => Number.isInteger(n) && n % STEP === 0;


    // Gate: not found
    if (!lot) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className={`rounded-2xl border p-6 ${dark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white"}`}>
                    <p>Listing not found.</p>
                    <button onClick={() => nav(-1)} className="mt-4 px-3 py-2 rounded-xl border">
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    // Gate: must be owner
    const isOwner = user && ((lot.sellerEmail && lot.sellerEmail === user.email) || (lot.seller && lot.seller === user.email));
    if (!user || !isOwner) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className={`rounded-2xl border p-6 ${dark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white"}`}>
                    <h1 className="text-xl font-semibold">Edit listing</h1>
                    <p className={`mt-2 text-sm ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                        You don't have permission to edit this listing.
                    </p>
                    {!user && (
                        <Link to="/signin" state={{ from: location }} className="inline-block mt-4 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">
                            Sign in
                        </Link>
                    )}
                </div>
            </div>
        );
    }
    function validate() {
        if (!title.trim()) return "Enter a title.";
        if (!locationText.trim()) return "Enter a valid location.";

        if (type === "auction") {
            const n = Number(currentBid);
            if (!Number.isFinite(n) || n < MIN) return `Minimum is \u20AC${MIN}.`;
            if (!isStepAmount(n)) return `Amounts must be in \u20AC${STEP} steps (e.g. 250, 300, 350).`;
            if (reservePrice !== "" && Number(reservePrice) <= n) return "Reserve must be greater than current bid.";
        } else {
            if (askingPrice === "" || Number(askingPrice) < MIN) return `Minimum is \u20AC${MIN}.`;
            const a = Number(askingPrice);
            if (!isStepAmount(a)) return `Amounts must be in \u20AC${STEP} steps (e.g. 250, 300, 350).`;
        }
        return "";
    }

    function onSave(e) {
        e.preventDefault();

        const err = validate();
        if (err) { setError(err); return; }

        // Helper to parse integers from inputs like "12 345" etc.
        const toNum = (val) => {
            if (val === undefined || val === null) return undefined;
            const s = String(val).trim();
            if (s === "") return undefined;
            const n = Number(s.replace(/[^\d.-]/g, ""));
            return Number.isFinite(n) ? n : undefined;
        };

        setLots(prev =>
            prev.map((l) => {
                if (l.id !== lot.id) return l;

                // If no photos, keep lot unchanged and show error
                if (!previews || previews.length === 0) {
                    setError("Add at least one photo.");
                    return l;
                }

                // ---------- Build specs ----------
                let specs = {};
                if (category === "Trucks") {
                    if (make) specs.make = make.trim();
                    if (model) specs.model = model.trim();
                    if (vin) specs.vin = vin.trim();

                    const mile = toNum(mileageKm);
                    if (mile !== undefined) specs.mileageKm = mile;

                    const ew = toNum(emptyWeight);
                    if (ew !== undefined) specs.emptyWeight = ew;

                    const mw = toNum(maxLoadWeight);
                    if (mw !== undefined) specs.maxLoadWeight = mw;

                    if (axleConfig) specs.axleConfig = axleConfig;
                    if (emission) specs.emission = emission;
                    if (transmission) specs.transmission = transmission;
                    if (inspectionValidUntil) specs.inspectionValidUntil = inspectionValidUntil; // yyyy-mm-dd as entered

                } else {
                    if (engine?.trim() && engine.trim() !== "-") specs.engine = engine.trim();
                    if (power?.trim() && power.trim() !== "-") specs.power = power.trim();
                    if (weight?.trim() && weight.trim() !== "-") specs.weight = weight.trim();
                }

                // ---------- Top-level fields ----------
                const updatedBase = {
                    ...l,
                    title: title.trim(),
                    description: description.trim(),
                    location: locationText.trim(),
                    hasDefects,
                    specs,
                    images: previews.slice(),   // keep order
                    category,                   // if editable in your form
                };

                // Hours should be only for NON-trucks (trucks use mileageKm in specs)
                if (category === "Truck") {
                    updatedBase.hours = undefined;
                } else {
                    const hoursNum = toNum(hours);
                    updatedBase.hours = hoursNum;
                }

                // ---------- Type-specific ----------
                if (type === "auction") {
                    const bidNum = toNum(currentBid);
                    const resNum = reservePrice === "" ? undefined : toNum(reservePrice);

                    return {
                        ...updatedBase,
                        type: "auction",
                        currentBid: bidNum ?? l.currentBid ?? 0,
                        reservePrice: resNum,
                        askingPrice: undefined, // not for auction
                        // keep existing endsAt unless you edit it elsewhere
                        endsAt: l.endsAt,
                    };
                } else {
                    const askNum = toNum(askingPrice);

                    return {
                        ...updatedBase,
                        type: "sale",
                        askingPrice: askNum ?? l.askingPrice ?? 0,
                        currentBid: undefined,
                        reservePrice: undefined,
                        endsAt: undefined,
                    };
                }
            })
        );

        // If we set an error above, don't navigate; you can also early-return here if you prefer.
        // For simplicity, only navigate when no error is set:
        if (!("current" in onSave)) onSave.current = {};
        // give React one tick to apply setError (optional)
        setTimeout(() => {
            // if there is still an error displayed, do not navigate
            // (you can track error state or simply rely on your validate() above)
            nav("/my-listings");
        }, 0);
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <div className={`rounded-2xl border p-6 ${dark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white"}`}>
                <h1 className="text-2xl font-semibold">Edit listing</h1>
                <p className={`text-sm mt-1 ${dark ? "text-neutral-400" : "text-gray-600"}`}>Update basic details and pricing.</p>

                <form className="mt-6 space-y-6" onSubmit={onSave}>
                    <div>
                        <label className="text-xs font-medium">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium">Location</label>
                        <input
                            value={locationText}
                            onChange={(e) => setLocationText(e.target.value)}
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium">Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        >
                            <option value="auction">Auction</option>
                            <option value="sale">For sale</option>
                        </select>
                    </div>

                    {type === "auction" ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs">Current bid (EUR)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={currentBid}
                                    onChange={(e) => setCurrentBid(e.target.value)}
                                    onWheel={(e) => e.preventDefault()} // prevent changing number on scroll
                                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                                />
                            </div>
                            <div>
                                <label className="text-xs">Reserve price (EUR, optional)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={reservePrice}
                                    onChange={(e) => setReservePrice(e.target.value)}
                                    onWheel={(e) => e.preventDefault()}
                                    placeholder="(optional)"
                                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="text-xs">Asking price (EUR)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={askingPrice}
                                    onChange={(e) => setAskingPrice(e.target.value)}
                                    onWheel={(e) => e.preventDefault()}
                                className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                            />
                        </div>
                    )}
                    {/* Defects */}
                    <div>
                        <label className="text-xs font-medium">Defects</label>
                        <select
                            value={hasDefects ? "With defects" : "Without defects"}
                            onChange={(e) => setHasDefects(e.target.value === "With defects")}
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        >
                            <option>Without defects</option>
                            <option>With defects</option>
                        </select>
                    </div>
                    {/* Specifications */}
                    <div>
                        <label className="text-xs font-medium block mb-2">Specifications</label>

                        {category === "Trucks" ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                <input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Make (e.g., Volvo)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                                <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model (e.g., FH16)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />

                                <input value={vin} onChange={(e) => setVin(e.target.value)} placeholder="VIN"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm sm:col-span-2 ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />

                                <input type="number" inputMode="numeric" value={mileageKm}
                                    onChange={(e) => setMileageKm(e.target.value)} placeholder="Mileage (km)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />

                                <input value={emptyWeight} onChange={(e) => setEmptyWeight(e.target.value)} placeholder="Empty weight (kg)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                                <input value={maxLoadWeight} onChange={(e) => setMaxLoadWeight(e.target.value)} placeholder="Max load weight (kg)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />

                                <select value={axleConfig} onChange={(e) => setAxleConfig(e.target.value)}
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}>
                                    <option value="">Axle configuration</option>
                                    <option>4x2</option><option>6x2</option><option>6x4</option>
                                    <option>8x4</option><option>10x4</option><option>Other</option>
                                </select>

                                <select value={emission} onChange={(e) => setEmission(e.target.value)}
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}>
                                    <option value="">Emission standard</option>
                                    <option>Euro 3</option><option>Euro 4</option><option>Euro 5</option>
                                    <option>Euro 6</option><option>Euro VI</option>
                                </select>

                                <select value={transmission} onChange={(e) => setTransmission(e.target.value)}
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}>
                                    <option value="">Transmission type</option>
                                    <option>Manual</option><option>Automatic</option><option>AMT</option>
                                </select>

                                <input type="date" value={inspectionValidUntil}
                                    onChange={(e) => setInspectionValidUntil(e.target.value)}
                                    placeholder="Technical inspection valid until"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm sm:col-span-2 ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                <input value={engine} onChange={(e) => setEngine(e.target.value)} placeholder="Engine (or -)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                                <input value={power} onChange={(e) => setPower(e.target.value)} placeholder="Power (or -)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                                <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight (or -)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                                <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hours (or -)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                            </div>
                        )}
                    </div>
                    {/* Photos */}
                    <div>
                        <label className="text-xs font-medium">Photos</label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className={`mt-1 block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:bg-gray-50 ${dark ? "file:border-neutral-700 file:bg-neutral-800 file:text-white" : "file:border-gray-200"
                                }`}
                        />

                        {previews.length > 0 && (
                            <>
                                <div className={`mt-1 text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                                    {previews.length} photo{previews.length > 1 ? "s" : ""} selected
                                </div>
                                <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {previews.map((url, i) => (
                                        <div key={`${url}-${i}`} className="relative group">
                                            <img src={url} alt={`photo-${i}`} className="w-full h-24 object-cover rounded-lg border" />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                className="absolute top-1 right-1 text-xs px-2 py-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                                                aria-label="Remove photo"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-medium">Description</label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        />
                    </div>

                    {error && (
                        <div className={dark ? "text-red-300 text-sm" : "text-red-600 text-sm"}>{error}</div>
                    )}

                    <div className="pt-2 flex gap-2">
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-xl text-sm bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Save changes
                        </button>
                        <button
                            type="button"
                            onClick={() => nav(-1)}
                            className={`px-4 py-2 rounded-xl border text-sm ${dark ? "border-neutral-700" : ""}`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
// helpers (near formatCurrency / prettyLeft)
function getSellerLabel(lot) {
    if (!lot) return "";
    if (lot.sellerType === "Private person") return "Private person";
    if (lot.sellerType === "Company") {
        const name = lot.companyName?.trim();
        return name && name.length ? name : "Company";
    }
    // Back-compat for older lots:
    return lot.seller || "Seller";
}
function formatCurrency(value) {
    if (value == null || isNaN(value)) return "\u20AC0";
    return `\u20AC${Math.round(value).toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

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
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const fromForHeader = location.pathname.startsWith("/lot/")
        ? location                  // return to that lot
        : location.pathname === "/sell"
            ? "/sell"                   // return to sell
            : "/";                      // otherwise home
    const isHome = location.pathname === "/";
    // Close the menu whenever route changes (optional safeguard)
    React.useEffect(() => {
        const close = () => setMobileOpen(false);
        window.addEventListener("popstate", close);
        return () => window.removeEventListener("popstate", close);
    }, []);

    const menuItemClass = `w-full text-left px-4 py-3 text-sm rounded-xl ${dark ? "hover:bg-neutral-800" : "hover:bg-gray-100"
        }`;
    return (
        <header
            className={`sticky top-0 z-[9999] border-b ${dark ? "bg-neutral-900/80 text-white" : "bg-white/80"
                } backdrop-blur supports-[backdrop-filter]:bg-white/60`}
        >
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
                <Link
                    to="/"
                    className={`w-10 h-10 rounded-2xl grid place-items-center font-extrabold ${dark ? "bg-blue-500 text-white" : "bg-blue-600 text-white"
                        }`}
                    onClick={() => setMobileOpen(false)}
                >
                    HB
                </Link>

                <div className="mr-auto">
                    <div className="text-xl font-extrabold leading-5">HeavyBid</div>
                    <div className={`text-xs ${dark ? "text-white" : "text-gray-500"}`}>
                        Heavy machinery auctions {"\u00B7"} EU
                    </div>
                </div>

                {/* Search */}
                {isHome && (
                    <div className="hidden md:flex items-center gap-2 flex-1 max-w-xl mx-6">
                        <div className="relative w-full">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={"Search model, location, seller..."}
                                className={`w-full border ${dark ? "border-neutral-700 bg-neutral-800 text-white placeholder-neutral-400" : "border-gray-200"
                                    } focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none rounded-xl pl-9 pr-3 py-2 text-sm`}
                            />
                            <Search
                                size={16}
                                className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-neutral-400" : "text-gray-400"}`}
                            />
                        </div>
                    </div>
                )}
                {/* Theme toggle */}
                <button
                    onClick={() => setDark(!dark)}
                    className={`p-2 rounded-xl border ${dark ? "border-neutral-700" : "border-gray-200"}`}
                    aria-label="Toggle theme"
                >
                    {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* Sell equipment routes to /sell if signed in, /signin if not */}
                <div className="hidden md:flex items-center gap-2">
                {user ? (
                    <Link
                        to="/sell"
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm"
                    >
                        Sell equipment
                    </Link>
                ) : (
                    <Link
                            to="/signin"
                            state={{ from: "/sell" }}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm"
                    >
                        Sell equipment
                    </Link>
                )}

                {/* Auth area */}
                {user ? (
                    <>
                        <span
                            className={`text-xs px-2 py-1 rounded-lg border ${dark ? "border-neutral-700" : "border-gray-200"
                                }`}
                        >
                            Signed in as {user.email}
                        </span>
                        <button
                            onClick={() => {
                                setUser(null);
                                navigate("/"); // redirect to home
                            }}
                            className={`px-3 py-2 rounded-xl border text-sm ${dark ? "border-neutral-700" : ""
                                }`}
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <>
                        <Link
                                to="/signin"
                                state={{ from: fromForHeader }}
                            className={`px-3 py-2 rounded-xl border text-sm ${dark ? "border-neutral-700" : ""
                                }`}
                        >
                            Sign in
                        </Link>
                        <Link
                                to="/signup"
                                state={{ from: fromForHeader }}
                            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm"
                        >
                            Sign up
                        </Link>
                    </>
                )}
                {user && (
                    <Link
                        to="/my-listings"
                        className="px-3 py-2 rounded-xl border text-sm hover:bg-black/5 dark:hover:bg-white/10"
                    >
                        My listings
                    </Link>
                    )}
                </div>
                {/* Mobile hamburger (md hidden) */}
                <button
                    className="md:hidden p-2 rounded-xl border"
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label="Open menu"
                >
                    {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

            {/* Mobile sheet */}
            {mobileOpen && (
                <>
                    {/* Clickable overlay to close */}
                    <div
                        className="fixed inset-0 z-[55]"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div
                        className={`md:hidden fixed right-3 top-[64px] z-[60] w-[88%] max-w-xs rounded-2xl border shadow-lg ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"
                            }`}
                    >
                        <div className="py-2">
                            {user ? (
                                <>
                                    <Link
                                        to="/sell"
                                        className={menuItemClass}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Sell equipment
                                    </Link>
                                    <Link
                                        to="/my-listings"
                                        className={menuItemClass}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        My listings
                                    </Link>
                                    <button
                                        className={menuItemClass}
                                        onClick={() => {
                                            setUser(null);
                                            setMobileOpen(false);
                                            navigate("/");
                                        }}
                                    >
                                        Sign out
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/signin"
                                        className={menuItemClass}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        to="/signup"
                                        className={menuItemClass}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Sign up
                                    </Link>
                                    <Link
                                        to="/signin"
                                        className={menuItemClass}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Sell equipment
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

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
    subcategories, subcategory, setSubcategory, subcategoryCounts,
    // condition / defects (interdependent)
    conditions, condition, setCondition, conditionCounts,
    defectsList, defects, setDefects, defectsCounts,
    // price
    priceSteps, priceMin, priceMax, setPriceMin, setPriceMax, listingType, setListingType
}) {
    const Count = ({ map }) => Array.from(map.values()).reduce((a, b) => a + b, 0);

    return (
        <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className={`${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"} rounded-2xl shadow-sm border p-4 sticky top-20`}>

            {/* Country */}
            <div>
                <CountrySelect
                    dark={dark}
                    countries={countries}
                    country={country}
                    setCountry={setCountry}
                    countryCounts={countryCounts}
                />
            </div>

            {/* Category */}
            <div className="mt-4">
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                >
                    {categories.map((c) => (
                        <option key={c} value={c}>
                            {c} {c !== "All" && categoryCounts?.get(c) ? `(${categoryCounts.get(c)})` : ""}
                        </option>
                    ))}
                </select>
            </div>
            {/* Subcategory (enabled when a specific Category is selected) */}
            <div className="mt-3">
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Subcategory</label>
                <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    disabled={category === "All"}
                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""
                        } ${category === "All" ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                    {subcategories.map((s) => (
                        <option key={s} value={s}>
                            {s} {s !== "All" && subcategoryCounts?.get(s) ? `(${subcategoryCounts.get(s)})` : ""}
                        </option>
                    ))}
                </select>
            </div>
            {/* Listing Type (new) */}
            <div className="mt-4">
                <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Listing Type</label>
                <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                >
                    <option value="All">All</option>
                    <option value="auction">Auctions</option>
                    <option value="sale">For sale</option>
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
                    <option value="newest">Newest</option>
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
                            <option key={`min-${v}`} value={v}>{formatCurrency(v)}</option>
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
                            <option key={`max-${v}`} value={v}>{formatCurrency(v)}</option>
                        ))}
                    </select>
                </div>
            </div>
            {/* Reset Filters button */}
            <div className="mt-4">
                <button
                    type="button"
                    onClick={() => {
                        setListingType("All");
                        setCountry("All");
                        setCategory("All");
                        setSubcategory("All");
                        setCondition("All");
                        setDefects("All");
                        setSortBy("endingSoon");
                        setPriceMin(priceSteps[0]);
                        setPriceMax(priceSteps[priceSteps.length - 1]);
                        setQuery(""); // optional: reset search text if you have one
                    }}
                    className={`w-full py-2 rounded-xl font-medium ${dark
                            ? "bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-white"
                            : "bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-800"
                        }`}
                >
                    Reset filters
                </button>
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

function Card({ lot, dark, user }) {
    const userEmail = user?.email?.trim().toLowerCase() || "";
    const lotSellerEmail = lot?.sellerEmail?.trim().toLowerCase() || "";

    const isOwner = !!userEmail && !!lotSellerEmail && userEmail === lotSellerEmail;
    const kind = lot.type || "auction"; // default to auction if missing
    const { has, met } = reserveInfo(lot);
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
                        {kind === "auction" ? (
                            <>
                                <Clock size={14} /> {prettyLeft(lot.endsAt)}
                            </>
                        ) : (
                            <>For sale</>
                        )}
                    </div>
                    {isOwner && (
                        <div className={`absolute bottom-3 right-3 px-2 py-1 rounded-md text-xs font-semibold z-10 ${dark ? "bg-amber-900/90 text-amber-200" : "bg-amber-100 text-amber-800"
                            }`}>
                            Your listing
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-lg leading-snug line-clamp-2">{lot.title}</h3>
                    <p
                        className={`text-sm mt-1 flex items-center gap-1 ${dark ? "text-neutral-400" : "text-gray-500"
                            }`}
                    >
                        <MapPin size={14} />
                        <span className="inline-flex items-center gap-1">
                            <Flag 
                                cc={getCountryCodeFromLot(lot)}/>
                            {lot.location}
                        </span>
                        {" \u00B7 "}
                        {getSellerLabel(lot)}
                    </p>
                    {lot.createdAt && (
                        <p className={`text-xs mt-1 ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                            Added {formatDateTime(lot.createdAt)}
                        </p>
                    )}
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
                        {kind === "auction" ? (
                            <>
                        <div
                            className={`rounded-xl border p-3 ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"
                                }`}
                        >
                            <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                                Current bid
                            </div>
                            <div className="text-xl font-bold">{formatCurrency(lot.currentBid)}</div>
                                </div>
                                {has && met ? (
                        <div
                            className={`rounded-xl border p-3 text-right ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"
                                }`}
                        >
                            <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                                Reserve
                            </div>
                            <div className="text-xl font-semibold">{formatCurrency(lot.reservePrice)}</div>
                                    </div>
                                ) : (
                                    <div />
                                )}
                            </>
                        ) : (
                            <div className={`col-span-2 rounded-xl border p-3 ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"}`}>
                                <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>Asking price</div>
                                <div className="text-xl font-bold">{formatCurrency(lot.askingPrice)}</div>
                            </div>
                        )}
                    </div>
                </div>
            </Motion.article>
        </Link>
    );
}

// Derive country from "City, Country"
function getCountry(location = "") {
    const parts = String(location).split(",").map(s => s.trim()).filter(Boolean);
    return parts.length ? parts[parts.length - 1] : "Unknown";
}

// Return a numeric price for filtering/sorting depending on listing type
function listingPrice(l) {
    // auction -> currentBid; sale -> askingPrice; fallback 0
    if ((l.type || "auction") === "auction") return Number(l.currentBid ?? 0);
    return Number(l.askingPrice ?? 0);
}
function buildPriceSteps(max) {
    const s = new Set([0]); // use a Set to avoid duplicates

    const add = (start, end, step) => {
        const hi = Math.min(end, max);
        for (let v = start; v <= hi; v += step) s.add(v);
    };

    // Gradual bands; overlaps are fine because Set dedupes
    add(150, 2000, 150);
    add(2000, 10000, 500);
    add(10000, 20000, 2500);
    add(20000, 50000, 5000);
    add(50000, 100000, 10000);
    add(100000, 1000000, 50000);
    add(1000000, max, 100000);

    // Ensure exact max is present
    s.add(max);

    // Return unique, sorted ascending
    return Array.from(s).sort((a, b) => a - b);
}
// Safe time compare: put null/invalid to the end
function endsAtTime(l) {
    const t = l?.endsAt ? new Date(l.endsAt).getTime() : NaN;
    return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
}

// ---- Pages ----
function Home({
    lots, query, setQuery, category, setCategory, sortBy, setSortBy, dark,
    country, setCountry,
    condition, setCondition,
    defects, setDefects,
    priceSteps, priceMin, priceMax, setPriceMin, setPriceMax, user
}) {
    const [listingType, setListingType] = React.useState("All"); // All | auction | sale
    const [_tick, setTick] = useState(0);
    useEffect(() => { const t = setInterval(() => setTick(x => x + 1), 1000); return () => clearInterval(t); }, []);
    const [subcategory, setSubcategory] = useState("All");
    const location = useLocation();
    useEffect(() => {
        const cat = location.state?.category;
        const sub = location.state?.subcategory;
        if (cat) 
            setCategory(cat);
        if (sub && typeof setSubcategory === "function") 
            setSubcategory(sub);
            if (cat || sub)
                window.history.replaceState({}, document.title, window.location.pathname); // clear state so it’s not reused
    }, [location.state, setCategory, setSubcategory]);
    // Base list: only text + price filters
    const baseFiltered = useMemo(() => {
        let out = lots.filter((l) =>
            `${l.title} ${l.location} ${l.seller}`.toLowerCase().includes(query.toLowerCase())
        );
        if (listingType !== "All") {
            out = out.filter((l) => (l.type || "auction") === listingType);
        }
        out = out.filter((l) => {
            const p = listingPrice(l);
            return p >= priceMin && p <= priceMax;
        });

        return out;
    }, [lots, query, priceMin, priceMax, listingType]);
    // Subcategory list & counts (scoped to the currently selected Category)
    const subcategoryCounts = useMemo(() => {
        const m = new Map();
        for (const l of baseFiltered) {
            if (category !== "All" && l.category !== category) continue;
            const key = l.subcategory || "Unspecified";
            m.set(key, (m.get(key) || 0) + 1);
        }
        return m;
    }, [baseFiltered, category]);

    const subcategories = useMemo(() => {
        const keys = Array.from(subcategoryCounts.keys()).sort();
        return ["All", ...keys];
    }, [subcategoryCounts]);
    


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
    useEffect(() => {
        if (subcategory !== "All" && !subcategoryCounts.has(subcategory)) {
            setSubcategory("All");
        }
    }, [subcategoryCounts, subcategory]);

    useEffect(() => {
        // whenever the main category changes, reset subcategory to All
        setSubcategory("All");
    }, [category]);

    // Final list applies ALL four filters + sort
    const filtered = useMemo(() => {
        let out = baseFiltered;
        if (country !== "All") out = out.filter(l => getCountry(l.location) === country);
        if (category !== "All") out = out.filter(l => l.category === category);
        if (subcategory !== "All") out = out.filter(l => (l.subcategory || "Unspecified") === subcategory);
        if (condition !== "All") out = out.filter(l => l.condition === condition);
        if (defects !== "All") out = out.filter(l => (l.hasDefects ? "With defects" : "Without defects") === defects);

        if (sortBy === "endingSoon") {
            out = out.slice().sort((a, b) => endsAtTime(a) - endsAtTime(b));
        }
        if (sortBy === "priceHigh") {
            out = out.slice().sort((a, b) => listingPrice(b) - listingPrice(a));
        }
        if (sortBy === "priceLow") {
            out = out.slice().sort((a, b) => listingPrice(a) - listingPrice(b));
        }
        if (sortBy === "newest") out = out.slice().sort((a, b) => {
            const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return tb - ta; // newest first
        });
        return out;
    }, [baseFiltered, country, category, subcategory, condition, defects, sortBy]);
    // --- Pagination ---
    const [pageSize, setPageSize] = React.useState(12); // 12 | 28 | 56
    const [page, setPage] = React.useState(1);

    // Reset to first page when filters change
    React.useEffect(() => {
        setPage(1);
    }, [query, category, sortBy, listingType, country, condition, defects, priceMin, priceMax, pageSize]);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Clamp page if data shrinks
    React.useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [page, totalPages]);

    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, total);
    const pageLots = filtered.slice(start, end);


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
                    subcategories={subcategories}
                    subcategory={subcategory}
                    setSubcategory={setSubcategory}
                    subcategoryCounts={subcategoryCounts}
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
                    listingType={listingType}
                    setListingType={setListingType}
                />
            </aside>

            <section className="md:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold">Live listings</h2>
                    <span className={`text-sm ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                        {total === 0 ? "0 results" : `Showing ${start + 1}-${end} of ${total} results`}
                    </span>
                </div>

                <p className={`text-xs -mt-2 mb-4 ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                    Showing bids between {formatCurrency(priceMin)} and {formatCurrency(priceMax)}.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <AnimatePresence>
                        {pageLots.map((l) => (
                            <Motion.div
                                key={l.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                <Card lot={l} dark={dark} user={user} />
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
                {/* Pager controls */}
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 sm:justify-between">
                    {/* Results per page */}
                    <div className="flex items-center gap-2">
                        <label className={`text-sm ${dark ? "text-neutral-400" : "text-gray-600"}`}>Results per page</label>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            className={`border rounded-lg px-2 py-1 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        >
                            <option value={12}>12</option>
                            <option value={28}>28</option>
                            <option value={56}>56</option>
                        </select>
                    </div>

                    {/* Page buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(1)}
                            disabled={page <= 1}
                            className={`px-3 py-1 rounded-lg border text-sm ${page <= 1 ? "opacity-50 cursor-not-allowed" : ""} ${dark ? "border-neutral-700" : ""}`}
                            aria-label="First page"
                        >
                            {"<< First"}
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className={`px-3 py-1 rounded-lg border text-sm ${page <= 1 ? "opacity-50 cursor-not-allowed" : ""} ${dark ? "border-neutral-700" : ""}`}
                            aria-label="Previous page"
                        >
                            {"< Prev"}
                        </button>

                        <span className={`text-sm ${dark ? "text-neutral-300" : "text-gray-700"}`}>
                            Page {page} of {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className={`px-3 py-1 rounded-lg border text-sm ${page >= totalPages ? "opacity-50 cursor-not-allowed" : ""} ${dark ? "border-neutral-700" : ""}`}
                            aria-label="Next page"
                        >
                            {"Next >>"}
                        </button>
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={page >= totalPages}
                            className={`px-3 py-1 rounded-lg border text-sm ${page >= totalPages ? "opacity-50 cursor-not-allowed" : ""} ${dark ? "border-neutral-700" : ""}`}
                            aria-label="Last page"
                        >
                            {"Last >>"}
                        </button>
                    </div>
                </div>
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
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";  // ?? stop page scroll
        return () => {
            document.body.style.overflow = prev;    // ?? restore on close
        };
    }, []);
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
        
        <div
                className="fixed inset-0 z-[10001] bg-black/90 backdrop-blur-sm flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            // ?? prevent page scroll on backdrop (but allow image zoom)
            onWheelCapture={(e) => {
                if (e.target === e.currentTarget) { e.preventDefault(); e.stopPropagation(); }
            }}
            onTouchMoveCapture={(e) => {
                if (e.target === e.currentTarget) { e.preventDefault(); e.stopPropagation(); }
            }}
            onClick={onClose}
        >
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
    if (!lot) return [];
    const rows = [];
    const s = lot.specs || {};
    const defectsLabel = lot.hasDefects ? "With defects" : "Without defects";

    const fmtInt = (n) =>
    Number.isFinite(n) ? n.toLocaleString("de-DE") : n;
    const fmtDate = (iso) => {
        if (!iso) return iso;
        const d = new Date(iso);
        return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("de-DE");
    };

    // ?? Truck-specific specs
    if (lot.category === "Trucks") {
        rows.push(["Category", lot.category]);
        rows.push(["Condition", lot.condition]);
        rows.push(["Seller", lot.seller]);
        rows.push(["Defects", defectsLabel]);

        if (s.make) rows.push(["Make", s.make]);
        if (s.model) rows.push(["Model", s.model]);
        if (s.vin) rows.push(["VIN", s.vin]);
        if (s.mileageKm) rows.push(["Mileage", `${fmtInt(s.mileageKm)} km`]);
        if (s.emptyWeight) rows.push(["Empty weight", `${fmtInt(s.emptyWeight)} kg`]);
        if (s.maxLoadWeight) rows.push(["Max load weight", `${fmtInt(s.maxLoadWeight)} kg`]);
        if (s.axleConfig) rows.push(["Axle configuration", s.axleConfig]);
        if (s.emission) rows.push(["Emission standard", s.emission]);
        if (s.transmission) rows.push(["Transmission", s.transmission]);
        if (s.inspectionValidUntil)
            rows.push(["Technical inspection valid until", fmtDate(s.inspectionValidUntil)]);
    }

    // ?? All other categories
    else {
        rows.push(["Category", lot.category]);
        rows.push(["Year", lot.year]);
        rows.push(["Hours", lot.hours != null ? lot.hours.toLocaleString("de-DE") : null]);
        rows.push(["Condition", lot.condition]);
        rows.push(["Seller", lot.seller]);
        rows.push(["Defects", defectsLabel]);

        if (lot.specs) {
            const order = ["engine", "power", "weight"];
            order.forEach((k) => s[k] && rows.push([prettyLabel(k), s[k]]));

            const skipped = new Set(order);
            Object.entries(s).forEach(([k, v]) => {
                if (!skipped.has(k) && v != null && v !== "") {
                    rows.push([prettyLabel(k), v]);
                }
            });
        }
    }

    // Remove empty rows
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
    const location = useLocation();
    const isAuction = (lot?.type || "auction") === "auction";
    // Reserve flags — compute once (ABOVE the return, not inside JSX)
    const hasReserve =
        typeof lot?.reservePrice === "number" && Number.isFinite(lot.reservePrice);
    const reserveMet =
        hasReserve && Number(lot.currentBid ?? 0) >= lot.reservePrice;
    // Top of LotDetail (after you got 'lot' and 'user')
    const isOwner = !!user && (
        (lot.sellerEmail && lot.sellerEmail === user.email) ||
        (!lot.sellerEmail && lot.seller && lot.seller === user.email) // fallback if older data
    );

    // Hooks must always be at the top (no conditionals)
    const [_tick, setTick] = useState(0); // just to re-render countdown each second
    useEffect(() => {
        const t = setInterval(() => setTick((x) => x + 1), 1000);
        return () => clearInterval(t);
    }, []);

    const [activeIdx, setActiveIdx] = useState(0);
    const [lightbox, setLightbox] = useState(false);

    // Bid state (initialize to next step above current bid, but at least MIN_BID)
    const initialBid = Math.max(nextValidStep(((lot?.currentBid ?? 0) + STEP)), MIN_BID);
    const [bidInput, setBidInput] = useState(String(initialBid)); // keep as string while typing
    const [error, setError] = useState("");

    // Validate bid whenever it changes (safe: early-return if no lot)
    useEffect(() => {
        if (!lot) return;

        if (bidInput === "") { setError("Enter a number."); return; }

        const bid = Number(bidInput);
        if (!Number.isFinite(bid)) { setError("Enter a number."); return; }
        if (bid < MIN_BID) {
            setError(`Minimum bid is \u20AC${MIN_BID}.`); return; }
        if (!isStepAmount(bid)) {
            setError(`Bids must be in \u20AC${STEP} steps(e.g. 250, 300, 350).`); return; }
        if (bid <= lot.currentBid) {
            setError(`Your bid must be higher than the current bid(\u20AC${lot.currentBid}).`); return; }

        setError("");
    }, [bidInput, lot]);

    // Handlers
    function placeBid() {
        if (!lot || error) return;
        if (isOwner) {
            alert("You cannot bid on your own listing.");
            return;
        }   
        const bid = nextValidStep(Number(bidInput));
        setLots(prev => prev.map(l => (l.id === lot.id ? { ...l, currentBid: bid } : l)));
        setBidInput(String(bid)); // reflect snapped value
        alert(`Bid placed: ${formatCurrency(bid)}`);
    }

    function nudge(delta) {
        const current = bidInput === "" ? initialBid : Number(bidInput) || 0;
        const next = Math.max(MIN_BID, current + delta * STEP);
        setBidInput(String(nextValidStep(next)));
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
            <button onClick={() => nav(-1)} className="inline-flex items-center gap-1 mb-2">
                <ChevronLeft size={16} /> Back
            </button>

            <Breadcrumbs lot={lot} dark={dark} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gallery */}
                <div className={`lg:col-span-2 rounded-2xl overflow-hidden border ${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"}`}>
                    <button
                        type="button"
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
                        <MapPin size={14} />
                        <span className="inline-flex items-center gap-1">
                            <Flag
                           cc={getCountryCodeFromLot(lot)} />
                            {lot.location}
                        </span>
                        {" \u00B7 "}
                        {getSellerLabel(lot)}
                    </p>
                    {lot.createdAt && (
                        <p className={`text-xs mt-1 ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                            Added {formatDateTime(lot.createdAt)}
                        </p>
                    )}
                    <div className="mt-2 flex gap-2">
                        <span className={`text-[11px] px-2 py-1 rounded-lg border ${lot.hasDefects
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
                        <FactPill label="Category" value={`${lot.category}${lot.subcategory && lot.subcategory !== "All" ? " - " + lot.subcategory : ""}`} dark={dark} />
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


                    {isAuction ? (
                        <>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className={`rounded-xl border p-3 ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"}`}>
                            <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>Current bid</div>
                            <div className="text-xl font-bold">{formatCurrency(lot.currentBid)}</div>
                                </div>

                        <div className={`rounded-xl border p-3 text-right ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"}`}>
                                    <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>Reserve</div>
                                    {!hasReserve ? (
                                        <div className="text-xl font-semibold">-</div>
                                    ) : reserveMet ? (
                                            <div className="text-lg font-semibold inline-flex items-center gap-1">
                                              <CheckCircle2 size={16} />
                                                  {formatCurrency(lot.reservePrice)} 
                            </div>
                                    ) : (
                                        <div className="text-lg font-semibold">Not met</div>
               
                                    )}
                                </div>
                            </div>
                            
                    <div className={`mt-3 inline-flex items-center gap-1 text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                        <Clock size={14} /> Ends in {prettyLeft(lot.endsAt)}
                        
                    </div>

                    {/* Bidding UI */}
                    <div className="mt-4">
                        <label className={`text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>Your bid (EUR)</label>
                        <div className="mt-1 flex items-stretch gap-2">
                            <button type="button" onClick={() => nudge(-1)} className="px-3 rounded-xl border" aria-label="Decrease by 50">-50</button>
                            <input
                                type="text"
                                inputMode="numeric"
                                min={MIN_BID}
                                step={STEP}
                                value={bidInput}
                                        onChange={(e) => {
                                            const raw = e.target.value;
                                            if (raw === "") {
                                                setBidInput(""); return;
                                            }
                                            const digitsOnly = raw.replace(/[^\d]/g, "");
                                            setBidInput(digitsOnly);
                                        }}
                                        onBlur={() => {
                                            if (bidInput === "") return;
                                            const snapped = String(nextValidStep(Number(bidInput)));
                                            setBidInput(snapped);                                           
                                        }}
                                className={`flex-1 border rounded-xl px-3 py-2 ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                                    />
                                   
                            <button type="button" onClick={() => nudge(1)} className="px-3 rounded-xl border" aria-label="Increase by 50">+50</button>
                        </div>
                                {/* ? Show preview below the bid input */}
                                {Number.isFinite(Number(bidInput)) && bidInput !== "" && !error && (
                                    <p className={`mt-1 text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                                        Preview:
                                        {formatCurrency(Number(bidInput))}
                                    </p>
                                )}
                                <p className={`mt-2 text-xs ${error ? "text-red-600" : dark ? "text-neutral-400" : "text-gray-500"}`}>
                                    Minimum bid is {"\u20AC"}{MIN_BID.toLocaleString("de-DE")}.{" "}
                                    Bids increase in {"\u20AC"}{STEP.toLocaleString("de-DE")} steps
                                    {'\u00A0'}(e.g. 250, 300, 350).{" "}
                                    {error?.includes("current bid") ? (
                                        <>
                                            Your bid must be higher than the current bid (
                                            {"\u20AC"}{lot.currentBid.toLocaleString("de-DE")}
                                            ).
                                        </>
                                    ) : (
                                        "Your bid must be higher than the current bid."
                                    )}
                                </p>
                                {/* Conditional error message */}
                                {error && error.includes("steps") && (
                                    <p className="text-xs text-red-600 mt-1">
                                        {error.replace(/\u20AC/g, "\u20AC").replace(
                                            /(\d+)/g,
                                            (num) => Number(num).toLocaleString("de-DE")
                                        )}
                                    </p>
                                )}
                        {/* Signed-out notice */}
                        {!user && (
                            <div
                                className={`mt-3 rounded-xl border p-3 text-sm ${dark
                                        ? "bg-neutral-900 border-neutral-800 text-neutral-200"
                                        : "bg-blue-50 border-blue-200 text-blue-900"
                                    }`}
                            >
                                You must be signed in to place bids or buy now.{" "}
                                <Link to="/signin" state={{ from: location }} className="underline">Sign in</Link>
                            </div>
                        )}

                        {/* Action buttons — only show when signed in */}
                                {user && !isOwner && (
                            <div className="mt-3 flex gap-2">
                                <button
                                    className={`flex-1 py-2 rounded-xl text-white ${error ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                    onClick={placeBid}
                                    disabled={Boolean(error)}
                                >
                                    Place bid
                                </button>
                                
                            </div>
                        )}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* For-sale UI */}
                            <div className={`mt-4 rounded-xl border p-3 ${dark ? "bg-neutral-800 border-neutral-700" : "bg-gray-50"}`}>
                                <div className={`text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>Asking price</div>
                                <div className="text-2xl font-bold">{formatCurrency(lot.askingPrice)}</div>
                            </div>
                                <div className="mt-4">
                                    {isOwner ? (
                                        <div
                                            className={`rounded-xl border p-3 text-sm ${dark ? "bg-neutral-900 border-neutral-800 text-neutral-200" : "bg-amber-50 border-amber-200 text-amber-900"
                                                }`}
                                        >
                                            You're the seller of this listing - contacting yourself is disabled.
                                        </div>
                                    ) : (
                                <button                           
                                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => alert("Contact seller (mock)")}
                                >
                                    Contact seller
                                        </button>
                                    )}
                            </div>
                        </>
                    )}
                    {/* Owner notice — replaces the bid UI */}
                    {user && isOwner && isAuction && (
                        <div
                            className={`mt-3 rounded-xl border p-3 text-sm ${dark ? "bg-neutral-900 border-neutral-800 text-neutral-200" : "bg-amber-50 border-amber-200 text-amber-900"
                                }`}
                        >
                            You're the seller of this lot - bidding and buying are disabled.
                        </div>
                    )}
                </div>
                
            </div>


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


function SignUp({ dark, setUser }) {
    const nav = useNavigate();
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [confirm, setConfirm] = React.useState("");
    const [error, setError] = React.useState("");
    const location = useLocation();
    const rawFrom = location.state?.from;
    const from = typeof rawFrom === "string" ? rawFrom : rawFrom?.pathname || "/";


    const onSubmit = (e) => {
        e.preventDefault();
        // simple validations
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email.");
        if (password.length < 6) return setError("Password must be at least 6 characters.");
        if (password !== confirm) return setError("Passwords do not match.");
        setError("");

        // mock 'create account'
        setUser({ email });
        nav(from, { replace: true });
    };

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className={`rounded-2xl border p-6 ${dark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-gray-200"}`}>
                <h1 className="text-2xl font-semibold">Create your account</h1>
                <p className={`text-sm mt-1 ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                    Sign up to place bids and manage your listings.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        />
                    </div>

                    <div>
                        <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            autoComplete="new-password"
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        />
                        <p className={`mt-1 text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>At least 6 characters.</p>
                    </div>

                    <div>
                        <label className={`text-xs font-medium ${dark ? "text-neutral-400" : "text-gray-600"}`}>Confirm password</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            placeholder="Repeat password"
                            autoComplete="new-password"
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        />
                    </div>

                    {error && <div className={dark ? "text-red-300 text-sm" : "text-red-600 text-sm"}>{error}</div>}

                    <button type="submit" className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm">
                        Create account
                    </button>
                </form>

                <div className={`mt-6 text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                    Already have an account? <Link to="/signin" state={{ from }} className="underline">Sign in</Link>
                </div>
            </div>
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
    const location = useLocation();
    const rawFrom = location.state?.from;
    const from = typeof rawFrom === "string" ? rawFrom : rawFrom?.pathname || "/";

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
            nav(from, { replace: true }); // ? go back to intended page (or home)
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
                            {loading ? "Signing in..." : "Sign in"}
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
                    Don't have an account? <Link to="/signup" state={{ from }} className="underline">Sign up</Link>
                </div>
            </div>
        </div>
    );
}

function RequireAuth({ user, children }) {
    const location = useLocation();
    if (!user) {
        // send them to /signin, and remember where they tried to go
        return <Navigate to="/signin" replace state={{ from: location }} />;
    }
    return children;
}

function Sell({ dark, user, lots, setLots }) {
    const nav = useNavigate();

    // ----- Options -----
    const conditionOptions = ["Used", "New"];
    const defectsOptions = ["With defects", "Without defects"];
    const years = Array.from({ length: 2025 - 1900 + 1 }, (_, i) => 1900 + i).reverse();

    // ----- Form state -----
    const [title, setTitle] = React.useState("");
    const [category, setCategory] = React.useState("");
    const [subcategory, setSubcategory] = React.useState("");
    const [year, setYear] = React.useState(2015);
    const [condition, setCondition] = React.useState("Used");
    const [defects, setDefects] = React.useState("Without defects");

    const [engine, setEngine] = React.useState("");
    const [power, setPower] = React.useState("");
    const [weight, setWeight] = React.useState("");
    const [hours, setHours] = React.useState("");

    const [description, setDescription] = React.useState("");
    const [documents, setDocuments] = React.useState("");
    const [location, setLocation] = React.useState("");
    const [coords, setCoords] = React.useState(null);
    const [locationErr, setLocationErr] = React.useState("");

    // Prices as raw strings; live inline errors
    const [startPrice, setStartPrice] = React.useState("0");
    const [reservePrice, setReservePrice] = React.useState("");
    const [startErr, setStartErr] = React.useState("");
    const [reserveErr, setReserveErr] = React.useState("");

    // Photos: device uploads
    const [files, setFiles] = React.useState([]); // File[]
    const [previews, setPreviews] = React.useState([]); // string[] (Object URLs)

    // Top-level form error (non-price)
    const [error, setError] = React.useState("");
    const [listingType, setListingType] = React.useState("auction"); // "auction" | "sale"
    const [sellerType, setSellerType] = useState("Private person"); // "Private person" | "Company"
    const [companyName, setCompanyName] = useState("");
    // Truck-specific
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [vin, setVin] = useState("");
    const [mileageKm, setMileageKm] = useState("");
    const [emptyWeight, setEmptyWeight] = useState("");
    const [maxLoadWeight, setMaxLoadWeight] = useState("");
    const [axleConfig, setAxleConfig] = useState("");
    const [inspectionValidUntil, setInspectionValidUntil] = useState("");
    const [emission, setEmission] = useState("");
    const [transmission, setTransmission] = useState("");

    // Cleanup all previews on unmount
    React.useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, []); // only on unmount

    // ----- Validation helpers -----
    const MIN = 250;
    const STEP = 50;
    const isMultipleOf50 = (n) => Number.isFinite(n) && n % STEP === 0;

    function validateStartPrice(v) {
        if (v === "" || v == null) return "Starting price is required.";
        const n = Number(v);
        if (!Number.isFinite(n)) return "Starting price must be a number.";
        if (n < MIN) return `Starting price must be at least \u20AC${MIN}.`;
        if (!isMultipleOf50(n)) return "Starting price must increase in \u20AC50 steps (e.g., 250, 300, 350...).";
        return "";
    }

    function validateReservePrice(v, startV) {
        if (v === "" || v == null) return ""; // optional
        const n = Number(v);
        const s = Number(startV);
        if (!Number.isFinite(n)) return "Reserve price must be a number.";
        if (n < MIN) return `Reserve price must be at least \u20AC${MIN}.`;
        if (!isMultipleOf50(n)) return "Reserve price must increase in \u20AC50 steps (e.g., 250, 300, 350...).";
        if (Number.isFinite(s) && n < s) return "Reserve price must be greater than or equal to the starting price.";
        return "";
    }

    function handleFileChange(e) {
        const list = Array.from(e.target.files || []);
        const images = list.filter((f) => f.type.startsWith("image/"));

        // Build URLs for new files only
        const newUrls = images.map((f) => URL.createObjectURL(f));

        // Append (don’t replace)
        setFiles((prev) => [...prev, ...images]);
        setPreviews((prev) => [...prev, ...newUrls]);

        // Allow re-selecting the same file names
        e.target.value = "";
    }

    function removePhoto(idx) {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
        setPreviews((prev) => {
            const url = prev[idx];
            if (url) URL.revokeObjectURL(url);
            return prev.filter((_, i) => i !== idx);
        });
    }

    function validateFormOther() {
        if (!title.trim()) return "Please enter a machine name.";
        const normalizedCat = (category || "").trim();
        const validCategories = Object.keys(categoryStructure);
        if (!normalizedCat || !validCategories.includes(normalizedCat)) {
            return "Choose a valid category.";
        }

        // ? Subcategory is optional. If present (not "All"), it must exist under the selected category
        const normalizedSub = (subcategory || "").trim();
        if (
            normalizedSub &&
            normalizedSub !== "All" &&
            !(categoryStructure[normalizedCat] || []).includes(normalizedSub)
        ) {
            return "Choose a valid subcategory.";
        }
        const y = Number(year);
        if (!(y >= 1900 && y <= 2025)) return "Year must be between 1900 and 2025.";
        if (!conditionOptions.includes(condition)) return "Choose a valid condition.";
        if (!defectsOptions.includes(defects)) return "Choose a valid defects option.";
        if (!location.trim()) return "Please enter a location (e.g., Riga, Latvia).";
        if (!previews || previews.length === 0) return "Please add at least one photo.";
        return "";

    }

    function onSubmit(e) {
        e.preventDefault();
        if (!coords || !location) {
            setLocationErr("Please select a valid location from the list.");
            return;
        }

        // Re-run price validators
        if (listingType === "auction") {
        const se = validateStartPrice(startPrice);
        const be = validateReservePrice(reservePrice, startPrice);
        setStartErr(se);
        setReserveErr(be);
        if (se || be) return;
        }
        // Other fields
        const err = validateFormOther();
        if (err) { setError(err); return; }
        setError("");

        const sp = Number(startPrice);
        const bp = reservePrice === "" ? undefined : Number(reservePrice);

        // Specs object (omit "-" / blanks)
        let specs = {};
        if (category === "Trucks") {
            if (make) specs.make = make;
            if (model) specs.model = model;
            if (vin) specs.vin = vin;
            if (mileageKm) specs.mileageKm = Number(mileageKm);
            if (emptyWeight) specs.emptyWeight = Number(emptyWeight);
            if (maxLoadWeight) specs.maxLoadWeight = Number(maxLoadWeight);
            if (axleConfig) specs.axleConfig = axleConfig;
            if (inspectionValidUntil) specs.inspectionValidUntil = inspectionValidUntil; // ISO date
            if (emission) specs.emission = emission;
            if (transmission) specs.transmission = transmission;
        } else {
            if (engine && engine !== "-") specs.engine = engine;
            if (power && power !== "-") specs.power = power;
            if (weight && weight !== "-") specs.weight = weight;
            if (hours && hours !== "-" && hours !== "") specs.hours = Number(hours);
        }

        const docList = documents.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);
        const locLower = (location || "").toLowerCase();
        const matched = Object.entries(NAME_TO_CODE)
            .find(([name]) => locLower.includes(name));
        const cc = matched ? matched[1] : null;
        const displaySeller =
            sellerType === "Private person"
                ? "Private person"
                : (companyName?.trim() ? companyName.trim() : "Company");

        const newId = `NEW${Date.now().toString().slice(-6)}`;
        const base = {
            id: newId,
            title: title.trim(),
            location: location.trim(), // "City, Country"
            coords, // { lat, lng }
            countryCode: cc,
            images: previews.slice(), // use object URLs for MVP
            year: Number(year),
            hours: hours === "-" || hours === "" ? undefined : Number(hours),
            condition,
            hasDefects: defects === "With defects",
            category,
            subcategory,
            seller: displaySeller,
            sellerEmail: user?.email || null,
            sellerType,  
            companyName: sellerType === "Company" ? (companyName?.trim() || "") : "", 
            specs,
            description: description.trim(),
            documents: docList,
            createdAt: new Date().toISOString(),
        };
        const newLot = listingType === "auction" ? {
            ...base, type: "auction", currentBid: sp, reserve: bp, endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        } 
            : { ...base, type: "sale", askingPrice: sp, endsAt:null };

        setLots((prev) => [newLot, ...prev]);
        nav(`/lot/${newId}`);
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <div className={`rounded-2xl border p-6 ${dark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-gray-200"}`}>
                <h1 className="text-2xl font-semibold">Sell equipment</h1>
                <p className={`text-sm mt-1 ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                    {listingType === "auction" ? "Fill in the details below to create your auction listing." : "Fill in the details below to create your for-sale listing."}
                </p>

                <form className="mt-6 space-y-6" onSubmit={onSubmit}>
                    <div>
                        <label className="text-xs font-medium">Listing type</label>
                        <select
                            value={listingType}
                            onChange={(e) => setListingType(e.target.value)}
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        >
                            <option value="auction">Auction</option>
                            <option value="sale">For sale</option>
                        </select>
                    </div>
                    {/* Basic */}
                    <div className="sm:col-span-2">
                        <div>
                            <label className="text-xs font-medium">Machine name</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., 2018 Volvo L120 Wheel Loader"
                                className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm tracking-wide leading-tight ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                            />
                        </div>
                        {/* Category & Subcategory */}
                        <div className="sm:col-span-2">
                            <div>
                                <label className="text-xs font-medium">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        setSubcategory("");
                                    }}
                                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm tracking-wide leading-tight ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""
                                        }`}
                                >
                                    <option value="" disabled>Select a category</option>
                                    {Object.keys(categoryStructure).map((main) => (
                                        <option key={main} value={main}>{main}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-medium">Subcategory</label>
                                <select
                                    value={subcategory}
                                    onChange={(e) => setSubcategory(e.target.value)}
                                    disabled={!category || category === "All"}
                                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm tracking-wide leading-tight ${dark
                                            ? "bg-neutral-800 border-neutral-700 text-white"
                                            : ""
                                        } ${!category || category === "All" ? "opacity-60" : ""}`}
                                >
                                    <option value="">Select a subcategory</option>
                                    {(categoryStructure[category] || []).map((sub) => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* Seller type */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium">Seller type</label>
                            <select
                                value={sellerType}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setSellerType(v);
                                    if (v !== "Company") setCompanyName("");
                                }}
                                className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""
                                }`}
                                
                            >
                                <option value="Private person">Private person</option>
                                <option value="Company">Company</option>
                            </select>
                            <p className={`mt-1 text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                                Choose who is selling this machine.
                            </p>
                        </div>

                        {/* Only show when Company is selected */}
                        {sellerType === "Company" && (
                        <div>
                            <label className="text-xs font-medium">Company name (optional)</label>
                            <input
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                placeholder="e.g., UAB Heavybid"
                               
                                className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""
                                    }`}
                            />
                            <p className={`mt-1 text-xs ${dark ? "text-neutral-400" : "text-gray-500"}`}>
                                If left blank, it will display as "Company".
                            </p>
                            </div>
                        )}
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-medium">Year</label>
                            <select
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                            >
                                {years.map((y) => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium">Condition</label>
                            <select
                                value={condition}
                                onChange={(e) => setCondition(e.target.value)}
                                className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                            >
                                {conditionOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium">Defects</label>
                            <select
                                value={defects}
                                onChange={(e) => setDefects(e.target.value)}
                                className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                            >
                                {defectsOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Specifications */}
                    <div>
                        <label className="text-xs font-medium block mb-2">Specifications</label>

                        {category === "Trucks" ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {/* Make / Model */}
                                <input value={make} onChange={(e) => setMake(e.target.value)} placeholder="Make (e.g., Volvo)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                                <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model (e.g., FH16)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />

                                {/* VIN */}
                                <input value={vin} onChange={(e) => setVin(e.target.value)} placeholder="VIN"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm sm:col-span-2 ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />

                                {/* Mileage */}
                                <input type="number" inputMode="numeric" value={mileageKm}
                                    onChange={(e) => setMileageKm(e.target.value)} placeholder="Mileage (km)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />

                                {/* Weights */}
                                <input value={emptyWeight} onChange={(e) => setEmptyWeight(e.target.value)} placeholder="Empty weight (kg)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                                <input value={maxLoadWeight} onChange={(e) => setMaxLoadWeight(e.target.value)} placeholder="Max load weight (kg)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />

                                {/* Axle / Emission / Transmission */}
                                <select value={axleConfig} onChange={(e) => setAxleConfig(e.target.value)}
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}>
                                    <option value="">Axle configuration</option>
                                    <option>4x2</option><option>6x2</option><option>6x4</option>
                                    <option>8x4</option><option>10x4</option><option>Other</option>
                                </select>

                                <select value={emission} onChange={(e) => setEmission(e.target.value)}
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}>
                                    <option value="">Emission standard</option>
                                    <option>Euro 3</option><option>Euro 4</option><option>Euro 5</option>
                                    <option>Euro 6</option><option>Euro VI</option>
                                </select>

                                <select value={transmission} onChange={(e) => setTransmission(e.target.value)}
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}>
                                    <option value="">Transmission type</option>
                                    <option>Manual</option><option>Automatic</option><option>AMT</option>
                                </select>

                                {/* Inspection date */}
                                <input type="date" value={inspectionValidUntil}
                                    onChange={(e) => setInspectionValidUntil(e.target.value)}
                                    placeholder="Technical inspection valid until"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm sm:col-span-2 ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                            </div>
                        ) : (
                            // ? your existing generic specs (engine, power, weight, hours)
                            <div className="grid sm:grid-cols-2 gap-4">
                                <input value={engine} onChange={(e) => setEngine(e.target.value)} placeholder="Engine (or -)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                                <input value={power} onChange={(e) => setPower(e.target.value)} placeholder="Power (or -)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                                <input value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight (or -)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                                <input value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hours (or -)"
                                    className={`w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`} />
                            </div>
                        )}
                    </div>

                    {/* Description & documents */}
                    <div>
                        <label className="text-xs font-medium">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Describe condition, attachments, maintenance, etc."
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium">Documents (one per line)</label>
                            <textarea
                                value={documents}
                                onChange={(e) => setDocuments(e.target.value)}
                                rows={3}
                                placeholder="e.g., CE certificate\nService records"
                                className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""}`}
                            />
                        </div>

                        {/* Photos */}
                        <div>
                            <label className="text-xs font-medium">Photos</label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className={`mt-1 block w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:bg-gray-50 ${dark ? "file:border-neutral-700 file:bg-neutral-800 file:text-white" : "file:border-gray-200"
                                    }`}
                            />
                            {previews.length > 0 && (
                                <>
                                    <div className={`mt-1 text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                                        {previews.length} photo{previews.length > 1 ? "s" : ""} selected
                                    </div>
                                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                        {previews.map((url, i) => (
                                            <div key={url} className="relative group">
                                                <img src={url} alt={`photo-${i}`} className="w-full h-24 object-cover rounded-lg border" />
                                                <button
                                                    type="button"
                                                    onClick={() => removePhoto(i)}
                                                    className="absolute top-1 right-1 text-xs px-2 py-1 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition"
                                                    aria-label="Remove photo"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div>
                        <label className="text-xs font-medium">Pricing</label>
                        <div className={`mt-1 text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                            Minimum is {"\u20AC"}250. Amounts must increase in {"\u20AC"}50 steps (e.g., 250, 300, 350...).
                        </div>
                        {listingType === "auction" ? (
                        <div className="mt-2 grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs">Starting price (EUR)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={startPrice}
                                    onChange={(e) => {
                                        let v = e.target.value;
                                        if (v.length > 1 && v.startsWith("0")) {
                                            v = v.replace(/^0+/, ""); // remove all leading zeros
                                            if (v === "") v = "0";
                                        }
                                        setStartPrice(v);
                                        setStartErr(validateStartPrice(v));
                                        setReserveErr(validateReservePrice(reservePrice, v));
                                    }}
                                    onBlur={(e) => {
                                        // If empty on blur, reset to "0"
                                        if (e.target.value === "") setStartPrice("0");
                                        }}
                                        onWheel={(e) => e.preventDefault()}
                                    placeholder=""
                                    aria-invalid={Boolean(startErr)}
                                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""
                                        } ${startErr ? "border-red-500" : ""}`}
                                    />
                                    {Number.isFinite(Number(startPrice)) && Number(startPrice) > 0 && !startErr && (
                                        <p className={`mt-1 text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                                            Preview: {formatCurrency(Number(startPrice))}
                                        </p>
                                    )}
                                {startErr && (
                                    <p className={`mt-1 text-xs ${dark ? "text-red-300" : "text-red-600"}`}>{startErr}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs">Reserve price (EUR, optional)</label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={reservePrice}
                                    onChange={(e) => {
                                        let v = e.target.value;
                                        if (v.length > 1 && v.startsWith("0")) {
                                            v = v.replace(/^0+/, ""); // remove all leading zeros
                                            if (v === "") v = "0";
                                        }
                                        setReservePrice(v);
                                        setReserveErr(validateReservePrice(v, startPrice));
                                    }}
                                    onBlur={(e) => {
                                        // If empty on blur, reset to "0"
                                        if (e.target.value === "") setReservePrice("");
                                        }}
                                        onWheel={(e) => e.preventDefault()}
                                    placeholder="(optional)"
                                    aria-invalid={Boolean(reserveErr)}
                                    className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""
                                        } ${reserveErr ? "border-red-500" : ""}`}
                                    />
                                    {reservePrice !== "" && Number.isFinite(Number(reservePrice)) && Number(reservePrice) > 0 && !reserveErr && (
                                        <p className={`mt-1 text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                                            Preview: {formatCurrency(Number(reservePrice))}
                                        </p>
                                    )}
                                {reserveErr && (
                                    <p className={`mt-1 text-xs ${dark ? "text-red-300" : "text-red-600"}`}>{reserveErr}</p>
                                )}
                        </div>
                    </div>
                    ) : (
                    <div className="mt-2">
                        {/* For sale: Asking price only (reuse startPrice + validator) */}
                        <label className="text-xs">Asking price (EUR)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            min={MIN}
                            step={STEP}
                            value={startPrice}
                            onChange={(e) => {
                                let v = e.target.value;
                                if (v.length > 1 && v.startsWith("0")) v = v.replace(/^0+/, "") || "0";
                                setStartPrice(v);
                                setStartErr(validateStartPrice(v));
                            }}
                                        onBlur={(e) => { if (e.target.value === "") setStartPrice("0"); }}
                                        onWheel={(e) => e.preventDefault()}
                            aria-invalid={Boolean(startErr)}
                            className={`mt-1 w-full border rounded-xl px-3 py-2 text-sm ${dark ? "bg-neutral-800 border-neutral-700 text-white" : ""} ${startErr ? "border-red-500" : ""}`}
                                    />
                                    {Number.isFinite(Number(startPrice)) && Number(startPrice) > 0 && !startErr && (
                                        <p className={`mt-1 text-xs ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                                            Preview: {formatCurrency(Number(startPrice))}
                                        </p>
                                    )}
                        {startErr && <p className={`mt-1 text-xs ${dark ? "text-red-300" : "text-red-600"}`}>{startErr}</p>}
                    </div>
  )}
            </div>

                    {/* Location */}
                    <div>
                        <label className="text-xs font-medium">Location</label>
                        <LocationAutocompleteOSM
                            value={location}
                            onChange={(v) => { setLocation(v); setCoords(null); setLocationErr(""); }}
                            onSelect={(item) => { setLocation(item.label); setCoords(item.coords); setLocationErr(""); }}
                            dark={dark}
                        // Limit to your markets (optional):
                        // countryCodes={["ee","lv","lt","de","pl","se","fi"]}
                        />
                        {locationErr && (
                            <p className={`mt-1 text-xs ${dark ? "text-red-300" : "text-red-600"}`}>{locationErr}</p>
                        )}
                    </div>

                    {/* Top-level error */}
                    {error && (
                        <div className={dark ? "text-red-300 text-sm" : "text-red-600 text-sm"}>{error}</div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex gap-2">
                        <button
                            type="submit"
                            disabled={Boolean(startErr || reserveErr)}
                            className={`px-4 py-2 rounded-xl text-sm ${startErr || reserveErr ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                                }`}
                        >
                            Create listing
                        </button>
                        <button
                            type="button"
                            onClick={() => nav(-1)}
                            className={`px-4 py-2 rounded-xl border text-sm ${dark ? "border-neutral-700" : ""}`}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
// Reusable shell for static pages
function PageShell({ title, children, dark }) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className={`rounded-2xl border p-6 ${dark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white"}`}>
                <h1 className="text-2xl font-semibold">{title}</h1>
                <div className={`mt-4 space-y-4 ${dark ? "text-neutral-300" : "text-gray-700"}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}

function AboutPage({ dark }) {
    return (
        <PageShell title="About us" dark={dark}>
            <p>HeavyBid is a marketplace for heavy machinery across the EU & EEA, combining timed auctions with fixed-price listings.</p>
            <p>We focus on transparency, verified sellers, and safe transactions.</p>
        </PageShell>
    );
}

function TermsPage({ dark }) {
    return (
        <PageShell title="Terms and conditions" dark={dark}>
            <h2 className="text-lg font-semibold">1. Introduction</h2>
            <p>These Terms govern your use of HeavyBid. By using the site, you agree to them.</p>
            <h2 className="text-lg font-semibold">2. Accounts</h2>
            <p>Keep your credentials secure. You are responsible for activity under your account.</p>
            <h2 className="text-lg font-semibold">3. Listings & Bidding</h2>
            <p>All bids are binding. Sellers must provide accurate item information.</p>
            <h2 className="text-lg font-semibold">4. Liability</h2>
            <p>HeavyBid is a venue. We are not a party to transactions between users.</p>
        </PageShell>
    );
}

function HowItWorksPage({ dark }) {
    return (
        <PageShell title="How does it work?" dark={dark}>
            <ol className="list-decimal pl-5 space-y-2">
                <li>Create an account and verify your email.</li>
                <li>Browse auctions or fixed-price listings. Use filters for country, category, price.</li>
                <li>For auctions: place bids in {"\u20AC"}50 steps (min {"\u20AC"}250). For sales: contact the seller.</li>
                <li>After winning, arrange payment and pickup directly with the seller.</li>
            </ol>
        </PageShell>
    );
}

function FAQPage({ dark }) {
    return (
        <PageShell title="F.A.Q" dark={dark}>
            <div>
                <h3 className="font-semibold">How do bidding steps work?</h3>
                <p>Bids must be in {"\u20AC"}50 increments, starting at a minimum of {"\u20AC"}250.</p>
            </div>
            <div>
                <h3 className="font-semibold">Can I list a machine for direct sale?</h3>
                <p>Yes—choose "For sale" when creating a listing and set an asking price.</p>
            </div>
            <div>
                <h3 className="font-semibold">Which countries are supported?</h3>
                <p>EU & EEA countries for now.</p>
            </div>
        </PageShell>
    );
}

function ContactsPage({ dark }) {
    return (
        <PageShell title="Contacts" dark={dark}>
            <p>General inquiries: <a className="underline" href="mailto:info@heavybid.example">info@heavybid.example</a></p>
            <p>Support: <a className="underline" href="mailto:support@heavybid.example">support@heavybid.example</a></p>
            <p>Address: Example Street 1, 10111 Tallinn, Estonia</p>
        </PageShell>
    );
}

function PrivacyPage({ dark }) {
    return (
        <PageShell title="Privacy policy" dark={dark}>
            <h2 className="text-lg font-semibold">What we collect</h2>
            <p>Basic account info and usage data to operate the platform.</p>
            <h2 className="text-lg font-semibold">How we use it</h2>
            <p>To provide and improve services, detect abuse, and comply with law.</p>
            <h2 className="text-lg font-semibold">Your rights</h2>
            <p>You can request access, correction, or deletion of your personal data.</p>
        </PageShell>
    );
}
function NotFound({ dark }) {
    return (
        <div className="max-w-3xl mx-auto px-4 py-16">
            <div className={`rounded-2xl border p-8 text-center ${dark ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white"}`}>
                <h1 className="text-3xl font-bold">Page not found</h1>
                <p className={`mt-2 ${dark ? "text-neutral-400" : "text-gray-600"}`}>
                    The page you’re looking for doesn’t exist or has moved.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                    <a href="/" className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">Go to Home</a>
                    <a href="/faq" className={`px-4 py-2 rounded-xl border ${dark ? "border-neutral-700" : "border-gray-200"}`}>
                        Read FAQ
                    </a>
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
    const maxPrice = useMemo(
        () => Math.max(0, ...lots.map(listingPrice)),
        [lots]
    );

    const priceSteps = useMemo(() => {
        const steps = buildPriceSteps(maxPrice);
        return steps.length ? steps : [0, maxPrice];
    }, [maxPrice]);

    // ? Initialize AFTER steps exist; update if steps change
    const [priceMin, setPriceMin] = useState(0);
    const [priceMax, setPriceMax] = useState(0);
    useEffect(() => {
        if (priceSteps.length) setPriceMax(priceSteps[priceSteps.length - 1]);
    }, [priceSteps]);
    // optional: clamp min if it ends up above the new max
    useEffect(() => {
        if (priceMin > priceMax) setPriceMin(priceMax);
    }, [priceMin, priceMax]);
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
                                user={user}
                            />
                        }
                    />
                    <Route path="/lot/:id" element={<LotDetail lots={lots} setLots={setLots} dark={dark} user={user} />} />
                    <Route path="/signin" element={<SignIn dark={dark} setUser={setUser} />} />
                    <Route path="/signup" element={<SignUp dark={dark} setUser={setUser} />} />
                    <Route path="/my-listings" element={
                        <SellerDashboard lots={lots} user={user} dark={dark} />
                    } />
                    <Route path="/edit/:id" element={
                        <EditListing lots={lots} setLots={setLots} user={user} dark={dark} />
                    } />
                    <Route path="*" element={<div className="max-w-5xl mx-auto px-4 py-12">Not found</div>} />
                    <Route
                        path="/sell"
                        element={
                            <RequireAuth user={user}>
                                <Sell dark={dark} user={user} lots={lots} setLots={setLots} />
                            </RequireAuth>
                        }
                    />
                    <Route path="/about" element={<AboutPage dark={dark} />} />
                    <Route path="/terms" element={<TermsPage dark={dark} />} />
                    <Route path="/how-it-works" element={<HowItWorksPage dark={dark} />} />
                    <Route path="/faq" element={<FAQPage dark={dark} />} />
                    <Route path="/contacts" element={<ContactsPage dark={dark} />} />
                    <Route path="/privacy" element={<PrivacyPage dark={dark} />} />
                    <Route path="*" element={<NotFound dark={dark} />} />
                </Routes>
                <footer className={`${dark ? "bg-neutral-900 border-neutral-800" : "bg-white"} border-t mt-8`}>
                    <div className="max-w-7xl mx-auto px-4 py-6 text-sm flex flex-col gap-2">
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                            <Link to="/about" className="underline">About us</Link>
                            <Link to="/how-it-works" className="underline">How does it work?</Link>
                            <Link to="/faq" className="underline">F.A.Q</Link>
                            <Link to="/contacts" className="underline">Contacts</Link>
                            <Link to="/terms" className="underline">Terms & Conditions</Link>
                            <Link to="/privacy" className="underline">Privacy Policy</Link>
                        </div>
                        <div>{"\u00A9"} {new Date().getFullYear()} {" "} HeavyBid {" \u2014 "} Heavy machinery auctions</div>
                        <div>Contact: info@heavybid.example</div>
                    </div>
                </footer>
            </BrowserRouter>
        </div>
    );
}
