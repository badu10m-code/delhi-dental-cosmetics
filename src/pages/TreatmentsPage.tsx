import React from 'react';
import { PageRoute } from '../types';
import { TREATMENTS } from '../data/treatments';

interface TreatmentsPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const TreatmentsPage: React.FC<TreatmentsPageProps> = ({ onNavigate }) => {
  const nav = (p: PageRoute) => {
    onNavigate(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="pagehead">
        <h1>Treatments</h1>
        <p>
          Every treatment here starts the same way: an examination, an honest explanation of your
          options, and a price agreed before anything begins. Ask as many questions as you want.
        </p>
      </header>

      <section className="svcs">
        {TREATMENTS.map((svc) => (
          <div className="svc" key={svc.id}>
            <img src={svc.image} alt={svc.title} />
            <div>
              <h2>{svc.title}</h2>
              <p>{svc.description}</p>
              <p className="costline">
                {svc.costLine}{' '}
                {svc.guideSlug && (
                  <button
                    onClick={() => nav({ type: 'article', slug: svc.guideSlug! })}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#14263B',
                      fontWeight: 600,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      font: 'inherit',
                    }}
                  >
                    {svc.guideTitle || 'Read the guide'} &rarr;
                  </button>
                )}
              </p>
            </div>
            <button
              className="btn ghost"
              onClick={() => nav('contact')}
              style={{ cursor: 'pointer' }}
            >
              Book this &rarr;
            </button>
          </div>
        ))}
      </section>
    </>
  );
};
