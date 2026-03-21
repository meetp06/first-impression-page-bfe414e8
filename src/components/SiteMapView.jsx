import { motion } from 'framer-motion';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import './SiteMapView.css';

export default function SiteMapView({ opportunity }) {
  const { latitude, longitude, address, title, city } = opportunity;
  const hasCoords = latitude != null && longitude != null;

  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(address || title)}`;

  const streetViewUrl = hasCoords
    ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${latitude},${longitude}`
    : null;

  // Static map image via Google Maps embed (no API key required for embed)
  const embedSrc = hasCoords
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(address || title)}&z=15&output=embed`;

  return (
    <motion.div
      className="site-map"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Embedded Map */}
      <div className="site-map__embed-wrapper">
        <iframe
          className="site-map__embed"
          src={embedSrc}
          title={`Map of ${address || title}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="site-map__embed-overlay" />
      </div>

      {/* Location Info */}
      <div className="site-map__info">
        <div className="site-map__address">
          <MapPin size={16} />
          <div>
            <span className="site-map__address-text">{address || 'Address not available'}</span>
            {hasCoords && (
              <span className="site-map__coords">{latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="site-map__actions">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary site-map__action"
        >
          <ExternalLink size={14} />
          Open in Google Maps
        </a>
        {streetViewUrl && (
          <a
            href={streetViewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary site-map__action"
          >
            <Navigation size={14} />
            Street View
          </a>
        )}
      </div>

      {/* Directions */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${hasCoords ? `${latitude},${longitude}` : encodeURIComponent(address || title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="site-map__directions"
      >
        <Navigation size={12} />
        Get Directions
      </a>
    </motion.div>
  );
}
