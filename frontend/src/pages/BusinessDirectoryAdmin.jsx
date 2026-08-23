import { useState, useEffect, useRef } from 'react';
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Plus, Trash2, Edit2, ChevronLeft, Save, ExternalLink, Store, GripVertical,
    Image as ImageIcon, Loader2, Eye, EyeOff, Search, Layout,
} from 'lucide-react';
import axios from '../api/axios';
import { GujaratiInput, GujaratiTextarea } from '../components/GujaratiInput';
import BusinessTabEditorModal from '../components/BusinessTabEditorModal';

const input = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300";
const label = "text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1";

const EMPTY_FORM = {
    name: '', name_gu: '', category: '', description: '', description_gu: '',
    owner_name: '', phone: '', email: '', address: '', website: '',
    logo_url: '', cover_url: '', is_published: true,
};

const newProduct = () => ({ _key: `p-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: '', name_gu: '', description: '', price: '', image_url: '' });

const ImagePicker = ({ url, onChange, uploadPath, fieldName, className }) => {
    const fileRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append(fieldName, file);
            const res = await axios.post(uploadPath, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            onChange(res.data.url);
        } catch {
            alert('Image upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`flex items-center gap-3 ${className || ''}`}>
            {url ? <img src={url} alt="" className="w-14 h-14 rounded-lg object-cover border border-gray-200" /> : (
                <div className="w-14 h-14 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-300">
                    <ImageIcon className="w-5 h-5" />
                </div>
            )}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="text-xs font-semibold text-primary-600 hover:underline">
                {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (url ? 'Change' : 'Upload')}
            </button>
            {url && <button type="button" onClick={() => onChange('')} className="text-xs text-gray-400 hover:text-red-500">Remove</button>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>
    );
};

const SortableProductRow = ({ product, onChange, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product._key });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

    return (
        <div ref={setNodeRef} style={style} className="bg-white border border-gray-100 rounded-xl p-3 flex items-start gap-3">
            <button {...attributes} {...listeners} className="p-1 mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
            </button>
            <ImagePicker url={product.image_url} onChange={(url) => onChange({ ...product, image_url: url })} uploadPath="/business/upload-product-image" fieldName="image" />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input className={input} placeholder="Product/Service name" value={product.name} onChange={e => onChange({ ...product, name: e.target.value })} />
                <GujaratiInput className={input} placeholder="Type phonetically" value={product.name_gu} onChange={val => onChange({ ...product, name_gu: val })} />
                <input className={input} placeholder="Price (optional)" value={product.price} onChange={e => onChange({ ...product, price: e.target.value })} />
                <input className={input} placeholder="Short description" value={product.description} onChange={e => onChange({ ...product, description: e.target.value })} />
            </div>
            <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
};

const SortableTabRow = ({ tab, onEdit, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

    return (
        <div ref={setNodeRef} style={style} className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 flex items-center gap-3">
            <button {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                <GripVertical className="w-4 h-4" />
            </button>
            <span className="flex-1 text-sm font-medium text-gray-700">{tab.title}</span>
            <button onClick={onEdit} className="p-1.5 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg">
                <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    );
};

const BusinessDirectoryAdmin = () => {
    const [businesses, setBusinesses] = useState([]);
    const [view, setView] = useState('list'); // 'list' | 'editor'
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState(null); // null = new
    const [form, setForm] = useState(EMPTY_FORM);
    const [products, setProducts] = useState([]);
    const [saving, setSaving] = useState(false);
    const [tabs, setTabs] = useState([]);
    const [tabModal, setTabModal] = useState(null); // { tabId: number|null } | null

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => { fetchBusinesses(); }, []);

    const fetchBusinesses = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/business/admin');
            setBusinesses(res.data);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    };

    const openNew = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setProducts([]);
        setTabs([]);
        setView('editor');
    };

    const fetchTabs = async (bizId) => {
        try {
            const res = await axios.get(`/business/admin/${bizId}/tabs`);
            setTabs(res.data);
        } catch { /* ignore */ }
    };

    const openEdit = async (biz) => {
        try {
            const res = await axios.get(`/business/admin/${biz.id}`);
            const b = res.data;
            setEditingId(b.id);
            setForm({
                name: b.name || '', name_gu: b.name_gu || '', category: b.category || '',
                description: b.description || '', description_gu: b.description_gu || '',
                owner_name: b.owner_name || '', phone: b.phone || '', email: b.email || '',
                address: b.address || '', website: b.website || '',
                logo_url: b.logo_url || '', cover_url: b.cover_url || '', is_published: !!b.is_published,
            });
            setProducts((b.products || []).map(p => ({ ...p, _key: `p-${p.id}` })));
            await fetchTabs(b.id);
            setView('editor');
        } catch {
            alert('Failed to load business');
        }
    };

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const save = async () => {
        if (!form.name.trim()) { alert('Business name is required'); return; }
        setSaving(true);
        try {
            let id = editingId;
            if (id) {
                await axios.put(`/business/${id}`, form);
            } else {
                const res = await axios.post('/business', form);
                id = res.data.id;
                setEditingId(id);
            }
            await axios.put(`/business/${id}/products`, {
                products: products.map(({ name, name_gu, description, price, image_url }) => ({ name, name_gu, description, price, image_url }))
            });
            await fetchBusinesses();
            setView('list');
        } catch (e) {
            alert(e.response?.data?.error || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (biz) => {
        if (!confirm(`Delete "${biz.name}"? This also removes its product listings.`)) return;
        await axios.delete(`/business/${biz.id}`);
        fetchBusinesses();
    };

    const togglePublish = async (biz) => {
        await axios.put(`/business/${biz.id}`, { name: biz.name, category: biz.category, is_published: !biz.is_published });
        fetchBusinesses();
    };

    const addProduct = () => setProducts(prev => [...prev, newProduct()]);
    const updateProduct = (key, patch) => setProducts(prev => prev.map(p => p._key === key ? patch : p));
    const deleteProduct = (key) => setProducts(prev => prev.filter(p => p._key !== key));
    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        setProducts(prev => {
            const oldIdx = prev.findIndex(p => p._key === active.id);
            const newIdx = prev.findIndex(p => p._key === over.id);
            return arrayMove(prev, oldIdx, newIdx);
        });
    };

    const deleteTab = async (tab) => {
        if (!confirm(`Delete the "${tab.title}" tab?`)) return;
        await axios.delete(`/business/admin/${editingId}/tabs/${tab.id}`);
        fetchTabs(editingId);
    };

    const handleTabDragEnd = async ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIdx = tabs.findIndex(t => t.id === active.id);
        const newIdx = tabs.findIndex(t => t.id === over.id);
        const reordered = arrayMove(tabs, oldIdx, newIdx);
        setTabs(reordered);
        await axios.put(`/business/admin/${editingId}/tabs-order`, { orderedIds: reordered.map(t => t.id) });
    };

    const filtered = businesses.filter(b =>
        !search || b.name.toLowerCase().includes(search.toLowerCase()) || (b.category || '').toLowerCase().includes(search.toLowerCase())
    );

    if (view === 'list') return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Business Directory</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Manage the businesses visitors can search and browse on your site</p>
                </div>
                <button onClick={openNew} className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-xl text-sm">
                    <Plus className="w-4 h-4" /> Add Business
                </button>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your businesses…" className={input + ' pl-9'} />
            </div>

            {loading && <p className="text-sm text-gray-400">Loading…</p>}

            {!loading && filtered.length === 0 && (
                <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100">
                    <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No businesses yet</p>
                </div>
            )}

            <div className="space-y-3">
                {filtered.map(biz => (
                    <div key={biz.id} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                            {biz.logo_url ? <img src={biz.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <Store className="w-5 h-5 text-primary-400 flex-shrink-0" />}
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{biz.name}</p>
                                <p className="text-xs text-gray-400">{biz.category || 'Uncategorized'} · /business/{biz.slug}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${biz.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {biz.is_published ? 'published' : 'hidden'}
                            </span>
                            <button onClick={() => togglePublish(biz)} title={biz.is_published ? 'Hide from directory' : 'Publish'} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg">
                                {biz.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button onClick={() => openEdit(biz)} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <a href={`/business/${biz.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <button onClick={() => remove(biz)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // ── EDITOR VIEW ──
    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
                <button onClick={() => setView('list')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Business' : 'Add Business'}</h2>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={label}>Business Name</label><input className={input} value={form.name} onChange={e => set('name', e.target.value)} /></div>
                    <div><label className={label}>Business Name (Gujarati)</label><GujaratiInput className={input} placeholder="Type phonetically" value={form.name_gu} onChange={val => set('name_gu', val)} /></div>
                </div>
                <div><label className={label}>Category</label><input className={input} placeholder="e.g. Retail, Farming, Handicrafts" value={form.category} onChange={e => set('category', e.target.value)} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={label}>Description</label><textarea rows={3} className={input + ' resize-none'} value={form.description} onChange={e => set('description', e.target.value)} /></div>
                    <div><label className={label}>Description (Gujarati)</label><GujaratiTextarea rows={3} className={input + ' resize-none'} placeholder="Type phonetically" value={form.description_gu} onChange={val => set('description_gu', val)} /></div>
                </div>
                <div><label className={label}>Owner Name</label><input className={input} value={form.owner_name} onChange={e => set('owner_name', e.target.value)} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={label}>Phone</label><input className={input} value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
                    <div><label className={label}>Email</label><input className={input} value={form.email} onChange={e => set('email', e.target.value)} /></div>
                </div>
                <div><label className={label}>Address</label><input className={input} value={form.address} onChange={e => set('address', e.target.value)} /></div>
                <div><label className={label}>Website</label><input className={input} placeholder="https://…" value={form.website} onChange={e => set('website', e.target.value)} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className={label}>Logo</label><ImagePicker url={form.logo_url} onChange={url => set('logo_url', url)} uploadPath="/business/upload-logo" fieldName="logo" /></div>
                    <div><label className={label}>Cover Image</label><ImagePicker url={form.cover_url} onChange={url => set('cover_url', url)} uploadPath="/business/upload-cover" fieldName="cover" /></div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer w-fit">
                    <input type="checkbox" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} className="accent-primary-500" />
                    <span className="text-sm font-medium text-gray-700">Published (visible in the public directory)</span>
                </label>
            </div>

            {/* Products / Portfolio */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">Products & Portfolio</h3>
                    <button onClick={addProduct} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg">
                        <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                </div>
                {products.length === 0 && <p className="text-sm text-gray-400">No products yet — add one to build this business's portfolio.</p>}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={products.map(p => p._key)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2">
                            {products.map(p => (
                                <SortableProductRow key={p._key} product={p} onChange={(patch) => updateProduct(p._key, patch)} onDelete={() => deleteProduct(p._key)} />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>

            {/* Custom Tabs — Page-Builder-style extra tabs on this business's profile */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-800 flex items-center gap-2"><Layout className="w-4 h-4 text-primary-500" /> Custom Tabs</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Design extra tabs (Our Story, Gallery, etc.) with the same block editor as the Page Builder</p>
                    </div>
                    {editingId && (
                        <button onClick={() => setTabModal({ tabId: null })} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg">
                            <Plus className="w-3.5 h-3.5" /> Add Tab
                        </button>
                    )}
                </div>
                {!editingId && <p className="text-sm text-gray-400">Save this business first, then you can add custom tabs.</p>}
                {editingId && tabs.length === 0 && <p className="text-sm text-gray-400">No custom tabs yet.</p>}
                {editingId && tabs.length > 0 && (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTabDragEnd}>
                        <SortableContext items={tabs.map(t => t.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {tabs.map(t => (
                                    <SortableTabRow key={t.id} tab={t} onEdit={() => setTabModal({ tabId: t.id })} onDelete={() => deleteTab(t)} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <div className="flex gap-3">
                <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving…' : 'Save Business'}
                </button>
                <button onClick={() => setView('list')} className="border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50">
                    Cancel
                </button>
            </div>

            {tabModal && (
                <BusinessTabEditorModal
                    businessId={editingId}
                    tabId={tabModal.tabId}
                    onClose={() => setTabModal(null)}
                    onSaved={() => fetchTabs(editingId)}
                />
            )}
        </div>
    );
};

export default BusinessDirectoryAdmin;
