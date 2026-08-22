import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
            <a href="/" className="mt-4 inline-block text-orange-600 font-semibold hover:underline">Go back home</a>
        </div>
    </div>
);

function AppContent() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

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
            ) : (
                <Navbar />
            )}
            
            <main className={isAuthPage ? "" : "pt-4"}>
                <Suspense fallback={<div className="text-center p-10">Loading page...</div>}>
                    <Routes>
                        {/* Public pages — require login */}
                        <Route path="/"        element={<AuthRoute><VillageProfile /></AuthRoute>} />
                        <Route path="/panchayat" element={<AuthRoute><PanchayatDetails /></AuthRoute>} />
                        <Route path="/services"  element={<AuthRoute><ServicesPage /></AuthRoute>} />
                        <Route path="/contact"   element={<AuthRoute><ContactPage /></AuthRoute>} />
                        {/* Specific routes must come before dynamic param routes */}
                        <Route path="/services/admin/form-download-center" element={<AuthRoute><FormDownloadPage /></AuthRoute>} />
                        <Route path="/admin/staff-attendance"    element={<AuthRoute><StaffAttendancePage /></AuthRoute>} />
                        <Route path="/services/:serviceId"       element={<AuthRoute><ServiceCategoryPage /></AuthRoute>} />
                        <Route path="/services/:serviceId/:itemId" element={<AuthRoute><ServiceItemPage /></AuthRoute>} />
                        <Route path="/p/:slug"  element={<AuthRoute><PublishedPage /></AuthRoute>} />

                        {/* Admin only */}
                        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

                        {/* Auth pages — redirect away if already logged in */}
                        <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
                        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
            </main>
            {!isAuthPage && <Footer />}
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
