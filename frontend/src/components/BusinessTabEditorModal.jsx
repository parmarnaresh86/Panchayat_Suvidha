import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import axios from '../api/axios';
import BasicBlockEditor from './pagebuilder/BasicBlockEditor';

// Full-screen editor for one Business Directory tab (title + block content).
// tabId === null means creating a new tab.
const BusinessTabEditorModal = ({ businessId, tabId, onClose, onSaved }) => {
    const [title, setTitle] = useState('');
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(!!tabId);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!tabId) return;
        axios.get(`/business/admin/${businessId}/tabs/${tabId}`)
            .then(res => {
                setTitle(res.data.title || '');
                setBlocks(Array.isArray(res.data.content_json) ? res.data.content_json : []);
            })
            .finally(() => setLoading(false));
    }, [businessId, tabId]);

    const save = async () => {
        if (!title.trim()) { alert('Tab title is required'); return; }
        setSaving(true);
        try {
            if (tabId) {
                await axios.put(`/business/admin/${businessId}/tabs/${tabId}`, { title, content_json: blocks });
            } else {
                await axios.post(`/business/admin/${businessId}/tabs`, { title, content_json: blocks });
            }
            onSaved();
            onClose();
        } catch (e) {
            alert(e.response?.data?.error || 'Failed to save tab');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-900">{tabId ? 'Edit Tab' : 'New Tab'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                </div>

                {loading ? (
                    <p className="p-6 text-sm text-gray-400">Loading…</p>
                ) : (
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Tab Title</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Our Story, Gallery, Certifications"
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                        </div>
                        <BasicBlockEditor blocks={blocks} onChange={setBlocks} />
                    </div>
                )}

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
                    <button
                        onClick={save}
                        disabled={saving || loading}
                        className="inline-flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving…' : 'Save Tab'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusinessTabEditorModal;
