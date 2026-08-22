// Renders a single block by type
const BlockRenderer = ({ block }) => {
    const s = block.props || {};

    switch (block.type) {
        case 'heading':
            return <h2 style={{ fontSize: s.fontSize || '2rem', color: s.color || '#111', fontWeight: 'bold', textAlign: s.align || 'left' }}>{s.text || 'Heading'}</h2>;
        case 'text':
            return <p style={{ fontSize: s.fontSize || '1rem', color: s.color || '#444', textAlign: s.align || 'left', lineHeight: 1.7 }}>{s.text || 'Text block'}</p>;
        case 'button':
            return (
                <div style={{ textAlign: s.align || 'left' }}>
                    <a href={s.url || '#'} style={{ display: 'inline-block', background: s.bg || '#f97316', color: s.color || '#fff', padding: '10px 28px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: s.fontSize || '1rem' }}>
                        {s.text || 'Click Here'}
                    </a>
                </div>
            );
        case 'image':
            return s.src
                ? <img src={s.src} alt={s.alt || ''} style={{ width: s.width || '100%', borderRadius: s.rounded ? '12px' : '0', objectFit: 'cover' }} />
                : <div style={{ background: '#f3f4f6', height: '200px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No image selected</div>;
        case 'divider':
            return <hr style={{ border: 'none', borderTop: `${s.thickness || 1}px solid ${s.color || '#e5e7eb'}`, margin: '8px 0' }} />;
        case 'spacer':
            return <div style={{ height: `${s.height || 32}px` }} />;
        case 'card':
            return (
                <div style={{ background: s.bg || '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    {s.title && <h3 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#111' }}>{s.title}</h3>}
                    <p style={{ color: '#555' }}>{s.text || 'Card content'}</p>
                </div>
            );
        case 'alert':
            return (
                <div style={{ background: s.bg || '#fff7ed', border: `1px solid ${s.border || '#fed7aa'}`, borderRadius: '10px', padding: '14px 18px', color: s.color || '#9a3412' }}>
                    {s.text || 'Alert message'}
                </div>
            );
        default:
            return null;
    }
};

export default BlockRenderer;
