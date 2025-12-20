import React, { useState, useEffect } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * ImageWithFallback Component
 * Renders an image with a graceful fallback if the source fails to load.
 * 
 * @component
 * @param {object} props
 * @param {string} props.src - The source URL of the image
 * @param {string} props.alt - Alternative text for the image
 * @param {string} props.className - CSS classes for the container/image
 */
const ImageWithFallback = ({ src, alt, className, ...props }) => {
    const [error, setError] = useState(false);
    const [imageSrc, setImageSrc] = useState(src);

    useEffect(() => {
        setImageSrc(src);
        setError(false);
    }, [src]);

    const handleError = () => {
        setError(true);
    };

    if (error || !imageSrc) {
        return (
            <div 
                className={`flex flex-col items-center justify-center bg-coffee-50 text-coffee-300 ${className}`}
                role="img"
                aria-label={alt || "Image placeholder"}
            >
                <UtensilsCrossed size={48} strokeWidth={1.5} />
                <span className="mt-2 text-xs font-medium text-coffee-400">ScanDine</span>
            </div>
        );
    }

    return (
        <img
            src={imageSrc}
            alt={alt}
            className={className}
            onError={handleError}
            {...props}
        />
    );
};

ImageWithFallback.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    className: PropTypes.string
};

export default ImageWithFallback;
