import { useVillage } from '../context/VillageContext';

// Dev-only convenience: lets you flip between seeded villages without
// editing hosts files or typing ?village= by hand. Hidden once a real
// subdomain or ?village= is present (production, or an explicit dev choice).
const DevVillageSwitcher = () => {
    const village = useVillage();
    if (!import.meta.env.DEV || !village?.isDevFallback) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg px-3 py-2 text-sm flex items-center gap-2">
            <span className="text-gray-500">Village:</span>
            <select
                value={village.villageSlug}
                onChange={(e) => village.switchVillage(e.target.value)}
                className="border rounded px-1 py-0.5 text-sm"
            >
                {village.knownVillageSlugs.map(slug => (
                    <option key={slug} value={slug}>{slug}</option>
                ))}
            </select>
        </div>
    );
};

export default DevVillageSwitcher;
