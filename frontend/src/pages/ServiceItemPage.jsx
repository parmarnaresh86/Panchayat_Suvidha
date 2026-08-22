import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/Card';
import axios from '../api/axios';
import servicesDataFallback from '../data/servicesData';
import FormDownloadPage from './FormDownloadPage';
import StaffAttendancePage from './StaffAttendancePage';
import PrimarySchoolPage from './PrimarySchoolPage';
import AnganwadiPage from './AnganwadiPage';
import LibraryPage from './LibraryPage';
import AnimalHusbandryDairyPage from './AnimalHusbandryDairyPage';
import EmploymentBoardModulePage from './EmploymentBoardModulePage';
import MarketYardPage from './MarketYardPage';
import PgvclElectricServicePage from './PgvclElectricServicePage';
import STBusTimetableModulePage from './STBusTimetableModulePage';
import WaterSupplyModulePage from './WaterSupplyModulePage';
import HealthCenterModulePage from './HealthCenterModulePage';

const normalizeDocs = (docs) => {
    if (!docs) return [];
    if (Array.isArray(docs)) return docs.filter(Boolean);
    if (typeof docs === 'string') {
        return docs
            .split(/\r?\n|,/)
            .map((s) => s.trim())
            .filter(Boolean);
    }
    return [];
};

