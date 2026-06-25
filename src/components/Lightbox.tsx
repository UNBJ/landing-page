import React, { useEffect, useRef } from 'react';

interface Photo {
  id: string;
  url: string;
  width?: number;
  height?: number;
}

interface LightboxProps {
  isOpen: boolean;
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}) => {
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Bloquear scroll de la página al abrir el Lightbox
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    // Manejar teclado
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalStyle;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onPrev, onNext, onClose]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  // Manejar gestos táctiles (Swipe)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      onNext();
    } else if (isRightSwipe) {
      onPrev();
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Descarga directa intentando forzar la descarga de la imagen
      const response = await fetch(currentPhoto.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      
      // Obtener el nombre del archivo desde la URL
      const filename = currentPhoto.url.split('/').pop() || `foto-${currentPhoto.id}.jpg`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error al descargar la imagen por fetch, abriendo en pestaña nueva:', error);
      // Fallback si CORS no lo permite
      window.open(currentPhoto.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Botón Cerrar */}
      <button 
        className="lightbox-close" 
        onClick={onClose}
        aria-label="Cerrar visualizador"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <span>Cerrar</span>
      </button>

      {/* Área de la Imagen */}
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        {/* Flecha Izquierda (Desktop) */}
        <button
          className="lightbox-nav lightbox-nav--prev"
          onClick={onPrev}
          aria-label="Foto anterior"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Contenedor de la Imagen */}
        <div className="lightbox-image-container">
          <img
            src={currentPhoto.url}
            alt={`Foto del congreso número ${currentIndex + 1}`}
            className="lightbox-img"
            loading="eager"
          />
        </div>

        {/* Flecha Derecha (Desktop) */}
        <button
          className="lightbox-nav lightbox-nav--next"
          onClick={onNext}
          aria-label="Siguiente foto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Barra de Acciones Inferior */}
      <div className="lightbox-footer" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-info">
          <span className="lightbox-counter">
            Foto {currentIndex + 1} de {photos.length}
          </span>
        </div>
        
        <div className="lightbox-actions">
          <button className="lightbox-download-btn" onClick={handleDownload}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Descargar Original</span>
          </button>
        </div>

        <div className="lightbox-tip">
          <strong>Tip móvil:</strong> Mantén presionada la foto para guardarla directamente en tu galería.
        </div>
      </div>

      <style>{`
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(28, 28, 28, 0.96);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          user-select: none;
        }

        .lightbox-close {
          position: absolute;
          top: 24px;
          right: 32px;
          background: none;
          border: none;
          color: #E8E6DF;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.2s, transform 0.2s;
          padding: 8px 12px;
          border-radius: 4px;
          z-index: 1010;
        }

        .lightbox-close:hover {
          opacity: 1;
          transform: translateY(-1px);
        }

        .lightbox-content {
          flex: 1;
          width: 100%;
          max-width: 1200px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 40px;
          margin-bottom: 20px;
          position: relative;
        }

        .lightbox-image-container {
          flex: 1;
          height: 100%;
          max-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          overflow: hidden;
        }

        .lightbox-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.3s ease-out;
        }

        .lightbox-nav {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #E8E6DF;
          border-radius: 50%;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
          flex-shrink: 0;
        }

        .lightbox-nav:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }

        .lightbox-nav:active {
          transform: scale(0.95);
        }

        .lightbox-footer {
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding-bottom: 12px;
          color: #E8E6DF;
          text-align: center;
          z-index: 1010;
        }

        .lightbox-counter {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 0.5px;
          opacity: 0.7;
        }

        .lightbox-actions {
          margin-top: 4px;
        }

        .lightbox-download-btn {
          background: var(--accent-red, #D85446);
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 999px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(216, 84, 70, 0.3);
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
        }

        .lightbox-download-btn:hover {
          background: #c2463a;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(216, 84, 70, 0.4);
        }

        .lightbox-download-btn:active {
          transform: translateY(0);
        }

        .lightbox-tip {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          opacity: 0.5;
          max-width: 280px;
          line-height: 1.4;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .lightbox-overlay {
            padding: 16px;
          }
          .lightbox-close {
            top: 16px;
            right: 16px;
          }
          .lightbox-close span {
            display: none; /* Solo icono en móviles */
          }
          .lightbox-nav {
            display: none; /* Esconder flechas en móvil, usar swipe */
          }
          .lightbox-image-container {
            padding: 0;
            max-height: 60vh;
          }
          .lightbox-content {
            margin-top: 60px;
          }
        }
      `}</style>
    </div>
  );
};
