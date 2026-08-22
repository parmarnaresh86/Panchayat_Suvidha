import React, { useState } from 'react';
import Card from '../components/Card';
import EducationModuleAdmin from './EducationModuleAdmin';

const moduleTabs = [
    { id: 'primary-school', label: 'પ્રાથમિક શાળા' },
    { id: 'anganwadi', label: 'આંગણવાડી' },
    { id: 'library', label: 'લાઇબ્રેરી' }
];

const EducationModulesAdmin = () => {
    const [activeModule, setActiveModule] = useState('primary-school');

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
                                    ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </Card>

            <EducationModuleAdmin key={activeModule} moduleId={activeModule} />
        </div>
    );
};

export default EducationModulesAdmin;
