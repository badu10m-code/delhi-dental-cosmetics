import React from 'react';
import { BannerData, PageRoute } from '../types';

interface BannerProps {
  banners: BannerData[];
  onBookClick: (page: PageRoute) => void;
}

export const Banner: React.FC<BannerProps> = ({ banners, onBookClick }) => {
  const activeBanner = banners.find((b) => b.active);
  if (!activeBanner) return null;

  return (
    <section className="banner">
      <p className="bk">{activeBanner.badge || 'Special offer'}</p>
      <h2>{activeBanner.heading}</h2>
      <p>{activeBanner.text}</p>
      <button
        className="btn"
        onClick={() => {
          onBookClick('contact');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        {activeBanner.cta || 'Book an appointment'}
      </button>
    </section>
  );
};
