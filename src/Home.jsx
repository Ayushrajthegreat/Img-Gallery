import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Upload, Image as ImageIcon, User, Loader2 } from 'lucide-react'

function Home() {
    const [images, setImages] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    // Form State
    const [name, setName] = useState('')
    const [category, setCategory] = useState('Nature')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState(null)
    const [uploaderName, setUploaderName] = useState('')

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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async (e) => {
        e.preventDefault()

        if (!file) {
            alert('Please select a file!')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB!')
            return
        }

        setUploading(true)
        setSuccessMsg('')

        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('Gallery')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('Gallery')
                .getPublicUrl(filePath)

            // 3. Insert into Database
            const { error: dbError } = await supabase
                .from('images')
                .insert([
                    {
                        uploader_name: uploaderName || 'Anonymous',
                        name: name || file.name,
                        category,
                        description,
                        storage_path: filePath,
                        public_url: publicUrl
                    }
                ])

            if (dbError) throw dbError

            // Reset Form
            setName('')
            setDescription('')
            setFile(null)
            document.getElementById('file-upload').value = ''

            setSuccessMsg('Image uploaded successfully!')
            fetchImages() // Refresh gallery

        } catch (error) {
            console.error('Error uploading:', error)
            alert('Error uploading image: ' + error.message)
        } finally {
            setUploading(false)
            setTimeout(() => setSuccessMsg(''), 5000)
        }
    }

    const openImagePage = (img) => {
        window.open(`/image/${img.id}`, '_blank')
    }

    return (
        <div className="App">
            <header>
                <h1>ImgGallery</h1>
                <p>Share your moments anonymously with the world.</p>
            </header>

            <div className="container">
                {/* Upload Section */}
                <section className="upload-section">
                    <h2><Upload size={20} style={{ marginRight: '8px' }} /> Upload Photo</h2>
                    {successMsg && <div className="success-message">{successMsg}</div>}

                    <form onSubmit={handleUpload}>
                        <div className="form-group">
                            <label>Uploader Name (Optional)</label>
                            <input
                                type="text"
                                placeholder="Anonymous"
                                value={uploaderName}
                                onChange={(e) => setUploaderName(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Image Title</label>
                            <input
                                type="text"
                                placeholder="Give your image a title"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                                <option>Nature</option>
                                <option>Technology</option>
                                <option>People</option>
                                <option>Abstract</option>
                                <option>Animals</option>
                                <option>Urban</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                rows="3"
                                placeholder="Tell us about this image..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label>Image File</label>
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                            />
                        </div>

                        <button type="button" onClick={handleUpload} className="upload-btn" disabled={uploading}>
                            {uploading ? (
                                <><span className="loader"></span> Uploading...</>
                            ) : (
                                'Upload Image'
                            )}
                        </button>
                    </form>
                </section>

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
