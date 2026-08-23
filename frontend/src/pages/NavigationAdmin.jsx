import { useState, useEffect, useRef } from 'react';
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, GripVertical, Save, ChevronDown, ChevronRight, Image as ImageIcon, Loader2 } from 'lucide-react';
import axios from '../api/axios';
import { GujaratiInput } from '../components/GujaratiInput';

const BUILTIN_LINKS = [
    { value: '/', label: 'Home (built-in)' },
    { value: '/services', label: 'Services (built-in)' },
    { value: '/contact', label: 'Contact (built-in)' },
    { value: '/panchayat', label: 'Panchayat Details (built-in)' },
    { value: '/business', label: 'Business Directory (built-in)' },
];

const newItem = () => ({
    _key: `nav-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    label_en: 'New Item', label_gu: '', link_type: 'builtin', link_value: '/', icon_url: '', children: []
});

const LinkFields = ({ item, pages, onChange }) => {
    const set = (patch) => onChange({ ...item, ...patch });
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <select
                value={item.link_type}
                onChange={e => set({ link_type: e.target.value, link_value: '' })}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5"
            >
                <option value="builtin">Built-in page</option>
                <option value="page">Custom page (Page Builder)</option>
                <option value="url">External URL</option>
            </select>

            {item.link_type === 'builtin' && (
                <select value={item.link_value} onChange={e => set({ link_value: e.target.value })} className="text-sm border border-gray-200 rounded-lg px-2 py-1.5">
                    <option value="">Choose…</option>
                    {BUILTIN_LINKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
            )}
            {item.link_type === 'page' && (
                <select value={item.link_value} onChange={e => set({ link_value: e.target.value })} className="text-sm border border-gray-200 rounded-lg px-2 py-1.5">
                    <option value="">Choose a page…</option>
                    {pages.map(p => <option key={p.slug} value={p.slug}>{p.title} ({p.slug === 'home' ? '/' : `/p/${p.slug}`})</option>)}
                </select>
            )}
            {item.link_type === 'url' && (
                <input
                    value={item.link_value}
                    onChange={e => set({ link_value: e.target.value })}
                    placeholder="https://…"
                    className="text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                />
            )}
        </div>
    );
};

const IconUpload = ({ item, onChange }) => {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('icon', file);
            const res = await axios.post('/navigation/upload-icon', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onChange({ ...item, icon_url: res.data.icon_url });
        } catch {
            alert('Icon upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {item.icon_url
                ? <img src={item.icon_url} alt="" className="w-6 h-6 rounded object-cover border border-gray-200" />
                : <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center"><ImageIcon className="w-3.5 h-3.5 text-gray-300" /></div>
            }
            <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs text-primary-600 hover:underline"
                disabled={uploading}
            >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : (item.icon_url ? 'Change icon' : 'Add icon')}
            </button>
            {item.icon_url && (
                <button type="button" onClick={() => onChange({ ...item, icon_url: '' })} className="text-xs text-gray-400 hover:text-red-500">Remove</button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    );
};

const NavItemRow = ({ item, pages, onChange, onDelete, onAddChild, onChangeChild, onDeleteChild }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._key });
    const [expanded, setExpanded] = useState(true);
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

    return (
        <div ref={setNodeRef} style={style} className="bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="flex items-start gap-2 p-3">
                <button {...attributes} {...listeners} className="p-1 mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                </button>
                <button onClick={() => setExpanded(e => !e)} className="p-1 mt-1 text-gray-400 hover:text-gray-600">
                    {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                <div className="flex-1 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                            value={item.label_en}
                            onChange={e => onChange({ ...item, label_en: e.target.value })}
                            placeholder="Label (English)"
                            className="text-sm font-semibold border border-gray-200 rounded-lg px-2 py-1.5"
                        />
                        <GujaratiInput
                            value={item.label_gu}
                            onChange={val => onChange({ ...item, label_gu: val })}
                            placeholder="Type phonetically, e.g. 'sevao'"
                            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                        />
                    </div>
                    <LinkFields item={item} pages={pages} onChange={onChange} />
                    <IconUpload item={item} onChange={onChange} />
                </div>
                <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            {expanded && (
                <div className="pl-12 pr-3 pb-3 space-y-2">
                    {item.children.map((child, i) => (
                        <div key={child._key} className="flex items-start gap-2 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                            <span className="text-gray-300 text-xs mt-2">↳</span>
                            <div className="flex-1 space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input
                                        value={child.label_en}
                                        onChange={e => onChangeChild(i, { ...child, label_en: e.target.value })}
                                        placeholder="Sub-item label (English)"
                                        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                                    />
                                    <GujaratiInput
                                        value={child.label_gu}
                                        onChange={val => onChangeChild(i, { ...child, label_gu: val })}
                                        placeholder="Type phonetically"
                                        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5"
                                    />
                                </div>
                                <LinkFields item={child} pages={pages} onChange={(patch) => onChangeChild(i, patch)} />
                            </div>
                            <button onClick={() => onDeleteChild(i)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={onAddChild}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add sub-menu item
                    </button>
                </div>
            )}
        </div>
    );
};

const NavigationAdmin = () => {
    const [items, setItems] = useState([]);
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => {
        (async () => {
            try {
                const [navRes, pagesRes] = await Promise.all([axios.get('/navigation'), axios.get('/pages')]);
                const withKeys = navRes.data.map(item => ({
                    ...item, _key: `nav-${item.id}`,
                    children: (item.children || []).map(c => ({ ...c, _key: `nav-${c.id}` }))
                }));
                setItems(withKeys);
                setPages(pagesRes.data);
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const updateItem = (key, patch) => setItems(prev => prev.map(it => it._key === key ? { ...it, ...patch } : it));
    const deleteItem = (key) => setItems(prev => prev.filter(it => it._key !== key));
    const addTopLevel = () => setItems(prev => [...prev, newItem()]);

    const addChild = (parentKey) => setItems(prev => prev.map(it =>
        it._key === parentKey ? { ...it, children: [...it.children, newItem()] } : it
    ));
    const updateChild = (parentKey, index, patch) => setItems(prev => prev.map(it =>
        it._key === parentKey ? { ...it, children: it.children.map((c, i) => i === index ? { ...c, ...patch } : c) } : it
    ));
    const deleteChild = (parentKey, index) => setItems(prev => prev.map(it =>
        it._key === parentKey ? { ...it, children: it.children.filter((_, i) => i !== index) } : it
    ));

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        setItems(prev => {
            const oldIdx = prev.findIndex(i => i._key === active.id);
            const newIdx = prev.findIndex(i => i._key === over.id);
            return arrayMove(prev, oldIdx, newIdx);
        });
    };

    const save = async () => {
        setSaving(true);
        try {
            const payload = {
                items: items.map(({ label_en, label_gu, link_type, link_value, icon_url, children }) => ({
                    label_en, label_gu, link_type, link_value, icon_url,
                    children: children.map(({ label_en, label_gu, link_type, link_value, icon_url }) => ({ label_en, label_gu, link_type, link_value, icon_url }))
                }))
            };
            await axios.put('/navigation', payload);
            setSavedAt(Date.now());
        } catch {
            alert('Failed to save navigation');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="text-sm text-gray-400">Loading…</p>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Control the menu, submenus, and nav links shown to visitors of this village's site.</p>
                </div>
                <button
                    onClick={save}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl text-sm"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving…' : 'Save Menu'}
                </button>
            </div>
            {savedAt && <p className="text-xs text-green-600">Saved — the Navbar reflects this immediately.</p>}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map(i => i._key)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {items.map(item => (
                            <NavItemRow
                                key={item._key}
                                item={item}
                                pages={pages}
                                onChange={(patch) => updateItem(item._key, patch)}
                                onDelete={() => deleteItem(item._key)}
                                onAddChild={() => addChild(item._key)}
                                onChangeChild={(i, patch) => updateChild(item._key, i, patch)}
                                onDeleteChild={(i) => deleteChild(item._key, i)}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <button
                onClick={addTopLevel}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-xl border border-primary-200"
            >
                <Plus className="w-4 h-4" /> Add Menu Item
            </button>
        </div>
    );
};

export default NavigationAdmin;
