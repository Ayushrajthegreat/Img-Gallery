import { useState } from 'react'
import { X, Download, HardDrive, Monitor, Smartphone } from 'lucide-react'

const QUALITIES = [
    { id: 'original', label: 'Original', icon: HardDrive, desc: 'Full Resolution' },
    { id: 'high', label: 'Large', width: 1920, icon: Monitor, desc: '1920px width' },
    { id: 'medium', label: 'Medium', width: 800, icon: Smartphone, desc: '800px width' }
]

export function ImageModal({ image, onClose }) {
    const [selectedQuality, setSelectedQuality] = useState('original')
    const [downloading, setDownloading] = useState(false)

    const handleDownload = async () => {
        try {
            setDownloading(true)

            // 1. Fetch the image
            const response = await fetch(image.public_url)
            const blob = await response.blob()

            let blobToDownload = blob
            let filename = image.name

            // 2. Resize if needed
            if (selectedQuality !== 'original') {
                const qualitySetting = QUALITIES.find(q => q.id === selectedQuality)
                if (qualitySetting && qualitySetting.width) {
                    blobToDownload = await resizeImage(blob, qualitySetting.width)
                    filename = `${image.name.split('.')[0]}_${selectedQuality}.jpg`
                }
            }

            // 3. Trigger Download
            const url = window.URL.createObjectURL(blobToDownload)
            const a = document.createElement('a')
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="modal-grid">
                    <div className="modal-image-col">
                        <img src={image.public_url} alt={image.name} className="modal-preview" />
                    </div>

                    <div className="modal-info-col">
                        <h2>{image.name}</h2>
                        <p className="modal-desc">{image.description}</p>

                        <div className="metadata">
                            <span className="tag">{image.category}</span>
                            <span className="byline">by {image.uploader_name || 'Anonymous'}</span>
                        </div>

                        <div className="quality-selector">
                            <h3>Select Quality</h3>
                            <div className="quality-options">
                                {QUALITIES.map(q => (
                                    <label key={q.id} className={`quality-option ${selectedQuality === q.id ? 'active' : ''}`}>
                                        <input
                                            type="radio"
                                            name="quality"
                                            value={q.id}
                                            checked={selectedQuality === q.id}
                                            onChange={() => setSelectedQuality(q.id)}
                                        />
                                        <q.icon size={20} className="quality-icon" />
                                        <div className="quality-text">
                                            <span className="q-label">{q.label}</span>
                                            <span className="q-desc">{q.desc}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            className="download-action-btn"
                            onClick={handleDownload}
                            disabled={downloading}
                        >
                            <Download size={20} />
                            {downloading ? 'Processing...' : 'Download Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
