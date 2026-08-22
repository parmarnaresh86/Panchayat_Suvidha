import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Card from '../components/Card';

const getDefaultFacilitiesModuleData = (moduleId) => {
    if (moduleId === 'pgvcl-electric-service') {
        return {
            basicInfo: {
                electricityOfficeName: '',
                helplineNumber: '',
                officeAddress: ''
            },
            billPayment: {
                redirectUrl: 'https://www.pgvcl.com',
                lastPaymentStatus: ''
            }
        };
    }

    if (moduleId === 'st-bus-timetable') {
        return {
            busRoutes: []
        };
    }

    if (moduleId === 'water-supply') {
        return {
            supplySchedule: [],
            complaints: {
                reportWaterIssueInfo: '',
                leakageComplaintInfo: '',
                complaintLink: ''
            },
            contact: {
                waterDepartmentContact: ''
            }
        };
    }

    if (moduleId === 'health-center') {
        return {
            basicInfo: {
                healthCenterName: '',
                doctorName: '',
                contactNumber: ''
            },
            services: {
                opdTiming: '',
                emergencyServices: '',
                ambulance108: ''
            }
        };
    }

    return {};
};

const moduleMeta = {
    'pgvcl-electric-service': {
        title: 'PGVCL (વીજ સેવા)',
        tabs: [
            { id: 'basic', label: 'Basic Info' },
            { id: 'bill-payment', label: 'Bill Payment' }
        ]
    },
    'st-bus-timetable': {
        title: 'એસ.ટી. બસ સમયપત્રક',
        tabs: [
            { id: 'routes', label: 'Bus Routes' }
        ]
    },
    'water-supply': {
        title: 'પાણી પુરવઠો',
        tabs: [
            { id: 'schedule', label: 'Supply Schedule' },
            { id: 'complaints', label: 'Complaints' },
            { id: 'contact', label: 'Contact' }
        ]
    },
    'health-center': {
        title: 'આરોગ્ય કેન્દ્ર',
        tabs: [
            { id: 'basic', label: 'Basic Info' },
            { id: 'services', label: 'Services' }
        ]
    }
};

