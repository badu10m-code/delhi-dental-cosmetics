import React, { useState } from 'react';
import { PageRoute, ClinicSettings } from '../types';

interface HeaderProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  settings: ClinicSettings;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, settings }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const phone = settings.phone || '+91 95605 53331';
  const whatsapp = settings.whatsapp || '919560553331';
  const hours = settings.hours || 'Mon to Sat: 9:30 AM to 1:30 PM & 5:00 PM to 8:00 PM · Sunday closed';

  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const cleanWa = whatsapp.replace(/[^0-9]/g, '');

  const isCurrent = (route: string) => {
    if (typeof currentPage === 'string') {
      return currentPage === route;
    }
    return false;
  };

  const handleNav = (route: PageRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="topbar">
        <span>{hours}</span>
        <span>
          <a href={`https://wa.me/${cleanWa}`} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>{' '}
          &nbsp;{' '}
          <a href={`tel:${cleanPhone}`}>&#9742; {phone}</a>
        </span>
      </div>

      <nav>
        <button
          onClick={() => handleNav('home')}
          className="brand"
          style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
        >
          <svg width="34" height="34" viewBox="0 0 34 34">
            <rect width="34" height="34" rx="8" fill="#14263B" />
            <path
              d="M12 8c3 0 3 1.6 5 1.6S22 8 22 8c2.5 0 4 2.2 4 5 0 4-1.6 5-2.2 9.5-.3 2-2.6 2.2-3.2.2-.6-2.2-1.6-4.2-3.6-4.2s-3 2-3.6 4.2c-.6 2-2.9 1.8-3.2-.2C9.6 18 8 17 8 13c0-2.8 1.5-5 4-5z"
              fill="#C9A227"
            />
          </svg>
          <b>Delhi Dental Cosmetics</b>
        </button>

        <div className={`links ${mobileMenuOpen ? 'open' : ''}`}>
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNav('home');
            }}
            className={isCurrent('home') ? 'active' : ''}
          >
            Home
          </a>
          <a
            href="#treatments"
            onClick={(e) => {
              e.preventDefault();
              handleNav('services');
            }}
            className={isCurrent('services') ? 'active' : ''}
          >
            Treatments
          </a>
          <a
            href="#doctors"
            onClick={(e) => {
              e.preventDefault();
              handleNav('doctors');
            }}
            className={isCurrent('doctors') ? 'active' : ''}
          >
            Our Team
          </a>
          <a
            href="#gallery"
            onClick={(e) => {
              e.preventDefault();
              handleNav('gallery');
            }}
            className={isCurrent('gallery') ? 'active' : ''}
          >
            Gallery
          </a>
          <a
            href="#blog"
            onClick={(e) => {
              e.preventDefault();
              handleNav('blog');
            }}
            className={isCurrent('blog') ? 'active' : ''}
          >
            Blog
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleNav('contact');
            }}
            className={isCurrent('contact') ? 'active' : ''}
          >
            Contact
          </a>
          <a
            href="#book"
            onClick={(e) => {
              e.preventDefault();
              handleNav('contact');
            }}
            className="cta"
          >
            Book Appointment
          </a>
        </div>

        <button
          className="burger"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </nav>
    </>
  );
};
