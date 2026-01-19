import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Image as ImageIcon, User, Loader2, Upload } from 'lucide-react'

function Home() {
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchImages()
    }, [])

    const fetchImages = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('images')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setImages(data || [])
        } catch (error) {
            console.error('Error fetching images:', error.message)
        } finally {
            setLoading(false)
        }
    }

    const openImagePage = (img) => {
        navigate(`/image/${img.id}`)
    }

    return (
        <div className="App">
            <header>
                <h1>ImgGallery</h1>
                <p>Share your moments anonymously with the world.</p>
                <div style={{ marginTop: '1.5rem' }}>
                    <button
                        onClick={() => navigate('/upload')}
                        className="upload-btn"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Upload size={18} /> Upload New Image
                    </button>
                </div>
            </header>

            <div className="container">
                {/* Gallery Section */}
                <section className="gallery-section">
                    <h2 style={{ textAlign: 'left', marginBottom: '1.5rem' }}><ImageIcon size={20} style={{ marginRight: '8px' }} /> Recent Uploads</h2>

                    {loading ? (
                        <div style={{ color: '#888' }}>
                            <Loader2 className="loader" style={{ marginRight: '8px' }} />
                            Loading gallery...
                        </div>
                    ) : images.length === 0 ? (
                        <p style={{ color: '#666' }}>No images yet. Be the first to upload!</p>
                    ) : (
                        <div className="gallery-grid">
                            {images.map((img) => (
                                <div key={img.id} className="image-card" onClick={() => openImagePage(img)} style={{ cursor: 'pointer' }}>
                                    <div className="image-wrapper">
                                        <img src={img.public_url} alt={img.name} loading="lazy" />
                                    </div>
                                    <div className="card-content">
                                        <h3>{img.name}</h3>
                                        <span className="category-tag">{img.category}</span>
                                        <p className="description">{img.description}</p>
                                        <div className="uploader">
                                            <User size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                            Uploaded by {img.uploader_name || 'Anonymous'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default Home
