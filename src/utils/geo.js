// src/utils/geo.js
export const NAME_TO_CODE = {
    Austria: "AT", Belgium: "BE", Bulgaria: "BG", Croatia: "HR", Cyprus: "CY",
    "Czech Republic": "CZ", Czechia: "CZ", Denmark: "DK", Estonia: "EE",
    Finland: "FI", France: "FR", Germany: "DE", Greece: "GR", Hungary: "HU",
    Ireland: "IE", Italy: "IT", Latvia: "LV", Lithuania: "LT", Luxembourg: "LU",
    Malta: "MT", Netherlands: "NL", Poland: "PL", Portugal: "PT", Romania: "RO",
    Slovakia: "SK", Slovenia: "SI", Spain: "ES", Sweden: "SE",
    Iceland: "IS", Liechtenstein: "LI", Norway: "NO"
};

export function countryNameToCode(name) {
    if (!name || name === "All") return "";
    return NAME_TO_CODE[name] || "";
}

export function Flag({ cc, className = "" }) {
    if (!cc || cc.length !== 2) return null;
    const lower = cc.toLowerCase();
    return (
        <img
            src={`https://flagcdn.com/24x18/${lower}.png`}
            srcSet={`https://flagcdn.com/48x36/${lower}.png 2x, https://flagcdn.com/72x54/${lower}.png 3x`}
            width="24" height="18" alt={cc}
            className={`inline-block rounded-[2px] ${className}`}
            loading="lazy" referrerPolicy="no-referrer"
        />
    );
}
