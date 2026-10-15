import React, { useState } from 'react';
import { PageRoute, ClinicPost } from '../types';
import { ARTICLES } from '../data/articles';

interface BlogPageProps {
  onNavigate: (page: PageRoute) => void;
  clinicPosts: ClinicPost[];
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate, clinicPosts }) => {
  const [selectedCat, setSelectedCat] = useState('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'implants', label: 'Implants' },
    { id: 'rct', label: 'Root Canal' },
    { id: 'braces', label: 'Braces' },
    { id: 'gums', label: 'Gum Health' },
    { id: 'crowns', label: 'Crowns' },
    { id: 'kids', label: 'Kids' },
    { id: 'cosmetic', label: 'Cosmetic' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'prevention', label: 'Prevention' },
  ];

  const filteredArticles = ARTICLES.filter((art) => {
    if (selectedCat === 'all') return true;
    return art.category === selectedCat;
  });

  const featuredArticle = ARTICLES.find((a) => a.featured) || ARTICLES[0];

  const openArticle = (slug: string) => {
    onNavigate({ type: 'article', slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="pagehead">
        <p className="kicker">Patient guides</p>
        <h1>Dental Health, Explained Plainly</h1>
        <p>
          Detailed guides on the treatments and the questions patients actually bring into the chair.
          Written by the clinic, without the jargon.
        </p>
      </header>

      {/* Featured post */}
      <section className="feat">
        <div
          className="fcard"
          onClick={() => openArticle(featuredArticle.slug)}
          style={{ cursor: 'pointer' }}
        >
          <div>
            <span className="btag">Featured &middot; {featuredArticle.categoryLabel}</span>
            <h2>{featuredArticle.title}</h2>
            <p>{featuredArticle.summary}</p>
            <span className="bmeta">
              {featuredArticle.date} &middot; {featuredArticle.readTime} &middot; By {featuredArticle.author}
            </span>
          </div>
          <img src={featuredArticle.image} alt={featuredArticle.title} />
        </div>
      </section>

      {/* Filter bar */}
      <section className="filterbar">
        <span>Browse by topic:</span>
        {categories.map((c) => (
          <button
            key={c.id}
            className={`fchip ${selectedCat === c.id ? 'on' : ''}`}
            onClick={() => setSelectedCat(c.id)}
          >
            {c.label}
          </button>
        ))}
      </section>

      {/* Articles list */}
      <section className="bloglist">
        {filteredArticles.map((art) => (
          <div
            key={art.slug}
            className="brow"
            onClick={() => openArticle(art.slug)}
            style={{ cursor: 'pointer' }}
          >
            <img src={art.image} alt={art.title} />
            <div>
              <span className="btag">{art.categoryLabel}</span>
              <h3>{art.title}</h3>
              <p>{art.summary}</p>
              <span className="bmeta">
                {art.date} &middot; {art.readTime}
              </span>
            </div>
          </div>
        ))}
        {filteredArticles.length === 0 && (
          <p className="fine" style={{ padding: '30px 0' }}>
            No articles in this category currently.
          </p>
        )}
      </section>

      {/* Dynamic notes from clinic desk (from admin dashboard) */}
      <section className="dynblog" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 4vw' }}>
        <h2>More notes from the clinic</h2>
        <div id="dyn-posts">
          {clinicPosts.length === 0 ? (
            <p className="fine">No additional staff notes published yet.</p>
          ) : (
            clinicPosts
              .slice()
              .reverse()
              .map((p) => (
                <article
                  key={p.id}
                  className="art dynpost"
                  style={{
                    background: 'var(--cream)',
                    padding: '24px 28px',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    border: '1px solid var(--line)',
                  }}
                >
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>{p.title}</h3>
                  <p className="ameta" style={{ marginBottom: '14px', paddingBottom: '8px' }}>
                    {p.date || 'Recent update'} &middot; from the clinic desk
                  </p>
                  {p.body.split(/\n\n+/).map((par, i) => (
                    <p key={i} style={{ color: '#43536B', marginBottom: '10px' }}>
                      {par}
                    </p>
                  ))}
                </article>
              ))
          )}
        </div>
      </section>
    </>
  );
};
