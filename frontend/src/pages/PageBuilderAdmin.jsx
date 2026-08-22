import { useState, useEffect } from 'react';
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Plus, Trash2, Edit2, Eye, Globe, FileText, GripVertical,
    ChevronLeft, Save, ExternalLink, X, Check,
} from 'lucide-react';
import axios from '../api/axios';
import BlockRenderer from '../components/pagebuilder/BlockRenderer';

// ── Block palette definition ──────────────────────────────────
const PALETTE = [
    { type: 'heading',  label: 'Heading',  icon: '𝐇' },
    { type: 'text',     label: 'Text',     icon: '¶' },
    { type: 'button',   label: 'Button',   icon: '⬛' },
    { type: 'image',    label: 'Image',    icon: '🖼' },
    { type: 'card',     label: 'Card',     icon: '🃏' },
    { type: 'divider',  label: 'Divider',  icon: '—' },
    { type: 'spacer',   label: 'Spacer',   icon: '↕' },
    { type: 'alert',    label: 'Alert',    icon: '⚠' },
];

const defaultProps = (type) => {
    switch (type) {
        case 'heading':  return { text: 'New Heading', fontSize: '2rem', color: '#111', align: 'left' };
        case 'text':     return { text: 'Write your content here...', fontSize: '1rem', color: '#444', align: 'left' };
        case 'button':   return { text: 'Click Here', url: '#', bg: '#f97316', color: '#fff', align: 'left' };
        case 'image':    return { src: '', alt: '', width: '100%', rounded: true };
        case 'card':     return { title: 'Card Title', text: 'Card description', bg: '#fff' };
        case 'divider':  return { color: '#e5e7eb', thickness: 1 };
        case 'spacer':   return { height: 32 };
        case 'alert':    return { text: 'Important notice', bg: '#fff7ed', border: '#fed7aa', color: '#9a3412' };
        default:         return {};
    }
};

const newBlock = (type) => ({ id: `block-${Date.now()}-${Math.random().toString(36).slice(2)}`, type, props: defaultProps(type) });

// ── Sortable block wrapper ────────────────────────────────────
const SortableBlock = ({ block, selected, onSelect, onDelete, preview }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => !preview && onSelect(block.id)}
            className={`group relative rounded-xl border-2 transition-all duration-150 cursor-pointer
                ${selected && !preview ? 'border-orange-400 shadow-md shadow-orange-100' : 'border-transparent hover:border-gray-200'}
                ${preview ? 'border-transparent cursor-default' : ''}
            `}
        >
            {!preview && (
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    <button {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4" />
                    </button>
                </div>
            )}
            {!preview && selected && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                    className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
            <div className="p-3">
                <BlockRenderer block={block} />
            </div>
        </div>
    );
};

