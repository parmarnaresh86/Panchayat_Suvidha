import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
        subtitle: 'Electricity services and bill payment support',
        tabs: [
            { id: 'basic', label: 'Basic Info' },
            { id: 'bill-payment', label: 'Bill Payment' }
        ]
    },
    'st-bus-timetable': {
        title: 'એસ.ટી. બસ સમયપત્રક',
        subtitle: 'Travel routes and bus search for villagers',
        tabs: [
            { id: 'routes', label: 'Bus Routes' },
            { id: 'search', label: 'Search Bus' }
        ]
    },
    'water-supply': {
        title: 'પાણી પુરવઠો',
        subtitle: 'Village water management and complaints',
        tabs: [
            { id: 'schedule', label: 'Supply Schedule' },
            { id: 'complaints', label: 'Complaints' },
            { id: 'contact', label: 'Contact' }
        ]
    },
    'health-center': {
        title: 'આરોગ્ય કેન્દ્ર',
        subtitle: 'Healthcare services and emergency support',
        tabs: [
            { id: 'basic', label: 'Basic Info' },
            { id: 'services', label: 'Services' }
        ]
    }
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
                                    {row[column.key] || '-'}
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

const FacilitiesModulePage = ({ moduleId }) => {
    const meta = moduleMeta[moduleId];
    const [data, setData] = useState(getDefaultFacilitiesModuleData(moduleId));
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(meta?.tabs?.[0]?.id || '');
    const [searchFrom, setSearchFrom] = useState('');
    const [searchTo, setSearchTo] = useState('');

    useEffect(() => {
        let mounted = true;

        axios
            .get(`/facilities/modules/${moduleId}`)
            .then((res) => {
                if (!mounted) return;
                setData({ ...getDefaultFacilitiesModuleData(moduleId), ...(res.data || {}) });
            })
            .catch(() => {
                if (!mounted) return;
                setData(getDefaultFacilitiesModuleData(moduleId));
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [moduleId]);

    const filteredBusRoutes = useMemo(() => {
        if (moduleId !== 'st-bus-timetable') return [];
        const rows = Array.isArray(data.busRoutes) ? data.busRoutes : [];
        const fromKey = searchFrom.trim().toLowerCase();
        const toKey = searchTo.trim().toLowerCase();
        return rows.filter((row) => {
            const from = String(row.from || '').toLowerCase();
            const to = String(row.to || '').toLowerCase();
            const matchFrom = !fromKey || from.includes(fromKey);
            const matchTo = !toKey || to.includes(toKey);
            return matchFrom && matchTo;
        });
    }, [moduleId, data.busRoutes, searchFrom, searchTo]);

    if (!meta) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-6">
                    <div className="text-red-600 font-semibold">Facilities module not found.</div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700">{meta.title}</h1>
                    <p className="text-sm text-gray-600 mt-1">{meta.subtitle}</p>
                </div>
                <Link to="/services/facilities" className="text-blue-700 font-semibold hover:underline">
                    Back to Facilities
                </Link>
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

            {loading ? (
                <Card className="p-6">
                    <div className="text-gray-600 font-semibold">Loading details...</div>
                </Card>
            ) : null}

            {!loading && moduleId === 'pgvcl-electric-service' && activeTab === 'basic' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Electricity Office Name</div>
                            <div className="font-bold text-gray-900 mt-2">{data.basicInfo?.electricityOfficeName || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Helpline Number</div>
                            <div className="font-bold text-gray-900 mt-2">{data.basicInfo?.helplineNumber || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Office Address</div>
                            <div className="font-bold text-gray-900 mt-2">{data.basicInfo?.officeAddress || '-'}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            {!loading && moduleId === 'pgvcl-electric-service' && activeTab === 'bill-payment' ? (
                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Bill Payment</h2>
                    <a
                        href={data.billPayment?.redirectUrl || 'https://www.pgvcl.com'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold"
                    >
                        Go to PGVCL Website
                    </a>

                    <div className="rounded-xl border border-slate-200 p-4">
                        <div className="text-xs uppercase text-gray-500 font-semibold">Last Payment Status</div>
                        <div className="font-bold text-gray-900 mt-2">{data.billPayment?.lastPaymentStatus || '-'}</div>
                    </div>
                </Card>
            ) : null}

            {!loading && moduleId === 'st-bus-timetable' && activeTab === 'routes' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Bus Routes</h2>
                    <PublicTable
                        columns={[
                            { key: 'from', label: 'From' },
                            { key: 'to', label: 'To' },
                            { key: 'busTime', label: 'Bus Time' },
                            { key: 'busType', label: 'Bus Type' }
                        ]}
                        rows={data.busRoutes || []}
                    />
                </Card>
            ) : null}

            {!loading && moduleId === 'st-bus-timetable' && activeTab === 'search' ? (
                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Search Bus</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">From location</label>
                            <input
                                type="text"
                                value={searchFrom}
                                onChange={(e) => setSearchFrom(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                                placeholder="Enter source"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">To location</label>
                            <input
                                type="text"
                                value={searchTo}
                                onChange={(e) => setSearchTo(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-2"
                                placeholder="Enter destination"
                            />
                        </div>
                    </div>

                    <PublicTable
                        columns={[
                            { key: 'from', label: 'From' },
                            { key: 'to', label: 'To' },
                            { key: 'busTime', label: 'Bus Time' },
                            { key: 'busType', label: 'Bus Type' }
                        ]}
                        rows={filteredBusRoutes}
                    />
                </Card>
            ) : null}

            {!loading && moduleId === 'water-supply' && activeTab === 'schedule' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Supply Schedule</h2>
                    <PublicTable
                        columns={[
                            { key: 'area', label: 'Area' },
                            { key: 'timing', label: 'Water Timing' },
                            { key: 'days', label: 'Days' }
                        ]}
                        rows={data.supplySchedule || []}
                    />
                </Card>
            ) : null}

            {!loading && moduleId === 'water-supply' && activeTab === 'complaints' ? (
                <Card className="p-6 space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">Complaints</h2>
                    <div className="rounded-xl border border-slate-200 p-4">
                        <div className="text-xs uppercase text-gray-500 font-semibold">Report Water Issue</div>
                        <div className="font-bold text-gray-900 mt-2">{data.complaints?.reportWaterIssueInfo || '-'}</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                        <div className="text-xs uppercase text-gray-500 font-semibold">Leakage Complaint</div>
                        <div className="font-bold text-gray-900 mt-2">{data.complaints?.leakageComplaintInfo || '-'}</div>
                    </div>
                    {data.complaints?.complaintLink ? (
                        <a
                            href={data.complaints.complaintLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold"
                        >
                            Report Complaint
                        </a>
                    ) : null}
                </Card>
            ) : null}

            {!loading && moduleId === 'water-supply' && activeTab === 'contact' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Water Department Contact</h2>
                    <div className="rounded-xl border border-slate-200 p-4">
                        <div className="font-bold text-gray-900">{data.contact?.waterDepartmentContact || '-'}</div>
                    </div>
                </Card>
            ) : null}

            {!loading && moduleId === 'health-center' && activeTab === 'basic' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Basic Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Health center name</div>
                            <div className="font-bold text-gray-900 mt-2">{data.basicInfo?.healthCenterName || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Doctor name</div>
                            <div className="font-bold text-gray-900 mt-2">{data.basicInfo?.doctorName || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Contact number</div>
                            <div className="font-bold text-gray-900 mt-2">{data.basicInfo?.contactNumber || '-'}</div>
                        </div>
                    </div>
                </Card>
            ) : null}

            {!loading && moduleId === 'health-center' && activeTab === 'services' ? (
                <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">OPD timing</div>
                            <div className="font-bold text-gray-900 mt-2">{data.services?.opdTiming || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">Emergency services</div>
                            <div className="font-bold text-gray-900 mt-2">{data.services?.emergencyServices || '-'}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 p-4">
                            <div className="text-xs uppercase text-gray-500 font-semibold">108 ambulance</div>
                            <div className="font-bold text-gray-900 mt-2">{data.services?.ambulance108 || '-'}</div>
                        </div>
                    </div>
                </Card>
            ) : null}
        </div>
    );
};

export default FacilitiesModulePage;
