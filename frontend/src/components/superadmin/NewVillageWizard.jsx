import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Check, Loader2, X, ExternalLink } from 'lucide-react';
import axios from '../../api/axios';
import { THEME_PRESETS } from '../../themePresets';

const slugify = (name) => name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 50);

const Field = ({ label, children }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        {children}
    </div>
);

const input = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300";

// Creates a village and auto-provisions it with a starter home page +
// standard services catalog (see backend/starter-content.js), so the new
// site works immediately instead of starting blank.
const NewVillageWizard = ({ saToken, villageUrl, onCreated, onClose }) => {
    const [step, setStep] = useState(1); // 1: form, 2: review, 3: success
    const [form, setForm] = useState({
        name: '', slug: '', taluka: '', district: '', state: 'Gujarat',
        area: '', total_households: '', description: '', theme: 'classic'
    });
    const [slugTouched, setSlugTouched] = useState(false);
    const [slugStatus, setSlugStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
    const [slugReason, setSlugReason] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const [created, setCreated] = useState(null);
    const debounceRef = useRef(null);

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleNameChange = (val) => {
        set('name', val);
        if (!slugTouched) set('slug', slugify(val));
    };

    useEffect(() => {
        if (!form.slug) { setSlugStatus(null); return; }
        setSlugStatus('checking');
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await axios.get(`/super-admin/villages/check-slug/${form.slug}`, {
                    headers: { Authorization: `Bearer ${saToken}` }
                });
                if (res.data.available) setSlugStatus('available');
                else { setSlugStatus(res.data.reason ? 'invalid' : 'taken'); setSlugReason(res.data.reason || ''); }
            } catch {
                setSlugStatus(null);
            }
        }, 400);
        return () => clearTimeout(debounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.slug]);

    const canProceed = form.name.trim() && form.slug.trim() && slugStatus === 'available';

    const createVillage = async () => {
        setCreating(true);
        setError('');
        try {
            const res = await axios.post('/super-admin/villages', form, {
                headers: { Authorization: `Bearer ${saToken}` }
            });
            setCreated(res.data);
            setStep(3);
            onCreated?.(res.data);
        } catch (e) {
            setError(e.response?.data?.error || 'Failed to create village');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">New Village</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                {/* Step indicator */}
                {step < 3 && (
                    <div className="flex items-center gap-2 px-6 pt-4 text-xs font-semibold text-gray-400">
                        <span className={step === 1 ? 'text-primary-600' : ''}>1. Details</span>
                        <span>→</span>
                        <span className={step === 2 ? 'text-primary-600' : ''}>2. Review & Create</span>
                    </div>
                )}

                <div className="p-6 space-y-4">
                    {step === 1 && (
                        <>
                            <Field label="Village Name">
                                <input className={input} value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Kukavav" />
                            </Field>
                            <Field label="Subdomain (slug)">
                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                    <input
                                        className="flex-1 text-sm px-3 py-2 focus:outline-none"
                                        value={form.slug}
                                        onChange={e => { setSlugTouched(true); set('slug', slugify(e.target.value)); }}
                                        placeholder="kukavav"
                                    />
                                    <span className="px-3 py-2 bg-gray-50 text-gray-400 text-xs border-l border-gray-200">.panchayatsuvidha.in</span>
                                </div>
                                {slugStatus === 'checking' && <p className="text-xs text-gray-400">Checking availability…</p>}
                                {slugStatus === 'available' && <p className="text-xs text-green-600 flex items-center gap-1"><Check className="w-3 h-3" /> Available</p>}
                                {slugStatus === 'taken' && <p className="text-xs text-red-500">This subdomain is already taken.</p>}
                                {slugStatus === 'invalid' && <p className="text-xs text-red-500">{slugReason}</p>}
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Taluka"><input className={input} value={form.taluka} onChange={e => set('taluka', e.target.value)} /></Field>
                                <Field label="District"><input className={input} value={form.district} onChange={e => set('district', e.target.value)} /></Field>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="State"><input className={input} value={form.state} onChange={e => set('state', e.target.value)} /></Field>
                                <Field label="Households"><input className={input} value={form.total_households} onChange={e => set('total_households', e.target.value)} /></Field>
                            </div>
                            <Field label="Description">
                                <textarea rows={3} className={input + ' resize-none'} value={form.description} onChange={e => set('description', e.target.value)} />
                            </Field>
                            <Field label="Theme">
                                <div className="grid grid-cols-3 gap-2">
                                    {THEME_PRESETS.map(preset => (
                                        <button
                                            key={preset.key}
                                            type="button"
                                            onClick={() => set('theme', preset.key)}
                                            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 transition-colors ${form.theme === preset.key ? 'border-primary-400 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                                        >
                                            <span className="w-6 h-6 rounded-full border border-black/10" style={{ background: preset.swatch }} />
                                            <span className="text-xs font-medium text-gray-700 text-center leading-tight">{preset.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <p className="text-sm text-gray-500">Review before creating — this provisions a live site immediately.</p>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                                <p><span className="text-gray-400">Name:</span> <span className="font-semibold text-gray-800">{form.name}</span></p>
                                <p><span className="text-gray-400">Subdomain:</span> <span className="font-semibold text-gray-800">{form.slug}.panchayatsuvidha.in</span></p>
                                <p><span className="text-gray-400">Location:</span> <span className="font-semibold text-gray-800">{[form.taluka, form.district, form.state].filter(Boolean).join(', ') || '—'}</span></p>
                                <p><span className="text-gray-400">Theme:</span> <span className="font-semibold text-gray-800">{THEME_PRESETS.find(p => p.key === form.theme)?.label}</span></p>
                            </div>
                            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 text-sm text-primary-700">
                                On creation, this village gets a starter homepage (banner, gallery, panchayat members, map, achievements, contact, census) and the standard Admin / Employment / Facilities / Education services — all ready to customize in the Page Builder.
                            </div>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                        </>
                    )}

                    {step === 3 && created && (
                        <div className="text-center py-4 space-y-4">
                            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">{created.name} is live</h3>
                                <p className="text-sm text-gray-500 mt-1">The site is provisioned and ready to customize.</p>
                            </div>

                            {created.adminUsername && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Admin login for this village</p>
                                    <p className="text-sm text-gray-700">Username: <span className="font-mono font-semibold">{created.adminUsername}</span></p>
                                    <p className="text-sm text-gray-700">Password: <span className="font-mono font-semibold">{created.adminPassword}</span></p>
                                    <p className="text-xs text-red-500 mt-2">Shown once — save it now. Share it with whoever will manage this village, then have them change it.</p>
                                </div>
                            )}

                            <a
                                href={villageUrl(created.slug)}
                                target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-4 py-2 rounded-lg"
                            >
                                Visit site <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    {step === 1 && (
                        <>
                            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!canProceed}
                                className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg text-sm"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                                <ArrowLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                onClick={createVillage}
                                disabled={creating}
                                className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                            >
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                {creating ? 'Creating…' : 'Create Village'}
                            </button>
                        </>
                    )}
                    {step === 3 && (
                        <button onClick={onClose} className="ml-auto bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm">
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewVillageWizard;
