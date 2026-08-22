import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import Card from '../components/Card';
import { getDefaultEducationModuleData, getEducationModuleConfig } from '../data/educationModulesConfig';

const formatDate = (value) => {
    if (!value) return '-';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const EducationModulePage = ({ moduleId }) => {
    const config = getEducationModuleConfig(moduleId);
    const [data, setData] = useState(getDefaultEducationModuleData(moduleId));
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        let mounted = true;

        axios
            .get(`/education/modules/${moduleId}`)
            .then((res) => {
                if (!mounted) return;
                setData({ ...getDefaultEducationModuleData(moduleId), ...(res.data || {}) });
            })
            .catch(() => {
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

    const records = Array.isArray(data.records) ? data.records : [];
    const announcements = useMemo(() => {
        const list = Array.isArray(data.announcements) ? [...data.announcements] : [];
        return list.sort((a, b) => String(b?.date || '').localeCompare(String(a?.date || '')));
    }, [data.announcements]);

    if (!config) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-6">
                    <div className="text-red-600 font-semibold">Education module not found.</div>
                </Card>
            </div>
        );
    }

    const tabs = [
        { id: 'basic', label: 'Basic Information' },
        { id: 'records', label: config.recordsTitle },
        { id: 'announcements', label: config.announcementsTitle }
    ];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700">{config.titleGu}</h1>
                    <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                </div>
                <Link to="/services/education" className="text-blue-700 font-semibold hover:underline">
                    Back to Education
                </Link>
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

            {loading ? (
                <Card className="p-6">
                    <div className="text-gray-600 font-semibold">Loading details...</div>
                </Card>
            ) : null}

            {!loading && activeTab === 'basic' ? (
                <>
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{config.basicInfoTitle}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {config.basicFields.map((field) => (
                                <div key={field.key} className="rounded-xl border border-slate-200 bg-white p-4">
                                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                        {field.label}
                                    </div>
                                    <div className="text-base font-semibold text-gray-900 mt-2 break-words">
                                        {data.basicInfo?.[field.key] || '-'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {config.showMap ? (
                        <Card className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">{config.mapTitle}</h2>
                            {data.map?.embedUrl ? (
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                    <iframe
                                        title={`${config.title} map`}
                                        src={data.map.embedUrl}
                                        width="100%"
                                        height="360"
                                        style={{ border: 0 }}
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-600">Map location is not added yet.</div>
                            )}
                            {data.map?.locationUrl ? (
                                <a
                                    href={data.map.locationUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-block mt-4 text-blue-700 font-semibold hover:underline"
                                >
                                    Open in Google Maps
                                </a>
                            ) : null}
                        </Card>
                    ) : null}
                </>
            ) : null}

            {!loading && activeTab === 'records' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{config.recordsTitle}</h2>
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
                                </tr>
                            </thead>
                            <tbody>
                                {records.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={config.recordsColumns.length + (config.recordsPhotoKey ? 1 : 0)}
                                            className="px-3 py-4 text-center text-gray-600"
                                        >
                                            No records available.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((record) => (
                                        <tr key={record.id} className="border-t border-slate-100">
                                            {config.recordsPhotoKey ? (
                                                <td className="px-3 py-2">
                                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                                                        {record[config.recordsPhotoKey] ? (
                                                            <img
                                                                src={record[config.recordsPhotoKey]}
                                                                alt={record.name || 'Profile'}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full text-[10px] text-gray-500 flex items-center justify-center">
                                                                NA
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            ) : null}
                                            {config.recordsColumns.map((column) => (
                                                <td key={column.key} className="px-3 py-2 text-gray-800">
                                                    {column.inputType === 'date'
                                                        ? formatDate(record[column.key])
                                                        : record[column.key] || '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            ) : null}

            {!loading && activeTab === 'announcements' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{config.announcementsTitle}</h2>
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-3 py-3 text-left font-bold text-slate-700">Date</th>
                                    <th className="px-3 py-3 text-left font-bold text-slate-700">Type</th>
                                    <th className="px-3 py-3 text-left font-bold text-slate-700">Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                {announcements.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-3 py-4 text-center text-gray-600">
                                            No announcements available.
                                        </td>
                                    </tr>
                                ) : (
                                    announcements.map((notice) => (
                                        <tr key={notice.id} className="border-t border-slate-100">
                                            <td className="px-3 py-2 text-gray-700">{formatDate(notice.date)}</td>
                                            <td className="px-3 py-2 text-gray-800 font-semibold">{notice.type || '-'}</td>
                                            <td className="px-3 py-2 text-gray-700">{notice.message || '-'}</td>
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

export default EducationModulePage;
