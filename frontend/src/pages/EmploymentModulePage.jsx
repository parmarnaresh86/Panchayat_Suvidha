import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
        subtitle: 'Support farmers with livestock and dairy services'
    },
    'employment-board': {
        title: 'રોજગાર બોર્ડ',
        subtitle: 'Provide job information and registration support to villagers'
    },
    'market-yard': {
        title: 'માર્કેટ યાર્ડ',
        subtitle: 'Help farmers sell crops with prices, buyers, and transactions'
    }
};

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const PublicTable = ({ columns, rows }) => (
    <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
                <tr>
                    {columns.map((column) => (
                        <th key={column.key} className="px-3 py-3 text-left font-bold text-slate-700">
                            {column.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {!rows?.length ? (
                    <tr>
                        <td colSpan={columns.length} className="px-3 py-4 text-center text-gray-600">
                            No records available.
                        </td>
                    </tr>
                ) : (
                    rows.map((row) => (
                        <tr key={row.id} className="border-t border-slate-100">
                            {columns.map((column) => (
                                <td key={column.key} className="px-3 py-2 text-gray-800">
                                    {column.type === 'link' ? (
                                        row[column.key] ? (
                                            <a
                                                href={row[column.key]}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-700 hover:underline font-semibold break-all"
                                            >
                                                {row[column.key]}
                                            </a>
                                        ) : (
                                            '-'
                                        )
                                    ) : column.type === 'date' ? (
                                        formatDate(row[column.key])
                                    ) : (
                                        row[column.key] || '-'
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

const EmploymentModulePage = ({ moduleId }) => {
    const meta = moduleMeta[moduleId];
    const [data, setData] = useState(getDefaultEmploymentModuleData(moduleId));
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('basic');

    useEffect(() => {
        let mounted = true;

        axios
            .get(`/employment/modules/${moduleId}`)
            .then((res) => {
                if (!mounted) return;
                setData({ ...getDefaultEmploymentModuleData(moduleId), ...(res.data || {}) });
            })
            .catch(() => {
                if (!mounted) return;
                setData(getDefaultEmploymentModuleData(moduleId));
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
            <div className="container mx-auto p-6">
                <Card className="p-6">
                    <div className="text-red-600 font-semibold">Employment module not found.</div>
                </Card>
            </div>
        );
    }

    const tabsByModule = {
        'animal-husbandry-and-dairy': [
            { id: 'basic', label: 'Basic Info' },
            { id: 'livestock', label: 'Livestock Details' }
        ],
        'employment-board': [
            { id: 'job-listings', label: 'Job Listings' },
            { id: 'government-jobs', label: 'Government Jobs' },
            { id: 'mgnrega', label: 'MGNREGA' }
        ],
        'market-yard': [
            { id: 'market-info', label: 'Market Info' },
            { id: 'crop-prices', label: 'Crop Prices' },
            { id: 'farmers', label: 'Farmer Listings' },
            { id: 'buyers', label: 'Buyers / Traders' },
            { id: 'transactions', label: 'Transactions' },
            { id: 'schemes', label: 'Government Schemes' }
        ]
    };

    const tabs = tabsByModule[moduleId] || [];

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700">{meta.title}</h1>
                    <p className="text-sm text-gray-600 mt-1">{meta.subtitle}</p>
                </div>
                <Link to="/services/employment" className="text-blue-700 font-semibold hover:underline">
                    Back to Employment
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

            {!loading && moduleId === 'animal-husbandry-and-dairy' && activeTab === 'basic' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Total cattle in village</div>
                            <div className="font-bold text-gray-900 mt-2">{data.basicInfo?.totalCattle || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Dairy centers</div>
                            <div className="font-bold text-gray-900 mt-2">{data.basicInfo?.dairyCenters || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Veterinary contact</div>
                            <div className="font-bold text-gray-900 mt-2">{data.basicInfo?.veterinaryContact || '-'}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            {!loading && moduleId === 'animal-husbandry-and-dairy' && activeTab === 'livestock' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Livestock Details</h2>
                    <PublicTable
                        columns={[
                            { key: 'ownerName', label: 'Owner Name' },
                            { key: 'animalType', label: 'Animal Type (Cow/Buffalo/Goat)' },
                            { key: 'count', label: 'Count' },
                            { key: 'milkProduction', label: 'Milk Production' }
                        ]}
                        rows={data.livestockDetails || []}
                    />
                </Card>
            ) : null}

            {!loading && moduleId === 'employment-board' && activeTab === 'job-listings' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Job Listings</h2>
                    <PublicTable
                        columns={[
                            { key: 'jobTitle', label: 'Job Title' },
                            { key: 'companyDept', label: 'Company / Dept' },
                            { key: 'location', label: 'Location' },
                            { key: 'salary', label: 'Salary' },
                            { key: 'applyLink', label: 'Apply Link', type: 'link' }
                        ]}
                        rows={data.jobListings || []}
                    />
                </Card>
            ) : null}

            {!loading && moduleId === 'employment-board' && activeTab === 'government-jobs' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Government Jobs</h2>
                    <PublicTable
                        columns={[
                            { key: 'vacancyTitle', label: 'Latest Govt Vacancies' },
                            { key: 'department', label: 'Department / Panchayat Jobs' },
                            { key: 'jobType', label: 'Contract Jobs' },
                            { key: 'applyLink', label: 'Apply Link', type: 'link' }
                        ]}
                        rows={data.governmentJobs || []}
                    />
                </Card>
            ) : null}

            {!loading && moduleId === 'employment-board' && activeTab === 'mgnrega' ? (
                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">MGNREGA</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Job card holders</div>
                            <div className="font-bold text-gray-900 mt-2">{data.mgnrega?.jobCardHolders || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Work status</div>
                            <div className="font-bold text-gray-900 mt-2">{data.mgnrega?.workStatus || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Payment status</div>
                            <div className="font-bold text-gray-900 mt-2">{data.mgnrega?.paymentStatus || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Apply / Registration</div>
                            <div className="font-bold text-gray-900 mt-2 break-all">
                                {data.mgnrega?.applyRegistrationLink ? (
                                    <a
                                        href={data.mgnrega.applyRegistrationLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-700 hover:underline"
                                    >
                                        {data.mgnrega.applyRegistrationLink}
                                    </a>
                                ) : (
                                    '-'
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                        <div className="text-xs uppercase text-gray-500 font-semibold">Resume Upload (Optional)</div>
                        <div className="font-bold text-gray-900 mt-2 break-all">
                            {data.mgnrega?.resumeFileUrl ? (
                                <a
                                    href={data.mgnrega.resumeFileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-700 hover:underline"
                                >
                                    {data.mgnrega.resumeFileUrl}
                                </a>
                            ) : (
                                'Not available'
                            )}
                        </div>
                    </div>
                </Card>
            ) : null}

            {!loading && moduleId === 'market-yard' && activeTab === 'market-info' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Market Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Market yard name</div>
                            <div className="font-bold text-gray-900 mt-2">{data.marketInfo?.marketYardName || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Location</div>
                            <div className="font-bold text-gray-900 mt-2">{data.marketInfo?.location || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Timings</div>
                            <div className="font-bold text-gray-900 mt-2">{data.marketInfo?.timings || '-'}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            {!loading && moduleId === 'market-yard' && activeTab === 'crop-prices' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Crop Prices (Daily Update)</h2>
                    <PublicTable
                        columns={[
                            { key: 'cropName', label: 'Crop Name' },
                            { key: 'minPrice', label: 'Min Price' },
                            { key: 'maxPrice', label: 'Max Price' },
                            { key: 'avgPrice', label: 'Avg Price' },
                            { key: 'updatedDate', label: 'Updated Date', type: 'date' }
                        ]}
                        rows={data.cropPrices || []}
                    />
                </Card>
            ) : null}

            {!loading && moduleId === 'market-yard' && activeTab === 'farmers' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Farmer Listings</h2>
                    <PublicTable
                        columns={[
                            { key: 'farmerName', label: 'Farmer Name' },
                            { key: 'crop', label: 'Crop' },
                            { key: 'quantity', label: 'Quantity' },
                            { key: 'status', label: 'Status (Sold / Pending)' }
                        ]}
                        rows={data.farmerListings || []}
                    />
                </Card>
            ) : null}

            {!loading && moduleId === 'market-yard' && activeTab === 'buyers' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Buyers / Traders</h2>
                    <PublicTable
                        columns={[
                            { key: 'traderName', label: 'Trader Name' },
                            { key: 'contact', label: 'Contact' },
                            { key: 'category', label: 'Category' }
                        ]}
                        rows={data.buyersTraders || []}
                    />
                </Card>
            ) : null}

            {!loading && moduleId === 'market-yard' && activeTab === 'transactions' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Transactions</h2>
                    <PublicTable
                        columns={[
                            { key: 'cropSold', label: 'Crop Sold' },
                            { key: 'price', label: 'Price' },
                            { key: 'date', label: 'Date', type: 'date' }
                        ]}
                        rows={data.transactions || []}
                    />
                </Card>
            ) : null}

            {!loading && moduleId === 'market-yard' && activeTab === 'schemes' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Government Schemes</h2>
                    <PublicTable
                        columns={[
                            { key: 'schemeName', label: 'Scheme (MSP / Subsidy)' },
                            { key: 'details', label: 'Details' }
                        ]}
                        rows={data.governmentSchemes || []}
                    />
                </Card>
            ) : null}
        </div>
    );
};

export default EmploymentModulePage;
