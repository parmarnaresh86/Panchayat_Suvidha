// Provisions the two full demo villages (Sayla, Kukavav) with realistic
// content — profile, census, panchayat, achievements, navigation, contact
// info, and a Business Directory with 13 listings on Sayla — against any
// running instance of this backend, local or deployed.
//
// Needed because the Render free-tier backend runs on ephemeral disk: the
// SQLite file gets wiped on every redeploy AND occasionally on the
// instance's own idle spin-down/spin-up cycle, with no code change
// involved. Re-running this script is the fix each time that happens.
//
// Usage:
//   API_BASE=https://panchayat-suvidha-backend.onrender.com \
//   SUPER_ADMIN_PASSWORD=<current Render SUPER_ADMIN_PASSWORD> \
//   node backend/scripts/seed-demo-data.js
//
// Env vars:
//   API_BASE                required — e.g. http://localhost:5055 or the Render URL
//   SUPER_ADMIN_USERNAME     default 'superadmin'
//   SUPER_ADMIN_PASSWORD     required — must match the target server's env var
//   STANDARD_ADMIN_PASSWORD  default 'admin123' — password set for each village's "admin" user

const API_BASE = process.env.API_BASE;
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const STANDARD_ADMIN_USER = 'admin';
const STANDARD_ADMIN_PASS = process.env.STANDARD_ADMIN_PASSWORD || 'admin123';

if (!API_BASE) { console.error('Set API_BASE, e.g. API_BASE=http://localhost:5055'); process.exit(1); }
if (!SUPER_ADMIN_PASSWORD) { console.error('Set SUPER_ADMIN_PASSWORD to match the target server.'); process.exit(1); }

// ── tiny placeholder-image generator (no filesystem, no external assets) ──
function svg(bg, fg, text, w, h) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.round(h / 6)}" font-weight="bold" fill="${fg}" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;
}

async function req(method, url, { token, village, body, isForm, fileField, fileName, fileContent } = {}) {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (village) headers['X-Village-Slug'] = village;
    let opts = { method, headers };
    if (isForm) {
        const form = new FormData();
        form.append(fileField, new Blob([fileContent], { type: 'image/svg+xml' }), fileName);
        opts.body = form;
    } else if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
    }
    const res = await fetch(API_BASE + url, opts);
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) throw new Error(`${method} ${url} -> ${res.status}: ${JSON.stringify(data)}`);
    return data;
}

async function uploadSvg(token, village, endpoint, fileField, svgContent, fileName) {
    const result = await req('POST', endpoint, { token, village, isForm: true, fileField, fileName, fileContent: svgContent });
    return result.url || result.imageUrl;
}

const NAV_ITEMS = [
    { label_en: 'Home', label_gu: 'હોમ', link_type: 'builtin', link_value: '/' },
    { label_en: 'Services', label_gu: 'સેવાઓ', link_type: 'builtin', link_value: '/services' },
    { label_en: 'Business Directory', label_gu: 'વ્યવસાય નિર્દેશિકા', link_type: 'builtin', link_value: '/business' },
    { label_en: 'Contact', label_gu: 'સંપર્ક', link_type: 'builtin', link_value: '/contact' },
];

// ── reusable HTML-card tab builders ──────────────────────────────────────
const statCards = (stats, accent) => `
<div style="display:flex;gap:1rem;flex-wrap:wrap;justify-content:center;margin:1.5rem 0">
  ${stats.map(s => `
    <div style="background:${accent.bg};border-radius:14px;padding:1.25rem 2rem;text-align:center;min-width:130px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
      <div style="font-size:1.9rem;font-weight:800;color:${accent.fg}">${s.value}</div>
      <div style="font-size:.82rem;color:#6b7280;margin-top:.15rem">${s.label}</div>
    </div>`).join('')}
</div>`;

const featureGrid = (items) => `
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;margin-top:1rem">
  ${items.map(i => `
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:1.25rem;box-shadow:0 1px 4px rgba(0,0,0,.04)">
      <div style="font-size:1.8rem;margin-bottom:.5rem">${i.icon}</div>
      <div style="font-weight:700;color:#111827;margin-bottom:.25rem">${i.title}</div>
      <div style="font-size:.85rem;color:#6b7280;line-height:1.4">${i.text}</div>
    </div>`).join('')}
</div>`;

const testimonialCard = (quote, author, accent) => `
<div style="background:${accent.bg};border-left:4px solid ${accent.fg};border-radius:12px;padding:1.5rem;margin-top:1.5rem;max-width:640px;margin-left:auto;margin-right:auto">
  <p style="font-style:italic;color:#374151;font-size:1.02rem;line-height:1.6;margin:0 0 .75rem">"${quote}"</p>
  <p style="font-weight:700;color:${accent.fg};margin:0;font-size:.9rem">— ${author}</p>
</div>`;

const ctaBanner = (text, accent) => `
<div style="background:linear-gradient(135deg, ${accent.fg}, ${accent.bg2 || accent.fg});border-radius:16px;padding:1.75rem 1.5rem;text-align:center;margin-top:1.5rem">
  <p style="color:#fff;font-weight:700;font-size:1.1rem;margin:0">${text}</p>
</div>`;

