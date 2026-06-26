import React, { useState, useEffect } from 'react';
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

function getColumnCount(width: number): number {
  if (width >= 1280) return 4;
  if (width >= 820) return 3;
  return 2;
}

function getGap(cols: number): number {
  if (cols === 4) return 16;
  if (cols === 3) return 12;
  return 8;
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ photos }) => {
  const [visibleCount, setVisibleCount] = useState(24);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [colCount, setColCount] = useState(2);

  useEffect(() => {
    const update = () => setColCount(getColumnCount(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const visiblePhotos = photos.slice(0, visibleCount);
  const hasMore = photos.length > visibleCount;
  const gap = getGap(colCount);

  // Distribute photos round-robin into columns
  const columns: Photo[][] = Array.from({ length: colCount }, () => []);
  visiblePhotos.forEach((photo, i) => {
    columns[i % colCount].push(photo);
  });

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const handlePrev = () => {
    setLightboxIndex(prev =>
      prev !== null ? (prev > 0 ? prev - 1 : photos.length - 1) : null
    );
  };

  const handleNext = () => {
    setLightboxIndex(prev =>
      prev !== null ? (prev < photos.length - 1 ? prev + 1 : 0) : null
    );
  };

  const triggerDownload = async (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation();
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = photo.url.split('/').pop() || `foto-${photo.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(photo.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="gallery-container">
      <div
        className="gallery-grid"
        style={{ display: 'flex', gap: `${gap}px` }}
      >
        {columns.map((colPhotos, colIdx) => (
          <div
            key={colIdx}
            className="gallery-col"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: `${gap}px` }}
          >
            {colPhotos.map((photo, photoIdx) => {
              const globalIndex = photoIdx * colCount + colIdx;
              return (
                <div
                  key={photo.id}
                  className="gallery-item"
                  onClick={() => openLightbox(globalIndex)}
                  style={{ animationDelay: `${globalIndex * 40}ms` }}
                >
                  <img
                    src={photo.url}
                    alt={`Foto de la galería ${photo.id}`}
                    className="gallery-img"
                    loading="lazy"
                  />
                  <div className="gallery-item-overlay">
                    <div className="gallery-item-actions">
                      <button
                        className="gallery-action-btn"
                        onClick={(e) => { e.stopPropagation(); openLightbox(globalIndex); }}
                        aria-label="Ver pantalla completa"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
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
              );
            })}
          </div>
        ))}
      </div>

      <div className="gallery-actions-footer">
        {hasMore && (
          <button className="gallery-load-more-btn" onClick={() => setVisibleCount(v => v + 24)}>
            CARGAR MÁS FOTOS
          </button>
        )}
        <p className="gallery-pagination-info">
          Mostrando {Math.min(visibleCount, photos.length)} de {photos.length} fotos
        </p>
      </div>

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
        }

        .gallery-item {
          position: relative;
          border-radius: 0px;
          overflow: hidden;
          cursor: pointer;
          animation: itemFadeIn 0.5s ease-out both;
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
          transition: transform 0.5s ease;
        }

        .gallery-item:hover .gallery-img {
          transform: scale(1.03);
        }

        .gallery-item-overlay {
          position: absolute;
          inset: 0;
          background: rgba(28, 28, 28, 0.6);
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
          background: #FFFFFF;
          color: #1C1C1C;
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          transition: background 0.2s, transform 0.2s, color 0.2s;
        }

        .gallery-action-btn:hover {
          background: var(--accent-red, #D85446);
          color: #FFFFFF;
          transform: scale(1.05);
        }

        .gallery-action-btn:active {
          transform: scale(0.95);
        }

        .gallery-actions-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px 0 64px;
        }

        .gallery-load-more-btn {
          background: none;
          border: 1px solid #1C1C1C;
          color: #1C1C1C;
          padding: 16px 32px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.3s, color 0.3s;
        }

        .gallery-load-more-btn:hover {
          background: #1C1C1C;
          color: #E9E7E1;
        }

        .gallery-pagination-info {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: #5E5954;
        }

        @keyframes itemFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 639px) {
          .gallery-load-more-btn {
            width: 100%;
            font-size: 11px;
            letter-spacing: 2px;
            padding: 16px 28px;
          }
        }

        @media (min-width: 820px) {
          .gallery-load-more-btn {
            font-size: 11px;
            letter-spacing: 2.5px;
          }
        }

        @media (min-width: 1280px) {
          .gallery-load-more-btn {
            font-size: 13px;
            letter-spacing: 2px;
          }
        }
      `}</style>
    </div>
  );
};
