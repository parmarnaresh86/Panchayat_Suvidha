import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  BarChart3, 
  Settings, 
  Layout,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import axios from '../api/axios';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import StaffAttendancePage from './StaffAttendancePage';
import EducationModulesAdmin from './EducationModulesAdmin';
import EmploymentModulesAdmin from './EmploymentModulesAdmin';
import FacilitiesModulesAdmin from './FacilitiesModulesAdmin';
import PageBuilderAdmin from './PageBuilderAdmin';
import { useLanguage } from '../context/LanguageContext';

// ── Editable Form Download ─────────────────────────────────────
const DEFAULT_LINKS = [
    { id: 1, title: 'Digital Gujarat',   titleGu: 'ડિજિટલ ગુજરાત',   description: 'Government services portal', url: 'https://www.digitalgujarat.gov.in' },
    { id: 2, title: 'eGram Swaraj',      titleGu: 'ઈ-ગ્રામ સ્વરાજ',   description: 'Panchayat reports & planning', url: 'https://egramswaraj.gov.in' },
    { id: 3, title: 'UIDAI (Aadhaar)',   titleGu: 'UIDAI (આધાર)',     description: 'Aadhaar services', url: 'https://uidai.gov.in' },
    { id: 4, title: 'PM Kisan',          titleGu: 'PM કિસાન',         description: 'Farmer support scheme', url: 'https://pmkisan.gov.in' },
    { id: 5, title: 'GST Portal',        titleGu: 'GST પોર્ટલ',       description: 'Tax related services', url: 'https://www.gst.gov.in' },
    { id: 6, title: 'Form Download',     titleGu: 'ફોર્મ ડાઉનલોડ',    description: 'Panchayat forms', url: '' },
];

const EMPTY_LINK = { title: '', titleGu: '', description: '', url: '' };