async function main() {
    const superToken = (await req('POST', '/super-admin/login', { body: { username: SUPER_ADMIN_USERNAME, password: SUPER_ADMIN_PASSWORD } })).token;
    console.log('Super admin login OK');

    async function ensureVillage(payload) {
        try {
            const v = await req('POST', '/super-admin/villages', { token: superToken, body: payload });
            console.log(`Created village '${payload.slug}'`);
            return v;
        } catch (err) {
            if (!String(err.message).includes('409')) throw err;
            const all = await req('GET', '/super-admin/villages', { token: superToken });
            const v = all.find(x => x.slug === payload.slug);
            console.log(`Village '${payload.slug}' already exists (id=${v.id}), reusing`);
            return v;
        }
    }

    async function ensureStandardAdmin(villageId, villageSlug) {
        await req('POST', `/super-admin/villages/${villageId}/set-admin`, { token: superToken, body: {
            username: STANDARD_ADMIN_USER, password: STANDARD_ADMIN_PASS,
        }});
        const r = await req('POST', '/auth/login', { village: villageSlug, body: { username: STANDARD_ADMIN_USER, password: STANDARD_ADMIN_PASS, role: 'admin' } });
        console.log(`Standard admin (${STANDARD_ADMIN_USER}/${STANDARD_ADMIN_PASS}) ready for '${villageSlug}'`);
        return r.token;
    }

    // ── SAYLA ─────────────────────────────────────────────────────
    const sayla = await ensureVillage({
        slug: 'sayla', name: 'Sayla', taluka: 'Sayla', district: 'Surendranagar', state: 'Gujarat',
        area: '18.2 sq km', total_households: '1240',
        description: 'A historic gram panchayat in Surendranagar district, Gujarat, known for its royal heritage, weaving traditions, and thriving local commerce.',
        theme: 'heritage',
    });
    const saylaToken = await ensureStandardAdmin(sayla.id, 'sayla');

    await req('POST', '/village/update', { token: saylaToken, village: 'sayla', body: {
        name: 'Sayla', taluka: 'Sayla', district: 'Surendranagar', state: 'Gujarat',
        area: '18.2 sq km', total_households: '1240',
        description: 'Sayla is a historic gram panchayat in Surendranagar district, Gujarat, once the seat of the Sayla princely state. Today it is a thriving rural hub known for its handloom weaving, dairy cooperative, and small-scale trade.',
        history_en: 'Sayla traces its roots to a small princely state ruled by a Jhala Rajput dynasty. The erstwhile Sayla Palace still stands as a heritage landmark. Post-independence, Sayla merged into Gujarat state and its panchayat has since focused on rural infrastructure, education, and local enterprise.',
        history_gu: 'સાયલા સુરેન્દ્રનગર જિલ્લાનું એક ઐતિહાસિક ગામ છે, જે અગાઉ ઝાલા રાજપૂત રાજવી પરિવારની રિયાસત હતું. આજે સાયલા હાથશાળ વણાટકામ, ડેરી સહકારી મંડળી અને સ્થાનિક વ્યવસાય માટે જાણીતું છે.',
        theme: 'heritage',
    }});

    for (const c of [
        { category: 'Total Population', total: 6840, male: 3520, female: 3320 },
        { category: 'Literate', total: 5120, male: 2780, female: 2340 },
        { category: 'Illiterate', total: 1720, male: 740, female: 980 },
        { category: 'Workers', total: 2980, male: 2100, female: 880 },
        { category: 'Non-Workers', total: 3860, male: 1420, female: 2440 },
    ]) await req('POST', '/census/add', { token: saylaToken, village: 'sayla', body: c });

    for (const m of [
        { role: 'Sarpanch', name: 'Jayeshbhai Manubhai Zala', email: 'sarpanch.sayla@example.com', mobile: '9820000001', address: 'Panchayat Office, Sayla', description: 'Serving as Sarpanch since 2022, focused on road infrastructure and water supply improvements.' },
        { role: 'Talati-cum-Mantri', name: 'Rekhaben Chunilal Parmar', email: 'talati.sayla@example.com', mobile: '9820000002', address: 'Panchayat Office, Sayla', description: 'Handles all administrative and record-keeping functions of the panchayat.' },
        { role: 'Deputy Sarpanch', name: 'Kiritbhai Devraj Solanki', email: 'deputy.sayla@example.com', mobile: '9820000003', address: 'Panchayat Office, Sayla', description: 'Oversees sanitation and public health initiatives.' },
    ]) await req('POST', '/panchayat/member/add', { token: saylaToken, village: 'sayla', body: m });

    for (const a of [
        { title: 'Nirmal Gram Puraskar (Sample)', awarded_by: 'Ministry of Panchayati Raj, Govt. of India' },
        { title: 'Best Panchayat Award — Surendranagar District (Sample)', awarded_by: 'District Panchayat Office' },
    ]) await req('POST', '/achievements/add', { token: saylaToken, village: 'sayla', body: a });

    for (const p of [
        { name: 'Dr. Nileshbhai Trivedi', achievement: 'Renowned rural health practitioner running a free clinic for over 15 years', role: 'Physician' },
        { name: 'Kamlaben Rathod', achievement: "Founded a women's self-help group weaving cooperative employing 40+ local women", role: 'Social Entrepreneur' },
    ]) await req('POST', '/special-persons/add', { token: saylaToken, village: 'sayla', body: p });

    await req('PUT', '/navigation', { token: saylaToken, village: 'sayla', body: { items: NAV_ITEMS } });
    await req('PUT', '/contact/info', { token: saylaToken, village: 'sayla', body: {
        phone: '+91 98200 00000', email: 'panchayat.sayla@gujarat.gov.in',
        address: 'Gram Panchayat Office, Sayla, Surendranagar, Gujarat 363430',
        hours: '10:00 AM - 5:00 PM, Monday - Saturday',
    }});
    console.log('Sayla profile + census + panchayat + achievements + navigation + contact done');

    const SAYLA_FAQS = [
        { question_en: 'How do I apply for a birth certificate?', question_gu: 'જન્મ પ્રમાણપત્ર માટે કેવી રીતે અરજી કરવી?', answer_en: 'Visit the Panchayat Office with the hospital discharge slip and parents\' ID proof. Certificates are typically issued within 7 working days.', answer_gu: 'હોસ્પિટલ ડિસ્ચાર્જ સ્લિપ અને માતા-પિતાના ઓળખ પુરાવા સાથે પંચાયત ઓફિસની મુલાકાત લો. પ્રમાણપત્ર સામાન્ય રીતે ૭ કાર્યકારી દિવસોમાં જારી થાય છે.' },
        { question_en: 'How can I pay my property tax online?', question_gu: 'હું મારો પ્રોપર્ટી ટેક્સ ઓનલાઇન કેવી રીતે ભરી શકું?', answer_en: 'Property tax can be paid at the Panchayat Office counter, or through the Gujarat Panchayat e-Gram Swaraj portal using your property ID.', answer_gu: 'પ્રોપર્ટી ટેક્સ પંચાયત ઓફિસના કાઉન્ટર પર અથવા તમારા પ્રોપર્ટી ID વડે ગુજરાત પંચાયત e-ગ્રામ સ્વરાજ પોર્ટલ પર ભરી શકાય છે.' },
        { question_en: 'What are the Panchayat office hours?', question_gu: 'પંચાયત ઓફિસનો સમય શું છે?', answer_en: 'The Panchayat Office is open from 10:00 AM to 5:00 PM, Monday through Saturday. It remains closed on Sundays and government holidays.', answer_gu: 'પંચાયત ઓફિસ સોમવારથી શનિવાર સવારે ૧૦:૦૦ થી સાંજે ૫:૦૦ સુધી ખુલ્લી રહે છે. રવિવારે અને સરકારી રજાઓ પર બંધ રહે છે.' },
        { question_en: 'How do I apply for a death certificate?', question_gu: 'મરણ પ્રમાણપત્ર માટે કેવી રીતે અરજી કરવી?', answer_en: 'Bring the hospital or doctor\'s death report along with the deceased\'s ID proof to the Panchayat Office within 21 days of the death.', answer_gu: 'મૃત્યુના ૨૧ દિવસની અંદર હોસ્પિટલ અથવા ડોક્ટરનો મરણ રિપોર્ટ અને મૃતકનો ઓળખ પુરાવો પંચાયત ઓફિસમાં લાવો.' },
        { question_en: 'Who is the current Sarpanch of the village?', question_gu: 'ગામના હાલના સરપંચ કોણ છે?', answer_en: 'Shri Jayeshbhai Manubhai Zala is the current Sarpanch, serving since 2022. His contact details are listed on the Panchayat Members page.', answer_gu: 'શ્રી જયેશભાઈ મનુભાઈ ઝાલા ૨૦૨૨ થી હાલના સરપંચ છે. તેમની સંપર્ક વિગતો પંચાયત સભ્યો પેજ પર છે.' },
        { question_en: 'How can I report a broken streetlight?', question_gu: 'તૂટેલી સ્ટ્રીટલાઇટની ફરિયાદ કેવી રીતે કરવી?', answer_en: 'Call the Panchayat Office or submit a written complaint at the office counter mentioning the location. Repairs are usually done within a week.', answer_gu: 'પંચાયત ઓફિસને ફોન કરો અથવા સ્થળનો ઉલ્લેખ કરીને ઓફિસ કાઉન્ટર પર લેખિત ફરિયાદ આપો. સામાન્ય રીતે એક અઠવાડિયામાં રિપેર થાય છે.' },
        { question_en: 'How do I apply for a new ration card?', question_gu: 'નવું રેશન કાર્ડ કેવી રીતે મેળવવું?', answer_en: 'Apply through the Digital Gujarat portal or visit the Mamlatdar office with your Aadhaar card, address proof, and family photo.', answer_gu: 'ડિજિટલ ગુજરાત પોર્ટલ પર અરજી કરો અથવા આધાર કાર્ડ, સરનામાનો પુરાવો અને પરિવારનો ફોટો સાથે મામલતદાર ઓફિસની મુલાકાત લો.' },
        { question_en: 'What documents are needed for a caste certificate?', question_gu: 'જાતિ પ્રમાણપત્ર માટે કયા દસ્તાવેજો જરૂરી છે?', answer_en: 'You will need Aadhaar card, school leaving certificate, ration card, and a self-declaration form, submitted at the Taluka office.', answer_gu: 'આધાર કાર્ડ, શાળા છોડ્યાનું પ્રમાણપત્ર, રેશન કાર્ડ અને સ્વ-ઘોષણા ફોર્મ તાલુકા ઓફિસમાં સબમિટ કરવા જરૂરી છે.' },
        { question_en: 'How can I check the water supply schedule?', question_gu: 'પાણી પુરવઠાનું સમયપત્રક કેવી રીતે જોવું?', answer_en: 'Water is supplied daily from 6:00 AM to 8:00 AM and 5:00 PM to 7:00 PM. Any disruption is announced via the Panchayat notice board.', answer_gu: 'પાણી દરરોજ સવારે ૬:૦૦ થી ૮:૦૦ અને સાંજે ૫:૦૦ થી ૭:૦૦ સુધી પુરું પાડવામાં આવે છે. કોઈ પણ વિક્ષેપ પંચાયત નોટિસ બોર્ડ પર જાહેર કરાય છે.' },
        { question_en: 'How do I register a complaint about garbage collection?', question_gu: 'કચરો ઉઠાવવા બાબતે ફરિયાદ કેવી રીતે નોંધાવવી?', answer_en: 'Contact the Panchayat Office directly or inform your ward member. Garbage collection complaints are typically resolved within 2-3 days.', answer_gu: 'સીધા પંચાયત ઓફિસનો સંપર્ક કરો અથવા તમારા વોર્ડ સભ્યને જણાવો. કચરાની ફરિયાદો સામાન્ય રીતે ૨-૩ દિવસમાં ઉકેલાય છે.' },
        { question_en: 'How can I list my business in the Business Directory?', question_gu: 'મારો વ્યવસાય બિઝનેસ ડિરેક્ટરીમાં કેવી રીતે નોંધાવવો?', answer_en: 'Only Panchayat admins can add businesses to the directory currently. Visit or call the Panchayat Office with your business details to get listed.', answer_gu: 'હાલમાં માત્ર પંચાયત એડમિન બિઝનેસ ડિરેક્ટરીમાં વ્યવસાય ઉમેરી શકે છે. તમારા વ્યવસાયની વિગતો સાથે પંચાયત ઓફિસની મુલાકાત લો અથવા ફોન કરો.' },
        { question_en: 'What government schemes are available for farmers?', question_gu: 'ખેડૂતો માટે કઈ સરકારી યોજનાઓ ઉપલબ્ધ છે?', answer_en: 'PM-Kisan Samman Nidhi, crop insurance (PMFBY), and subsidized drip-irrigation schemes are all available — ask at the Panchayat Office for application help.', answer_gu: 'PM-કિસાન સન્માન નિધિ, ફસલ વીમો (PMFBY), અને સબસિડીવાળી ડ્રિપ-ઇરિગેશન યોજનાઓ ઉપલબ્ધ છે — અરજી માટે પંચાયત ઓફિસનો સંપર્ક કરો.' },
        { question_en: 'How do I apply for an income certificate?', question_gu: 'આવક પ્રમાણપત્ર માટે કેવી રીતે અરજી કરવી?', answer_en: 'Apply online via the Digital Gujarat portal, or submit a written application with salary slips/land records at the Mamlatdar office.', answer_gu: 'ડિજિટલ ગુજરાત પોર્ટલ પર ઓનલાઇન અરજી કરો, અથવા પગાર સ્લિપ/જમીન રેકોર્ડ સાથે લેખિત અરજી મામલતદાર ઓફિસમાં સબમિટ કરો.' },
        { question_en: 'Who do I contact for road repair requests?', question_gu: 'રોડ રિપેર માટે વિનંતી કોને કરવી?', answer_en: 'Submit a written request at the Panchayat Office describing the location and issue. Major repairs are taken up in the next budget cycle.', answer_gu: 'સ્થળ અને સમસ્યાનું વર્ણન કરીને પંચાયત ઓફિસમાં લેખિત વિનંતી સબમિટ કરો. મોટા રિપેર આગામી બજેટ ચક્રમાં લેવામાં આવે છે.' },
        { question_en: 'How can I get a No Objection Certificate (NOC) for construction?', question_gu: 'બાંધકામ માટે નો-ઓબ્જેક્શન સર્ટિફિકેટ (NOC) કેવી રીતે મેળવવું?', answer_en: 'Submit your building plan, land ownership documents, and application form at the Panchayat Office. Processing usually takes 15-20 days.', answer_gu: 'તમારો બિલ્ડિંગ પ્લાન, જમીન માલિકીના દસ્તાવેજો અને અરજી ફોર્મ પંચાયત ઓફિસમાં સબમિટ કરો. પ્રક્રિયામાં સામાન્ય રીતે ૧૫-૨૦ દિવસ લાગે છે.' },
        { question_en: 'What is the process to transfer property records?', question_gu: 'પ્રોપર્ટી રેકોર્ડ ટ્રાન્સફર કરવાની પ્રક્રિયા શું છે?', answer_en: 'Submit the sale deed, both parties\' ID proofs, and a mutation application at the Panchayat Office to update the property records.', answer_gu: 'પ્રોપર્ટી રેકોર્ડ અપડેટ કરવા માટે વેચાણ ડીડ, બંને પક્ષોના ઓળખ પુરાવા અને મ્યુટેશન અરજી પંચાયત ઓફિસમાં સબમિટ કરો.' },
        { question_en: 'How do I apply for the old-age pension scheme?', question_gu: 'વૃદ્ધાવસ્થા પેન્શન યોજના માટે કેવી રીતે અરજી કરવી?', answer_en: 'Applicants above 60 years can apply with Aadhaar card, age proof, and income certificate at the Mamlatdar office or via Digital Gujarat.', answer_gu: '૬૦ વર્ષથી ઉપરના અરજદારો આધાર કાર્ડ, વયનો પુરાવો અને આવક પ્રમાણપત્ર સાથે મામલતદાર ઓફિસ અથવા ડિજિટલ ગુજરાત દ્વારા અરજી કરી શકે છે.' },
        { question_en: 'How can I get information about the widow pension scheme?', question_gu: 'વિધવા પેન્શન યોજના વિશે માહિતી કેવી રીતે મેળવવી?', answer_en: 'The Gujarat Vidhva Sahay Yojana provides monthly pension to eligible widows. Contact the Panchayat Office or Mamlatdar office for the application form.', answer_gu: 'ગુજરાત વિધવા સહાય યોજના પાત્ર વિધવાઓને માસિક પેન્શન આપે છે. અરજી ફોર્મ માટે પંચાયત ઓફિસ અથવા મામલતદાર ઓફિસનો સંપર્ક કરો.' },
        { question_en: 'What is the emergency contact number for the panchayat?', question_gu: 'પંચાયતનો ઈમરજન્સી સંપર્ક નંબર શું છે?', answer_en: 'You can reach the Panchayat Office at +91 98200 00000 during office hours. For medical or fire emergencies, always dial 108 or 101.', answer_gu: 'ઓફિસ સમય દરમિયાન પંચાયત ઓફિસનો સંપર્ક +91 98200 00000 પર કરી શકાય છે. મેડિકલ અથવા ફાયર ઈમરજન્સી માટે હંમેશા ૧૦૮ અથવા ૧૦૧ ડાયલ કરો.' },
        { question_en: 'How can I download government forms from this website?', question_gu: 'આ વેબસાઇટ પરથી સરકારી ફોર્મ કેવી રીતે ડાઉનલોડ કરવા?', answer_en: 'Go to the Services section and open the relevant service category — downloadable forms are listed under each service item.', answer_gu: 'સેવાઓ સેક્શનમાં જાઓ અને સંબંધિત સેવા શ્રેણી ખોલો — દરેક સેવા આઇટમ હેઠળ ડાઉનલોડ કરી શકાય તેવા ફોર્મ સૂચિબદ્ધ છે.' },
    ];
    for (const f of SAYLA_FAQS) await req('POST', '/faqs/add', { token: saylaToken, village: 'sayla', body: f });
    console.log(`Sayla FAQ chat widget seeded (${SAYLA_FAQS.length} questions)`);

    async function makeBusiness(token, village, { key, name, name_gu, category, description, description_gu, owner_name, phone, email, logoColor, coverColor, coverLabel, products, tab }) {
        const logo = await uploadSvg(token, village, '/business/upload-logo', 'logo', svg(logoColor.bg, logoColor.fg, logoColor.text, 200, 200), `${key}-logo.svg`);
        const cover = await uploadSvg(token, village, '/business/upload-cover', 'cover', svg(coverColor.bg, coverColor.fg, coverLabel, 1200, 400), `${key}-cover.svg`);
        const biz = await req('POST', '/business', { token, village, body: {
            name, name_gu, category, description, description_gu,
            owner_name, phone, email, address: `${village === 'sayla' ? 'Sayla, Surendranagar' : 'Kukavav, Amreli'}, Gujarat`,
            logo_url: logo, cover_url: cover, is_published: true,
        }});
        const productImgs = await Promise.all(products.map((p, i) =>
            uploadSvg(token, village, '/business/upload-product-image', 'image', svg('#f3f4f6', logoColor.bg, `Item ${i + 1}`, 400, 300), `${key}-p${i + 1}.svg`)
        ));
        await req('PUT', `/business/${biz.id}/products`, { token, village, body: {
            products: products.map((p, i) => ({ ...p, image_url: productImgs[i] })),
        }});
        if (tab) await req('POST', `/business/admin/${biz.id}/tabs`, { token, village, body: tab });
        console.log(`  + [${village}] ${name}`);
        return biz;
    }

    await makeBusiness(saylaToken, 'sayla', {
        key: 'weaving', name: 'Sayla Handloom Weavers Cooperative', name_gu: 'સાયલા હાથશાળ વણકર સહકારી મંડળી',
        category: 'Handicrafts & Textiles',
        description: 'A women-led weaving cooperative producing traditional Patola-inspired sarees, bandhani dupattas, and handwoven textiles.',
        description_gu: 'મહિલા સંચાલિત વણાટકામ સહકારી મંડળી, પરંપરાગત પટોળા-શૈલીની સાડીઓ અને હાથશાળ કાપડ બનાવે છે.',
        owner_name: 'Kamlaben Rathod', phone: '9820011111', email: 'weavers.sayla@example.com',
        logoColor: { bg: '#7c2d12', fg: '#ffffff', text: 'SW' }, coverColor: { bg: '#c2410c', fg: '#ffffff' }, coverLabel: 'Sayla Handloom Weavers',
        products: [
            { name: 'Bandhani Dupatta', name_gu: 'બાંધણી દુપટ્ટો', description: 'Hand-tied bandhani dupatta, pure cotton', price: '₹850' },
            { name: 'Hand Embroidered Stole', name_gu: 'હાથ ભરતકામ સ્ટોલ', description: 'Traditional mirror-work embroidery on cotton', price: '₹650' },
        ],
        tab: {
            title: 'Our Story',
            content_json: [
                { id: 'b1', type: 'heading', props: { text: 'Our Story', fontSize: '2.25rem', color: '#7c2d12', align: 'center' } },
                { id: 'b2', type: 'text', props: { text: 'Founded in 2009 by twelve women from Sayla village, our cooperative began with a single loom and a shared goal: to keep the art of handloom weaving alive while creating dependable income for local women. Today we employ over 40 weavers and ship our textiles across Gujarat.', fontSize: '1.05rem', color: '#44403c', align: 'left' } },
                { id: 'b3', type: 'html', props: { html: statCards([{ value: '40+', label: 'Women Employed' }, { value: '15', label: 'Years Running' }], { bg: '#ffedd5', fg: '#7c2d12' }) } },
            ],
        },
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'dairy', name: 'Sayla Dudh Utpadak Sahakari Mandali', name_gu: 'સાયલા દૂધ ઉત્પાદક સહકારી મંડળી',
        category: 'Dairy & Agriculture', description: 'Village milk cooperative collecting and distributing fresh dairy products from over 200 local farmers.',
        owner_name: 'Jayeshbhai Manubhai Zala', phone: '9820022222', email: 'dairy.sayla@example.com',
        logoColor: { bg: '#0369a1', fg: '#ffffff', text: 'SD' }, coverColor: { bg: '#0284c7', fg: '#ffffff' }, coverLabel: 'Sayla Dairy Cooperative',
        products: [
            { name: 'Fresh Cow Milk', description: 'Daily fresh milk, collected each morning', price: '₹56/litre' },
            { name: 'Ghee (Desi)', description: 'Traditional bilona-method ghee', price: '₹620/kg' },
        ],
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'ginning', name: 'Zala Cotton Ginning Mill', name_gu: 'ઝાલા કોટન જીનીંગ મિલ',
        category: 'Agriculture & Industry',
        description: 'Cotton ginning and pressing unit serving farmers across Sayla taluka since 1998.',
        description_gu: '૧૯૯૮ થી સાયલા તાલુકાના ખેડૂતોને સેવા આપતું કોટન જીનીંગ યુનિટ.',
        owner_name: 'Prakashbhai Zala', phone: '9820033331', email: 'zalaginning@example.com',
        logoColor: { bg: '#92400e', fg: '#ffffff', text: 'ZC' }, coverColor: { bg: '#92400e', fg: '#ffffff' }, coverLabel: 'Zala Cotton Ginning Mill',
        products: [
            { name: 'Raw Cotton Procurement', description: 'Fair-price direct procurement from local farmers', price: 'Market rate' },
            { name: 'Ginned Cotton Bales', description: 'Machine-pressed cotton bales, export quality', price: '₹58,000/candy' },
        ],
        tab: { title: 'Why Farmers Trust Us', content_json: [
            { id: 'b1', type: 'heading', props: { text: 'Why Farmers Trust Us', fontSize: '2rem', color: '#92400e', align: 'center' } },
            { id: 'b2', type: 'html', props: { html: statCards([{ value: '25+', label: 'Years Operating' }, { value: '600+', label: 'Farmers Served' }, { value: '48hr', label: 'Payment Turnaround' }], { bg: '#fef3c7', fg: '#92400e' }) } },
        ]},
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'sweets', name: 'Sayla Sweets & Farsan', name_gu: 'સાયલા સ્વીટ્સ એન્ડ ફરસાણ',
        category: 'Food & Sweets',
        description: 'Family-run sweet shop known for fresh mohanthal, jalebi, and traditional Gujarati farsan.',
        description_gu: 'તાજા મોહનથાળ, જલેબી અને ગુજરાતી ફરસાણ માટે જાણીતી કૌટુંબિક દુકાન.',
        owner_name: 'Hasmukhbhai Thakkar', phone: '9820033332', email: 'saylasweets@example.com',
        logoColor: { bg: '#be123c', fg: '#ffffff', text: 'SS' }, coverColor: { bg: '#be123c', fg: '#ffffff' }, coverLabel: 'Sayla Sweets & Farsan',
        products: [
            { name: 'Mohanthal (1kg)', description: 'Classic gram-flour fudge, made fresh daily', price: '₹380' },
            { name: 'Jalebi-Fafda Combo', description: 'Weekend special — crispy fafda with hot jalebi', price: '₹160' },
        ],
        tab: { title: 'Our Specialties', content_json: [
            { id: 'b1', type: 'heading', props: { text: 'Our Specialties', fontSize: '2rem', color: '#be123c', align: 'center' } },
            { id: 'b2', type: 'html', props: { html: featureGrid([
                { icon: '🍬', title: 'Mohanthal', text: 'Our signature recipe, unchanged since 1985' },
                { icon: '🥟', title: 'Fafda-Jalebi', text: 'Fresh every Sunday morning' },
                { icon: '🎉', title: 'Festival Orders', text: 'Bulk orders for weddings & festivals' },
            ]) } },
        ]},
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'restaurant', name: 'Rajwadi Bhojanalay', name_gu: 'રજવાડી ભોજનાલય',
        category: 'Restaurant & Hospitality',
        description: 'Pure-vegetarian Gujarati thali restaurant inspired by the flavors of the old Sayla royal kitchen.',
        description_gu: 'સાયલા રિયાસતના રસોડાની પરંપરાગત વાનગીઓથી પ્રેરિત શુદ્ધ શાકાહારી થાળી રેસ્ટોરન્ટ.',
        owner_name: 'Dineshbhai Gohil', phone: '9820033333', email: 'rajwadibhojanalay@example.com',
        logoColor: { bg: '#7c2d12', fg: '#fbbf24', text: 'RR' }, coverColor: { bg: '#7c2d12', fg: '#fbbf24' }, coverLabel: 'Rajwadi Bhojanalay',
        products: [
            { name: 'Gujarati Thali', description: 'Unlimited thali with 12+ items', price: '₹180' },
            { name: 'Kathiyawadi Special', description: 'Bajra rotla with lasan chutney & chhas', price: '₹120' },
        ],
        tab: { title: 'Royal Heritage Menu', content_json: [
            { id: 'b1', type: 'heading', props: { text: 'A Taste of Royal Sayla', fontSize: '2.1rem', color: '#7c2d12', align: 'center' } },
            { id: 'b2', type: 'text', props: { text: 'Our recipes are passed down from cooks who once served the Sayla royal household — the same slow-cooked dals, hand-ground spice blends, and ghee-rich sweets, now on every table.', fontSize: '1rem', color: '#44403c', align: 'center' } },
            { id: 'b3', type: 'html', props: { html: ctaBanner('🍛 Open Daily 11 AM – 10 PM · Unlimited Thali Every Day', { fg: '#7c2d12', bg2: '#c2410c' }) } },
        ]},
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'electronics', name: 'Solanki Electronics & Mobile Care', name_gu: 'સોલંકી ઇલેક્ટ્રોનિક્સ એન્ડ મોબાઈલ કેર',
        category: 'Electronics & Repair',
        description: 'Mobile, TV, and home-appliance sales and repair shop with certified technicians.',
        description_gu: 'મોબાઈલ, ટીવી અને ઘરેલુ ઉપકરણોના વેચાણ અને રિપેરિંગ માટેની પ્રમાણિત દુકાન.',
        owner_name: 'Vijaybhai Solanki', phone: '9820033334', email: 'solankielectronics@example.com',
        logoColor: { bg: '#1d4ed8', fg: '#ffffff', text: 'SE' }, coverColor: { bg: '#1d4ed8', fg: '#ffffff' }, coverLabel: 'Solanki Electronics',
        products: [
            { name: 'Mobile Screen Replacement', description: 'All brands, same-day service', price: 'From ₹899' },
            { name: 'LED TV (32-inch)', description: 'New, with 1-year warranty', price: '₹11,999' },
        ],
        tab: { title: 'Our Services', content_json: [
            { id: 'b1', type: 'heading', props: { text: 'Our Services', fontSize: '2rem', color: '#1d4ed8', align: 'center' } },
            { id: 'b2', type: 'html', props: { html: featureGrid([
                { icon: '📱', title: 'Mobile Repair', text: 'Screen, battery, and software issues fixed same day' },
                { icon: '📺', title: 'TV & Appliance Sales', text: 'All major brands, EMI available' },
                { icon: '🛠️', title: 'Home Service', text: 'Technician visits for large appliances' },
            ]) } },
        ]},
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'medical', name: 'Krishna Medical Store', name_gu: 'કૃષ્ણા મેડિકલ સ્ટોર',
        category: 'Healthcare & Pharmacy',
        description: 'Licensed pharmacy stocking essential medicines, first-aid supplies, and health monitoring devices.',
        description_gu: 'જરૂરી દવાઓ, ફર્સ્ટ-એઇડ સામગ્રી અને હેલ્થ મોનિટરિંગ ડિવાઈસ સાથેની લાયસન્સ ધારક દવાની દુકાન.',
        owner_name: 'Dr. Ashokbhai Mehta', phone: '9820033335', email: 'krishnamedical@example.com',
        logoColor: { bg: '#047857', fg: '#ffffff', text: 'KM' }, coverColor: { bg: '#047857', fg: '#ffffff' }, coverLabel: 'Krishna Medical Store',
        products: [
            { name: 'BP Monitor (Digital)', description: 'Home blood pressure monitoring device', price: '₹1,450' },
            { name: 'First Aid Kit', description: 'Complete home first-aid kit', price: '₹399' },
        ],
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'hardware', name: 'Sayla Hardware & Building Materials', name_gu: 'સાયલા હાર્ડવેર એન્ડ બિલ્ડિંગ મેટેરિયલ',
        category: 'Hardware & Construction',
        description: 'One-stop shop for cement, paint, plumbing, and construction hardware for local builders.',
        description_gu: 'સિમેન્ટ, પેઇન્ટ, પ્લમ્બિંગ અને બાંધકામ હાર્ડવેર માટેની એક-સ્ટોપ દુકાન.',
        owner_name: 'Mahendrabhai Patel', phone: '9820033336', email: 'saylahardware@example.com',
        logoColor: { bg: '#78350f', fg: '#ffffff', text: 'SH' }, coverColor: { bg: '#78350f', fg: '#ffffff' }, coverLabel: 'Sayla Hardware',
        products: [
            { name: 'Cement (50kg bag)', description: 'OPC 53-grade cement', price: '₹385/bag' },
            { name: 'PVC Pipes (Assorted)', description: 'ISI-marked plumbing pipes, all sizes', price: 'Starting ₹65/meter' },
        ],
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'beauty', name: 'Divya Beauty Parlour & Boutique', name_gu: 'દિવ્યા બ્યુટી પાર્લર એન્ડ બુટિક',
        category: 'Beauty & Fashion',
        description: "Bridal makeup, beauty treatments, and a boutique of ready-made and custom-stitched women's wear.",
        description_gu: 'બ્રાઇડલ મેકઅપ, બ્યુટી ટ્રીટમેન્ટ અને મહિલાઓના રેડીમેડ તથા કસ્ટમ કપડાંનું બુટિક.',
        owner_name: 'Divyaben Joshi', phone: '9820033337', email: 'divyabeauty@example.com',
        logoColor: { bg: '#a21caf', fg: '#ffffff', text: 'DB' }, coverColor: { bg: '#a21caf', fg: '#ffffff' }, coverLabel: 'Divya Beauty Parlour',
        products: [
            { name: 'Bridal Makeup Package', description: 'Full bridal makeup with trial session', price: '₹8,500' },
            { name: 'Designer Blouse (Stitched)', description: 'Custom-fit designer blouse', price: '₹650' },
        ],
        tab: { title: 'Bridal Portfolio', content_json: [
            { id: 'b1', type: 'heading', props: { text: 'Bridal Portfolio', fontSize: '2rem', color: '#a21caf', align: 'center' } },
            { id: 'b2', type: 'html', props: { html: testimonialCard('Divyaben did my entire bridal look — I felt like a queen on my wedding day. Highly recommend!', 'Priyanka R., Bride', { bg: '#fae8ff', fg: '#a21caf' }) } },
            { id: 'b3', type: 'html', props: { html: ctaBanner('💄 Book your bridal trial 2 months in advance for wedding season', { fg: '#a21caf', bg2: '#701a75' }) } },
        ]},
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'garage', name: 'Sayla Auto Garage & Spares', name_gu: 'સાયલા ઓટો ગેરેજ એન્ડ સ્પેર્સ',
        category: 'Automotive',
        description: 'Multi-brand two-wheeler and car repair garage with genuine spare parts.',
        description_gu: 'બે-પૈડાં અને કારના રિપેરિંગ માટે ઓરિજિનલ સ્પેર પાર્ટ્સ સાથેનું ગેરેજ.',
        owner_name: 'Rajubhai Vora', phone: '9820033338', email: 'saylaautogarage@example.com',
        logoColor: { bg: '#1f2937', fg: '#dc2626', text: 'AG' }, coverColor: { bg: '#1f2937', fg: '#dc2626' }, coverLabel: 'Sayla Auto Garage',
        products: [
            { name: 'Two-Wheeler Full Service', description: 'Complete servicing with genuine oil', price: '₹450' },
            { name: 'Car AC Service', description: 'AC gas refill and inspection', price: '₹1,200' },
        ],
        tab: { title: 'Our Services', content_json: [
            { id: 'b1', type: 'heading', props: { text: 'Our Services', fontSize: '2rem', color: '#1f2937', align: 'center' } },
            { id: 'b2', type: 'html', props: { html: statCards([{ value: '18+', label: 'Years Experience' }, { value: '5000+', label: 'Vehicles Serviced' }, { value: '30 min', label: 'Avg. Wait Time' }], { bg: '#f3f4f6', fg: '#1f2937' }) } },
        ]},
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'nursery', name: 'Green Valley Nursery & Landscaping', name_gu: 'ગ્રીન વેલી નર્સરી એન્ડ લેન્ડસ્કેપિંગ',
        category: 'Agriculture & Horticulture',
        description: 'Plant nursery and landscaping service offering saplings, seeds, and garden design for homes and farms.',
        description_gu: 'ઘર અને ખેતર માટે રોપા, બીજ અને બગીચા ડિઝાઇન સેવા આપતી નર્સરી.',
        owner_name: 'Sureshbhai Barot', phone: '9820033339', email: 'greenvalleysayla@example.com',
        logoColor: { bg: '#15803d', fg: '#ffffff', text: 'GV' }, coverColor: { bg: '#15803d', fg: '#ffffff' }, coverLabel: 'Green Valley Nursery',
        products: [
            { name: 'Mango Sapling (Kesar)', description: 'Grafted Kesar mango sapling, 2ft', price: '₹120' },
            { name: 'Home Garden Design', description: 'Consultation + landscaping for small plots', price: 'From ₹5,000' },
        ],
        tab: { title: 'Plant Care Tips', content_json: [
            { id: 'b1', type: 'heading', props: { text: 'Plant Care Tips', fontSize: '2rem', color: '#15803d', align: 'center' } },
            { id: 'b2', type: 'html', props: { html: featureGrid([
                { icon: '💧', title: 'Watering', text: 'Water saplings early morning or evening, avoid midday heat' },
                { icon: '🌱', title: 'Soil Mix', text: 'We recommend 2:1:1 soil-compost-sand for most saplings' },
                { icon: '☀️', title: 'Sunlight', text: 'Most fruit saplings need 6+ hours of direct sun' },
            ]) } },
        ]},
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'cybercafe', name: 'Sayla Cyber Cafe & Computer Classes', name_gu: 'સાયલા સાયબર કાફે એન્ડ કમ્પ્યુટર ક્લાસ',
        category: 'IT & Digital Services',
        description: 'Internet cafe offering online form filling, printing, and basic computer training courses.',
        description_gu: 'ઓનલાઇન ફોર્મ ભરવા, પ્રિન્ટિંગ અને બેઝિક કમ્પ્યુટર તાલીમ અભ્યાસક્રમો આપતું સાયબર કાફે.',
        owner_name: 'Nikunjbhai Dave', phone: '9820033340', email: 'saylacybercafe@example.com',
        logoColor: { bg: '#4338ca', fg: '#ffffff', text: 'CC' }, coverColor: { bg: '#4338ca', fg: '#ffffff' }, coverLabel: 'Sayla Cyber Cafe',
        products: [
            { name: 'Online Form Filling', description: 'Government forms, exam applications, etc.', price: '₹30/form' },
            { name: 'Basic Computer Course', description: '1-month course, MS Office + Internet basics', price: '₹1,500' },
        ],
    });

    await makeBusiness(saylaToken, 'sayla', {
        key: 'grocery', name: 'Maa Ashapura General Store', name_gu: 'મા આશાપુરા જનરલ સ્ટોર',
        category: 'Grocery & Daily Needs',
        description: 'Neighborhood general store for groceries, household essentials, and daily needs, with home delivery.',
        description_gu: 'કિરાણા, ઘરવપરાશની ચીજવસ્તુઓ અને રોજિંદી જરૂરિયાતો માટે હોમ ડિલિવરી સાથેની દુકાન.',
        owner_name: 'Bhupendrabhai Rathva', phone: '9820033341', email: 'maaashapura@example.com',
        logoColor: { bg: '#c2410c', fg: '#ffffff', text: 'MA' }, coverColor: { bg: '#c2410c', fg: '#ffffff' }, coverLabel: 'Maa Ashapura General Store',
        products: [
            { name: 'Grocery Home Delivery', description: 'Free delivery within Sayla village on orders over ₹300', price: 'Free above ₹300' },
            { name: 'Monthly Ration Kit', description: 'Pre-packed staples kit for a family of 4', price: '₹1,850' },
        ],
    });

    console.log('Sayla Business Directory (13 listings) done');

    // ── KUKAVAV ───────────────────────────────────────────────────
    const kukavav = await ensureVillage({
        slug: 'kukavav', name: 'Kukavav', taluka: 'Kukavav Bagasara', district: 'Amreli', state: 'Gujarat',
        area: '22.5 sq km', total_households: '620',
        description: 'A gram panchayat in Amreli district, Gujarat, part of the Kukavav-Bagasara taluka, known for agriculture and rural cooperative enterprise.',
        theme: 'modern-minimal',
    });
    const kukavavToken = await ensureStandardAdmin(kukavav.id, 'kukavav');

    await req('POST', '/village/update', { token: kukavavToken, village: 'kukavav', body: {
        name: 'Kukavav', taluka: 'Kukavav Bagasara', district: 'Amreli', state: 'Gujarat',
        area: '22.5 sq km', total_households: '620',
        description: 'Kukavav is a gram panchayat village in Kukavav-Bagasara taluka, Amreli district, Gujarat. It serves as an administrative headquarters for the taluka and is primarily an agrarian community, with cotton, groundnut, and cattle farming as major economic activities.',
        history_en: 'Kukavav has long served as a taluka headquarters in Amreli district. The village panchayat has focused in recent years on sanitation drives, rural road connectivity, and support for smallholder farmers through cooperative input-supply services.',
        history_gu: 'કુકાવાવ અમરેલી જિલ્લાના કુકાવાવ-બગસરા તાલુકાનું મુખ્ય મથક ધરાવતું ગામ છે. અહીંની અર્થવ્યવસ્થા મુખ્યત્વે ખેતી અને પશુપાલન પર આધારિત છે.',
        theme: 'modern-minimal',
    }});

    for (const c of [
        { category: 'Total Population', total: 132, male: 73, female: 59 },
        { category: 'Literate', total: 72, male: 42, female: 30 },
        { category: 'Illiterate', total: 60, male: 31, female: 29 },
        { category: 'Workers', total: 50, male: 35, female: 15 },
        { category: 'Non-Workers', total: 82, male: 38, female: 44 },
    ]) await req('POST', '/census/add', { token: kukavavToken, village: 'kukavav', body: c });

    for (const m of [
        { role: 'Sarpanch', name: 'Bharatbhai Ravjibhai Dodiya', email: 'sarpanch.kukavav@example.com', mobile: '9830000001', address: 'Panchayat Office, Kukavav', description: 'Sarpanch since 2021, prioritizing farm-to-market road access and irrigation support.' },
        { role: 'Talati-cum-Mantri', name: 'Meenaben Devjibhai Sondarva', email: 'talati.kukavav@example.com', mobile: '9830000002', address: 'Panchayat Office, Kukavav', description: 'Manages panchayat records and government scheme enrollment for residents.' },
    ]) await req('POST', '/panchayat/member/add', { token: kukavavToken, village: 'kukavav', body: m });

    for (const a of [
        { title: 'Swachh Gram Award (Sample)', awarded_by: 'Amreli District Panchayat' },
        { title: 'ODF (Open Defecation Free) Certified Village', awarded_by: 'Swachh Bharat Mission, Govt. of Gujarat' },
    ]) await req('POST', '/achievements/add', { token: kukavavToken, village: 'kukavav', body: a });

    for (const p of [
        { name: 'Ramjibhai Vaghela', achievement: 'Progressive farmer recognized for pioneering drip-irrigation adoption in the taluka', role: 'Farmer' },
        { name: 'Kokilaben Parmar', achievement: 'Founded a self-help group supporting 25 rural women with micro-enterprise loans', role: 'Social Entrepreneur' },
    ]) await req('POST', '/special-persons/add', { token: kukavavToken, village: 'kukavav', body: p });

    await req('PUT', '/navigation', { token: kukavavToken, village: 'kukavav', body: { items: NAV_ITEMS } });
    await req('PUT', '/contact/info', { token: kukavavToken, village: 'kukavav', body: {
        phone: '+91 98300 00000', email: 'panchayat.kukavav@gujarat.gov.in',
        address: 'Gram Panchayat Office, Kukavav, Amreli, Gujarat 365560',
        hours: '10:00 AM - 5:00 PM, Monday - Saturday',
    }});
    console.log('Kukavav profile + census + panchayat + achievements + navigation + contact done');

    await makeBusiness(kukavavToken, 'kukavav', {
        key: 'krushi', name: 'Kukavav Krushi Kendra', name_gu: 'કુકાવાવ કૃષિ કેન્દ્ર',
        category: 'Agriculture & Farm Supplies',
        description: 'Farm input supply store providing seeds, fertilizers, and equipment to local farmers, alongside agronomy advice.',
        description_gu: 'સ્થાનિક ખેડૂતોને બિયારણ, ખાતર અને સાધનો પૂરાં પાડતું કૃષિ ઇનપુટ સ્ટોર.',
        owner_name: 'Bharatbhai Ravjibhai Dodiya', phone: '9830011111', email: 'krushikendra.kukavav@example.com',
        logoColor: { bg: '#1e40af', fg: '#ffffff', text: 'KK' }, coverColor: { bg: '#3b82f6', fg: '#ffffff' }, coverLabel: 'Kukavav Krushi Kendra',
        products: [
            { name: 'Cotton Seeds (BT Hybrid)', description: 'High-yield BT cotton seed, 450g pack', price: '₹850/pack' },
            { name: 'NPK Fertilizer', description: '19:19:19 balanced NPK fertilizer, 50kg bag', price: '₹1,150/bag' },
        ],
    });

    await makeBusiness(kukavavToken, 'kukavav', {
        key: 'handicraft', name: 'Vaghela Handicrafts', name_gu: 'વાઘેલા હસ્તકલા',
        category: 'Handicrafts & Textiles',
        description: 'Family-run handicrafts business producing traditional Kathiawadi embroidery and bandhani work.',
        owner_name: 'Kokilaben Parmar', phone: '9830022222', email: 'vaghela.handicrafts@example.com',
        logoColor: { bg: '#7c2d12', fg: '#ffffff', text: 'VH' }, coverColor: { bg: '#c2410c', fg: '#ffffff' }, coverLabel: 'Vaghela Handicrafts',
        products: [
            { name: 'Kathiawadi Embroidered Bag', description: 'Handmade mirror-work sling bag', price: '₹450' },
            { name: 'Bandhani Saree', description: 'Traditional tie-dye bandhani saree', price: '₹2,200' },
        ],
        tab: { title: 'About Us', content_json: [
            { id: 'b1', type: 'heading', props: { text: 'About Vaghela Handicrafts', fontSize: '2rem', color: '#7c2d12', align: 'center' } },
            { id: 'b2', type: 'text', props: { text: 'Started in 2015 as a home-based workshop, Vaghela Handicrafts now works with a network of 15 artisans across Kukavav taluka, preserving traditional Kathiawadi embroidery techniques passed down through generations.', fontSize: '1.05rem', color: '#44403c', align: 'left' } },
        ]},
    });

    console.log('\n=== DONE ===');
    console.log(`Sayla:   ${API_BASE.includes('localhost') ? 'http://localhost:5177' : 'https://panchayat-suvidha-frontend.onrender.com'}/?village=sayla   (${STANDARD_ADMIN_USER}/${STANDARD_ADMIN_PASS})`);
    console.log(`Kukavav: ${API_BASE.includes('localhost') ? 'http://localhost:5177' : 'https://panchayat-suvidha-frontend.onrender.com'}/?village=kukavav (${STANDARD_ADMIN_USER}/${STANDARD_ADMIN_PASS})`);
}

main().catch(err => { console.error('FAILED:', err.message); process.exit(1); });
