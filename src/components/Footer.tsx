import React from 'react';
import { PageRoute, ClinicSettings } from '../types';

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
  settings: ClinicSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings }) => {
  const currentYear = new Date().getFullYear();
  const phone = settings.phone || '+91 95605 53331';
  const whatsapp = settings.whatsapp || '919560553331';
  const hours = settings.hours || 'Mon to Sat: 9:30 AM to 1:30 PM & 5:00 PM to 8:00 PM\nSunday closed';
  const address = settings.address || '2413 Basement, Hudson Lane, Kingsway Camp, GTB Nagar, Delhi 110009';

  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const cleanWa = whatsapp.replace(/[^0-9]/g, '');

  const nav = (route: PageRoute) => {
    onNavigate(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer>
      <div className="fgrid">
        <div>
          <h4>Delhi Dental Cosmetics</h4>
          <p>
            Cosmetic and complete health dentistry in GTB Nagar, Delhi. Two dentists, one focused
            practice, and a clinic built to keep patients calm.
          </p>
          <p className="hrs" style={{ whiteSpace: 'pre-line' }}>
            {hours}
          </p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <a href="#home" onClick={(e) => { e.preventDefault(); nav('home'); }}>Home</a>
          <a href="#treatments" onClick={(e) => { e.preventDefault(); nav('services'); }}>Treatments</a>
          <a href="#doctors" onClick={(e) => { e.preventDefault(); nav('doctors'); }}>Our Team</a>
          <a href="#gallery" onClick={(e) => { e.preventDefault(); nav('gallery'); }}>Gallery</a>
          <a href="#blog" onClick={(e) => { e.preventDefault(); nav('blog'); }}>Blog</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); nav('contact'); }}>Contact</a>
          <a href="#faq" onClick={(e) => { e.preventDefault(); nav('faq'); }}>FAQs</a>
          <a href="#privacy" onClick={(e) => { e.preventDefault(); nav('privacy'); }}>Privacy</a>
        </div>

        <div>
          <h4>Popular Treatments</h4>
          <a href="#implants" onClick={(e) => { e.preventDefault(); nav('services'); }}>Dental Implants</a>
          <a href="#braces" onClick={(e) => { e.preventDefault(); nav('services'); }}>Braces &amp; Aligners</a>
          <a href="#smile" onClick={(e) => { e.preventDefault(); nav('services'); }}>Smile Makeover</a>
          <a href="#rct" onClick={(e) => { e.preventDefault(); nav('services'); }}>Root Canal Treatment</a>
          <a href="#whitening" onClick={(e) => { e.preventDefault(); nav('services'); }}>Teeth Whitening</a>
        </div>

        <div>
          <h4>Visit Us</h4>
          <p>{address}</p>
          <p>Near GTB Nagar Metro Station, Gate No. 4</p>
          <a href={`tel:${cleanPhone}`}>&#9742; {phone}</a>
          <a href={`https://wa.me/${cleanWa}`} target="_blank" rel="noopener noreferrer">WhatsApp the clinic</a>
          <a href="https://maps.google.com/?cid=7584890295485403271" target="_blank" rel="noopener noreferrer">
            Find us on Google Maps
          </a>
          <a href="https://www.facebook.com/delhidentalcosmetics/" target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </div>
      </div>

      <div className="fbottom">
        <span>&copy; {currentYear} Delhi Dental Cosmetics. All Rights Reserved.</span>
        <button
          onClick={() => nav('admin')}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            fontSize: 'inherit',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'none',
          }}
        >
          Staff login
        </button>
      </div>
    </footer>
  );
};
