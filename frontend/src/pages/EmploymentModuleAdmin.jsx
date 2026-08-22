import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Card from '../components/Card';

const getDefaultEmploymentModuleData = (moduleId) => {
    if (moduleId === 'animal-husbandry-and-dairy') {
        return {
            basicInfo: {
                totalCattle: '',
                dairyCenters: '',
                veterinaryContact: ''
            },
            livestockDetails: []
        };
    }

    if (moduleId === 'employment-board') {
        return {
            jobListings: [],
            governmentJobs: [],
            mgnrega: {
                jobCardHolders: '',
                workStatus: '',
                paymentStatus: '',
                applyRegistrationLink: '',
                resumeFileUrl: ''
            }
        };
    }

    if (moduleId === 'market-yard') {
        return {
            marketInfo: {
                marketYardName: '',
                location: '',
                timings: ''
            },
            cropPrices: [],
            farmerListings: [],
            buyersTraders: [],
            transactions: [],
            governmentSchemes: []
        };
    }

    return {};
};

const moduleMeta = {
    'animal-husbandry-and-dairy': {
        title: 'પશુપાલન અને ડેરી',
        tabs: [
            { id: 'basic', label: 'Basic Info' },
            { id: 'livestock', label: 'Livestock Details' }
        ]
    },
    'employment-board': {
        title: 'રોજગાર બોર્ડ',
        tabs: [
            { id: 'job-listings', label: 'Job Listings' },
            { id: 'government-jobs', label: 'Government Jobs' },
            { id: 'mgnrega', label: 'MGNREGA' }
        ]
    },
    'market-yard': {
        title: 'માર્કેટ યાર્ડ',
        tabs: [
            { id: 'market-info', label: 'Market Info' },
            { id: 'crop-prices', label: 'Crop Prices' },
            { id: 'farmers', label: 'Farmer Listings' },
            { id: 'buyers', label: 'Buyers / Traders' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'schemes', label: 'Government Schemes' }
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

const EmploymentModuleAdmin = ({ moduleId }) => {
    const meta = moduleMeta[moduleId];
    const [data, setData] = useState(getDefaultEmploymentModuleData(moduleId));
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState(meta?.tabs?.[0]?.id || '');
    const [uploadingResume, setUploadingResume] = useState(false);

    useEffect(() => {
        let mounted = true;

        axios
            .get(`/employment/modules/${moduleId}`)
            .then((res) => {
                if (!mounted) return;
                setData({ ...getDefaultEmploymentModuleData(moduleId), ...(res.data || {}) });
            })
            .catch((error) => {
                console.error('Failed to fetch employment module:', error);
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
                <div className="text-red-600 font-semibold">Employment module not found.</div>
            </Card>
        );
    }

    const setBasicInfoField = (key, value) => {
        setData((prev) => ({
            ...prev,
            basicInfo: {
                ...(prev.basicInfo || {}),
                [key]: value
            }
        }));
    };

    const setMarketInfoField = (key, value) => {
        setData((prev) => ({
            ...prev,
            marketInfo: {
                ...(prev.marketInfo || {}),
                [key]: value
            }
        }));
    };

    const setMgnregaField = (key, value) => {
        setData((prev) => ({
            ...prev,
            mgnrega: {
                ...(prev.mgnrega || {}),
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

    const uploadResume = async (file) => {
        if (!file) return;
        setUploadingResume(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`/employment/modules/${moduleId}/upload-file`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res?.data?.file_url) {
                setMgnregaField('resumeFileUrl', res.data.file_url);
            }
        } catch (error) {
            console.error('Resume upload failed:', error);
            alert('Resume upload failed.');
        } finally {
            setUploadingResume(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`/employment/modules/${moduleId}/update`, data);
            alert('Employment module details saved successfully!');
        } catch (error) {
            console.error('Failed to save employment module:', error);
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
                    <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Employment Module</div>
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

            {moduleId === 'animal-husbandry-and-dairy' && activeTab === 'basic' ? (
                <Card className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Basic Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Total cattle in village</label>
                            <input
                                type="text"
                                value={data.basicInfo?.totalCattle || ''}
                                onChange={(e) => setBasicInfoField('totalCattle', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Dairy centers</label>
                            <input
                                type="text"
                                value={data.basicInfo?.dairyCenters || ''}
                                onChange={(e) => setBasicInfoField('dairyCenters', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Veterinary contact</label>
                            <input
                                type="text"
                                value={data.basicInfo?.veterinaryContact || ''}
                                onChange={(e) => setBasicInfoField('veterinaryContact', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                    </div>
                </Card>
            ) : null}

            {moduleId === 'animal-husbandry-and-dairy' && activeTab === 'livestock' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Livestock Details</h3>
                    <EditableTable
                        columns={[
                            { key: 'ownerName', label: 'Owner Name' },
                            { key: 'animalType', label: 'Animal Type' },
                            { key: 'count', label: 'Count' },
                            { key: 'milkProduction', label: 'Milk Production' }
                        ]}
                        rows={data.livestockDetails || []}
                        onAdd={() =>
                            addRow(
                                'livestockDetails',
                                { ownerName: '', animalType: '', count: '', milkProduction: '' },
                                'livestock'
                            )
                        }
                        onRemove={(id) => removeRow('livestockDetails', id)}
                        onChange={(id, key, value) => updateRow('livestockDetails', id, key, value)}
                    />
                </Card>
            ) : null}

            {moduleId === 'employment-board' && activeTab === 'job-listings' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Job Listings</h3>
                    <EditableTable
                        columns={[
                            { key: 'jobTitle', label: 'Job Title' },
                            { key: 'companyDept', label: 'Company / Dept' },
                            { key: 'location', label: 'Location' },
                            { key: 'salary', label: 'Salary' },
                            { key: 'applyLink', label: 'Apply Link' }
                        ]}
                        rows={data.jobListings || []}
                        onAdd={() =>
                            addRow(
                                'jobListings',
                                { jobTitle: '', companyDept: '', location: '', salary: '', applyLink: '' },
                                'job'
                            )
                        }
                        onRemove={(id) => removeRow('jobListings', id)}
                        onChange={(id, key, value) => updateRow('jobListings', id, key, value)}
                    />
                </Card>
            ) : null}

            {moduleId === 'employment-board' && activeTab === 'government-jobs' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Government Jobs</h3>
                    <EditableTable
                        columns={[
                            { key: 'vacancyTitle', label: 'Latest Govt Vacancies' },
                            { key: 'department', label: 'Department / Panchayat Jobs' },
                            { key: 'jobType', label: 'Contract Jobs' },
                            { key: 'applyLink', label: 'Apply Link' }
                        ]}
                        rows={data.governmentJobs || []}
                        onAdd={() =>
                            addRow(
                                'governmentJobs',
                                { vacancyTitle: '', department: '', jobType: '', applyLink: '' },
                                'gov-job'
                            )
                        }
                        onRemove={(id) => removeRow('governmentJobs', id)}
                        onChange={(id, key, value) => updateRow('governmentJobs', id, key, value)}
                    />
                </Card>
            ) : null}

            {moduleId === 'employment-board' && activeTab === 'mgnrega' ? (
                <Card className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">MGNREGA</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Job card holders</label>
                            <input
                                type="text"
                                value={data.mgnrega?.jobCardHolders || ''}
                                onChange={(e) => setMgnregaField('jobCardHolders', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Work status</label>
                            <input
                                type="text"
                                value={data.mgnrega?.workStatus || ''}
                                onChange={(e) => setMgnregaField('workStatus', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Payment status</label>
                            <input
                                type="text"
                                value={data.mgnrega?.paymentStatus || ''}
                                onChange={(e) => setMgnregaField('paymentStatus', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Apply / Registration Link</label>
                            <input
                                type="text"
                                value={data.mgnrega?.applyRegistrationLink || ''}
                                onChange={(e) => setMgnregaField('applyRegistrationLink', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Resume File URL (Optional)</label>
                        <input
                            type="text"
                            value={data.mgnrega?.resumeFileUrl || ''}
                            onChange={(e) => setMgnregaField('resumeFileUrl', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Upload Resume (Optional)</label>
                        <input
                            type="file"
                            onChange={(e) => uploadResume(e.target.files?.[0])}
                            className="w-full"
                        />
                        {uploadingResume ? (
                            <div className="text-sm text-blue-600 font-semibold">Uploading resume...</div>
                        ) : null}
                    </div>
                </Card>
            ) : null}

            {moduleId === 'market-yard' && activeTab === 'market-info' ? (
                <Card className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Market Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Market yard name</label>
                            <input
                                type="text"
                                value={data.marketInfo?.marketYardName || ''}
                                onChange={(e) => setMarketInfoField('marketYardName', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Location</label>
                            <input
                                type="text"
                                value={data.marketInfo?.location || ''}
                                onChange={(e) => setMarketInfoField('location', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Timings</label>
                            <input
                                type="text"
                                value={data.marketInfo?.timings || ''}
                                onChange={(e) => setMarketInfoField('timings', e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                            />
                        </div>
                    </div>
                </Card>
            ) : null}

            {moduleId === 'market-yard' && activeTab === 'crop-prices' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Crop Prices (Update Daily)</h3>
                    <EditableTable
                        columns={[
                            { key: 'cropName', label: 'Crop Name' },
                            { key: 'minPrice', label: 'Min Price' },
                            { key: 'maxPrice', label: 'Max Price' },
                            { key: 'avgPrice', label: 'Avg Price' },
                            { key: 'updatedDate', label: 'Updated Date', inputType: 'date' }
                        ]}
                        rows={data.cropPrices || []}
                        onAdd={() =>
                            addRow(
                                'cropPrices',
                                { cropName: '', minPrice: '', maxPrice: '', avgPrice: '', updatedDate: '' },
                                'crop-price'
                            )
                        }
                        onRemove={(id) => removeRow('cropPrices', id)}
                        onChange={(id, key, value) => updateRow('cropPrices', id, key, value)}
                    />
                </Card>
            ) : null}

            {moduleId === 'market-yard' && activeTab === 'farmers' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Farmer Listings</h3>
                    <EditableTable
                        columns={[
                            { key: 'farmerName', label: 'Farmer Name' },
                            { key: 'crop', label: 'Crop' },
                            { key: 'quantity', label: 'Quantity' },
                            { key: 'status', label: 'Status (Sold / Pending)' }
                        ]}
                        rows={data.farmerListings || []}
                        onAdd={() =>
                            addRow(
                                'farmerListings',
                                { farmerName: '', crop: '', quantity: '', status: '' },
                                'farmer'
                            )
                        }
                        onRemove={(id) => removeRow('farmerListings', id)}
                        onChange={(id, key, value) => updateRow('farmerListings', id, key, value)}
                    />
                </Card>
            ) : null}

            {moduleId === 'market-yard' && activeTab === 'buyers' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Buyers / Traders</h3>
                    <EditableTable
                        columns={[
                            { key: 'traderName', label: 'Trader Name' },
                            { key: 'contact', label: 'Contact' },
                            { key: 'category', label: 'Category' }
                        ]}
                        rows={data.buyersTraders || []}
                        onAdd={() =>
                            addRow(
                                'buyersTraders',
                                { traderName: '', contact: '', category: '' },
                                'buyer'
                            )
                        }
                        onRemove={(id) => removeRow('buyersTraders', id)}
                        onChange={(id, key, value) => updateRow('buyersTraders', id, key, value)}
                    />
                </Card>
            ) : null}

            {moduleId === 'market-yard' && activeTab === 'transactions' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Transactions</h3>
                    <EditableTable
                        columns={[
                            { key: 'cropSold', label: 'Crop sold' },
                            { key: 'price', label: 'Price' },
                            { key: 'date', label: 'Date', inputType: 'date' }
                        ]}
                        rows={data.transactions || []}
                        onAdd={() =>
                            addRow(
                                'transactions',
                                { cropSold: '', price: '', date: '' },
                                'transaction'
                            )
                        }
                        onRemove={(id) => removeRow('transactions', id)}
                        onChange={(id, key, value) => updateRow('transactions', id, key, value)}
                    />
                </Card>
            ) : null}

            {moduleId === 'market-yard' && activeTab === 'schemes' ? (
                <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Government Schemes</h3>
                    <EditableTable
                        columns={[
                            { key: 'schemeName', label: 'Scheme (MSP/Subsidy)' },
                            { key: 'details', label: 'Details' }
                        ]}
                        rows={data.governmentSchemes || []}
                        onAdd={() =>
                            addRow(
                                'governmentSchemes',
                                { schemeName: '', details: '' },
                                'scheme'
                            )
                        }
                        onRemove={(id) => removeRow('governmentSchemes', id)}
                        onChange={(id, key, value) => updateRow('governmentSchemes', id, key, value)}
                    />
                </Card>
            ) : null}
        </div>
    );
};

export default EmploymentModuleAdmin;
