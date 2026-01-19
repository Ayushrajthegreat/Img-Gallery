import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Upload, ArrowLeft } from 'lucide-react'

function UploadPage() {
    const navigate = useNavigate()
    const [uploading, setUploading] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    // Form State
    const [name, setName] = useState('')
    const [category, setCategory] = useState('Nature')
    const [description, setDescription] = useState('')
    const [file, setFile] = useState(null)
    const [uploaderName, setUploaderName] = useState('')

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

            // Reset Form and Navigate
            setSuccessMsg('Image uploaded successfully! Redirecting...')
            setTimeout(() => {
                navigate('/')
            }, 1500)

        } catch (error) {
            console.error('Error uploading:', error)
            alert('Error uploading image: ' + error.message)
            setUploading(false)
        }
    }

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <button className="back-btn" onClick={() => navigate('/')} style={{ position: 'relative', top: '0', left: '0', marginBottom: '1rem' }}>
                <ArrowLeft size={20} /> Back to Gallery
            </button>

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
        </div>
    )
}

export default UploadPage
