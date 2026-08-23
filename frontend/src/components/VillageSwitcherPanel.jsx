import { useState, useEffect } from 'react';
import { MapPin, X, Check } from 'lucide-react';
import axios from '../api/axios';
import { useVillage } from '../context/VillageContext';

// Always-visible (no login required) tab on the side of the screen that
// opens a panel listing every active village, so an end user can jump to
// any village's public site without ever needing an account.
const VillageSwitcherPanel = () => {
    const { villageSlug, switchVillage } = useVillage();
    const [open, setOpen] = useState(false);
    const [villages, setVillages] = useState(null);

    useEffect(() => {
        if (open && villages === null) {
            axios.get('/villages').then(res => setVillages(res.data)).catch(() => setVillages([]));
        }
    }, [open, villages]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed top-1/2 -translate-y-1/2 left-0 z-40 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-3 px-2 rounded-r-lg shadow-lg flex flex-col items-center gap-1 [writing-mode:vertical-rl]"
                aria-label="Browse villages"
            >
                <MapPin className="w-4 h-4 rotate-90" />
                Villages
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-primary-600" /> Select a Village
                            </h2>
                            <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3">
                            {villages === null && (
                                <div className="space-y-2 p-2">
                                    {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
                                </div>
                            )}
                            {villages?.length === 0 && (
                                <p className="text-center text-gray-400 text-sm py-10">No villages available yet.</p>
                            )}
                            {villages?.map(v => {
                                const isCurrent = v.slug === villageSlug;
                                return (
                                    <button
                                        key={v.slug}
                                        onClick={() => { setOpen(false); if (!isCurrent) switchVillage(v.slug); }}
                                        className={`w-full text-left px-4 py-3 rounded-xl mb-1.5 transition-colors flex items-center justify-between gap-2
                                            ${isCurrent ? 'bg-primary-50 border border-primary-200' : 'hover:bg-gray-50 border border-transparent'}`}
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">{v.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {[v.taluka, v.district, v.state].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                        {isCurrent && <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VillageSwitcherPanel;
