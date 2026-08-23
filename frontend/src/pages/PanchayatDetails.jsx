
import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import Card from '../components/Card';
import { useLanguage } from '../context/LanguageContext';

const PanchayatDetails = () => {
    const [members, setMembers] = useState([]);
    const { t } = useLanguage();

    useEffect(() => {
        axios.get('/panchayat').then(response => setMembers(response.data));
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-bold text-center mb-8 text-primary-700">
                {t('Panchayat Members', 'પંચાયતના સભ્યો')}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {members.map(member => (
                    <Card key={member.id} className="text-center transform hover:scale-105 transition-transform duration-300">
                        <img
                            src={member.photo_url || 'https://via.placeholder.com/180.png/f97316/ffffff?text=Photo'}
                            alt={member.name}
                            className="w-40 h-40 rounded-full mx-auto mb-4 shadow-lg object-cover"
                        />
                        <h2 className="text-2xl font-bold">{member.name}</h2>
                        <span className="inline-block bg-primary-200 text-primary-800 text-sm font-semibold px-3 py-1 rounded-full mt-2">
                            {t(member.role, member.role === 'Sarpanch' ? 'સરપંચ' : 'તલાટી મંત્રી')}
                        </span>
                        <div className="text-left mt-4 space-y-2 text-gray-600">
                            <p><strong>{t('Email', 'ઈમેલ')}:</strong> {member.email}</p>
                            <p><strong>{t('Mobile', 'મોબાઈલ')}:</strong> {member.mobile}</p>
                            <p><strong>{t('Address', 'સરનામું')}:</strong> {member.address}</p>
                            <p className="mt-2 italic">{member.description}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default PanchayatDetails;
