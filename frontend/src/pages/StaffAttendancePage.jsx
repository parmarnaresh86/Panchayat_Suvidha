import React, { useMemo, useState } from 'react';
import Card from '../components/Card';

const initialStaff = [
    { name: 'Sarpanch', role: 'Sarpanch' },
    { name: 'Secretary', role: 'Secretary' },
    { name: 'Panchayat Staff', role: 'Staff' },
    { name: 'Field Worker', role: 'Field Worker' },
];

const statusOptions = ['Present', 'Absent', 'Leave'];

const todayISO = new Date().toISOString().slice(0, 10);

const formatTime = (time) => (time ? time : '--');

const computeTotalHours = (inTime, outTime) => {
    if (!inTime || !outTime) return '--';

    const [h1, m1] = inTime.split(':').map(Number);
    const [h2, m2] = outTime.split(':').map(Number);
    const start = new Date();
    start.setHours(h1, m1, 0, 0);
    const end = new Date();
    end.setHours(h2, m2, 0, 0);

    let diff = (end - start) / (1000 * 60); // minutes
    if (diff < 0) diff = 0;

    const hours = Math.floor(diff / 60);
    const minutes = Math.round(diff % 60);
    return `${hours}h ${minutes}m`;
};

const StaffAttendancePage = () => {
    const [attendance, setAttendance] = useState([
        { date: todayISO, staffName: 'Sarpanch', role: 'Sarpanch', status: 'Present', inTime: '09:15', outTime: '17:20', remarks: '' },
        { date: todayISO, staffName: 'Secretary', role: 'Secretary', status: 'Present', inTime: '09:05', outTime: '17:05', remarks: '' },
        { date: todayISO, staffName: 'Panchayat Staff', role: 'Staff', status: 'Absent', inTime: '', outTime: '', remarks: 'Sick leave' },
    ]);

    const [formData, setFormData] = useState({
        staffName: initialStaff[0].name,
        date: todayISO,
        status: 'Present',
        inTime: '09:00',
        outTime: '17:00',
        remarks: '',
    });

    const [filters, setFilters] = useState({ from: '', to: '', staffName: '', status: '' });

    const filteredAttendance = useMemo(() => {
        return attendance.filter((row) => {
            const date = row.date;
            if (filters.from && date < filters.from) return false;
            if (filters.to && date > filters.to) return false;
            if (filters.staffName && row.staffName !== filters.staffName) return false;
            if (filters.status && row.status !== filters.status) return false;
            return true;
        });
    }, [attendance, filters]);

    const summaryStats = useMemo(() => {
        const totalStaff = new Set(initialStaff.map((s) => s.name)).size;
        const presentToday = attendance.filter((r) => r.date === todayISO && r.status === 'Present').length;
        const absentToday = attendance.filter((r) => r.date === todayISO && r.status === 'Absent').length;
        const lateEntries = attendance.filter((r) => r.date === todayISO && r.status === 'Present' && r.inTime > '09:30').length;

        return { totalStaff, presentToday, absentToday, lateEntries };
    }, [attendance]);

    const monthlyReport = useMemo(() => {
        const stats = {};
        attendance.forEach((row) => {
            const key = row.staffName;
            if (!stats[key]) {
                stats[key] = { present: 0, absent: 0, leave: 0 };
            }
            const lower = row.status.toLowerCase();
            if (lower === 'present') stats[key].present += 1;
            if (lower === 'absent') stats[key].absent += 1;
            if (lower === 'leave') stats[key].leave += 1;
        });
        return stats;
    }, [attendance]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleMarkAttendance = (e) => {
        e.preventDefault();
        const staff = initialStaff.find((s) => s.name === formData.staffName);
        const role = staff ? staff.role : 'Staff';
        const record = {
            date: formData.date,
            staffName: formData.staffName,
            role,
            status: formData.status,
            inTime: formData.status === 'Present' ? formData.inTime : '',
            outTime: formData.status === 'Present' ? formData.outTime : '',
            remarks: formData.remarks,
        };
        setAttendance((prev) => [record, ...prev]);
        setFormData((prev) => ({ ...prev, remarks: '' }));
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Staff Name', 'Role', 'Status', 'In Time', 'Out Time', 'Total Hours', 'Remarks'];
        const rows = attendance.map((row) => [
            row.date,
            row.staffName,
            row.role,
            row.status,
            row.inTime,
            row.outTime,
            computeTotalHours(row.inTime, row.outTime),
            row.remarks,
        ]);

        const csvContent = [headers, ...rows]
            .map((d) => d.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `staff-attendance-${todayISO}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportToPDF = () => {
        alert('PDF export is not yet implemented in this environment. Please use CSV or print the page.');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-blue-700 mb-3">સ્ટાફ હાજરી</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="text-xs uppercase text-gray-500">Total Staff</div>
                    <div className="text-3xl font-bold text-gray-900">{summaryStats.totalStaff}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-xs uppercase text-gray-500">Present Today</div>
                    <div className="text-3xl font-bold text-green-600">{summaryStats.presentToday}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-xs uppercase text-gray-500">Absent Today</div>
                    <div className="text-3xl font-bold text-red-600">{summaryStats.absentToday}</div>
                </Card>
                <Card className="p-4">
                    <div className="text-xs uppercase text-gray-500">Late Entries</div>
                    <div className="text-3xl font-bold text-primary-600">{summaryStats.lateEntries}</div>
                </Card>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>
                <form className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" onSubmit={handleMarkAttendance}>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Staff Name</label>
                        <select
                            name="staffName"
                            value={formData.staffName}
                            onChange={handleInputChange}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                        >
                            {initialStaff.map((member) => (
                                <option key={member.name} value={member.name}>{member.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                        >
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">In Time</label>
                        <input
                            type="time"
                            name="inTime"
                            value={formData.inTime}
                            onChange={handleInputChange}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                            disabled={formData.status !== 'Present'}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Out Time</label>
                        <input
                            type="time"
                            name="outTime"
                            value={formData.outTime}
                            onChange={handleInputChange}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                            disabled={formData.status !== 'Present'}
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-semibold text-gray-700">Remarks</label>
                        <input
                            type="text"
                            name="remarks"
                            value={formData.remarks}
                            onChange={handleInputChange}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2"
                            placeholder="Optional remarks"
                        />
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 text-right">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            ✅ Mark Attendance
                        </button>
                    </div>
                </form>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Filters</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">From</label>
                        <input type="date" name="from" value={filters.from} onChange={handleFilterChange}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">To</label>
                        <input type="date" name="to" value={filters.to} onChange={handleFilterChange}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Staff Name</label>
                        <select name="staffName" value={filters.staffName} onChange={handleFilterChange}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2">
                            <option value="">All</option>
                            {initialStaff.map((member) => (
                                <option key={member.name} value={member.name}>{member.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange}
                            className="mt-1 w-full border border-gray-300 rounded-lg p-2">
                            <option value="">All</option>
                            {statusOptions.map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Attendance Table</h2>
                    <div className="flex gap-2">
                        <button onClick={exportToCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Export CSV</button>
                        <button onClick={exportToPDF} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Export PDF</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                {['Date', 'Staff Name', 'Role', 'Status', 'In Time', 'Out Time', 'Total Hours', 'Remarks'].map((col) => (
                                    <th key={col} className="px-3 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAttendance.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-3 py-4 text-center text-gray-600">No records found with current filters.</td>
                                </tr>
                            ) : (
                                filteredAttendance.map((row, idx) => (
                                    <tr key={`${row.staffName}-${row.date}-${idx}`} className="hover:bg-gray-50">
                                        <td className="px-3 py-2 text-sm">{row.date}</td>
                                        <td className="px-3 py-2 text-sm">{row.staffName}</td>
                                        <td className="px-3 py-2 text-sm">{row.role}</td>
                                        <td className="px-3 py-2 text-sm font-semibold">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.status === 'Present' ? 'bg-green-100 text-green-700' : row.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{row.status}</span>
                                        </td>
                                        <td className="px-3 py-2 text-sm">{formatTime(row.inTime)}</td>
                                        <td className="px-3 py-2 text-sm">{formatTime(row.outTime)}</td>
                                        <td className="px-3 py-2 text-sm">{computeTotalHours(row.inTime, row.outTime)}</td>
                                        <td className="px-3 py-2 text-sm">{row.remarks || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Monthly Report</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-2 text-left text-sm font-semibold border-b border-gray-200">Staff Name</th>
                                <th className="px-3 py-2 text-left text-sm font-semibold border-b border-gray-200">Present Days</th>
                                <th className="px-3 py-2 text-left text-sm font-semibold border-b border-gray-200">Absent Days</th>
                                <th className="px-3 py-2 text-left text-sm font-semibold border-b border-gray-200">Leave Days</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(monthlyReport).map(([name, values]) => (
                                <tr key={name} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 text-sm">{name}</td>
                                    <td className="px-3 py-2 text-sm">{values.present}</td>
                                    <td className="px-3 py-2 text-sm">{values.absent}</td>
                                    <td className="px-3 py-2 text-sm">{values.leave}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default StaffAttendancePage;
