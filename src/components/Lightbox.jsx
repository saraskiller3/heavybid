// src/components/Lightbox.jsx
import React from "react";
import { createPortal } from "react-dom";

export default function Lightbox({
    images = [],
    index = 0,
    alt = "",
    onClose,
    onPrev,
    onNext,
}) {
    const safeIndex = Number.isInteger(index) && index >= 0 && index < images.length ? index : 0;
    const src = images[safeIndex];

    // lock scroll + keyboard handlers
    React.useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
            if (e.key === "ArrowLeft") onPrev?.();
            if (e.key === "ArrowRight") onNext?.();
        };
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [onClose, onPrev, onNext]);

    const overlay = (
        <div
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center"
            role="dialog"
            aria-modal="true"
        >
            {/* backdrop click */}
            <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="absolute inset-0"
            />

            {/* content */}
            <div className="relative z-[201] max-w-6xl w-full px-4">
                {/* header controls */}
                <div className="absolute -top-10 right-4 flex gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-2 py-1 rounded bg-white/10 text-white hover:bg-white/20"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* nav buttons */}
                <button
                    type="button"
                    onClick={onPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                    aria-label="Previous"
                >
                    ‹
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
                    aria-label="Next"
                >
                    ›
                </button>

                {/* main image */}
                <img
                    src={src}
                    alt={`${alt} — image ${safeIndex + 1}`}
                    className="mx-auto max-h-[80vh] w-auto object-contain rounded-lg bg-black/20"
                    onError={(e) => {
                        e.currentTarget.src =
                            `https://placehold.co/1600x1000?text=${encodeURIComponent(alt || "Image")}`;
                    }}
                />

                {/* thumbs */}
                {images.length > 1 && (
                    <div className="mt-4 grid grid-cols-6 sm:grid-cols-8 gap-2">
                        {images.map((s, i) => (
                            <button
                                key={`${s}-${i}`}
                                type="button"
                                onClick={() => onNext && i !== safeIndex && onNext(i)} // optional jump if you wire it
                                className={`h-16 rounded-md overflow-hidden ring-2 ${i === safeIndex ? "ring-blue-500" : "ring-transparent"
                                    }`}
                                aria-label={`Image ${i + 1}`}
                                title={`Image ${i + 1}`}
                            >
                                <img
                                    src={s}
                                    alt={`thumb ${i + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = `https://placehold.co/240x160?text=${i + 1}`;
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // render via portal to avoid stacking-context issues
    return createPortal(overlay, document.body);
}