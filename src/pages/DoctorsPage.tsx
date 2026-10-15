import React from 'react';
import { PageRoute } from '../types';
import { DOCTORS } from '../data/doctors';

interface DoctorsPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({ onNavigate }) => {
  return (
    <>
      <header className="pagehead">
        <h1>Our Team</h1>
        <p>Two dentists, one shared chair-side manner: explain everything, rush nothing.</p>
      </header>

      <section className="docs">
        {DOCTORS.map((doc, idx) => (
          <div className="doc" key={idx}>
            <img src={doc.image} alt={doc.name} />
            <div>
              <h2>{doc.name}</h2>
              <p className="cred">{doc.credentials}</p>
              <p>{doc.bio}</p>
            </div>
          </div>
        ))}
        <p className="fine">
          The rest of the team, from the front desk to the chairside assistants, keeps the
          follow-ups, reminders and records running so visits stay short and stress-free.
        </p>
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            className="btn"
            onClick={() => {
              onNavigate('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            Schedule a Consultation
          </button>
        </div>
      </section>
    </>
  );
};
