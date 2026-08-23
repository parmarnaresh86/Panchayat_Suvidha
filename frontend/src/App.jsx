import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getVillageSlug } from './api/tenant';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DevVillageSwitcher from './components/DevVillageSwitcher';
import VillageProfile from './pages/VillageProfile';
import PanchayatDetails from './pages/PanchayatDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ServiceCategoryPage from './pages/ServiceCategoryPage';
import ServiceItemPage from './pages/ServiceItemPage';
import FormDownloadPage from './pages/FormDownloadPage';
import StaffAttendancePage from './pages/StaffAttendancePage';

const ServicesPage  = lazy(() => import('./pages/ServicesPage'));
const ContactPage   = lazy(() => import('./pages/ContactPage'));
const PublishedPage = lazy(() => import('./pages/PublishedPage'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const BusinessDirectoryPage = lazy(() => import('./pages/BusinessDirectoryPage'));
const BusinessDetailPage = lazy(() => import('./pages/BusinessDetailPage'));

// Requires any login (admin or user)
const AuthRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    return children;
};

// Requires admin login
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');
    if (!token || role !== 'admin') return <Navigate to="/login" replace />;
    return children;
};

// Redirect already-logged-in users away from /login
const GuestRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (token) return <Navigate to="/" replace />;
    return children;
};

const NotFoundPage = () => (
    <div className="min-h-screen flex items-center justify-center text-center p-8">
        <div>
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-gray-600">We couldn't find the page you're looking for.</p>
            <a href="/" className="mt-4 inline-block text-primary-600 font-semibold hover:underline">Go back home</a>
        </div>
    </div>
);

function AppContent() {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const isSuperAdminPage = location.pathname.startsWith('/super-admin');

    // Without real per-village subdomains, ?village=slug in the URL is the
    // only thing that makes a link self-sufficient (shareable, safe to
    // reload). Internal <Link>s only set the pathname, so the query would
    // otherwise disappear on the very first click. Re-add it after every
    // navigation so whatever's in the address bar always matches the
    // village actually being rendered.
    useEffect(() => {
        if (isSuperAdminPage) return;
        const params = new URLSearchParams(location.search);
        const slug = getVillageSlug();
        if (slug && params.get('village') !== slug) {
            params.set('village', slug);
            navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
        }
    }, [location.pathname, location.search, isSuperAdminPage, navigate]);

    return (
        <div className="bg-linear-to-b from-gray-50 to-white min-h-screen">
            {isAuthPage ? (
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-center md:justify-start">
                    <div className="flex items-center">
                        <img className="h-10 w-10" src="/logo.svg" alt="Panchayat Suvidha Logo" />
                        <span className="ml-3 text-2xl font-bold text-gray-900 tracking-tight">
                            PanchayatSuvidha
                        </span>
                    </div>
                </div>
            ) : !isSuperAdminPage && (
                <Navbar />
            )}

            <main className={isAuthPage ? "" : "pt-4"}>
                <Suspense fallback={<div className="text-center p-10">Loading page...</div>}>
                    <Routes>
                        {/* Public pages — viewable by anyone, no login required.
                            Any edit/add/update UI on these pages self-gates on
                            isAdmin (see AuthContext) rather than the route. */}
                        <Route path="/"        element={<VillageProfile />} />
                        <Route path="/panchayat" element={<PanchayatDetails />} />
                        <Route path="/services"  element={<ServicesPage />} />
                        <Route path="/contact"   element={<ContactPage />} />
                        {/* Specific routes must come before dynamic param routes */}
                        <Route path="/services/admin/form-download-center" element={<FormDownloadPage />} />
                        {/* Marking attendance is an update action, so this one stays behind login */}
                        <Route path="/admin/staff-attendance"    element={<AuthRoute><StaffAttendancePage /></AuthRoute>} />
                        <Route path="/services/:serviceId"       element={<ServiceCategoryPage />} />
                        <Route path="/services/:serviceId/:itemId" element={<ServiceItemPage />} />
                        <Route path="/p/:slug"  element={<PublishedPage />} />
                        <Route path="/business" element={<BusinessDirectoryPage />} />
                        <Route path="/business/:slug" element={<BusinessDetailPage />} />

                        {/* Admin only */}
                        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

                        {/* Platform super-admin — creates/manages villages themselves.
                            Its own separate login, not tied to village admin auth. */}
                        <Route path="/super-admin" element={<SuperAdminDashboard />} />

                        {/* Auth pages — redirect away if already logged in */}
                        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
                        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </main>
            {!isAuthPage && !isSuperAdminPage && <Footer />}
            {!isSuperAdminPage && <DevVillageSwitcher />}
        </div>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
