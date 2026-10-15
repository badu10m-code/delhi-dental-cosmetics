import React from 'react';
import { PageRoute } from '../types';
import { ARTICLES } from '../data/articles';

interface ArticlePageProps {
  slug: string;
  onNavigate: (page: PageRoute) => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({ slug, onNavigate }) => {
  const article = ARTICLES.find((a) => a.slug === slug) || ARTICLES[0];
  const relatedArticles = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 4);

  const nav = (p: PageRoute) => {
    onNavigate(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="pagehead">
        <p className="kicker">
          <button
            onClick={() => nav('blog')}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: 'inherit',
              fontWeight: 'inherit',
              fontSize: 'inherit',
              padding: 0,
            }}
          >
            &larr; All Patient Guides
          </button>
        </p>
      </header>

      <section className="artsec">
        <article className="art" data-cat={article.category}>
          <h1>{article.title}</h1>
          <p className="ameta">
            By {article.author} &middot; {article.date} &middot; {article.categoryLabel} &middot; {article.readTime}
          </p>

          <figure className="arthero">
            <img src={article.image} alt={article.title} />
            {article.caption && <figcaption>{article.caption}</figcaption>}
          </figure>

          {article.sections.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '24px' }}>
              {section.heading && <h2>{section.heading}</h2>}

              {section.paragraphs?.map((p, pIdx) => (
                <p key={pIdx}>{p}</p>
              ))}

              {section.bullets && (
                <ul className="pul">
                  {section.bullets.map((b, bIdx) => (
                    <li key={bIdx}>{b}</li>
                  ))}
                </ul>
              )}

              {section.table && (
                <div style={{ overflowX: 'auto', margin: '22px 0' }}>
                  <table className="tstage">
                    <thead>
                      <tr>
                        {section.table.headers.map((h, hIdx) => (
                          <th key={hIdx}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {section.callout && (
                <p className="acta">
                  {section.callout.text}{' '}
                  <button
                    onClick={() => nav('contact')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--navy)',
                      textDecoration: 'underline',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: 'inherit',
                      padding: 0,
                    }}
                  >
                    {section.callout.linkText}
                  </button>
                </p>
              )}
            </div>
          ))}

          <div className="authorbox">
            <div className="abx">
              <b>{article.author}</b>
              <span>BDS, MDS &middot; 17+ years &middot; Delhi Dental Cosmetics, GTB Nagar</span>
              <p>
                The clinic handles implants, braces, cosmetic work and everyday family dentistry for
                patients across North Delhi.{' '}
                <button
                  onClick={() => nav('doctors')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--navy)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: 'inherit',
                  }}
                >
                  Meet the team
                </button>
                .
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="related" style={{ maxWidth: '760px', margin: '0 auto', padding: '0 4vw 60px' }}>
        <h2>More from the clinic</h2>
        <div className="rlist">
          {relatedArticles.map((rel) => (
            <button
              key={rel.slug}
              onClick={() => nav({ type: 'article', slug: rel.slug })}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: '1px solid var(--line)',
                padding: '16px 0',
                fontWeight: 500,
                color: 'var(--navy)',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              {rel.title} &rarr;
            </button>
          ))}
        </div>
      </section>
    </>
  );
};
