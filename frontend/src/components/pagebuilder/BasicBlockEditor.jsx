import { useState } from 'react';
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash2, Edit2, GripVertical, X } from 'lucide-react';
import BlockRenderer from './BlockRenderer';

// A smaller, reusable version of the Page Builder's block editor, scoped to
// the generic content blocks only (no village-wide widgets like panchayat
// members/census — those don't make sense on e.g. a business profile tab).
// Used by the Page Builder itself would be a bigger refactor; for now this
// powers Business Directory tabs.

const PALETTE = [
    { type: 'heading',  label: 'Heading',  icon: '𝐇' },
    { type: 'text',     label: 'Text',     icon: '¶' },
    { type: 'button',   label: 'Button',   icon: '⬛' },
    { type: 'image',    label: 'Image',    icon: '🖼' },
    { type: 'card',     label: 'Card',     icon: '🃏' },
    { type: 'divider',  label: 'Divider',  icon: '—' },
    { type: 'spacer',   label: 'Spacer',   icon: '↕' },
    { type: 'alert',    label: 'Alert',    icon: '⚠' },
    { type: 'html',     label: 'HTML/Embed', icon: '</>' },
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
        case 'html':     return { html: '' };
        default:         return {};
    }
};

const newBlock = (type) => ({ id: `block-${Date.now()}-${Math.random().toString(36).slice(2)}`, type, props: defaultProps(type) });

const SortableBlock = ({ block, selected, onSelect, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onSelect(block.id)}
            className={`group relative rounded-xl border-2 transition-all duration-150 cursor-pointer
                ${selected ? 'border-primary-400 shadow-md shadow-primary-100' : 'border-transparent hover:border-gray-200'}`}
        >
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                <button {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                </button>
            </div>
            {selected && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                    className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
            <div className="p-3"><BlockRenderer block={block} /></div>
        </div>
    );
};

const PropsEditor = ({ block, onChange }) => {
    if (!block) return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2 p-6">
            <Edit2 className="w-8 h-8 opacity-30" />
            <p>Select a block to edit its properties</p>
        </div>
    );

    const p = block.props;
    const set = (key, val) => onChange({ ...block, props: { ...p, [key]: val } });

    const field = (fieldLabel, key, type = 'text', extra = {}) => (
        <div key={key} className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{fieldLabel}</label>
            {type === 'textarea' ? (
                <textarea rows={extra.rows || 3} value={p[key] ?? ''} onChange={e => set(key, e.target.value)}
                    className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none ${extra.mono ? 'font-mono' : ''}`} />
            ) : type === 'select' ? (
                <select value={p[key] ?? ''} onChange={e => set(key, e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300">
                    {extra.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : type === 'checkbox' ? (
                <input type="checkbox" checked={!!p[key]} onChange={e => set(key, e.target.checked)} className="accent-primary-500" />
            ) : (
                <input type={type} value={p[key] ?? ''} onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300" />
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
        html: [
            field('HTML Code', 'html', 'textarea', { rows: 10, mono: true }),
            <p key="html-warning" className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-2">
                ⚠️ This renders directly on the business's page, exactly as pasted. Only paste code from sources you trust.
            </p>,
        ],
    };

    return (
        <div className="p-4 space-y-4 overflow-y-auto h-full">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="text-xs font-bold tracking-widest text-primary-500 uppercase">{block.type}</span>
            </div>
            {(fields[block.type] || []).map((f, i) => <div key={i}>{f}</div>)}
        </div>
    );
};

// blocks/onChange: controlled block array, same shape used by Pages.content_json
const BasicBlockEditor = ({ blocks, onChange }) => {
    const [selectedId, setSelectedId] = useState(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    const addBlock = (type) => {
        const b = newBlock(type);
        onChange([...blocks, b]);
        setSelectedId(b.id);
    };
    const updateBlock = (updated) => onChange(blocks.map(b => b.id === updated.id ? updated : b));
    const deleteBlock = (id) => { onChange(blocks.filter(b => b.id !== id)); setSelectedId(null); };
    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIdx = blocks.findIndex(b => b.id === active.id);
        const newIdx = blocks.findIndex(b => b.id === over.id);
        onChange(arrayMove(blocks, oldIdx, newIdx));
    };

    const selectedBlock = blocks.find(b => b.id === selectedId);

    return (
        <div className="flex h-[60vh] border border-gray-200 rounded-2xl overflow-hidden">
            <div className="w-44 bg-white border-r border-gray-100 flex-shrink-0 overflow-y-auto">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-3 pt-3 pb-2">Blocks</p>
                <div className="px-2 pb-3 space-y-1">
                    {PALETTE.map(({ type, label: l, icon }) => (
                        <button key={type} onClick={() => addBlock(type)}
                            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors text-left">
                            <span className="text-base w-5 text-center">{icon}</span>{l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 min-h-64 p-6">
                    {blocks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-300 border-2 border-dashed border-gray-200 rounded-xl">
                            <Plus className="w-8 h-8 mb-2" />
                            <p className="text-sm font-medium">Add a block from the left panel</p>
                        </div>
                    )}
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2 pl-8">
                                {blocks.map(block => (
                                    <SortableBlock key={block.id} block={block} selected={selectedId === block.id} onSelect={setSelectedId} onDelete={deleteBlock} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            </div>

            <div className="w-60 bg-white border-l border-gray-100 flex-shrink-0 overflow-hidden flex flex-col">
                <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase px-3 pt-3 pb-2 flex-shrink-0">Properties</p>
                <div className="flex-1 overflow-y-auto">
                    <PropsEditor block={selectedBlock} onChange={updateBlock} />
                </div>
                {selectedBlock && (
                    <div className="p-3 border-t border-gray-100 flex-shrink-0">
                        <button onClick={() => deleteBlock(selectedId)} className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2 rounded-lg text-sm font-medium transition-colors">
                            <Trash2 className="w-4 h-4" /> Remove Block
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BasicBlockEditor;
