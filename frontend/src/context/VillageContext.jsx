
/* eslint react-refresh/only-export-components: off */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getVillageSlug, setVillageSlug, isDevFallback, KNOWN_VILLAGE_SLUGS } from '../api/tenant';
import axios from '../api/axios';

const VillageContext = createContext();

export const VillageProvider = ({ children }) => {
    const [villageSlug] = useState(getVillageSlug());
    const [village, setVillage] = useState(null);

    // Applies the village's chosen theme (a data-theme attribute the CSS
    // in index.css keys off of) so the whole site re-skins without any
    // component needing to know about theming at all.
    const applyTheme = useCallback((theme) => {
        document.documentElement.setAttribute('data-theme', theme || 'classic');
    }, []);

    const refreshVillage = useCallback(() => {
        axios.get('/village')
            .then(res => { setVillage(res.data); applyTheme(res.data.theme); })
            .catch(() => {});
    }, [applyTheme]);

    useEffect(() => { refreshVillage(); }, [refreshVillage]);

    // Switching tenants mid-session (dev only) means every already-fetched
    // village-scoped piece of state would need to be refetched — simplest
    // and safest is a full reload with the new slug.
    const switchVillage = (slug) => {
        setVillageSlug(slug);
        window.location.reload();
    };

    return (
        <VillageContext.Provider value={{
            villageSlug,
            village,
            refreshVillage,
            switchVillage,
            isDevFallback: isDevFallback(),
            knownVillageSlugs: KNOWN_VILLAGE_SLUGS
        }}>
            {children}
        </VillageContext.Provider>
    );
};

export const useVillage = () => useContext(VillageContext);
