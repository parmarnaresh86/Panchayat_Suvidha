import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from '../api/axios';

const PageEditContext = createContext(null);

export const PageEditProvider = ({ children }) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [pageName, setPageName] = useState(null);
    const [sections, setSections] = useState(null);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    // Stable isAdmin state — updates on storage events (login/logout) but not on every render
    const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('role') === 'admin');
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));

    useEffect(() => {
        const sync = () => {
            setIsAdmin(localStorage.getItem('role') === 'admin');
            setIsLoggedIn(!!localStorage.getItem('token'));
        };
        window.addEventListener('storage', sync);
        window.addEventListener('auth-change', sync);
        return () => {
            window.removeEventListener('storage', sync);
            window.removeEventListener('auth-change', sync);
        };
    }, []);

    const refreshAuth = useCallback(() => {
        setIsAdmin(localStorage.getItem('role') === 'admin');
        setIsLoggedIn(!!localStorage.getItem('token'));
    }, []);

    const enterEditMode = useCallback((name, defaultSections) => {
        setPageName(name);
        // Load saved layout from DB, fall back to defaults
        axios.get(`/page-content/${name}`)
            .then(res => {
                const saved = res.data?.sections;
                setSections(saved && saved.length ? saved : defaultSections);
            })
            .catch(() => setSections(defaultSections));
        setIsEditMode(true);
        setDirty(false);
    }, []);

    const exitEditMode = useCallback(() => {
        setIsEditMode(false);
        setSelectedSectionId(null);
        setDirty(false);
    }, []);

    const updateSection = useCallback((id, patch) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, content: { ...s.content, ...patch } } : s));
        setDirty(true);
    }, []);

    const reorderSections = useCallback((newOrder) => {
        setSections(newOrder);
        setDirty(true);
    }, []);

    const addSection = useCallback((type) => {
        const id = `custom-${Date.now()}`;
        const defaults = {
            heading:   { text: 'New Heading', fontSize: '2rem', color: '#111', align: 'center' },
            text:      { text: 'Write your content here...', fontSize: '1rem', color: '#444', align: 'left' },
            button:    { text: 'Click Here', url: '#', bg: '#f97316', color: '#fff', align: 'center' },
            image:     { src: '', alt: '', width: '100%', rounded: true },
            card:      { title: 'Card Title', text: 'Card description', bg: '#fff' },
            alert:     { text: 'Important notice', bg: '#fff7ed', border: '#fed7aa', color: '#9a3412' },
            divider:   { color: '#e5e7eb', thickness: 1 },
            spacer:    { height: 32 },
        };
        const newSection = {
            id,
            type,
            label: type.charAt(0).toUpperCase() + type.slice(1),
            content: defaults[type] || {},
            isCustom: true,
        };
        setSections(prev => [...(prev || []), newSection]);
        setDirty(true);
    }, []);

    const removeSection = useCallback((id) => {
        setSections(prev => prev.filter(s => s.id !== id));
        setDirty(true);
    }, []);

    const saveChanges = useCallback(async () => {
        if (!pageName || !sections) return;
        setSaving(true);
        try {
            await axios.put(`/page-content/${pageName}`, { sections });
            setDirty(false);
        } catch (err) {
            console.error('Save failed:', err);
        } finally {
            setSaving(false);
        }
    }, [pageName, sections]);

    return (
        <PageEditContext.Provider value={{
            isEditMode, isAdmin, isLoggedIn, refreshAuth,
            selectedSectionId, setSelectedSectionId,
            sections, setSections,
            dirty, saving,
            enterEditMode, exitEditMode,
            updateSection, reorderSections, addSection, removeSection, saveChanges,
        }}>
            {children}
        </PageEditContext.Provider>
    );
};

export const usePageEdit = () => useContext(PageEditContext);