const EditableFormDownload = () => {
    const [links, setLinks] = React.useState(() => {
        try { return JSON.parse(localStorage.getItem('formDownloadLinks')) || DEFAULT_LINKS; }
        catch { return DEFAULT_LINKS; }
    });
    const [editId, setEditId] = React.useState(null);
    const [draft, setDraft] = React.useState(EMPTY_LINK);
    const [showAdd, setShowAdd] = React.useState(false);
    const [newLink, setNewLink] = React.useState(EMPTY_LINK);

    const persist = (updated) => {
        setLinks(updated);
        localStorage.setItem('formDownloadLinks', JSON.stringify(updated));
    };

    const startEdit = (link) => { setEditId(link.id); setDraft({ ...link }); };
    const cancelEdit = () => { setEditId(null); setDraft(EMPTY_LINK); };
    const saveEdit = () => {
        persist(links.map(l => l.id === editId ? { ...draft, id: editId } : l));
        cancelEdit();
    };
    const deleteLink = (id) => persist(links.filter(l => l.id !== id));
    const addLink = () => {
        if (!newLink.title.trim() || !newLink.url.trim()) return;
        persist([...links, { ...newLink, id: Date.now() }]);
        setNewLink(EMPTY_LINK);
        setShowAdd(false);
    };

    const field = (label, key, obj, setObj, type = 'text') => (
        <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500">{label}</label>
            <input
                type={type}
                value={obj[key]}
                onChange={e => setObj(p => ({ ...p, [key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
        </div>
    );

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <span>📥</span> Form Download Links
                </h3>
                <Button onClick={() => setShowAdd(p => !p)} className="bg-orange-500 hover:bg-orange-600 text-white w-auto px-4 py-2 text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" /> {showAdd ? 'Cancel' : 'Add Link'}
                </Button>
            </div>

            {showAdd && (
                <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {field('Title (EN)', 'title', newLink, setNewLink)}
                        {field('Title (GU)', 'titleGu', newLink, setNewLink)}
                        {field('Description', 'description', newLink, setNewLink)}
                        {field('URL', 'url', newLink, setNewLink, 'url')}
                    </div>
                    <div className="flex gap-2 pt-1">
                        <Button onClick={addLink} className="bg-orange-500 hover:bg-orange-600 text-white w-auto px-4 py-2 text-sm">Add</Button>
                        <Button onClick={() => { setShowAdd(false); setNewLink(EMPTY_LINK); }} className="bg-white border border-gray-200 text-gray-700 w-auto px-4 py-2 text-sm">Cancel</Button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {links.map(link => (
                    <div key={link.id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition-shadow">
                        {editId === link.id ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {field('Title (EN)', 'title', draft, setDraft)}
                                    {field('Title (GU)', 'titleGu', draft, setDraft)}
                                    {field('Description', 'description', draft, setDraft)}
                                    {field('URL', 'url', draft, setDraft, 'url')}
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={saveEdit} className="bg-orange-500 hover:bg-orange-600 text-white w-auto px-4 py-1.5 text-sm">Save</Button>
                                    <Button onClick={cancelEdit} className="bg-white border border-gray-200 text-gray-700 w-auto px-4 py-1.5 text-sm">Cancel</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900">{link.title} <span className="text-gray-400 font-normal text-sm">/ {link.titleGu}</span></p>
                                    <p className="text-xs text-gray-500 mt-0.5">{link.description}</p>
                                    <a href={link.url} target="_blank" rel="noreferrer" className="text-xs text-orange-500 hover:underline truncate block mt-1">{link.url || '—'}</a>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => startEdit(link)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => deleteLink(link.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
};

const AdminDashboard = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const [adminSubTab, setAdminSubTab] = useState('staff-attendance');
    const [servicesSubTab, setServicesSubTab] = useState('admin-panel');
    const [villageData, setVillageData] = useState(null);
    const [censusData, setCensusData] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Village form state
    const [villageForm, setVillageForm] = useState({
        name: '',
        taluka: '',
        district: '',
        state: '',
        area: '',
        total_households: '',
        description: '',
        history_en: '',
        history_gu: ''
    });
    const [villageSaving, setVillageSaving] = useState(false);

    // Census state
    const [showAddCensus, setShowAddCensus] = useState(false);
    const [censusForm, setCensusForm] = useState({
        category: '',
        total: '',
        male: '',
        female: ''
    });
    const [censusSaving, setCensusSaving] = useState(false);
    const [censusEditId, setCensusEditId] = useState(null);
    const [censusEdit, setCensusEdit] = useState({
        category: '',
        total: '',
        male: '',
        female: ''
    });
    const [censusEditSaving, setCensusEditSaving] = useState(false);

    // Member state
    const [memberEditId, setMemberEditId] = useState(null);
    const [memberDraft, setMemberDraft] = useState({ role: '', name: '', email: '', mobile: '', address: '', description: '', photo_url: '' });
    const [memberEditSaving, setMemberEditSaving] = useState(false);
    const [memberPhotoFile, setMemberPhotoFile] = useState(null);
    const [memberPhotoPreview, setMemberPhotoPreview] = useState('');

    // Add member state
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMember, setNewMember] = useState({ role: '', name: '', email: '', mobile: '', address: '', description: '' });
    const [addMemberSaving, setAddMemberSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!villageData) return;

        setVillageForm({
            name: villageData?.name ?? '',
            taluka: villageData?.taluka ?? '',
            district: villageData?.district ?? '',
            state: villageData?.state ?? '',
            area: villageData?.area ?? '',
            total_households: villageData?.total_households ?? '',
            description: villageData?.description ?? '',
            history_en: villageData?.history?.english ?? '',
            history_gu: villageData?.history?.gujarati ?? ''
        });
    }, [villageData]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vRes, cRes, mRes] = await Promise.all([
                axios.get('/village'),
                axios.get('/census'),
                axios.get('/panchayat')
            ]);
            setVillageData(vRes.data);
            setCensusData(cRes.data);
            setMembers(mRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/login';
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedImage) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('image', selectedImage);

        try {
            await axios.post('/village/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Image uploaded successfully!');
            setSelectedImage(null);
            fetchData(); // Refresh to see new images
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Delete this image?')) return;

        try {
            await axios.delete(`/village/image/${imageId}`);
            alert('Image deleted successfully');
            fetchData();
        } catch (error) {
            console.error('Delete image failed:', error);
            alert('Failed to delete image');
        }
    };

    const handleVillageUpdate = async () => {
        setVillageSaving(true);
        try {
            await axios.post('/village/update', {
                ...villageForm
            });
            alert('Village updated successfully!');
            fetchData();
        } catch (error) {
            console.error('Village update failed:', error);
            alert('Failed to update village.');
        } finally {
            setVillageSaving(false);
        }
    };

    const handleAddCensus = async () => {
        if (!censusForm.category.trim()) {
            alert('Please enter category');
            return;
        }

        setCensusSaving(true);
        try {
            await axios.post('/census/add', {
                category: censusForm.category,
                total: Number(censusForm.total),
                male: Number(censusForm.male),
                female: Number(censusForm.female)
            });
            alert('Census record added!');
            setShowAddCensus(false);
            setCensusForm({ category: '', total: '', male: '', female: '' });
            fetchData();
        } catch (err) {
            console.error('Add census failed:', err);
            alert('Failed to add census record.');
        } finally {
            setCensusSaving(false);
        }
    };

    const handleDeleteCensus = async (id) => {
        try {
            await axios.delete(`/census/${id}`);
            fetchData();
        } catch (err) {
            console.error('Delete census failed:', err);
            alert('Failed to delete census record.');
        }
    };

    const handleStartCensusEdit = (item) => {
        setCensusEditId(item.id);
        setCensusEdit({
            category: item.category ?? '',
            total: String(item.total ?? ''),
            male: String(item.male ?? ''),
            female: String(item.female ?? '')
        });
    };

    const handleCancelCensusEdit = () => {
        setCensusEditId(null);
        setCensusEdit({ category: '', total: '', male: '', female: '' });
    };

    const handleSaveCensusEdit = async () => {
        if (!censusEditId) return;
        setCensusEditSaving(true);
        try {
            await axios.post('/census/update', {
                id: censusEditId,
                category: censusEdit.category,
                total: Number(censusEdit.total),
                male: Number(censusEdit.male),
                female: Number(censusEdit.female)
            });
            alert('Census updated!');
            handleCancelCensusEdit();
            fetchData();
        } catch (err) {
            console.error('Update census failed:', err);
            alert('Failed to update census.');
        } finally {
            setCensusEditSaving(false);
        }
    };

    const handleStartMemberEdit = (member) => {
        setMemberEditId(member.id);
        setMemberPhotoFile(null);
        setMemberPhotoPreview(member.photo_url || '');
        setMemberDraft({
            role: member.role ?? '',
            name: member.name ?? '',
            email: member.email ?? '',
            mobile: member.mobile ?? '',
            address: member.address ?? '',
            description: member.description ?? '',
            photo_url: member.photo_url ?? ''
        });
    };

    const handleCancelMemberEdit = () => {
        setMemberEditId(null);
        setMemberPhotoFile(null);
        setMemberPhotoPreview('');
        setMemberDraft({
            role: '',
            name: '',
            email: '',
            mobile: '',
            address: '',
            description: '',
            photo_url: ''
        });
    };

    const handleSaveMemberEdit = async () => {
        if (!memberEditId) return;
        setMemberEditSaving(true);

        try {
            let photoUrl = memberDraft.photo_url;

            if (memberPhotoFile) {
                const formData = new FormData();
                formData.append('photo', memberPhotoFile);
                formData.append('memberId', memberEditId);

                const uploadRes = await axios.post('/panchayat/member/upload-photo', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (!uploadRes?.data?.photo_url) {
                    throw new Error('Upload succeeded but did not return photo_url');
                }

                photoUrl = uploadRes.data.photo_url;
            }

            const updateRes = await axios.post('/panchayat/member/update', {
                id: memberEditId,
                ...memberDraft,
                photo_url: photoUrl
            });

            if (!updateRes?.data?.message) {
                throw new Error('Update request succeeded with no response message');
            }

            alert('Member updated and photo saved!');
            handleCancelMemberEdit();
            fetchData();
        } catch (err) {
            console.error('Update member failed:', err);
            const serverMessage = err.response?.data?.message || err.response?.data?.error;
            const message = serverMessage || err.message || 'Failed to update member.';
            alert(`Failed to update member: ${message}`);
        } finally {
            setMemberEditSaving(false);
        }
    };

    const handleMemberPhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMemberPhotoFile(file);
            setMemberPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleAddMember = async () => {
        if (!newMember.name.trim() || !newMember.role.trim()) {
            alert('Name and Role are required');
            return;
        }
        setAddMemberSaving(true);
        try {
            await axios.post('/panchayat/member/add', newMember);
            setShowAddMember(false);
            setNewMember({ role: '', name: '', email: '', mobile: '', address: '', description: '' });
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to add member');
        } finally {
            setAddMemberSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-orange-600 flex items-center gap-2">
                        <LayoutDashboard className="w-6 h-6" /> {t('Admin Panel', 'એડમિન પેનલ')}
                    </h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem 
                        icon={<MapPin className="w-5 h-5" />} 
                        label={t('Village Profile', 'ગામની પ્રોફાઇલ')}
                        active={activeTab === 'village'} 
                        onClick={() => setActiveTab('village')} 
                    />
                    <SidebarItem 
                        icon={<Settings className="w-5 h-5" />} 
                        label={t('Services', 'સેવાઓ')}
                        active={activeTab === 'services'} 
                        onClick={() => setActiveTab('services')} 
                    />
                    <SidebarItem
                        icon={<Layout className="w-5 h-5" />}
                        label={t('Page Builder', 'પેજ બિલ્ડર')}
                        active={activeTab === 'page-builder'}
                        onClick={() => setActiveTab('page-builder')}
                    />
                    <SidebarItem
                        icon={<Users className="w-5 h-5" />}
                        label={t('Contact', 'સંપર્ક')}
                        active={activeTab === 'contact'}
                        onClick={() => setActiveTab('contact')}
                    />
                </nav>
                <div className="p-4 border-t border-gray-100">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                        <LogOut className="w-5 h-5" /> {t('Logout', 'લૉગઆઉટ')}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 capitalize">
                        {activeTab === 'village' && t('Village Profile', 'ગામની પ્રોફાઇલ')}
                        {activeTab === 'services' && t('Services', 'સેવાઓ')}
                        {activeTab === 'page-builder' && t('Page Builder', 'પેજ બિલ્ડર')}
                        {activeTab === 'contact' && t('Contact', 'સંપર્ક')}
                    </h1>
                    
                </header>

                {activeTab === 'village' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <Card>
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <h3 className="text-lg font-bold">{t('Village Details', 'ગામની વિગતો')}</h3>
                                <Button
                                    onClick={handleVillageUpdate}
                                    disabled={villageSaving}
                                    className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-5 py-2 text-sm whitespace-nowrap"
                                >
                                    {villageSaving ? t('Updating...', 'અપડેટ થઈ રહ્યું છે...') : t('Update Village', 'ગામ અપડેટ કરો')}
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">{t('Village Name', 'ગામનું નામ')}</label>
                                    <Input
                                        value={villageForm.name}
                                        onChange={(e) => setVillageForm((p) => ({ ...p, name: e.target.value }))}
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">{t('Taluka', 'તાલુકો')}</label>
                                    <Input
                                        value={villageForm.taluka}
                                        onChange={(e) => setVillageForm((p) => ({ ...p, taluka: e.target.value }))}
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">{t('District', 'જિલ્લો')}</label>
                                    <Input
                                        value={villageForm.district}
                                        onChange={(e) => setVillageForm((p) => ({ ...p, district: e.target.value }))}
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">{t('State', 'રાજ્ય')}</label>
                                    <Input
                                        value={villageForm.state}
                                        onChange={(e) => setVillageForm((p) => ({ ...p, state: e.target.value }))}
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">{t('Area', 'વિસ્તાર')}</label>
                                    <Input
                                        value={villageForm.area}
                                        onChange={(e) => setVillageForm((p) => ({ ...p, area: e.target.value }))}
                                        type="text"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">{t('Total Households', 'કુલ ઘરો')}</label>
                                    <Input
                                        value={villageForm.total_households}
                                        onChange={(e) =>
                                            setVillageForm((p) => ({ ...p, total_households: e.target.value }))
                                        }
                                        type="text"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-600">{t('Description', 'વર્ણન')}</label>
                                    <textarea
                                        className="w-full border border-gray-200 rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        rows={3}
                                        value={villageForm.description}
                                        onChange={(e) => setVillageForm((p) => ({ ...p, description: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600">{t('History (EN)', 'ઇતિહાસ (અંગ્રેજી)')}</label>
                                        <textarea
                                            className="w-full border border-gray-200 rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            rows={2}
                                            value={villageForm.history_en}
                                            onChange={(e) =>
                                                setVillageForm((p) => ({ ...p, history_en: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-600">{t('History (GU)', 'ઇતિહાસ (ગુજરાતી)')}</label>
                                        <textarea
                                            className="w-full border border-gray-200 rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            rows={2}
                                            value={villageForm.history_gu}
                                            onChange={(e) =>
                                                setVillageForm((p) => ({ ...p, history_gu: e.target.value }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Image Upload Section */}
                        <Card>
                            <div className="flex items-center gap-3 mb-6">
                                <ImageIcon className="w-6 h-6 text-orange-600" />
                                <h3 className="text-lg font-bold">{t('Village Photos', 'ગામના ફોટા')}</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-orange-300 transition-colors bg-gray-50/50">
                                        <input 
                                            type="file" 
                                            id="file-upload" 
                                            className="hidden" 
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-orange-500 mb-2">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">
                                                {selectedImage ? selectedImage.name : t('Click to upload photo', 'ફોટો અપલોડ કરવા માટે ક્લિક કરો')}
                                            </span>
                                            <span className="text-xs text-gray-400">{t('PNG, JPG up to 10MB', 'PNG, JPG 10MB સુધી')}</span>
                                        </label>
                                    </div>
                                    <Button 
                                        onClick={handleUpload}
                                        disabled={!selectedImage || uploading}
                                        className={`${!selectedImage ? 'bg-gray-300' : 'bg-orange-600 hover:bg-orange-700'} text-white font-bold py-3`}
                                    >
                                        {uploading ? t('Uploading...', 'અપલોડ થઈ રહ્યું છે...') : t('Confirm Upload', 'અપલોડ કન્ફર્મ કરો')}
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{t('Current Gallery', 'વર્તમાન ગેલેરી')}</h4>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(villageData?.villageImages || []).map((image) => (
                                            <div key={image.id} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 shadow-sm">
                                                <img src={image.url} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={() => handleDeleteImage(image.id)}
                                                        className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                        {/* Census Data Section */}
                        <Card>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="w-6 h-6 text-orange-600" />
                                    <h3 className="text-lg font-bold">{t('Census Data', 'વસ્તી ગણતરી ડેટા')}</h3>
                                </div>
                                <Button
                                    onClick={() => setShowAddCensus((p) => !p)}
                                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm whitespace-nowrap"
                                >
                                    <Plus className="w-4 h-4" /> {showAddCensus ? t('Cancel', 'રદ કરો') : t('Add Record', 'રેકોર્ડ ઉમેરો')}
                                </Button>
                            </div>

                            {showAddCensus && (
                                <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">{t('Category', 'શ્રેણી')}</label>
                                            <Input value={censusForm.category} onChange={(e) => setCensusForm((p) => ({ ...p, category: e.target.value }))} type="text" placeholder={t('e.g. Population', 'દા.ત. વસ્તી')} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">{t('Total', 'કુલ')}</label>
                                            <Input value={censusForm.total} onChange={(e) => setCensusForm((p) => ({ ...p, total: e.target.value }))} type="number" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">{t('Male', 'પુરુષ')}</label>
                                            <Input value={censusForm.male} onChange={(e) => setCensusForm((p) => ({ ...p, male: e.target.value }))} type="number" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">{t('Female', 'સ્ત્રી')}</label>
                                            <Input value={censusForm.female} onChange={(e) => setCensusForm((p) => ({ ...p, female: e.target.value }))} type="number" />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-3">
                                        <Button onClick={handleAddCensus} disabled={censusSaving} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 text-sm whitespace-nowrap">
                                            {censusSaving ? t('Saving...', 'સાચવી રહ્યું છે...') : t('Add Record', 'રેકોર્ડ ઉમેરો')}
                                        </Button>
                                        <Button onClick={() => { setShowAddCensus(false); setCensusForm({ category: '', total: '', male: '', female: '' }); }} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-5 py-2 text-sm whitespace-nowrap">
                                            {t('Cancel', 'રદ કરો')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                        <tr>
                                            <th className="px-4 py-3 font-bold">{t('Category', 'શ્રેણી')}</th>
                                            <th className="px-4 py-3 font-bold">{t('Total', 'કુલ')}</th>
                                            <th className="px-4 py-3 font-bold">{t('Male', 'પુરુષ')}</th>
                                            <th className="px-4 py-3 font-bold">{t('Female', 'સ્ત્રી')}</th>
                                            <th className="px-4 py-3 font-bold text-right">{t('Actions', 'ક્રિયાઓ')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {censusData.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-medium">
                                                    {censusEditId === item.id ? <Input value={censusEdit.category} onChange={(e) => setCensusEdit((p) => ({ ...p, category: e.target.value }))} type="text" /> : item.category}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {censusEditId === item.id ? <Input value={censusEdit.total} onChange={(e) => setCensusEdit((p) => ({ ...p, total: e.target.value }))} type="number" /> : item.total}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {censusEditId === item.id ? <Input value={censusEdit.male} onChange={(e) => setCensusEdit((p) => ({ ...p, male: e.target.value }))} type="number" /> : item.male}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {censusEditId === item.id ? <Input value={censusEdit.female} onChange={(e) => setCensusEdit((p) => ({ ...p, female: e.target.value }))} type="number" /> : item.female}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        {censusEditId === item.id ? (
                                                            <>
                                                                <button className="p-2 text-green-700 hover:bg-green-50 rounded-lg" onClick={handleSaveCensusEdit} disabled={censusEditSaving}><Save className="w-4 h-4" /></button>
                                                                <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg" onClick={handleCancelCensusEdit}><X className="w-4 h-4" /></button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" onClick={() => handleStartCensusEdit(item)}><Edit className="w-4 h-4" /></button>
                                                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" onClick={() => handleDeleteCensus(item.id)}><Trash2 className="w-4 h-4" /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Panchayat Members Section */}
                        <Card>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Users className="w-6 h-6 text-orange-600" />
                                    <h3 className="text-lg font-bold">{t('Panchayat Members', 'પંચાયત સભ્યો')}</h3>
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
                                        {members.length}/3
                                    </span>
                                </div>
                                {members.length < 3 && (
                                    <Button
                                        onClick={() => setShowAddMember(p => !p)}
                                        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-4 py-2 text-sm whitespace-nowrap"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {showAddMember ? t('Cancel', 'રદ કરો') : t('Add Member', 'સભ્ય ઉમેરો')}
                                    </Button>
                                )}
                                {members.length >= 3 && (
                                    <span className="text-xs text-gray-400 italic">{t('Maximum 3 members reached', 'મહત્તમ 3 સભ્યો પહોંચી ગયા')}</span>
                                )}
                            </div>

                            {/* Add Member Form */}
                            {showAddMember && (
                                <div className="mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-4">
                                    <h4 className="font-bold text-gray-700 text-sm">{t('New Member Details', 'નવા સભ્યની વિગતો')}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">{t('Name', 'નામ')} *</label>
                                            <Input value={newMember.name} onChange={e => setNewMember(p => ({ ...p, name: e.target.value }))} type="text" placeholder={t('Full name', 'પૂરું નામ')} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">{t('Role', 'ભૂમિકા')} *</label>
                                            <select
                                                value={newMember.role}
                                                onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}
                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                            >
                                                <option value="">{t('Select role', 'ભૂમિકા પસંદ કરો')}</option>
                                                <option value="Sarpanch">{t('Sarpanch', 'સરપંચ')}</option>
                                                <option value="Secretary">{t('Secretary', 'સચિવ')}</option>
                                                <option value="Member">{t('Member', 'સભ્ય')}</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">{t('Email', 'ઈમેલ')}</label>
                                            <Input value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} type="email" placeholder="email@example.com" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-600">{t('Mobile', 'મોબાઇલ')}</label>
                                            <Input value={newMember.mobile} onChange={e => setNewMember(p => ({ ...p, mobile: e.target.value }))} type="text" placeholder={t('10-digit number', '10-અંકનો નંબર')} />
                                        </div>
                                        <div className="space-y-1 sm:col-span-2">
                                            <label className="text-xs font-bold text-gray-600">{t('Address', 'સરનામું')}</label>
                                            <Input value={newMember.address} onChange={e => setNewMember(p => ({ ...p, address: e.target.value }))} type="text" placeholder={t('Address', 'સરનામું')} />
                                        </div>
                                        <div className="space-y-1 sm:col-span-2">
                                            <label className="text-xs font-bold text-gray-600">{t('Description', 'વર્ણન')}</label>
                                            <textarea
                                                rows={2}
                                                value={newMember.description}
                                                onChange={e => setNewMember(p => ({ ...p, description: e.target.value }))}
                                                placeholder={t('Short bio...', 'ટૂંકી માહિતી...')}
                                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-1">
                                        <Button
                                            onClick={handleAddMember}
                                            disabled={addMemberSaving}
                                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 text-sm whitespace-nowrap"
                                        >
                                            {addMemberSaving ? t('Adding...', 'ઉમેરી રહ્યું છે...') : t('Add Member', 'સભ્ય ઉમેરો')}
                                        </Button>
                                        <Button
                                            onClick={() => { setShowAddMember(false); setNewMember({ role: '', name: '', email: '', mobile: '', address: '', description: '' }); }}
                                            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-5 py-2 text-sm whitespace-nowrap"
                                        >
                                            {t('Cancel', 'રદ કરો')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Members Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {members.map((member) => (
                                    <div key={member.id} className="border border-gray-100 rounded-2xl p-4 flex gap-4 items-start hover:shadow-sm transition-shadow">
                                        <div className="w-16 h-16 rounded-xl shrink-0 overflow-hidden bg-orange-100 border border-gray-200">
                                            {member.photo_url ? (
                                                <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-orange-600 text-2xl font-bold">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {memberEditId === member.id ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-500">{t('Name', 'નામ')}</label>
                                                            <Input value={memberDraft.name} onChange={e => setMemberDraft(p => ({ ...p, name: e.target.value }))} type="text" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-500">{t('Role', 'ભૂમિકા')}</label>
                                                            <select
                                                                value={memberDraft.role}
                                                                onChange={e => setMemberDraft(p => ({ ...p, role: e.target.value }))}
                                                                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                                                            >
                                                                <option value="Sarpanch">{t('Sarpanch', 'સરપંચ')}</option>
                                                                <option value="Secretary">{t('Secretary', 'સચિવ')}</option>
                                                                <option value="Member">{t('Member', 'સભ્ય')}</option>
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-500">{t('Email', 'ઈમેલ')}</label>
                                                            <Input value={memberDraft.email} onChange={e => setMemberDraft(p => ({ ...p, email: e.target.value }))} type="text" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-bold text-gray-500">{t('Mobile', 'મોબાઇલ')}</label>
                                                            <Input value={memberDraft.mobile} onChange={e => setMemberDraft(p => ({ ...p, mobile: e.target.value }))} type="text" />
                                                        </div>
                                                        <div className="col-span-2 space-y-1">
                                                            <label className="text-xs font-bold text-gray-500">{t('Address', 'સરનામું')}</label>
                                                            <Input value={memberDraft.address} onChange={e => setMemberDraft(p => ({ ...p, address: e.target.value }))} type="text" />
                                                        </div>
                                                        <div className="col-span-2 space-y-1">
                                                            <label className="text-xs font-bold text-gray-500">{t('Photo', 'ફોટો')}</label>
                                                            <input type="file" accept="image/*" onChange={handleMemberPhotoChange} className="w-full text-sm" />
                                                            {memberPhotoPreview && <img src={memberPhotoPreview} alt="preview" className="w-14 h-14 rounded-lg object-cover mt-1 border" />}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button onClick={handleSaveMemberEdit} disabled={memberEditSaving} className="bg-orange-500 hover:bg-orange-600 text-white text-xs py-1.5 px-4 whitespace-nowrap">
                                                            {memberEditSaving ? t('Saving...', 'સાચવી રહ્યું છે...') : t('Save', 'સાચવો')}
                                                        </Button>
                                                        <Button onClick={handleCancelMemberEdit} className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1.5 px-4 whitespace-nowrap">
                                                            {t('Cancel', 'રદ કરો')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-bold text-gray-900 truncate">{member.name}</h4>
                                                        <span className="shrink-0 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{member.role}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-0.5">{member.email}</p>
                                                    <p className="text-xs text-gray-500">{member.mobile}</p>
                                                    <button
                                                        onClick={() => handleStartMemberEdit(member)}
                                                        className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" /> {t('Edit Member', 'સભ્ય સંપાદિત કરો')}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="animate-in fade-in duration-500 space-y-6">
                        {/* 4 sub-tabs only */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { id: 'admin-panel',        label: 'Admin',              labelGu: 'એડમિન' },
                                    { id: 'education-modules',  label: 'Education Modules',  labelGu: 'શિક્ષણ' },
                                    { id: 'employment-modules', label: 'Employment Modules', labelGu: 'રોજગાર' },
                                    { id: 'facilities-modules', label: 'Facilities Modules', labelGu: 'સુવિધાઓ' },
                                ].map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setServicesSubTab(cat.id)}
                                        className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all duration-150
                                            ${servicesSubTab === cat.id
                                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                                            }`}
                                    >
                                        {cat.label}
                                        <span className="ml-1.5 text-xs opacity-60">{cat.labelGu}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Admin → Staff Attendance / Form Download */}
                        {servicesSubTab === 'admin-panel' && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                                    <div className="flex flex-wrap gap-3">
                                        {[
                                            { id: 'staff-attendance', label: 'Staff Attendance', labelGu: 'સ્ટાફ હાજરી' },
                                            { id: 'form-download',    label: 'Form Download',    labelGu: 'ફોર્મ ડાઉનલોડ' },
                                        ].map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setAdminSubTab(cat.id)}
                                                className={`px-5 py-2 rounded-xl text-sm font-semibold border transition-all duration-150
                                                    ${adminSubTab === cat.id
                                                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                                                    }`}
                                            >
                                                {cat.label}
                                                <span className="ml-1.5 text-xs opacity-70">{cat.labelGu}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {adminSubTab === 'staff-attendance' && <StaffAttendancePage />}
                                {adminSubTab === 'form-download'    && <EditableFormDownload />}
                            </div>
                        )}

                        {servicesSubTab === 'education-modules'  && <EducationModulesAdmin />}
                        {servicesSubTab === 'employment-modules' && <EmploymentModulesAdmin />}
                        {servicesSubTab === 'facilities-modules' && <FacilitiesModulesAdmin />}
                    </div>
                )}

                {activeTab === 'page-builder' && (
                    <PageBuilderAdmin />
                )}

                {activeTab === 'contact' && (
                    <ContactAdmin t={t} />
                )}

            </main>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ContactAdmin = ({ t }) => {
    const [contactInfo, setContactInfo] = useState({ phone: '', email: '', address: '', hours: '' });
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [infoRes, messagesRes] = await Promise.all([
                axios.get('/contact/info'),
                axios.get('/contact/messages')
            ]);
            setContactInfo(infoRes.data);
            setMessages(messagesRes.data);
        } catch (err) {
            console.error('Failed to load contact data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveContactInfo = async () => {
        setSaving(true);
        try {
            await axios.put('/contact/info', contactInfo);
            alert(t('Contact info updated!', 'સંપર્ક માહિતી અપડેટ થઈ!'));
        } catch (err) {
            alert(t('Failed to update contact info', 'સંપર્ક માહિતી અપડેટ કરવામાં નિષ્ફળ'));
        } finally {
            setSaving(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await axios.put(`/contact/messages/${id}/read`);
            fetchData();
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!window.confirm(t('Delete this message?', 'આ સંદેશ કાઢી નાખો?'))) return;
        try {
            await axios.delete(`/contact/messages/${id}`);
            fetchData();
        } catch (err) {
            console.error('Failed to delete message:', err);
        }
    };

    if (loading) return <div className="text-center p-10">{t('Loading...', 'લોડ થઈ રહ્યું છે...')}</div>;

    const unreadCount = messages.filter(m => !m.is_read).length;

    return (
        <div className="space-y-6">
            {/* Contact Info Editor */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{t('Contact Information', 'સંપર્ક માહિતી')}</h3>
                    <Button onClick={handleSaveContactInfo} disabled={saving} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 text-sm whitespace-nowrap">
                        {saving ? t('Saving...', 'સાચવી રહ્યું છે...') : t('Save Changes', 'ફેરફારો સાચવો')}
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">{t('Phone', 'ફોન')}</label>
                        <Input value={contactInfo.phone} onChange={(e) => setContactInfo(p => ({ ...p, phone: e.target.value }))} type="text" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">{t('Email', 'ઈમેલ')}</label>
                        <Input value={contactInfo.email} onChange={(e) => setContactInfo(p => ({ ...p, email: e.target.value }))} type="email" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">{t('Address', 'સરનામું')}</label>
                        <Input value={contactInfo.address} onChange={(e) => setContactInfo(p => ({ ...p, address: e.target.value }))} type="text" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-600">{t('Office Hours', 'કાર્યાલય સમય')}</label>
                        <Input value={contactInfo.hours} onChange={(e) => setContactInfo(p => ({ ...p, hours: e.target.value }))} type="text" />
                    </div>
                </div>
            </Card>

            {/* Messages List */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold">{t('Contact Messages', 'સંપર્ક સંદેશાઓ')}</h3>
                        {unreadCount > 0 && (
                            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                                {unreadCount} {t('new', 'નવા')}
                            </span>
                        )}
                    </div>
                </div>

                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">{t('No messages yet', 'હજુ સુધી કોઈ સંદેશ નથી')}</p>
                ) : (
                    <div className="space-y-3">
                        {messages.map(msg => (
                            <div key={msg.id} className={`border rounded-2xl p-4 transition-colors ${msg.is_read ? 'border-gray-100 bg-white' : 'border-orange-100 bg-orange-50'}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-bold text-gray-900">{msg.name}</p>
                                            {!msg.is_read && (
                                                <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{t('New', 'નવું')}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-2">{msg.email} • {new Date(msg.created_at).toLocaleString()}</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                        {!msg.is_read && (
                                            <button onClick={() => handleMarkAsRead(msg.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title={t('Mark as read', 'વાંચ્યું તરીકે ચિહ્નિત કરો')}>
                                                <Save className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteMessage(msg.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title={t('Delete', 'કાઢી નાખો')}>
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 font-medium ${
            active 
            ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-100' 
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
        {icon}
        {label}
    </button>
);

export default AdminDashboard;