const EditableTable = ({ columns, rows, onAdd, onRemove, onChange }) => (
    <div className="space-y-3">
        <div className="flex justify-end">
            <button
                type="button"
                onClick={onAdd}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
            >
                Add Row
            </button>
        </div>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} className="px-3 py-3 text-left font-bold text-slate-700">
                                {column.label}
                            </th>
                        ))}
                        <th className="px-3 py-3 text-left font-bold text-slate-700">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {!rows?.length ? (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-3 py-4 text-center text-gray-600">
                                No rows yet.
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => (
                            <tr key={row.id} className="border-t border-slate-100">
                                {columns.map((column) => (
                                    <td key={column.key} className="px-3 py-2 align-top min-w-[150px]">
                                        <input
                                            type={column.inputType || 'text'}
                                            value={row[column.key] || ''}
                                            onChange={(e) => onChange(row.id, column.key, e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                        />
                                    </td>
                                ))}
                                <td className="px-3 py-2 align-top">
                                    <button
                                        type="button"
                                        onClick={() => onRemove(row.id)}
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
    </div>
);

const FacilitiesModuleAdmin = ({ moduleId }) => {
    const meta = moduleMeta[moduleId];
    const [data, setData] = useState(getDefaultFacilitiesModuleData(moduleId));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(meta?.tabs?.[0]?.id || '');

    useEffect(() => {
        let mounted = true;

        axios
            .get(`/facilities/modules/${moduleId}`)
            .then((res) => {
                if (!mounted) return;
                setData({ ...getDefaultFacilitiesModuleData(moduleId), ...(res.data || {}) });
            })
            .catch((error) => {
                console.error('Failed to fetch facilities module:', error);
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [moduleId]);

    if (!meta) {
        return (
            <Card className="p-6">
                <div className="text-red-600 font-semibold">Facilities module not found.</div>
            </Card>
        );
    }

    const updateRootField = (rootKey, key, value) => {
        setData((prev) => ({
            ...prev,
            [rootKey]: {
                ...(prev[rootKey] || {}),
                [key]: value
            }
        }));
    };

    const addRow = (arrayKey, template, prefix) => {
        setData((prev) => ({
            ...prev,
            [arrayKey]: [...(Array.isArray(prev[arrayKey]) ? prev[arrayKey] : []), { id: `${prefix}-${Date.now()}`, ...template }]
        }));
    };

    const updateRow = (arrayKey, rowId, key, value) => {
        setData((prev) => ({
            ...prev,
            [arrayKey]: (Array.isArray(prev[arrayKey]) ? prev[arrayKey] : []).map((row) =>
                row.id === rowId ? { ...row, [key]: value } : row
            )
        }));
    };

    const removeRow = (arrayKey, rowId) => {
        setData((prev) => ({
            ...prev,
            [arrayKey]: (Array.isArray(prev[arrayKey]) ? prev[arrayKey] : []).filter((row) => row.id !== rowId)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`/facilities/modules/${moduleId}/update`, data);
            alert('Facilities module details saved successfully!');
        } catch (error) {
            console.error('Failed to save facilities module:', error);
            alert('Failed to save details.');
        } finally {
            setSaving(false);
        }
    };

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
                    <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Facilities Module</div>
                    <h2 className="text-2xl font-extrabold text-blue-700">{meta.title}</h2>
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
                    {meta.tabs.map((tab) => (
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

            {moduleId === 'pgvcl-electric-service' && activeTab === 'basic' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Electricity Office Name</label>
                            <input
                                type="text"
                                value={data.basicInfo?.electricityOfficeName || ''}
                                onChange={(e) => updateRootField('basicInfo', 'electricityOfficeName', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Helpline Number</label>
                            <input
                                type="text"
                                value={data.basicInfo?.helplineNumber || ''}
                                onChange={(e) => updateRootField('basicInfo', 'helplineNumber', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Office Address</label>
                            <input
                                type="text"
                                value={data.basicInfo?.officeAddress || ''}
                                onChange={(e) => updateRootField('basicInfo', 'officeAddress', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                    </div>
                </Card>
            ) : null}

            {moduleId === 'pgvcl-electric-service' && activeTab === 'bill-payment' ? (
                <Card className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Bill Payment</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Redirect URL (PGVCL Website)</label>
                        <input
                            type="text"
                            value={data.billPayment?.redirectUrl || ''}
                            onChange={(e) => updateRootField('billPayment', 'redirectUrl', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Last Payment Status</label>
                        <input
                            type="text"
                            value={data.billPayment?.lastPaymentStatus || ''}
                            onChange={(e) => updateRootField('billPayment', 'lastPaymentStatus', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>
                </Card>
            ) : null}

            {moduleId === 'st-bus-timetable' && activeTab === 'routes' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Bus Routes</h3>
                    <EditableTable
                        columns={[
                            { key: 'from', label: 'From' },
                            { key: 'to', label: 'To' },
                            { key: 'busTime', label: 'Bus Time' },
                            { key: 'busType', label: 'Bus Type' }
                        ]}
                        rows={data.busRoutes || []}
                        onAdd={() => addRow('busRoutes', { from: '', to: '', busTime: '', busType: '' }, 'route')}
                        onRemove={(id) => removeRow('busRoutes', id)}
                        onChange={(id, key, value) => updateRow('busRoutes', id, key, value)}
                    />
                </Card>
            ) : null}

            {moduleId === 'water-supply' && activeTab === 'schedule' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Supply Schedule</h3>
                    <EditableTable
                        columns={[
                            { key: 'area', label: 'Area' },
                            { key: 'timing', label: 'Water Timing' },
                            { key: 'days', label: 'Days' }
                        ]}
                        rows={data.supplySchedule || []}
                        onAdd={() => addRow('supplySchedule', { area: '', timing: '', days: '' }, 'schedule')}
                        onRemove={(id) => removeRow('supplySchedule', id)}
                        onChange={(id, key, value) => updateRow('supplySchedule', id, key, value)}
                    />
                </Card>
            ) : null}

            {moduleId === 'water-supply' && activeTab === 'complaints' ? (
                <Card className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Complaints</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Report Water Issue</label>
                        <input
                            type="text"
                            value={data.complaints?.reportWaterIssueInfo || ''}
                            onChange={(e) => updateRootField('complaints', 'reportWaterIssueInfo', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Leakage Complaint</label>
                        <input
                            type="text"
                            value={data.complaints?.leakageComplaintInfo || ''}
                            onChange={(e) => updateRootField('complaints', 'leakageComplaintInfo', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Complaint Link</label>
                        <input
                            type="text"
                            value={data.complaints?.complaintLink || ''}
                            onChange={(e) => updateRootField('complaints', 'complaintLink', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>
                </Card>
            ) : null}

            {moduleId === 'water-supply' && activeTab === 'contact' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Water Department Contact</h3>
                    <input
                        type="text"
                        value={data.contact?.waterDepartmentContact || ''}
                        onChange={(e) => updateRootField('contact', 'waterDepartmentContact', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2"
                    />
                </Card>
            ) : null}

            {moduleId === 'health-center' && activeTab === 'basic' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Health center name</label>
                            <input
                                type="text"
                                value={data.basicInfo?.healthCenterName || ''}
                                onChange={(e) => updateRootField('basicInfo', 'healthCenterName', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Doctor name</label>
                            <input
                                type="text"
                                value={data.basicInfo?.doctorName || ''}
                                onChange={(e) => updateRootField('basicInfo', 'doctorName', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Contact number</label>
                            <input
                                type="text"
                                value={data.basicInfo?.contactNumber || ''}
                                onChange={(e) => updateRootField('basicInfo', 'contactNumber', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                    </div>
                </Card>
            ) : null}

            {moduleId === 'health-center' && activeTab === 'services' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">OPD timing</label>
                            <input
                                type="text"
                                value={data.services?.opdTiming || ''}
                                onChange={(e) => updateRootField('services', 'opdTiming', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Emergency services</label>
                            <input
                                type="text"
                                value={data.services?.emergencyServices || ''}
                                onChange={(e) => updateRootField('services', 'emergencyServices', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">108 ambulance</label>
                            <input
                                type="text"
                                value={data.services?.ambulance108 || ''}
                                onChange={(e) => updateRootField('services', 'ambulance108', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                    </div>
                </Card>
            ) : null}
        </div>
    );
};

export default FacilitiesModuleAdmin;
