import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import servicesDataFallback from '../data/servicesData';

const splitDocs = (value) => {
    if (!value) return [];
    return value
        .split(/\r?\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);
};

const docsToText = (docs) => {
    if (!docs) return '';
    if (Array.isArray(docs)) return docs.join('\n');
    return String(docs);
};

const AdminServices = () => {
    const [services, setServices] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [newItemLabel, setNewItemLabel] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        axios
            .get('/services')
            .then((res) => {
                if (!mounted) return;
                setServices(res.data);
                setSelectedServiceId((prev) => prev ?? res.data?.[0]?.id ?? null);
            })
            .catch(() => {
                if (!mounted) return;
                setServices(servicesDataFallback);
                setSelectedServiceId(servicesDataFallback?.[0]?.id ?? null);
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const selectedService = useMemo(() => {
        if (!services || !selectedServiceId) return null;
        return services.find((s) => s.id === selectedServiceId);
    }, [services, selectedServiceId]);

    const updateService = (serviceId, next) => {
        setServices((prev) =>
            prev.map((s) => {
                if (s.id !== serviceId) return s;
                return { ...s, ...next };
            })
        );
    };

    const updateItem = (serviceId, itemId, nextItem) => {
        setServices((prev) =>
            prev.map((s) => {
                if (s.id !== serviceId) return s;
                return {
                    ...s,
                    items: (s.items ?? []).map((i) => (i.id === itemId ? { ...i, ...nextItem } : i))
                };
            })
        );
    };

    const handleAddItem = () => {
        if (!selectedService) return;
        const label = newItemLabel.trim();
        if (!label) return;

        const newId = `custom-${Date.now()}`;
        const newItem = {
            id: newId,
            label,
            to: `/services/${selectedService.id}/${newId}`,
            department: '',
            eligibility: '',
            description: '',
            documents: [],
            procedure: '',
            fees: '',
            contact: '',
            helpline: '',
            officialLink: ''
        };

        updateService(selectedService.id, {
            items: [...selectedService.items, newItem]
        });

        setNewItemLabel('');
    };

    const handleRemoveItem = (itemId) => {
        if (!selectedService) return;
        updateService(selectedService.id, {
            items: selectedService.items.filter((i) => i.id !== itemId)
        });
    };

    const handleSave = async () => {
        if (!services) return;
        setSaving(true);
        try {
            await axios.post('/services/update', { services });
            alert('Services updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update services.');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !services) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-gray-600 font-semibold">Loading services...</div>
            </div>
        );
    }

    if (!selectedService) {
        return (
            <Card className="p-6">
                <div className="text-red-600 font-semibold">No service found.</div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Edit Services</div>
                    <div className="text-2xl font-extrabold text-blue-700">
                        {selectedService?.title ?? 'Services'}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2"
                    >
                        {saving ? 'Saving...' : 'Save All'}
                    </Button>
                </div>
            </div>

            {/* Categories on top (like government portal tabs) */}
            <Card className="p-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Service Categories
                    </div>
                    <div className="text-xs text-gray-500 font-semibold">
                        {services.length} categories
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                    {services.map((s) => {
                        const active = s.id === selectedService.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => setSelectedServiceId(s.id)}
                                className={`px-4 py-2 rounded-xl border text-sm font-semibold whitespace-nowrap transition-colors ${
                                    active
                                        ? 'bg-blue-50 border-blue-200 text-blue-800'
                                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                                }`}
                            >
                                {s.guTitle}
                            </button>
                        );
                    })}
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">
                            Edit Category
                        </div>
                        <div className="text-xl font-extrabold text-blue-700">
                            {selectedService.guTitle}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Update titles and all service item details. Changes apply globally.
                        </div>
                    </div>
                </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Title (EN)</label>
                            <Input
                                value={selectedService.title}
                                onChange={(e) => updateService(selectedService.id, { title: e.target.value })}
                                type="text"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Title (GU)</label>
                            <Input
                                value={selectedService.guTitle}
                                onChange={(e) => updateService(selectedService.id, { guTitle: e.target.value })}
                                type="text"
                            />
                        </div>
                    </div>

                    <div className="flex items-end gap-3 mb-5">
                        <div className="flex-1">
                            <label className="text-sm font-bold text-gray-700">Add New Item Label (GU)</label>
                            <Input
                                value={newItemLabel}
                                onChange={(e) => setNewItemLabel(e.target.value)}
                                type="text"
                                placeholder="e.g., નવી સેવા"
                            />
                        </div>
                        <Button
                            onClick={handleAddItem}
                            className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2"
                        >
                            Add Item
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {(selectedService.items ?? []).map((item) => (
                            <Card key={item.id} className="p-5">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <div className="font-bold text-slate-900 text-lg">{item.id}</div>
                                    <button
                                        className="text-red-600 hover:text-red-700 font-semibold"
                                        onClick={() => handleRemoveItem(item.id)}
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700">Label (GU)</label>
                                        <Input
                                            value={item.label}
                                            onChange={(e) => updateItem(selectedService.id, item.id, { label: e.target.value })}
                                            type="text"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700">Department</label>
                                            <Input
                                                value={item.department ?? ''}
                                                onChange={(e) =>
                                                    updateItem(selectedService.id, item.id, { department: e.target.value })
                                                }
                                                type="text"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700">Eligibility</label>
                                            <Input
                                                value={item.eligibility ?? ''}
                                                onChange={(e) =>
                                                    updateItem(selectedService.id, item.id, { eligibility: e.target.value })
                                                }
                                                type="text"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700">Description</label>
                                        <textarea
                                            className="w-full border border-gray-200 rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            rows={3}
                                            value={item.description ?? ''}
                                            onChange={(e) =>
                                                updateItem(selectedService.id, item.id, { description: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700">Required Documents (one per line)</label>
                                        <textarea
                                            className="w-full border border-gray-200 rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            rows={3}
                                            value={docsToText(item.documents)}
                                            onChange={(e) =>
                                                updateItem(selectedService.id, item.id, {
                                                    documents: splitDocs(e.target.value)
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-gray-700">Procedure (How to apply)</label>
                                        <textarea
                                            className="w-full border border-gray-200 rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            rows={3}
                                            value={item.procedure ?? ''}
                                            onChange={(e) =>
                                                updateItem(selectedService.id, item.id, { procedure: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700">Fees</label>
                                            <Input
                                                value={item.fees ?? ''}
                                                onChange={(e) => updateItem(selectedService.id, item.id, { fees: e.target.value })}
                                                type="text"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700">Contact</label>
                                            <Input
                                                value={item.contact ?? ''}
                                                onChange={(e) =>
                                                    updateItem(selectedService.id, item.id, { contact: e.target.value })
                                                }
                                                type="text"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700">Helpline</label>
                                            <Input
                                                value={item.helpline ?? ''}
                                                onChange={(e) =>
                                                    updateItem(selectedService.id, item.id, { helpline: e.target.value })
                                                }
                                                type="text"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-bold text-gray-700">Official Link (URL)</label>
                                            <Input
                                                value={item.officialLink ?? ''}
                                                onChange={(e) =>
                                                    updateItem(selectedService.id, item.id, { officialLink: e.target.value })
                                                }
                                                type="text"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
            </Card>
        </div>
    );
};

export default AdminServices;

