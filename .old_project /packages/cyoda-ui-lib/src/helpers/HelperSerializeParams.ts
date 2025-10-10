function isEncoded(str) {
    if (typeof str !== 'string') return false;
    try {
        return encodeURIComponent(decodeURIComponent(str)) === str;
    } catch {
        return false;
    }
}

function encodeIfNeeded(val) {
    const s = String(val);
    return isEncoded(s) ? s : encodeURIComponent(s);
}

export default function serializeParams(params) {
    const parts = [];
    const append = (k, v) => {
        if (v === undefined || v === null) return;
        const key = encodeIfNeeded(k);
        const value = typeof v === 'string' ? encodeIfNeeded(v) : encodeIfNeeded(String(v));
        parts.push(`${key}=${value}`);
    };

    for (const key of Object.keys(params || {})) {
        const val = params[key];
        if (Array.isArray(val)) {
            for (const item of val) append(key, item);
        } else {
            append(key, val);
        }
    }
    return parts.join('&');
}
