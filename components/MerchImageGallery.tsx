import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

interface MerchImageGalleryProps {
  productTitle: string;
  productImages: string[];
  coverImage: string;
  selectedColor: string;
  onColorChange: (color: string) => void;
  colors?: string[];
}

const MerchImageGallery: React.FC<MerchImageGalleryProps> = ({
  productTitle,
  productImages,
  coverImage,
  selectedColor,
  onColorChange,
  colors = ['Black', 'White', 'Navy', 'Gray', 'Green']
}) => {
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [currentImageSrc, setCurrentImageSrc] = useState<string>('');

  // Get all available images (product_images array or fallback to cover)
  const allImages = useMemo(() => {
    if (productImages && Array.isArray(productImages) && productImages.length > 0) {
      return productImages;
    }
    return coverImage ? [coverImage] : [];
  }, [productImages, coverImage]);

  // Get image for selected color
  const getImageForColor = useCallback((color: string): string => {
    if (allImages.length === 0) return coverImage || '';
    if (allImages.length === 1) return allImages[0];
    
    // Match color to image by index (Black=0, White=1, Navy=2, Gray=3, Green=4)
    const colorIndex = colors.indexOf(color);
    if (colorIndex >= 0 && colorIndex < allImages.length) {
      return allImages[colorIndex];
    }
    // Fallback: use first image
    return allImages[0];
  }, [allImages, coverImage, colors]);

  // Update displayed image when color changes
  useEffect(() => {
    if (selectedColor) {
      const newImage = getImageForColor(selectedColor);
      if (newImage !== currentImageSrc) {
        setCurrentImageSrc(newImage);
        setImageLoading(true);
      }
    } else {
      // No color selected, show first image
      const firstImage = allImages[0] || coverImage || '';
      if (firstImage !== currentImageSrc) {
        setCurrentImageSrc(firstImage);
        setImageLoading(true);
      }
    }
  }, [selectedColor, getImageForColor, allImages, coverImage, currentImageSrc]);

  // Initialize with first image on mount
  useEffect(() => {
    if (!currentImageSrc && allImages.length > 0) {
      setCurrentImageSrc(allImages[0]);
      setImageLoading(true);
    } else if (!currentImageSrc && coverImage) {
      setCurrentImageSrc(coverImage);
      setImageLoading(true);
    }
  }, [currentImageSrc, allImages, coverImage]);

  const handleImageClick = (color: string, index: number) => {
    onColorChange(color);
    // Also update image directly when clicking thumbnail
    const imageToShow = allImages[index] || allImages[0] || coverImage || '';
    if (imageToShow !== currentImageSrc) {
      setCurrentImageSrc(imageToShow);
      setImageLoading(true);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setImageLoading(false);
    const img = e.currentTarget;
    console.error('Failed to load image:', currentImageSrc);
    
    // Try to fix URL encoding issues
    if (currentImageSrc && currentImageSrc.includes('%20')) {
      const fixedUrl = currentImageSrc.replace(/%20/g, '_').replace(/\(/g, '_').replace(/\)/g, '_');
      if (fixedUrl !== currentImageSrc) {
        console.log('Attempting to fix URL:', fixedUrl);
        setCurrentImageSrc(fixedUrl);
        setImageLoading(true);
        return;
      }
    }
    
    // Fallback to cover image if current image fails
    if (currentImageSrc !== coverImage && coverImage) {
      setCurrentImageSrc(coverImage);
      setImageLoading(true);
    } else {
      // If all else fails, show placeholder
      img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23333" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not available%3C/text%3E%3C/svg%3E';
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      {/* Loading Spinner */}
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-brand-black/70 z-10 rounded-lg">
          <RefreshCw className="animate-spin text-brand-green" size={48} />
        </div>
      )}

      {/* Main Product Image */}
      <div className="relative w-full max-w-md mb-4">
        <img
          src={currentImageSrc}
          alt={productTitle}
          className={`w-full max-h-[500px] object-contain transition-opacity duration-300 rounded-lg ${
            imageLoading ? 'opacity-0' : 'opacity-100'
          }`}
          key={currentImageSrc} // Force re-render when image changes
          onLoadStart={() => setImageLoading(true)}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>

      {/* Thumbnail Gallery (if multiple images) */}
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto max-w-full px-2">
          {allImages.map((img, index) => {
            const colorForImage = colors[index] || `Image ${index + 1}`;
            const isActive = selectedColor === colorForImage || (!selectedColor && index === 0);
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleImageClick(colorForImage, index)}
                className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                  isActive
                    ? 'border-brand-green ring-2 ring-brand-green/50 scale-105'
                    : 'border-brand-slate hover:border-brand-teal'
                }`}
                aria-label={`View ${colorForImage} color`}
              >
                <img
                  src={img}
                  alt={`${productTitle} - ${colorForImage}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Handle image loading errors in thumbnails
                    const target = e.currentTarget;
                    if (target.src && target.src.includes('%20')) {
                      target.src = target.src.replace(/%20/g, '_').replace(/\(/g, '_').replace(/\)/g, '_');
                    }
                  }}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Color Label (if color is selected) */}
      {selectedColor && allImages.length > 1 && (
        <p className="text-xs text-brand-teal mt-2 font-mono">
          Showing: <span className="text-brand-green font-bold">{selectedColor}</span>
        </p>
      )}
    </div>
  );
};

export default MerchImageGallery;

