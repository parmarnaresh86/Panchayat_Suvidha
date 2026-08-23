import React, { useState } from 'react';
import Card from '../components/Card';
import FacilitiesModuleAdmin from './FacilitiesModuleAdmin';

const moduleTabs = [
    { id: 'pgvcl-electric-service', label: 'PGVCL વીજ સેવા' },
    { id: 'st-bus-timetable', label: 'એસ.ટી. બસ સમયપત્રક' },
    { id: 'water-supply', label: 'પાણી પુરવઠો' },
    { id: 'health-center', label: 'આરોગ્ય કેન્દ્ર' }
];

const FacilitiesModulesAdmin = () => {
    const [activeModule, setActiveModule] = useState('pgvcl-electric-service');

    return (
        <div className="space-y-4">
            <Card className="p-3">
                <div className="flex flex-wrap gap-2">
                    {moduleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveModule(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                                activeModule === tab.id
                                    ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </Card>

            <FacilitiesModuleAdmin key={activeModule} moduleId={activeModule} />
        </div>
    );
};

export default FacilitiesModulesAdmin;
