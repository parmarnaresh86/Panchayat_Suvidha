import React, { useState } from 'react';
import Card from '../components/Card';
import EmploymentModuleAdmin from './EmploymentModuleAdmin';

const moduleTabs = [
    { id: 'animal-husbandry-and-dairy', label: 'પશુપાલન અને ડેરી' },
    { id: 'employment-board', label: 'રોજગાર બોર્ડ' },
    { id: 'market-yard', label: 'માર્કેટ યાર્ડ' }
];

const EmploymentModulesAdmin = () => {
    const [activeModule, setActiveModule] = useState('animal-husbandry-and-dairy');

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

            <EmploymentModuleAdmin key={activeModule} moduleId={activeModule} />
        </div>
    );
};

export default EmploymentModulesAdmin;
