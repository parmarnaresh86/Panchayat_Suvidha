// Best-effort phonetic Latin -> Gujarati transliteration (ITRANS-style
// convention: case matters — e.g. 'a' vs 'A', 't' vs 'T', 's' vs 'S', 'n' vs
// 'N', 'l' vs 'L' pick different, similar-sounding Gujarati letters). This
// is a lightweight phonetic helper, not a full IME — it won't get every
// conjunct or loanword right, but it covers everyday words well enough for
// admins typing village/site content without a Gujarati keyboard.
//
// Any text that's already Gujarati Unicode (e.g. pasted in) passes through
// untouched, since only contiguous Latin-letter runs are ever converted.

const CONSONANTS_RAW = {
    // conjuncts / digraphs first so they win over shorter matches
    kSh: 'ક્ષ', ksh: 'ક્ષ', GY: 'જ્ઞ', jn: 'જ્ઞ',
    chh: 'છ', Chh: 'છ',
    kh: 'ખ', gh: 'ઘ', ch: 'ચ', jh: 'ઝ',
    Th: 'ઠ', Dh: 'ઢ', th: 'થ', dh: 'ધ',
    ph: 'ફ', bh: 'ભ', sh: 'શ', Sh: 'ષ',
    k: 'ક', g: 'ગ', j: 'જ', T: 'ટ', D: 'ડ', N: 'ણ',
    t: 'ત', d: 'દ', n: 'ન', p: 'પ', f: 'ફ', b: 'બ', m: 'મ',
    y: 'ય', r: 'ર', l: 'લ', L: 'ળ', v: 'વ', w: 'વ',
    S: 'સ', s: 'સ', h: 'હ', x: 'ક્ષ', z: 'ઝ',
};

const MATRAS_RAW = {
    au: 'ૌ', ai: 'ૈ', aa: 'ા', ii: 'ી', uu: 'ૂ',
    A: 'ા', I: 'ી', U: 'ૂ',
    i: 'િ', u: 'ુ', e: 'ે', o: 'ો',
    a: '', // inherent vowel — no matra needed
};

const INDEP_VOWELS_RAW = {
    au: 'ઔ', ai: 'ઐ', aa: 'આ', ii: 'ઈ', uu: 'ઊ',
    A: 'આ', I: 'ઈ', U: 'ઊ',
    i: 'ઇ', u: 'ઉ', e: 'એ', o: 'ઓ', a: 'અ',
};

const byLengthDesc = (obj) => Object.entries(obj).sort((a, b) => b[0].length - a[0].length);

const CONSONANTS = byLengthDesc(CONSONANTS_RAW);
const MATRAS = byLengthDesc(MATRAS_RAW);
const INDEP_VOWELS = byLengthDesc(INDEP_VOWELS_RAW);

const ANUSVARA = 'ં'; // ં
const VISARGA = 'ઃ';  // ઃ
const VIRAMA = '્';   // ્

function matchLongest(str, pos, table) {
    for (const [key, val] of table) {
        if (str.startsWith(key, pos)) return { key, val };
    }
    return null;
}

export function transliterateGujarati(text) {
    if (!text) return text;
    let out = '';
    let i = 0;
    const n = text.length;

    while (i < n) {
        // Anusvara / visarga triggers
        if (text[i] === 'M') { out += ANUSVARA; i += 1; continue; }
        if (text.startsWith('.n', i)) { out += ANUSVARA; i += 2; continue; }
        if (text.startsWith('.h', i)) { out += VISARGA; i += 2; continue; }

        const cons = matchLongest(text, i, CONSONANTS);
        if (cons) {
            i += cons.key.length;
            const vow = matchLongest(text, i, MATRAS);
            if (vow && vow.key !== 'a') {
                out += cons.val + vow.val;
                i += vow.key.length;
            } else if (vow && vow.key === 'a') {
                out += cons.val; // inherent vowel — consume the 'a', no matra glyph
                i += 1;
            } else if (matchLongest(text, i, CONSONANTS)) {
                out += cons.val + VIRAMA; // consonant cluster
            } else {
                out += cons.val; // word-final consonant, inherent vowel stands
            }
            continue;
        }

        const ivow = matchLongest(text, i, INDEP_VOWELS);
        if (ivow) {
            out += ivow.val;
            i += ivow.key.length;
            continue;
        }

        // Not a recognized Latin phonetic token (space, punctuation, digit,
        // already-Gujarati Unicode, etc.) — pass through unchanged.
        out += text[i];
        i += 1;
    }

    return out;
}
