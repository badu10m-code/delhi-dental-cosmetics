import React from 'react';
import { PageRoute } from '../types';

interface PrivacyPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigate }) => {
  return (
    <>
      <section className="pagehead">
        <p className="kicker">Your data</p>
        <h1>Privacy, in plain language</h1>
        <p>What this website collects, what it does not, and who can see it.</p>
      </section>

      <section className="wprose" style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 4vw' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--navy)' }}>
          What the booking form collects
        </h2>
        <p style={{ color: '#43536B', marginBottom: '24px' }}>
          Only what the clinic needs to confirm your appointment: your name, phone number, an optional
          email address, your preferred date and time, the treatment you are asking about, and anything
          you choose to add in the note. Nothing else is asked and nothing else is stored.
        </p>

        <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--navy)' }}>Where it goes</h2>
        <p style={{ color: '#43536B', marginBottom: '24px' }}>
          Booking requests are sent to the clinic's own cloud store, which only the clinic staff can open
          through a passcode-protected dashboard. The clinic uses it to call or message you back and
          confirm your slot. It is not shared with advertisers, data brokers or anyone else.
        </p>

        <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--navy)' }}>
          What this website does not do
        </h2>
        <p style={{ color: '#43536B', marginBottom: '24px' }}>
          Public pages of this site set no tracking cookies, run no analytics, and show no ads. Nothing
          follows you to another website. When you tap a WhatsApp or call button, that opens your own
          WhatsApp or phone app, and their own policies apply from that point.
        </p>

        <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--navy)' }}>
          How long your details are kept
        </h2>
        <p style={{ color: '#43536B', marginBottom: '24px' }}>
          Booking requests stay in the clinic dashboard until the visit is done or you ask for them to
          be removed, whichever comes first. Ask the clinic by phone or WhatsApp and any record of your
          request will be deleted.
        </p>

        <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--navy)' }}>Questions</h2>
        <p style={{ color: '#43536B', marginBottom: '30px' }}>
          Call +91 95605 53331 or WhatsApp the clinic during working hours. A person answers, not a
          form.
        </p>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            className="btn ghost"
            onClick={() => {
              onNavigate('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ cursor: 'pointer' }}
          >
            Go to Contact Page &rarr;
          </button>
        </div>
      </section>
    </>
  );
};
