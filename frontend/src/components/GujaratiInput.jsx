import { transliterateGujarati } from '../utils/gujaratiTransliteration';

// Drop-in text input/textarea that lets an admin type Gujarati phonetically
// in Latin letters — each word converts to Gujarati script as soon as you
// finish it (space/punctuation), the same interaction Google's classic
// transliteration tools use. Pasted Gujarati Unicode text passes through
// untouched.
//
// Unlike a plain <input>, onChange here receives the new string value
// directly (not an event) — call sites use onChange={(val) => set(val)}.

const isBoundaryChar = (ch) => ch !== undefined && !/[A-Za-z]/.test(ch);

function convertTrailingWord(value) {
    if (!value) return value;
    const lastChar = value[value.length - 1];
    if (!isBoundaryChar(lastChar)) return value; // still mid-word — leave as Latin for now

    const before = value.slice(0, -1);
    const match = before.match(/[A-Za-z]+$/);
    if (!match) return value;

    const latinWord = match[0];
    const converted = transliterateGujarati(latinWord);
    return before.slice(0, before.length - latinWord.length) + converted + lastChar;
}

function convertRemainder(value) {
    const match = value.match(/[A-Za-z]+$/);
    if (!match) return value;
    const latinWord = match[0];
    return value.slice(0, value.length - latinWord.length) + transliterateGujarati(latinWord);
}

const baseProps = (value, onChange) => ({
    value,
    onChange: (e) => onChange(convertTrailingWord(e.target.value)),
    onBlur: (e) => {
        const converted = convertRemainder(e.target.value);
        if (converted !== e.target.value) onChange(converted);
    },
    lang: 'gu',
});

export const GujaratiInput = ({ value, onChange, className, placeholder, type = 'text' }) => (
    <input type={type} className={`font-gujarati ${className || ''}`} placeholder={placeholder} {...baseProps(value, onChange)} />
);

export const GujaratiTextarea = ({ value, onChange, className, placeholder, rows = 3 }) => (
    <textarea rows={rows} className={`font-gujarati ${className || ''}`} placeholder={placeholder} {...baseProps(value, onChange)} />
);
