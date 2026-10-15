import React from 'react';
import { PageRoute } from '../types';
import { GALLERY_ITEMS } from '../data/gallery';

interface GalleryPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate }) => {
  return (
    <>
      <header className="pagehead">
        <h1>A Look Around</h1>
        <p>Real photos from the clinic's own Google listing.</p>
      </header>

      <section className="gal">
        {GALLERY_ITEMS.map((item, idx) => (
          <figure key={idx}>
            <img src={item.image} alt={item.title} />
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </section>

      <div style={{ textAlign: 'center', margin: '40px auto 60px' }}>
        <button
          className="btn"
          onClick={() => {
            onNavigate('contact');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          style={{ cursor: 'pointer', border: 'none' }}
        >
          Book an Appointment
        </button>
      </div>
    </>
  );
};
