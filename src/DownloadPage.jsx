import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { Download, Share2, Info, Loader2, HardDrive, Monitor, Smartphone, ChevronDown, Check } from 'lucide-react'

const QUALITIES = [
    { id: 'original', label: 'Original', icon: HardDrive, desc: 'Full Resolution' },
    { id: 'high', label: 'Large', width: 1920, icon: Monitor, desc: '1920px width' },
    { id: 'medium', label: 'Medium', width: 800, icon: Smartphone, desc: '800px width' }
]

function DownloadPage() {
    const { id } = useParams()
    const [image, setImage] = useState(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [selectedQuality, setSelectedQuality] = useState('original')

    useEffect(() => {
        fetchImageDetails()
    }, [id])

    const fetchImageDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('images')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            setImage(data)
        } catch (error) {
            console.error('Error fetching image:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!image) return
        try {
            setDownloading(true)

            const response = await fetch(image.public_url)
            const blob = await response.blob()

            let blobToDownload = blob
            // Normalize filename: remove special chars, spaces to underscores
            let safeName = image.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            // Remove any trailing existing extension to avoid double extension like .jpg.jpg
            safeName = safeName.replace(/\.[^/.]+$/, "")

            let filename = `${safeName}.${blob.type.split('/')[1] || 'jpg'}`

            if (selectedQuality !== 'original') {
                const qualitySetting = QUALITIES.find(q => q.id === selectedQuality)
                if (qualitySetting && qualitySetting.width) {
                    blobToDownload = await resizeImage(blob, qualitySetting.width)
                    filename = `${safeName}_${selectedQuality}.jpg`
                }
            }

            const url = window.URL.createObjectURL(blobToDownload)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setDropdownOpen(false)

        } catch (error) {
            console.error('Download failed:', error)
            alert('Download failed. Please try again.')
        } finally {
            setDownloading(false)
        }
    }

    const resizeImage = (file, targetWidth) => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.src = URL.createObjectURL(file)
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const scaleFactor = targetWidth / img.width
                const targetHeight = img.height * scaleFactor

                canvas.width = targetWidth
                canvas.height = targetHeight

                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

                canvas.toBlob((blob) => {
                    resolve(blob)
                }, 'image/jpeg', 0.9)
            }
            img.onerror = reject
        })
    }

    const selectedQualityLabel = QUALITIES.find(q => q.id === selectedQuality)?.label || 'Original'

    if (loading) return <div className="loading-page"><Loader2 className="loader" /> Loading image details...</div>
    if (!image) return <div className="error-page">Image not found</div>

    return (
        <div className="download-page">
            <div className="dl-main-content">
                <div className="dl-image-container">
                    <img src={image.public_url} alt={image.name} className="dl-image-preview" />
                </div>
            </div>

            <div className="dl-sidebar">
                <div className="dl-sidebar-content">
                    <div className="dl-uploader-info">
                        <div className="dl-avatar">
                            {image.uploader_name ? image.uploader_name[0].toUpperCase() : 'A'}
                        </div>
                        <div>
                            <h3 className="dl-uploader-name">{image.uploader_name || 'Anonymous'}</h3>
                            <span className="dl-uploader-stats">Uploader</span>
                        </div>
                    </div>

                    <h1 className="dl-title">{image.name}</h1>

                    <div className="dl-actions">
                        <div className="download-dropdown-container">
                            <button
                                className="dl-primary-btn"
                                onClick={handleDownload}
                                disabled={downloading}
                            >
                                {downloading ? (
                                    <><Loader2 className="loader" size={20} /> Processing...</>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        Download ({selectedQualityLabel})
                                    </>
                                )}
                            </button>
                            <button
                                className="dl-dropdown-trigger"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                <ChevronDown size={20} />
                            </button>

                            {dropdownOpen && (
                                <div className="dl-quality-menu">
                                    {QUALITIES.map(q => (
                                        <div
                                            key={q.id}
                                            className={`dl-quality-item ${selectedQuality === q.id ? 'active' : ''}`}
                                            onClick={() => setSelectedQuality(q.id)}
                                        >
                                            <div className="dl-q-left">
                                                <q.icon size={16} />
                                                <span>{q.label}</span>
                                            </div>
                                            <span className="dl-q-desc">{q.desc}</span>
                                            {selectedQuality === q.id && <Check size={16} className="dl-check" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="dl-meta-grid">
                        <div className="dl-meta-item">
                            <span className="dl-meta-label">Category</span>
                            <span className="dl-meta-value">{image.category}</span>
                        </div>
                        <div className="dl-meta-item">
                            <span className="dl-meta-label">Uploaded</span>
                            <span className="dl-meta-value">{new Date(image.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="dl-meta-item">
                            <span className="dl-meta-label">Type</span>
                            <span className="dl-meta-value">JPG</span>
                        </div>
                        {/* Note: In a real app we'd get real dimensions and type from metadata */}
                    </div>

                    <div className="dl-description">
                        <h4>Description</h4>
                        <p>{image.description || 'No description provided.'}</p>
                    </div>

                    <div className="dl-tags">
                        <span className="dl-tag">#{image.category.toLowerCase()}</span>
                        <span className="dl-tag">#photo</span>
                        <span className="dl-tag">#gallery</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DownloadPage
