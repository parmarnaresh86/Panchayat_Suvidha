import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Card from '../components/Card';
import { getDefaultEducationModuleData, getEducationModuleConfig } from '../data/educationModulesConfig';

const EducationModuleAdmin = ({ moduleId }) => {
    const config = getEducationModuleConfig(moduleId);
    const [data, setData] = useState(getDefaultEducationModuleData(moduleId));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [uploadingRecordId, setUploadingRecordId] = useState('');

    useEffect(() => {
        let mounted = true;

        axios
            .get(`/education/modules/${moduleId}`)
            .then((res) => {
                if (!mounted) return;
                setData({ ...getDefaultEducationModuleData(moduleId), ...(res.data || {}) });
            })
            .catch((error) => {
                console.error('Failed to fetch education module data:', error);
                if (!mounted) return;
                setData(getDefaultEducationModuleData(moduleId));
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [moduleId]);

    if (!config) {
        return (
            <Card className="p-6">
                <div className="text-red-600 font-semibold">Education module not found.</div>
            </Card>
        );
    }

    const setBasicField = (fieldKey, value) => {
        setData((prev) => ({
            ...prev,
            basicInfo: {
                ...(prev.basicInfo || {}),
                [fieldKey]: value
            }
        }));
    };

    const setMapField = (fieldKey, value) => {
        setData((prev) => ({
            ...prev,
            map: {
                ...(prev.map || {}),
                [fieldKey]: value
            }
        }));
    };

    const addRecord = () => {
        const blank = {};
        config.recordsColumns.forEach((column) => {
            blank[column.key] = '';
        });
        if (config.recordsPhotoKey) {
            blank[config.recordsPhotoKey] = '';
        }

        setData((prev) => ({
            ...prev,
            records: [...(Array.isArray(prev.records) ? prev.records : []), { id: `record-${Date.now()}`, ...blank }]
        }));
    };

    const updateRecordField = (recordId, key, value) => {
        setData((prev) => ({
            ...prev,
            records: (Array.isArray(prev.records) ? prev.records : []).map((record) =>
                record.id === recordId ? { ...record, [key]: value } : record
            )
        }));
    };

    const removeRecord = (recordId) => {
        setData((prev) => ({
            ...prev,
            records: (Array.isArray(prev.records) ? prev.records : []).filter((record) => record.id !== recordId)
        }));
    };

    const uploadRecordPhoto = async (recordId, file) => {
        if (!file || !config.recordsPhotoKey) return;
        setUploadingRecordId(recordId);

        try {
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('recordId', recordId);

            const res = await axios.post(`/education/modules/${moduleId}/upload-photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res?.data?.photo_url) {
                updateRecordField(recordId, config.recordsPhotoKey, res.data.photo_url);
            }
        } catch (error) {
            console.error('Failed to upload photo:', error);
            alert('Failed to upload photo.');
        } finally {
            setUploadingRecordId('');
        }
    };

    const addAnnouncement = () => {
        setData((prev) => ({
            ...prev,
            announcements: [
                ...(Array.isArray(prev.announcements) ? prev.announcements : []),
                { id: `notice-${Date.now()}`, date: '', type: config.announcementTypes[0] || 'Event', message: '' }
            ]
        }));
    };

    const updateAnnouncement = (noticeId, key, value) => {
        setData((prev) => ({
            ...prev,
            announcements: (Array.isArray(prev.announcements) ? prev.announcements : []).map((notice) =>
                notice.id === noticeId ? { ...notice, [key]: value } : notice
            )
        }));
    };

    const removeAnnouncement = (noticeId) => {
        setData((prev) => ({
            ...prev,
            announcements: (Array.isArray(prev.announcements) ? prev.announcements : []).filter(
                (notice) => notice.id !== noticeId
            )
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`/education/modules/${moduleId}/update`, data);
            alert('Module details saved successfully!');
        } catch (error) {
            console.error('Failed to save module details:', error);
            alert('Failed to save module details.');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Information' },
        { id: 'records', label: config.recordsTitle },
        { id: 'announcements', label: config.announcementsTitle }
    ];

    const records = Array.isArray(data.records) ? data.records : [];
    const announcements = Array.isArray(data.announcements) ? data.announcements : [];

    if (loading) {
        return (
            <Card className="p-6">
                <div className="text-gray-600 font-semibold">Loading module details...</div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">
                        Education Module
                    </div>
                    <h2 className="text-2xl font-extrabold text-blue-700">{config.titleGu}</h2>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold disabled:opacity-60"
                >
                    {saving ? 'Saving...' : 'Save All'}
                </button>
            </div>

            <Card className="p-3">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                                activeTab === tab.id
                                    ? 'bg-blue-50 border-blue-200 text-blue-800'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </Card>

            {activeTab === 'basic' ? (
                <Card className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">{config.basicInfoTitle}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {config.basicFields.map((field) => (
                            <div key={field.key} className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">{field.label}</label>
                                <input
                                    type={field.inputType || 'text'}
                                    value={data.basicInfo?.[field.key] || ''}
                                    onChange={(e) => setBasicField(field.key, e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                />
                            </div>
                        ))}
                    </div>

                    {config.showMap ? (
                        <div className="grid grid-cols-1 gap-4 pt-2">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Google Map Embed URL</label>
                                <input
                                    type="text"
                                    value={data.map?.embedUrl || ''}
                                    onChange={(e) => setMapField('embedUrl', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    placeholder="https://www.google.com/maps/embed?..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Google Map Location URL</label>
                                <input
                                    type="text"
                                    value={data.map?.locationUrl || ''}
                                    onChange={(e) => setMapField('locationUrl', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2"
                                    placeholder="https://maps.google.com/..."
                                />
                            </div>
                        </div>
                    ) : null}
                </Card>
            ) : null}

            {activeTab === 'records' ? (
                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-gray-900">{config.recordsTitle}</h3>
                        <button
                            type="button"
                            onClick={addRecord}
                            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                            Add Row
                        </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    {config.recordsPhotoKey ? (
                                        <th className="px-3 py-3 text-left font-bold text-slate-700">Photo</th>
                                    ) : null}
                                    {config.recordsColumns.map((column) => (
                                        <th key={column.key} className="px-3 py-3 text-left font-bold text-slate-700">
                                            {column.label}
                                        </th>
                                    ))}
                                    <th className="px-3 py-3 text-left font-bold text-slate-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={config.recordsColumns.length + (config.recordsPhotoKey ? 2 : 1)}
                                            className="px-3 py-4 text-center text-gray-600"
                                        >
                                            No records added yet.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record.id} className="border-t border-slate-100">
                                            {config.recordsPhotoKey ? (
                                                <td className="px-3 py-2 align-top min-w-[180px]">
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={record[config.recordsPhotoKey] || ''}
                                                            onChange={(e) =>
                                                                updateRecordField(record.id, config.recordsPhotoKey, e.target.value)
                                                            }
                                                            className="w-full border border-gray-300 rounded-lg p-2"
                                                            placeholder="Photo URL"
                                                        />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => uploadRecordPhoto(record.id, e.target.files?.[0])}
                                                            className="w-full"
                                                        />
                                                        {uploadingRecordId === record.id ? (
                                                            <div className="text-xs text-blue-600 font-semibold">Uploading...</div>
                                                        ) : null}
                                                    </div>
                                                </td>
                                            ) : null}
                                            {config.recordsColumns.map((column) => (
                                                <td key={column.key} className="px-3 py-2 align-top min-w-[140px]">
                                                    <input
                                                        type={column.inputType || 'text'}
                                                        value={record[column.key] || ''}
                                                        onChange={(e) => updateRecordField(record.id, column.key, e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg p-2"
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-3 py-2 align-top">
                                                <button
                                                    type="button"
                                                    onClick={() => removeRecord(record.id)}
                                                    className="text-red-600 hover:text-red-700 font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : null}

            {activeTab === 'announcements' ? (
                <Card className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-xl font-bold text-gray-900">{config.announcementsTitle}</h3>
                        <button
                            type="button"
                            onClick={addAnnouncement}
                            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                            Add Announcement
                        </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-3 py-3 text-left font-bold text-slate-700">Date</th>
                                    <th className="px-3 py-3 text-left font-bold text-slate-700">Type</th>
                                    <th className="px-3 py-3 text-left font-bold text-slate-700">Message</th>
                                    <th className="px-3 py-3 text-left font-bold text-slate-700">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-3 py-4 text-center text-gray-600">
                                            No announcements added yet.
                                        </td>
                                    </tr>
                                ) : (
                                    announcements.map((notice) => (
                                        <tr key={notice.id} className="border-t border-slate-100">
                                            <td className="px-3 py-2 align-top">
                                                <input
                                                    type="date"
                                                    value={notice.date || ''}
                                                    onChange={(e) => updateAnnouncement(notice.id, 'date', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg p-2"
                                                />
                                            </td>
                                            <td className="px-3 py-2 align-top">
                                                <select
                                                    value={notice.type || ''}
                                                    onChange={(e) => updateAnnouncement(notice.id, 'type', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg p-2"
                                                >
                                                    {config.announcementTypes.map((type) => (
                                                        <option key={type} value={type}>
                                                            {type}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-3 py-2 align-top min-w-[260px]">
                                                <textarea
                                                    value={notice.message || ''}
                                                    onChange={(e) => updateAnnouncement(notice.id, 'message', e.target.value)}
                                                    className="w-full border border-gray-300 rounded-lg p-2"
                                                    rows={2}
                                                />
                                            </td>
                                            <td className="px-3 py-2 align-top">
                                                <button
                                                    type="button"
                                                    onClick={() => removeAnnouncement(notice.id)}
                                                    className="text-red-600 hover:text-red-700 font-semibold"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : null}
        </div>
    );
};

export default EducationModuleAdmin;