const ServiceItemPage = () => {
    const { serviceId, itemId } = useParams();
    const [services, setServices] = useState(null);

    useEffect(() => {
        let mounted = true;
        axios
            .get('/services')
            .then((res) => {
                if (!mounted) return;
                setServices(res.data);
            })
            .catch(() => {
                if (!mounted) return;
                setServices(servicesDataFallback);
            });
        return () => {
            mounted = false;
        };
    }, []);

    const service = useMemo(() => {
        if (!services) return null;
        return services.find((s) => s.id === serviceId);
    }, [services, serviceId]);

    const item = useMemo(() => {
        if (!service) return null;
        return service.items.find((i) => i.id === itemId);
    }, [service, itemId]);

    const isFormDownloadToken =
        serviceId === 'admin' &&
        (itemId === 'form-download-center' ||
            itemId === 'custom-1774003186730' ||
            item?.label?.includes('ફોર્મ ડાઉનલોડ'));

    const isStaffAttendanceToken =
        serviceId === 'admin' &&
        (itemId === 'staff-attendance' ||
            itemId === 'custom-1774003124857' ||
            item?.id === 'staff-attendance' ||
            item?.label?.includes('સ્ટાફ હાજરી'));

    if (isFormDownloadToken) {
        return <FormDownloadPage />;
    }

    if (isStaffAttendanceToken) {
        return <StaffAttendancePage />;
    }

    if (serviceId === 'education' && itemId === 'primary-school') {
        return <PrimarySchoolPage />;
    }

    if (serviceId === 'education' && itemId === 'anganwadi') {
        return <AnganwadiPage />;
    }

    if (serviceId === 'education' && itemId === 'library') {
        return <LibraryPage />;
    }

    if (serviceId === 'employment' && itemId === 'animal-husbandry-and-dairy') {
        return <AnimalHusbandryDairyPage />;
    }

    if (serviceId === 'employment' && itemId === 'employment-board') {
        return <EmploymentBoardModulePage />;
    }

    if (serviceId === 'employment' && itemId === 'market-yard') {
        return <MarketYardPage />;
    }

    if (serviceId === 'facilities' && itemId === 'pgvcl-electric-service') {
        return <PgvclElectricServicePage />;
    }

    if (serviceId === 'facilities' && itemId === 'st-bus-timetable') {
        return <STBusTimetableModulePage />;
    }

    if (serviceId === 'facilities' && itemId === 'water-supply') {
        return <WaterSupplyModulePage />;
    }

    if (serviceId === 'facilities' && itemId === 'health-center') {
        return <HealthCenterModulePage />;
    }

    if (!services) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-6">
                    <div className="text-gray-600 font-semibold">Loading...</div>
                </Card>
            </div>
        );
    }

    if (serviceId === 'admin' && itemId === 'form-download-center') {
        return <FormDownloadPage />;
    }

    if (!service || !item) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-6">
                    <h1 className="text-3xl font-bold text-blue-700 mb-3">Item not found</h1>
                    <Link to={`/services/${serviceId ?? ''}`} className="text-blue-600 font-semibold hover:text-blue-700">
                        Back to Category
                    </Link>
                </Card>
            </div>
        );
    }

    const docs = normalizeDocs(item.documents);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-blue-700">{item.label}</h1>
                <Link to={`/services/${serviceId}`} className="text-blue-600 font-semibold hover:text-blue-700">
                    Back to {service.title}
                </Link>
            </div>

            <Card className="p-6">
                <div className="space-y-5">
                    {item.department ? (
                        <div>
                            <div className="text-xs uppercase tracking-wider font-bold text-blue-700">વિભાગ</div>
                            <div className="text-gray-800 font-semibold">{item.department}</div>
                        </div>
                    ) : null}

                    {item.description ? (
                        <div>
                            <div className="text-xs uppercase tracking-wider font-bold text-blue-700">વિવરણ</div>
                            <div className="text-gray-800 whitespace-pre-line">{item.description}</div>
                        </div>
                    ) : null}

                    {item.eligibility ? (
                        <div>
                            <div className="text-xs uppercase tracking-wider font-bold text-blue-700">પાત્રતા</div>
                            <div className="text-gray-800 whitespace-pre-line">{item.eligibility}</div>
                        </div>
                    ) : null}

                    {docs.length ? (
                        <div>
                            <div className="text-xs uppercase tracking-wider font-bold text-blue-700">આવશ્યક દસ્તાવેજો</div>
                            <ul className="list-disc pl-5 text-gray-800 space-y-1">
                                {docs.map((d, idx) => (
                                    <li key={`${item.id}-doc-${idx}`}>{d}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {item.procedure ? (
                        <div>
                            <div className="text-xs uppercase tracking-wider font-bold text-blue-700">અરજી પ્રક્રિયા</div>
                            <div className="text-gray-800 whitespace-pre-line">{item.procedure}</div>
                        </div>
                    ) : null}

                    {item.fees ? (
                        <div>
                            <div className="text-xs uppercase tracking-wider font-bold text-blue-700">ફી</div>
                            <div className="text-gray-800 whitespace-pre-line">{item.fees}</div>
                        </div>
                    ) : null}

                    {(item.contact || item.helpline) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {item.contact ? (
                                <div>
                                    <div className="text-xs uppercase tracking-wider font-bold text-blue-700">સંપર્ક</div>
                                    <div className="text-gray-800 whitespace-pre-line">{item.contact}</div>
                                </div>
                            ) : null}
                            {item.helpline ? (
                                <div>
                                    <div className="text-xs uppercase tracking-wider font-bold text-blue-700">હેલ્પલાઇન</div>
                                    <div className="text-gray-800 whitespace-pre-line">{item.helpline}</div>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {item.officialLink ? (
                        <div>
                            <div className="text-xs uppercase tracking-wider font-bold text-blue-700">ઓફિશિયલ લિંક</div>
                            <a
                                href={item.officialLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-700 font-semibold hover:underline break-all"
                            >
                                {item.officialLink}
                            </a>
                        </div>
                    ) : null}

                    {!item.description && !item.eligibility && !docs.length && !item.procedure && !item.contact && !item.officialLink ? (
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                            <div className="font-bold text-blue-800 mb-2">Coming Soon</div>
                            <div className="text-gray-700">
                                Admin will add details for this service soon.
                            </div>
                        </div>
                    ) : null}
                </div>
            </Card>
        </div>
    );
};

export default ServiceItemPage;
