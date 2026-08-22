import { X, Settings2, Plus, Trash2, Type, AlignLeft, Square, Image, CreditCard, AlertCircle, Minus, ArrowUpDown } from 'lucide-react';
import { usePageEdit } from '../../context/PageEditContext';

const Field = ({ label, children }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
        {children}
    </div>
);

const TextInput = ({ value, onChange, placeholder, type = 'text' }) => (
    <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
);

const TextArea = ({ value, onChange, rows = 3 }) => (
    <textarea
        rows={rows}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
    />
);

const ColorInput = ({ value, onChange, label }) => (
    <Field label={label}>
        <div className="flex items-center gap-2">
            <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
                className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5" />
            <TextInput value={value} onChange={onChange} placeholder="#000000" />
        </div>
    </Field>
);

// Per-section editors for existing page sections
const sectionEditors = {
    banner: ({ content, update }) => (
        <>
            <Field label="Village Name"><TextInput value={content.villageName} onChange={v => update({ villageName: v })} /></Field>
            <Field label="Tagline (English)"><TextInput value={content.taglineEn} onChange={v => update({ taglineEn: v })} /></Field>
            <Field label="Tagline (Gujarati)"><TextInput value={content.taglineGu} onChange={v => update({ taglineGu: v })} /></Field>
        </>
    ),
    gallery: ({ content, update }) => (
        <>
            <Field label="Section Title (English)"><TextInput value={content.titleEn} onChange={v => update({ titleEn: v })} /></Field>
            <Field label="Section Title (Gujarati)"><TextInput value={content.titleGu} onChange={v => update({ titleGu: v })} /></Field>
        </>
    ),
    members: ({ content, update }) => (
        <>
            <Field label="Heading (English)"><TextInput value={content.headingEn} onChange={v => update({ headingEn: v })} /></Field>
            <Field label="Heading (Gujarati)"><TextInput value={content.headingGu} onChange={v => update({ headingGu: v })} /></Field>
        </>
    ),
    map: ({ content, update }) => (
        <>
            <Field label="Heading (English)"><TextInput value={content.headingEn} onChange={v => update({ headingEn: v })} /></Field>
            <Field label="Heading (Gujarati)"><TextInput value={content.headingGu} onChange={v => update({ headingGu: v })} /></Field>
        </>
    ),
    history: ({ content, update }) => (
        <>
            <Field label="History (English)"><TextArea rows={5} value={content.historyEn} onChange={v => update({ historyEn: v })} /></Field>
            <Field label="History (Gujarati)"><TextArea rows={5} value={content.historyGu} onChange={v => update({ historyGu: v })} /></Field>
        </>
    ),
    achievements: ({ content, update }) => (
        <>
            <Field label="Heading (English)"><TextInput value={content.headingEn} onChange={v => update({ headingEn: v })} /></Field>
            <Field label="Heading (Gujarati)"><TextInput value={content.headingGu} onChange={v => update({ headingGu: v })} /></Field>
        </>
    ),
    personalities: ({ content, update }) => (
        <>
            <Field label="Heading (English)"><TextInput value={content.headingEn} onChange={v => update({ headingEn: v })} /></Field>
            <Field label="Heading (Gujarati)"><TextInput value={content.headingGu} onChange={v => update({ headingGu: v })} /></Field>
        </>
    ),
    contact: ({ content, update }) => (
        <>
            <Field label="Phone"><TextInput value={content.phone} onChange={v => update({ phone: v })} /></Field>
            <Field label="Email"><TextInput value={content.email} onChange={v => update({ email: v })} /></Field>
            <Field label="Address"><TextInput value={content.address} onChange={v => update({ address: v })} /></Field>
            <Field label="Hours"><TextInput value={content.hours} onChange={v => update({ hours: v })} /></Field>
        </>
    ),
    census: ({ content, update }) => (
        <>
            <Field label="Heading (English)"><TextInput value={content.headingEn} onChange={v => update({ headingEn: v })} /></Field>
            <Field label="Heading (Gujarati)"><TextInput value={content.headingGu} onChange={v => update({ headingGu: v })} /></Field>
            <Field label="Year"><TextInput value={content.year} onChange={v => update({ year: v })} /></Field>
        </>
    ),
    // Custom block editors
    heading: ({ content, update }) => (
        <>
            <Field label="Text"><TextArea rows={2} value={content.text} onChange={v => update({ text: v })} /></Field>
            <Field label="Font Size"><TextInput value={content.fontSize} onChange={v => update({ fontSize: v })} placeholder="2rem" /></Field>
            <ColorInput label="Color" value={content.color} onChange={v => update({ color: v })} />
            <Field label="Align">
                <select value={content.align || 'left'} onChange={e => update({ align: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </Field>
        </>
    ),
    text: ({ content, update }) => (
        <>
            <Field label="Content"><TextArea rows={4} value={content.text} onChange={v => update({ text: v })} /></Field>
            <Field label="Font Size"><TextInput value={content.fontSize} onChange={v => update({ fontSize: v })} placeholder="1rem" /></Field>
            <ColorInput label="Color" value={content.color} onChange={v => update({ color: v })} />
            <Field label="Align">
                <select value={content.align || 'left'} onChange={e => update({ align: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </Field>
        </>
    ),
    button: ({ content, update }) => (
        <>
            <Field label="Label"><TextInput value={content.text} onChange={v => update({ text: v })} /></Field>
            <Field label="URL"><TextInput value={content.url} onChange={v => update({ url: v })} placeholder="https://..." /></Field>
            <ColorInput label="Background" value={content.bg} onChange={v => update({ bg: v })} />
            <ColorInput label="Text Color" value={content.color} onChange={v => update({ color: v })} />
            <Field label="Align">
                <select value={content.align || 'center'} onChange={e => update({ align: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </Field>
        </>
    ),
    image: ({ content, update }) => (
        <>
            <Field label="Image URL"><TextInput value={content.src} onChange={v => update({ src: v })} placeholder="https://..." /></Field>
            <Field label="Alt Text"><TextInput value={content.alt} onChange={v => update({ alt: v })} /></Field>
            <Field label="Width"><TextInput value={content.width} onChange={v => update({ width: v })} placeholder="100%" /></Field>
            <Field label="Rounded corners">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={!!content.rounded} onChange={e => update({ rounded: e.target.checked })} className="accent-orange-500" />
                    Enable
                </label>
            </Field>
        </>
    ),
    card: ({ content, update }) => (
        <>
            <Field label="Title"><TextInput value={content.title} onChange={v => update({ title: v })} /></Field>
            <Field label="Content"><TextArea rows={3} value={content.text} onChange={v => update({ text: v })} /></Field>
            <ColorInput label="Background" value={content.bg} onChange={v => update({ bg: v })} />
        </>
    ),
    alert: ({ content, update }) => (
        <>
            <Field label="Message"><TextArea rows={2} value={content.text} onChange={v => update({ text: v })} /></Field>
            <ColorInput label="Background" value={content.bg} onChange={v => update({ bg: v })} />
            <ColorInput label="Border Color" value={content.border} onChange={v => update({ border: v })} />
            <ColorInput label="Text Color" value={content.color} onChange={v => update({ color: v })} />
        </>
    ),
    divider: ({ content, update }) => (
        <>
            <ColorInput label="Color" value={content.color} onChange={v => update({ color: v })} />
            <Field label="Thickness (px)"><TextInput type="number" value={String(content.thickness)} onChange={v => update({ thickness: Number(v) })} /></Field>
        </>
    ),
    spacer: ({ content, update }) => (
        <Field label="Height (px)"><TextInput type="number" value={String(content.height)} onChange={v => update({ height: Number(v) })} /></Field>
    ),
};

// Block palette definition
const PALETTE = [
    { type: 'heading', label: 'Heading',  icon: Type },
    { type: 'text',    label: 'Text',     icon: AlignLeft },
    { type: 'button',  label: 'Button',   icon: Square },
    { type: 'image',   label: 'Image',    icon: Image },
    { type: 'card',    label: 'Card',     icon: CreditCard },
    { type: 'alert',   label: 'Alert',    icon: AlertCircle },
    { type: 'divider', label: 'Divider',  icon: Minus },
    { type: 'spacer',  label: 'Spacer',   icon: ArrowUpDown },
];

const EditPanel = () => {
    const { isEditMode, selectedSectionId, sections, updateSection, setSelectedSectionId, addSection, removeSection } = usePageEdit();

    if (!isEditMode) return null;

    const section = sections?.find(s => s.id === selectedSectionId);
    const update = (patch) => updateSection(selectedSectionId, patch);
    const Editor = section ? sectionEditors[section.type] : null;

    return (
        <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-72 bg-white border-l border-gray-200 shadow-xl z-40 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-orange-50">
                <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-sm text-gray-800">
                        {section ? `Edit: ${section.label}` : 'Add / Edit Blocks'}
                    </span>
                </div>
                {section && (
                    <button onClick={() => setSelectedSectionId(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Block palette — always visible at top */}
                <div className="p-3 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Block
                    </p>
                    <div className="grid grid-cols-4 gap-1.5">
                        {PALETTE.map(({ type, label, icon: Icon }) => (
                            <button
                                key={type}
                                onClick={() => addSection(type)}
                                title={`Add ${label}`}
                                className="flex flex-col items-center gap-1 p-2 rounded-xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition-all text-gray-600 hover:text-orange-600"
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-[10px] font-semibold">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Section properties */}
                <div className="p-4 space-y-4">
                    {!section ? (
                        <div className="flex flex-col items-center justify-center text-center text-gray-400 gap-3 py-8">
                            <Settings2 className="w-8 h-8 opacity-20" />
                            <p className="text-sm">Click any section on the page to edit its properties</p>
                        </div>
                    ) : (
                        <>
                            {Editor ? (
                                <Editor content={section.content} update={update} />
                            ) : (
                                <p className="text-sm text-gray-400">No editable properties for this section.</p>
                            )}

                            {/* Delete button for custom blocks */}
                            {section.isCustom && (
                                <button
                                    onClick={() => { removeSection(section.id); setSelectedSectionId(null); }}
                                    className="w-full flex items-center justify-center gap-2 mt-4 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-sm font-semibold transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" /> Remove Block
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditPanel;
