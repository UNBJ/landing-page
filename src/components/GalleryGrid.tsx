import React, { useState } from 'react';
import { Lightbox } from './Lightbox';

interface Photo {
  id: string;
  url: string;
  width?: number;
  height?: number;
}

interface GalleryGridProps {
  photos: Photo[];
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ photos }) => {
  const [visibleCount, setVisibleCount] = useState(24);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visiblePhotos = photos.slice(0, visibleCount);
  const hasMore = photos.length > visibleCount;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 24);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex(prev => (prev !== null && prev < photos.length - 1 ? prev + 1 : 0));
  };

  const triggerDownload = async (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      const filename = photo.url.split('/').pop() || `foto-${photo.id}.jpg`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error al descargar la imagen, abriendo en pestaña:', error);
      window.open(photo.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="gallery-container">
      {/* Grid Masonry */}
      <div className="gallery-masonry">
        {visiblePhotos.map((photo, index) => (
          <div 
            key={photo.id} 
            className="gallery-item animate-fade-in"
            onClick={() => openLightbox(index)}
          >
            <img 
              src={photo.url} 
              alt={`Foto de la galería ${photo.id}`} 
              className="gallery-img"
              loading="lazy"
            />
            {/* Overlay al hacer hover */}
            <div className="gallery-item-overlay">
              <div className="gallery-item-actions">
                <button 
                  className="gallery-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(index);
                  }}
                  aria-label="Ver pantalla completa"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    <line x1="11" y1="8" x2="11" y2="14"></line>
                    <line x1="8" y1="11" x2="14" y2="11"></line>
                  </svg>
                </button>
                <button 
                  className="gallery-action-btn"
                  onClick={(e) => triggerDownload(e, photo)}
                  aria-label="Descargar foto original"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón Cargar Más */}
      {hasMore && (
        <div className="gallery-actions-footer">
          <button className="gallery-load-more-btn" onClick={handleLoadMore}>
            <span>Ver más fotos</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={lightboxIndex !== null}
        photos={photos}
        currentIndex={lightboxIndex || 0}
        onClose={closeLightbox}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      <style>{`
        .gallery-container {
          width: 100%;
          margin: 0 auto;
        }

        .gallery-masonry {
          column-count: 1;
          column-gap: 20px;
          width: 100%;
        }

        .gallery-item {
          break-inside: avoid;
          margin-bottom: 20px;
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          background-color: rgba(28, 28, 28, 0.03);
          border: 1px solid rgba(28, 28, 28, 0.08);
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
        }

        .gallery-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(28, 28, 28, 0.12);
        }

        .gallery-img {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .gallery-item:hover .gallery-img {
          transform: scale(1.03);
        }

        /* Overlay */
        .gallery-item-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(28, 28, 28, 0.4);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gallery-item:hover .gallery-item-overlay {
          opacity: 1;
        }

        .gallery-item-actions {
          display: flex;
          gap: 12px;
          transform: translateY(10px);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gallery-item:hover .gallery-item-actions {
          transform: translateY(0);
        }

        .gallery-action-btn {
          background: #E8E6DF;
          color: #1C1C1C;
          border: none;
          border-radius: 50%;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          transition: background 0.2s, transform 0.2s, color 0.2s;
        }

        .gallery-action-btn:hover {
          background: var(--accent-red, #D85446);
          color: white;
          transform: scale(1.1);
        }

        .gallery-action-btn:active {
          transform: scale(0.95);
        }

        /* Footer / Cargar Más */
        .gallery-actions-footer {
          display: flex;
          justify-content: center;
          margin-top: 40px;
          margin-bottom: 20px;
        }

        .gallery-load-more-btn {
          background: none;
          border: 1px solid var(--text-dark, #1C1C1C);
          color: var(--text-dark, #1C1C1C);
          padding: 14px 32px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: background 0.3s, color 0.3s, border-color 0.3s;
        }

        .gallery-load-more-btn:hover {
          background: var(--text-dark, #1C1C1C);
          color: var(--bg-cream, #E9E7E1);
        }

        .gallery-load-more-btn svg {
          transition: transform 0.3s ease;
        }

        .gallery-load-more-btn:hover svg {
          transform: translateY(2px);
        }

        /* Animación */
        .animate-fade-in {
          animation: itemFadeIn 0.5s ease-out both;
        }

        @keyframes itemFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Grid breakpoints */
        @media (min-width: 640px) {
          .gallery-masonry {
            column-count: 2;
          }
        }

        @media (min-width: 1024px) {
          .gallery-masonry {
            column-count: 3;
          }
        }

        @media (min-width: 1280px) {
          .gallery-masonry {
            column-count: 4;
          }
        }
      `}</style>
    </div>
  );
};