// ── Props editor panel ────────────────────────────────────────
const PropsEditor = ({ block, onChange }) => {
    if (!block) return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2 p-6">
            <Edit2 className="w-8 h-8 opacity-30" />
            <p>Select a block to edit its properties</p>
        </div>
    );

    const p = block.props;
    const set = (key, val) => onChange({ ...block, props: { ...p, [key]: val } });

    const field = (label, key, type = 'text', extra = {}) => (
        <div key={key} className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
            {type === 'textarea' ? (
                <textarea
                    rows={3}
                    value={p[key] ?? ''}
                    onChange={e => set(key, e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                />
            ) : type === 'select' ? (
                <select
                    value={p[key] ?? ''}
                    onChange={e => set(key, e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                    {extra.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : type === 'checkbox' ? (
                <input type="checkbox" checked={!!p[key]} onChange={e => set(key, e.target.checked)} className="accent-orange-500" />
            ) : (
                <input
                    type={type}
                    value={p[key] ?? ''}
                    onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
            )}
        </div>
    );

    const alignOpts = { options: ['left', 'center', 'right'] };

    const fields = {
        heading: [field('Text', 'text', 'textarea'), field('Font Size', 'fontSize'), field('Color', 'color', 'color'), field('Align', 'align', 'select', alignOpts)],
        text:    [field('Content', 'text', 'textarea'), field('Font Size', 'fontSize'), field('Color', 'color', 'color'), field('Align', 'align', 'select', alignOpts)],
        button:  [field('Label', 'text'), field('URL', 'url'), field('Background', 'bg', 'color'), field('Text Color', 'color', 'color'), field('Align', 'align', 'select', alignOpts)],
        image:   [field('Image URL', 'src'), field('Alt Text', 'alt'), field('Width', 'width'), field('Rounded', 'rounded', 'checkbox')],
        card:    [field('Title', 'title'), field('Content', 'text', 'textarea'), field('Background', 'bg', 'color')],
        divider: [field('Color', 'color', 'color'), field('Thickness (px)', 'thickness', 'number')],
        spacer:  [field('Height (px)', 'height', 'number')],
        alert:   [field('Message', 'text', 'textarea'), field('Background', 'bg', 'color'), field('Border Color', 'border', 'color'), field('Text Color', 'color', 'color')],
    };

    return (
        <div className="p-4 space-y-4 overflow-y-auto h-full">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="text-xs font-bold tracking-widest text-orange-500 uppercase">{block.type}</span>
            </div>
            {(fields[block.type] || []).map((f, i) => <div key={i}>{f}</div>)}
        </div>
    );
};

// ── Main component ────────────────────────────────────────────
const PageBuilderAdmin = () => {
    const [pages, setPages] = useState([]);
    const [view, setView] = useState('list'); // 'list' | 'editor'
    const [editingPage, setEditingPage] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [preview, setPreview] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newForm, setNewForm] = useState({ title: '', slug: '', showInNav: false });

    // Navbar pages stored in localStorage so Navbar reads them without a DB call
    const syncNavPages = (allPages) => {
        const navPages = allPages
            .filter(p => p.status === 'published' && p.showInNav)
            .map(p => ({ title: p.title, slug: p.slug }));
        localStorage.setItem('navbarPages', JSON.stringify(navPages));
        window.dispatchEvent(new Event('navbar-pages-change'));
    };

    const toggleNavbar = (pageId, val) => {
        const updated = pages.map(p => p.id === pageId ? { ...p, showInNav: val } : p);
        setPages(updated);
        syncNavPages(updated);
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    useEffect(() => { fetchPages(); }, []);

    const fetchPages = async () => {
        try {
            const res = await axios.get('/pages');
            // Restore showInNav from localStorage
            const navSlugs = new Set(
                JSON.parse(localStorage.getItem('navbarPages') || '[]').map(p => p.slug)
            );
            const withNav = res.data.map(p => ({ ...p, showInNav: navSlugs.has(p.slug) }));
            setPages(withNav);
        } catch { /* DB may not have table yet */ }
    };

    const openEditor = async (page) => {
        try {
            const res = await axios.get(`/pages/${page.slug}`);
            setEditingPage(res.data);
            setBlocks(Array.isArray(res.data.content_json) ? res.data.content_json : []);
        } catch {
            setEditingPage(page);
            setBlocks([]);
        }
        setSelectedId(null);
        setPreview(false);
        setView('editor');
    };

    const createPage = async () => {
        if (!newForm.title || !newForm.slug) return;
        try {
            const res = await axios.post('/pages', { title: newForm.title, slug: newForm.slug, content_json: [], status: 'draft' });
            const newPage = { ...res.data, showInNav: newForm.showInNav };
            const updated = [newPage, ...pages];
            setPages(updated);
            syncNavPages(updated);
            setShowNewForm(false);
            setNewForm({ title: '', slug: '', showInNav: false });
            openEditor(newPage);
        } catch (e) {
            alert(e.response?.data?.error || 'Failed to create page');
        }
    };

    const deletePage = async (id) => {
        if (!confirm('Delete this page?')) return;
        await axios.delete(`/pages/${id}`);
        setPages(p => p.filter(x => x.id !== id));
    };

    const savePage = async (status) => {
        setSaving(true);
        try {
            await axios.put(`/pages/${editingPage.id}`, {
                title: editingPage.title,
                slug: editingPage.slug,
                content_json: blocks,
                status: status || editingPage.status,
            });
            const updatedPage = { ...editingPage, status: status || editingPage.status };
            setEditingPage(updatedPage);
            const updatedPages = pages.map(p => p.id === editingPage.id ? { ...p, ...updatedPage } : p);
            setPages(updatedPages);
            syncNavPages(updatedPages);
        } catch (e) {
            alert('Save failed');
        } finally { setSaving(false); }
    };

    const addBlock = (type) => {
        const b = newBlock(type);
        setBlocks(prev => [...prev, b]);
        setSelectedId(b.id);
    };

    const updateBlock = (updated) => {
        setBlocks(prev => prev.map(b => b.id === updated.id ? updated : b));
    };

    const deleteBlock = (id) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        setSelectedId(null);
    };

    const handleDragEnd = ({ active, over }) => {
        if (active.id !== over?.id) {
            setBlocks(prev => {
                const oldIdx = prev.findIndex(b => b.id === active.id);
                const newIdx = prev.findIndex(b => b.id === over.id);
                return arrayMove(prev, oldIdx, newIdx);
            });
        }
    };

    const selectedBlock = blocks.find(b => b.id === selectedId);

    // ── LIST VIEW ──
    if (view === 'list') return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Pages</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Create and manage custom pages with the drag-and-drop builder</p>
                </div>
                <button
                    onClick={() => setShowNewForm(true)}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                >
                    <Plus className="w-4 h-4" /> New Page
                </button>
            </div>

            {showNewForm && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <h3 className="font-semibold text-gray-800">Create New Page</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Page Title</label>
                            <input
                                type="text"
                                placeholder="About Sayla"
                                value={newForm.title}
                                onChange={e => {
                                    const title = e.target.value;
                                    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                    setNewForm({ title, slug });
                                }}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">URL Slug</label>
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-r border-gray-200">/p/</span>
                                <input
                                    type="text"
                                    value={newForm.slug}
                                    onChange={e => setNewForm(f => ({ ...f, slug: e.target.value }))}
                                    className="flex-1 px-3 py-2 text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Show in Navbar toggle */}
                    <label className="flex items-center gap-3 cursor-pointer w-fit">
                        <div className={`relative w-10 h-5 rounded-full transition-colors ${newForm.showInNav ? 'bg-orange-500' : 'bg-gray-200'}`}
                            onClick={() => setNewForm(f => ({ ...f, showInNav: !f.showInNav }))}>
                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${newForm.showInNav ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Show in Navbar</span>
                        <span className="text-xs text-gray-400">(visible to all users after publish)</span>
                    </label>
                    <div className="flex gap-3">
                        <button onClick={createPage} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors">
                            Create & Edit
                        </button>
                        <button onClick={() => setShowNewForm(false)} className="border border-gray-200 text-gray-600 px-5 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {pages.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No pages yet</p>
                        <p className="text-sm mt-1">Create your first page to get started</p>
                    </div>
                )}
                {pages.map(page => (
                    <div key={page.id} className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-5 h-5 text-orange-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{page.title}</p>
                                <p className="text-xs text-gray-400">/p/{page.slug}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${page.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {page.status}
                            </span>
                            {/* Show in Navbar toggle */}
                            <label className="flex items-center gap-1.5 cursor-pointer" title="Show in Navbar">
                                <div
                                    className={`relative w-8 h-4 rounded-full transition-colors ${page.showInNav && page.status === 'published' ? 'bg-orange-500' : 'bg-gray-200'}`}
                                    onClick={() => toggleNavbar(page.id, !page.showInNav)}
                                >
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${page.showInNav && page.status === 'published' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </div>
                                <span className="text-xs text-gray-500">Navbar</span>
                            </label>
                            <button onClick={() => openEditor(page)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <button onClick={() => deletePage(page.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
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
        <div className="flex flex-col h-[calc(100vh-80px)] -m-8">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => setView('list')} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{editingPage?.title}</p>
                        <p className="text-xs text-gray-400">/p/{editingPage?.slug}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${editingPage?.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {editingPage?.status}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPreview(p => !p)}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${preview ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <Eye className="w-4 h-4" /> {preview ? 'Editing' : 'Preview'}
                    </button>
                    <button
                        onClick={() => savePage('draft')}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button
                        onClick={() => savePage('published')}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-sm"
                    >
                        <Globe className="w-4 h-4" /> {saving ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left: Block palette */}
                {!preview && (
                    <div className="w-48 bg-white border-r border-gray-100 flex-shrink-0 overflow-y-auto">
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-4 pt-4 pb-2">Blocks</p>
                        <div className="px-3 pb-4 space-y-1">
                            {PALETTE.map(({ type, label, icon }) => (
                                <button
                                    key={type}
                                    onClick={() => addBlock(type)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors text-left"
                                >
                                    <span className="text-base w-5 text-center">{icon}</span>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Center: Canvas */}
                <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 min-h-96 p-8">
                        {blocks.length === 0 && !preview && (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-300 border-2 border-dashed border-gray-200 rounded-xl">
                                <Plus className="w-10 h-10 mb-2" />
                                <p className="text-sm font-medium">Click a block from the left panel to add it</p>
                            </div>
                        )}
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2 pl-8">
                                    {blocks.map(block => (
                                        <SortableBlock
                                            key={block.id}
                                            block={block}
                                            selected={selectedId === block.id}
                                            onSelect={setSelectedId}
                                            onDelete={deleteBlock}
                                            preview={preview}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>

                {/* Right: Props panel */}
                {!preview && (
                    <div className="w-64 bg-white border-l border-gray-100 flex-shrink-0 overflow-hidden flex flex-col">
                        <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-4 pt-4 pb-2 flex-shrink-0">Properties</p>
                        <div className="flex-1 overflow-y-auto">
                            <PropsEditor
                                block={selectedBlock}
                                onChange={updateBlock}
                            />
                        </div>
                        {selectedBlock && (
                            <div className="p-3 border-t border-gray-100 flex-shrink-0">
                                <button
                                    onClick={() => { deleteBlock(selectedId); }}
                                    className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove Block
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageBuilderAdmin;
