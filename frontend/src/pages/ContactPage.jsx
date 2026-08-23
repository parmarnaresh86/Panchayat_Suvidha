import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import axios from '../api/axios';

const ContactPage = () => {
    const { t } = useLanguage();
    const [contactInfo, setContactInfo] = useState({
        phone: '+91 12345 67890',
        email: 'support@panchayatsuvidha.in',
        address: 'Panchayat Office, Sayla',
        hours: '9:00 AM - 6:00 PM, Monday - Saturday'
    });
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        axios.get('/contact/info')
            .then(res => setContactInfo(res.data))
            .catch(err => console.error('Failed to load contact info:', err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitSuccess(false);
        try {
            await axios.post('/contact/message', formData);
            setSubmitSuccess(true);
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setSubmitSuccess(false), 5000);
        } catch (err) {
            alert('Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8" id="quick-contact">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t('Contact Panchayat', 'સંપર્ક પંચાયત')}</h1>
            <p className="text-gray-600">{t('Reach out for support, complaints, and civic services.', 'સહાય, ફરિયાદો અને નાગરિક સેવાઓ માટે સંપર્ક કરો.')}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4">{t('Quick Contact', 'ઝડપી સંપર્ક')}</h2>
                    <ul className="space-y-3 text-sm leading-relaxed">
                        <li><strong>📞</strong> {contactInfo.phone}</li>
                        <li><strong>✉️</strong> {contactInfo.email}</li>
                        <li><strong>📍</strong> {contactInfo.address}</li>
                        <li><strong>⏰</strong> {contactInfo.hours}</li>
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-2xl font-bold mb-4">{t('Send us a message', 'અમને સંદેશો મોકલો')}</h2>
                    {submitSuccess && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                            {t('Message sent successfully!', 'સંદેશ સફળતાપૂર્વક મોકલ્યો!')}
                        </div>
                    )}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="name">{t('Name', 'નામ')}</label>
                            <input 
                                id="name" 
                                type="text" 
                                required 
                                value={formData.name}
                                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="email">{t('Email', 'ઇમેલ')}</label>
                            <input 
                                id="email" 
                                type="email" 
                                required 
                                value={formData.email}
                                onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700" htmlFor="message">{t('Message', 'સંદેશ')}</label>
                            <textarea 
                                id="message" 
                                rows="4" 
                                required 
                                value={formData.message}
                                onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                            ></textarea>
                        </div>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="bg-primary-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? t('Sending...', 'મોકલી રહ્યું છે...') : t('Send Message', 'સંદેશ મોકલો')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;