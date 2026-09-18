
import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Card from '../components/Card';
import { useLanguage } from '../context/LanguageContext';

const PanchayatDetails = () => {
    const [members, setMembers] = useState([]);
    const [representatives, setRepresentatives] = useState([]);
    const { t } = useLanguage();

    useEffect(() => {
        axios.get('/panchayat').then(response => setMembers(response.data));
        axios.get('/representatives').then(response => setRepresentatives(response.data)).catch(() => setRepresentatives([]));
    }, []);

    return (
        <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold mb-8 text-primary-700 border-l-8 border-primary-500 pl-4">
                    {t('Panchayat Office Bearers', 'ગ્રામ પંચાયતના પદાધિકારીઓ')}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {members.map(member => (
                        <Card key={member.id} className="text-center transform hover:scale-105 transition-transform duration-300">
                            <img
                                src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f97316&color=fff&size=180`}
                                alt={member.name}
                                className="w-32 h-32 rounded-full mx-auto mb-4 shadow-lg object-cover"
                            />
                            <h2 className="text-xl font-bold">{member.name}</h2>
                            <span className="inline-block bg-primary-200 text-primary-800 text-sm font-semibold px-3 py-1 rounded-full mt-2">
                                {t(member.role, member.role === 'Sarpanch' ? 'સરપંચ' : 'તલાટી મંત્રી')}
                            </span>
                            <div className="text-left mt-4 space-y-2 text-gray-600 text-sm">
                                {member.email && <p><strong>{t('Email', 'ઈમેલ')}:</strong> {member.email}</p>}
                                {member.mobile && <p><strong>{t('Mobile', 'મોબાઈલ')}:</strong> {member.mobile}</p>}
                                {member.address && <p><strong>{t('Address', 'સરનામું')}:</strong> {member.address}</p>}
                                {member.description && <p className="mt-2 italic">{member.description}</p>}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <h1 className="text-3xl font-bold mb-8 text-primary-700 border-l-8 border-primary-500 pl-4">
                    {t('Representatives', 'પ્રતિનિધિઓ')}
                </h1>
                <div className="space-y-4">
                    {representatives.map(rep => (
                        <div key={rep.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                            <img
                                src={rep.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(rep.name)}&background=dc2626&color=fff&size=120`}
                                alt={rep.name}
                                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                            />
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">{rep.name}</h3>
                                <p className="text-xs text-primary-600 font-semibold">{t(rep.role, rep.role)}</p>
                                {rep.party && <p className="text-xs text-gray-400">{rep.party}</p>}
                            </div>
                        </div>
                    ))}
                    {representatives.length === 0 && <p className="text-sm text-gray-400">{t('No representatives added yet.', 'હજુ કોઈ પ્રતિનિધિ ઉમેરાયા નથી.')}</p>}
                </div>
            </div>
        </div>
    );
};

export default PanchayatDetails;
