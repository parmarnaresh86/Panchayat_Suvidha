import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import BlockRenderer from '../components/pagebuilder/BlockRenderer';

const PublishedPage = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await axios.get(`/pages/${slug}`);
                if (res.data.status !== 'published') {
                    setError('This page is not published yet.');
                } else {
                    setPage(res.data);
                }
            } catch {
                setError('Page not found.');
            } finally {
                setLoading(false);
            }
        };
        fetchPage();
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 gap-4">
            <p className="text-2xl font-bold text-gray-700">{error}</p>
            <Link to="/" className="text-orange-500 hover:underline font-medium">← Back to Home</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-2">
                {(page.content_json || []).map((block) => (
                    <BlockRenderer key={block.id} block={block} />
                ))}
            </div>
        </div>
    );
};

export default PublishedPage;
