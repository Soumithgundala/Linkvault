// src/components/LinkPreview.tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import e from 'express';

interface PreviewData {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  error?: string;
}

export default function LinkPreview({ url }: { url: string }) {
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
        if (!response.ok) throw new Error('Preview failed');
        const data = await response.json();
        setPreview(data);
      } catch {
        setPreview({ error: 'Failed to load preview' });
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (loading) {
    return <div className="preview-loading">Loading preview...</div>;
  }

  if (preview?.error) {
    return <div className="preview-error">{preview.error}</div>;
  }
  const normalizeImageUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      // Force HTTPS for all external images
      parsed.protocol = 'https:';
      return parsed.toString();
    } catch {
      return url;
    }
  };
  

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="preview-card">
      {preview?.image && (
        <div className="preview-image-container">
          <Image
            src={normalizeImageUrl(preview.image)}
            alt="Preview"
            className="preview-image"
            width={320}
            height={180}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/default-image.png'; // Fallback image
            }}
          />
        </div>
      )}
      <div className="preview-content">
        {preview?.url && (
          <div className="preview-domain">
            {new URL(preview.url).hostname}
          </div>
        )}
        {preview?.title && <h3 className="preview-title">{preview.title}</h3>}
        {preview?.description && (
          <p className="preview-description">{preview.description}</p>
        )}
      </div>
    </a>
  );
}