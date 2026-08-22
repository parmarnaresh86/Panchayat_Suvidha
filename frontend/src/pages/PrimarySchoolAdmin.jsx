import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import Card from '../components/Card';
import Input from '../components/Input';

const getDefaultPrimarySchoolData = () => ({
    basicInfo: {
        schoolName: '',
        address: '',
        udiseCode: '',
        contactNumber: '',
        headmasterName: ''
    },
    staff: [],
    announcements: [],
    map: {
        embedUrl: '',
        locationUrl: ''
    }
});

const PrimarySchoolAdmin = () => {
    const [data, setData] = useState(getDefaultPrimarySchoolData());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingTeacherId, setUploadingTeacherId] = useState('');

    useEffect(() => {
        let mounted = true;

        axios
            .get('/education/primary-school')
            .then((res) => {
                if (!mounted) return;
                setData({ ...getDefaultPrimarySchoolData(), ...(res.data || {}) });
            })
            .catch((error) => {
                console.error('Failed to fetch primary school details:', error);
                if (!mounted) return;
                setData(getDefaultPrimarySchoolData());
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, []);

    const setBasicInfoField = (field, value) => {
        setData((prev) => ({
            ...prev,
            basicInfo: {
                ...(prev.basicInfo || {}),
                [field]: value
            }
        }));
    };

    const setMapField = (field, value) => {
        setData((prev) => ({
            ...prev,
            map: {
                ...(prev.map || {}),
                [field]: value
            }
        }));
    };

    const addTeacher = () => {
        setData((prev) => ({
            ...prev,
            staff: [
                ...(Array.isArray(prev.staff) ? prev.staff : []),
                {
                    id: `teacher-${Date.now()}`,
                    name: '',
                    subject: '',
                    qualification: '',
                    contact: '',
                    photoUrl: ''
                }
            ]
        }));
    };

    const removeTeacher = (teacherId) => {
        setData((prev) => ({
            ...prev,
            staff: (Array.isArray(prev.staff) ? prev.staff : []).filter((t) => t.id !== teacherId)
        }));
    };

    const setTeacherField = (teacherId, field, value) => {
        setData((prev) => ({
            ...prev,
            staff: (Array.isArray(prev.staff) ? prev.staff : []).map((teacher) =>
                teacher.id === teacherId ? { ...teacher, [field]: value } : teacher
            )
        }));
    };

    const uploadTeacherPhoto = async (teacherId, file) => {
        if (!file) return;
        setUploadingTeacherId(teacherId);

        try {
            const formData = new FormData();
            formData.append('photo', file);
            formData.append('teacherId', teacherId);

            const res = await axios.post('/education/primary-school/upload-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res?.data?.photo_url) {
                setTeacherField(teacherId, 'photoUrl', res.data.photo_url);
            }
        } catch (error) {
            console.error('Teacher photo upload failed:', error);
            alert('Failed to upload teacher photo.');
        } finally {
            setUploadingTeacherId('');
        }
    };

    const addAnnouncement = () => {
        setData((prev) => ({
            ...prev,
            announcements: [
                ...(Array.isArray(prev.announcements) ? prev.announcements : []),
                {
                    id: `notice-${Date.now()}`,
                    type: 'Event',
                    date: '',
                    message: ''
                }
            ]
        }));
    };

    const removeAnnouncement = (noticeId) => {
        setData((prev) => ({
            ...prev,
            announcements: (Array.isArray(prev.announcements) ? prev.announcements : []).filter(
                (n) => n.id !== noticeId
            )
        }));
    };

    const setAnnouncementField = (noticeId, field, value) => {
        setData((prev) => ({
            ...prev,
            announcements: (Array.isArray(prev.announcements) ? prev.announcements : []).map((notice) =>
                notice.id === noticeId ? { ...notice, [field]: value } : notice
            )
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post('/education/primary-school/update', data);
            alert('Primary school details saved successfully!');
        } catch (error) {
            console.error('Failed to save primary school details:', error);
            alert('Failed to save primary school details.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Card className="p-6">
                <div className="text-gray-600 font-semibold">Loading primary school details...</div>
            </Card>
        );
    }

    const staff = Array.isArray(data.staff) ? data.staff : [];
    const announcements = Array.isArray(data.announcements) ? data.announcements : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="text-sm text-gray-600 font-semibold uppercase tracking-wider">
                        Education Service
                    </div>
                    <h2 className="text-2xl font-extrabold text-blue-700">Primary School Admin</h2>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold disabled:opacity-60"
                >
                    {saving ? 'Saving...' : 'Save All Details'}
                </button>
            </div>

            <Card className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">School Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">School Name</label>
                        <Input
                            type="text"
                            value={data.basicInfo?.schoolName || ''}
                            onChange={(e) => setBasicInfoField('schoolName', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">UDISE Code</label>
                        <Input
                            type="text"
                            value={data.basicInfo?.udiseCode || ''}
                            onChange={(e) => setBasicInfoField('udiseCode', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Contact Number</label>
                        <Input
                            type="text"
                            value={data.basicInfo?.contactNumber || ''}
                            onChange={(e) => setBasicInfoField('contactNumber', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Headmaster Name</label>
                        <Input
                            type="text"
                            value={data.basicInfo?.headmasterName || ''}
                            onChange={(e) => setBasicInfoField('headmasterName', e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Address</label>
                    <textarea
                        className="w-full border border-gray-200 rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        rows={3}
                        value={data.basicInfo?.address || ''}
                        onChange={(e) => setBasicInfoField('address', e.target.value)}
                    />
                </div>
            </Card>

            <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Staff Details</h3>
                    <button
                        type="button"
                        onClick={addTeacher}
                        className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                        Add Teacher
                    </button>
                </div>

                {staff.length === 0 ? (
                    <div className="text-gray-600">No staff added yet.</div>
                ) : (
                    <div className="space-y-4">
                        {staff.map((teacher) => (
                            <div key={teacher.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="font-bold text-gray-900">{teacher.name || 'New Teacher'}</div>
                                    <button
                                        type="button"
                                        onClick={() => removeTeacher(teacher.id)}
                                        className="text-red-600 hover:text-red-700 font-semibold"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Name</label>
                                        <Input
                                            type="text"
                                            value={teacher.name || ''}
                                            onChange={(e) => setTeacherField(teacher.id, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Subject</label>
                                        <Input
                                            type="text"
                                            value={teacher.subject || ''}
                                            onChange={(e) => setTeacherField(teacher.id, 'subject', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Qualification</label>
                                        <Input
                                            type="text"
                                            value={teacher.qualification || ''}
                                            onChange={(e) =>
                                                setTeacherField(teacher.id, 'qualification', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Contact</label>
                                        <Input
                                            type="text"
                                            value={teacher.contact || ''}
                                            onChange={(e) => setTeacherField(teacher.id, 'contact', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Photo URL</label>
                                    <Input
                                        type="text"
                                        value={teacher.photoUrl || ''}
                                        onChange={(e) => setTeacherField(teacher.id, 'photoUrl', e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Upload Profile Photo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => uploadTeacherPhoto(teacher.id, e.target.files?.[0])}
                                    />
                                    {uploadingTeacherId === teacher.id ? (
                                        <div className="text-sm text-blue-600 font-semibold">Uploading photo...</div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Announcements / Notices</h3>
                    <button
                        type="button"
                        onClick={addAnnouncement}
                        className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                        Add Notice
                    </button>
                </div>

                {announcements.length === 0 ? (
                    <div className="text-gray-600">No announcements added yet.</div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map((notice) => (
                            <div key={notice.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="font-bold text-gray-900">Notice</div>
                                    <button
                                        type="button"
                                        onClick={() => removeAnnouncement(notice.id)}
                                        className="text-red-600 hover:text-red-700 font-semibold"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Type</label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                            value={notice.type || 'Event'}
                                            onChange={(e) =>
                                                setAnnouncementField(notice.id, 'type', e.target.value)
                                            }
                                        >
                                            <option value="Holiday">Holiday</option>
                                            <option value="Exam">Exam</option>
                                            <option value="Event">Event</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Date</label>
                                        <input
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                            type="date"
                                            value={notice.date || ''}
                                            onChange={(e) =>
                                                setAnnouncementField(notice.id, 'date', e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Message</label>
                                    <textarea
                                        className="w-full border border-gray-200 rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        rows={3}
                                        value={notice.message || ''}
                                        onChange={(e) =>
                                            setAnnouncementField(notice.id, 'message', e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            <Card className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Map Location</h3>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Google Map Embed URL</label>
                    <Input
                        type="text"
                        value={data.map?.embedUrl || ''}
                        onChange={(e) => setMapField('embedUrl', e.target.value)}
                        placeholder="https://www.google.com/maps/embed?..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Google Map Location URL</label>
                    <Input
                        type="text"
                        value={data.map?.locationUrl || ''}
                        onChange={(e) => setMapField('locationUrl', e.target.value)}
                        placeholder="https://maps.google.com/..."
                    />
                </div>
            </Card>
        </div>
    );
};

export default PrimarySchoolAdmin;
