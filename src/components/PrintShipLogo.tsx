import React, { useState, useEffect } from 'react';
import { SHIP_CONFIG } from '../constants';

interface PrintShipLogoProps {
  className?: string;
  customLogo?: string | null;
}

export const PrintShipLogo: React.FC<PrintShipLogoProps> = ({ 
  className = "w-14 h-14", 
  customLogo 
}) => {
  const [imageError, setImageError] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  useEffect(() => {
    try {
      const src = customLogo || localStorage.getItem('custom_ship_logo') || SHIP_CONFIG.badgeUrl || null;
      setLogoSrc(src && src.trim().length > 0 ? src : null);
    } catch {
      setLogoSrc(SHIP_CONFIG.badgeUrl || null);
    }
  }, [customLogo]);

  if (logoSrc && !imageError) {
    return (
      <img
        src={logoSrc}
        alt="Brasão"
        className={`${className} object-contain shrink-0 print:block`}
        onError={() => setImageError(true)}
      />
    );
  }

  // Brasão Naval Oficial em Vetor SVG de Alta Definição (100% compatível com Impressão e PDF)
  return (
    <div className={`${className} flex items-center justify-center shrink-0`}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full text-blue-950 print:text-black"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Círculo externo */}
        <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="2.5" fill="#f8fafc" className="print:fill-white" />
        <circle cx="50" cy="50" r="43" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
        <circle cx="50" cy="50" r="39" stroke="currentColor" strokeWidth="1" fill="#0f172a" className="print:fill-transparent" />
        
        {/* Haste Central da Âncora */}
        <line x1="50" y1="20" x2="50" y2="76" stroke="#fbbf24" strokeWidth="4.5" strokeLinecap="round" className="print:stroke-black" />
        {/* Cepo */}
        <line x1="36" y1="32" x2="64" y2="32" stroke="#fbbf24" strokeWidth="3.5" strokeLinecap="round" className="print:stroke-black" />
        {/* Anete */}
        <circle cx="50" cy="22" r="5" stroke="#fbbf24" strokeWidth="3" fill="none" className="print:stroke-black" />
        
        {/* Braços Curvos da Âncora */}
        <path 
          d="M26 62 C34 82, 66 82, 74 62" 
          stroke="#fbbf24" 
          strokeWidth="4.5" 
          strokeLinecap="round" 
          fill="none" 
          className="print:stroke-black" 
        />
        {/* Unhas triangulares */}
        <polygon points="26,62 23,55 31,58" fill="#fbbf24" className="print:fill-black" />
        <polygon points="74,62 77,55 69,58" fill="#fbbf24" className="print:fill-black" />
        
        {/* Cruzeiro */}
        <circle cx="50" cy="76" r="2.5" fill="#fbbf24" className="print:fill-black" />

        {/* Estrelas Heráldicas */}
        <polygon points="50,42 51.5,46 56,46 52.5,49 54,53 50,50.5 46,53 47.5,49 44,46 48.5,46" fill="#fbbf24" className="print:fill-black" />
        <polygon points="38,48 39,51 42,51 39.5,53 40.5,56 38,54 35.5,56 36.5,53 34,51 37,51" fill="#93c5fd" className="print:fill-black" />
        <polygon points="62,48 63,51 66,51 63.5,53 64.5,56 62,54 59.5,56 60.5,53 58,51 61,51" fill="#93c5fd" className="print:fill-black" />
      </svg>
    </div>
  );
};

export default PrintShipLogo;
