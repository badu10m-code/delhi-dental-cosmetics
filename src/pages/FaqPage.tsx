import React, { useState } from 'react';
import { PageRoute } from '../types';
import { FAQS } from '../data/faqs';

interface FaqPageProps {
  onNavigate: (page: PageRoute) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <section className="pagehead">
        <p className="kicker">Before you visit</p>
        <h1>Questions patients actually ask</h1>
        <p>
          Timings, costs, children, emergencies. If your question is not here, the clinic answers the
          phone.
        </p>
        <div style={{ maxWidth: '500px', margin: '20px auto 0' }}>
          <input
            type="text"
            placeholder="Search questions or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '12px 18px',
              borderRadius: '30px',
              border: '1px solid #C9C2B2',
              fontSize: '0.95rem',
            }}
          />
        </div>
      </section>

      <section className="faqsec" style={{ minHeight: '400px' }}>
        <div className="faqs">
          {filteredFaqs.map((faq, idx) => (
            <details key={idx} open={idx === 0 || searchQuery.length > 0}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
          {filteredFaqs.length === 0 && (
            <p className="fine" style={{ padding: '30px 0', textAlign: 'center' }}>
              No questions found matching "{searchQuery}". Call us directly at +91 95605 53331.
            </p>
          )}
        </div>

        <p className="gmore" style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            className="btn ghost"
            onClick={() => {
              onNavigate('contact');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{ cursor: 'pointer' }}
          >
            Book an appointment &rarr;
          </button>
        </p>
      </section>
    </>
  );
};
