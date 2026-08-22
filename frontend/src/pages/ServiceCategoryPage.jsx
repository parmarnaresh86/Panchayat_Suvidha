import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../components/Card';
import axios from '../api/axios';
import servicesDataFallback from '../data/servicesData';

const ServiceCategoryPage = () => {
    const { serviceId } = useParams();
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

    if (!services) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-6">
                    <div className="text-gray-600 font-semibold">Loading service...</div>
                </Card>
            </div>
        );
    }

    const service = services.find((s) => s.id === serviceId);

    if (!service) {
        return (
            <div className="container mx-auto p-6">
                <Card className="p-6">
                    <h1 className="text-3xl font-bold text-blue-700 mb-3">Service not found</h1>
                    <Link to="/" className="text-blue-600 font-semibold hover:text-blue-700">
                        Back to Village Profile
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
                    <ol className="inline-flex items-center space-x-2">
                        <li>
                            <Link to="/" className="hover:text-blue-600">Home</Link>
                        </li>
                        <li>/</li>
                        <li>
                            <Link to="/services" className="hover:text-blue-600">Services</Link>
                        </li>
                        <li>/</li>
                        <li className="font-semibold text-gray-900">{service.title}</li>
                    </ol>
                </nav>
                <Link to="/" className="text-blue-600 font-semibold hover:text-blue-700">
                    Back
                </Link>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{service.guTitle}</h2>
                <p className="text-sm text-gray-600 mb-6">
                    સેવા પસંદ કરીને વિગતો જુઓ.
                </p>

                <div className="space-y-3">
                    {service.items.map((item) => {
                        const normalizedLink =
                            item.id === 'form-download-center' ||
                            item.id.startsWith('custom-1774003186730') ||
                            item.label?.includes('ફોર્મ ડાઉનલોડ')
                                ? '/services/admin/form-download-center'
                            : item.id === 'staff-attendance' || item.label?.includes('સ્ટાફ હાજરી')
                                ? '/services/admin/staff-attendance'
                                : item.to;

                        return (
                            <Link
                                key={item.id}
                                to={normalizedLink}
                                className="block p-4 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-200 transition-colors"
                            >
                            <div className="flex items-center justify-between gap-4">
                                <div className="font-semibold text-gray-800">{item.label}</div>
                                <div className="text-blue-600 font-bold">→</div>
                            </div>
                            {item.description ? (
                                <div className="mt-2 text-sm text-gray-600">
                                    {item.description}
                                </div>
                            ) : null}
                            {item.department ? (
                                <div className="mt-2 text-xs text-blue-800 bg-blue-50 border border-blue-100 rounded-full w-fit px-3 py-1 font-semibold">
                                    {item.department}
                                </div>
                            ) : null}
                        </Link>
                    );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default ServiceCategoryPage;

