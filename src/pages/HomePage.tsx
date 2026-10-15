import React, { useEffect, useState } from 'react';
import { PageRoute, ClinicSettings } from '../types';

interface HomePageProps {
  onNavigate: (page: PageRoute) => void;
  settings: ClinicSettings;
}

const TYPEWRITER_WORDS = [
  'dental implants',
  'invisible aligners',
  'smile makeovers',
  'painless root canals',
];

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, settings }) => {
  const [twText, setTwText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const currentWord = TYPEWRITER_WORDS[wordIdx];
    let timer: NodeJS.Timeout;

    if (!isDeleting && charIdx < currentWord.length) {
      timer = setTimeout(() => {
        setTwText(currentWord.slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
      }, 75);
    } else if (!isDeleting && charIdx === currentWord.length) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && charIdx > 0) {
      timer = setTimeout(() => {
        setTwText(currentWord.slice(0, charIdx - 1));
        setCharIdx(charIdx - 1);
      }, 35);
    } else if (isDeleting && charIdx === 0) {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
    }

    return () => clearTimeout(timer);
  }, [wordIdx, charIdx, isDeleting]);

  // Animated counters
  const [ratingCount, setRatingCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [yearsCount, setYearsCount] = useState(0);
  const [daysCount, setDaysCount] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1500;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);

      setRatingCount(Number((4.9 * ease).toFixed(1)));
      setReviewsCount(Math.round(881 * ease));
      setYearsCount(Math.round(17 * ease));
      setDaysCount(Math.round(6 * ease));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setRatingCount(4.9);
        setReviewsCount(881);
        setYearsCount(17);
        setDaysCount(6);
      }
    };

    const handle = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(handle);
  }, []);

  const phone = settings.phone || '+91 95605 53331';
  const cleanPhone = phone.replace(/[^0-9+]/g, '');

  const nav = (p: PageRoute) => {
    onNavigate(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="hero">
        <div className="hwrap">
          <div className="hcopy">
            <div className="badge">
              <span className="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> 4.9 on Google
              &middot; 881 patient reviews
            </div>
            <h1>
              A calm clinic for the <em>smiles</em> people travel to GTB Nagar for
            </h1>
            <p className="typeline">
              <span className="tlabel">Known for</span> <span>{twText}</span>
              <span className="caret">|</span>
            </p>
            <p>
              Dr. Animesh Agarwal has spent close to two decades on Hudson Lane doing the work this
              clinic is known for: implants, zirconia crowns, braces and full smile makeovers,
              explained in plain language before anything begins. Patients come from Shamli,
              Panipat and across Delhi.
            </p>
            <div className="hbtns">
              <button
                className="btn"
                onClick={() => nav('contact')}
                style={{ cursor: 'pointer', border: 'none' }}
              >
                Book an Appointment
              </button>
              <a className="btn ghost light" href={`tel:${cleanPhone}`}>
                Call {phone}
              </a>
            </div>
            <div className="hmeta">
              Walk-ins by appointment &middot; Wheelchair accessible &middot; Paytm accepted
            </div>
          </div>

          <figure className="hphoto">
            <img
              src="/assets/hero-team.jpg"
              alt="The Delhi Dental Cosmetics team at the clinic reception"
            />
            <figcaption>
              <b>The team at reception</b>
              <span>Walk in and someone will walk you through it</span>
            </figcaption>
          </figure>
        </div>
      </header>

      <section className="strip">
        <a
          href="https://maps.google.com/?cid=7584890295485403271"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h3>Find the Clinic</h3>
          <span>
            2413 Basement, Hudson Lane, Kingsway Camp, GTB Nagar
            <br />
            Open in Google Maps &rarr;
          </span>
        </a>
        <a
          href="#book"
          onClick={(e) => {
            e.preventDefault();
            nav('contact');
          }}
        >
          <h3>Book an Appointment</h3>
          <span>
            Request a slot online, we confirm by call or WhatsApp
            <br />
            Book now &rarr;
          </span>
        </a>
        <a href={`tel:${cleanPhone}`}>
          <h3>Call the Clinic</h3>
          <span>
            We answer during clinic hours
            <br />
            {phone} &rarr;
          </span>
        </a>
      </section>

      <section className="stats">
        <div>
          <b>
            <span className="cnt">{ratingCount.toFixed(1)}</span>
          </b>
          <span>Google rating</span>
        </div>
        <div>
          <b>
            <span className="cnt">{reviewsCount}</span>
          </b>
          <span>Patient reviews</span>
        </div>
        <div>
          <b>
            <span className="cnt">{yearsCount}</span>+
          </b>
          <span>Years of practice</span>
        </div>
        <div>
          <b>
            <span className="cnt">{daysCount}</span>
          </b>
          <span>Days a week open</span>
        </div>
      </section>

      <section className="results">
        <p className="kicker">Actual results</p>
        <h2>Smiles, before and after</h2>
        <div className="duo">
          <figure>
            <img
              src="/assets/veneers-before-after.jpg"
              alt="Smile makeover with veneers, before and after"
            />
            <figcaption>
              Full smile makeover: worn, stained teeth restored with a matched set of crowns and
              veneers
            </figcaption>
          </figure>
          <figure>
            <img
              src="/assets/gap-closed.jpg"
              alt="Gap between front teeth closed with cosmetic bonding"
            />
            <figcaption>
              A front-tooth gap closed with cosmetic work, with the natural shape of the teeth kept
            </figcaption>
          </figure>
        </div>
        <p className="fine">
          Photos shared on the clinic's own Google listing. Every smile is planned case by case;
          yours gets its own plan, not a template.
        </p>
      </section>

      <section className="svclist">
        <p className="kicker">What we treat</p>
        <h2>Treatments at a glance</h2>
        <div className="row">
          <img src="/assets/operatory.jpg" alt="" />
          <div>
            <h3>Dental Implants</h3>
            <p>
              Single tooth to full-mouth plans, placed and restored under one roof. Dr. Agarwal
              plans every case on the X-ray before quoting anything.
            </p>
          </div>
          <button
            onClick={() => nav('services')}
            className="abtn ghost"
            style={{ border: 'none', background: 'none', color: '#14263B', fontWeight: 600, cursor: 'pointer' }}
          >
            Details &rarr;
          </button>
        </div>

        <div className="row">
          <img src="/assets/hero-team.jpg" alt="" />
          <div>
            <h3>Braces &amp; Invisible Aligners</h3>
            <p>
              Metal braces, ceramic and clear aligners. An Invisalign display sits at our
              reception; ask for it and we will show you real cases.
            </p>
          </div>
          <button
            onClick={() => nav('services')}
            style={{ border: 'none', background: 'none', color: '#14263B', fontWeight: 600, cursor: 'pointer' }}
          >
            Details &rarr;
          </button>
        </div>

        <div className="row">
          <img src="/assets/veneers-before-after.jpg" alt="" />
          <div>
            <h3>Smile Makeover &amp; Veneers</h3>
            <p>
              The signature work of this clinic: zirconia crowns, veneers and full smile design,
              matched to your face rather than a catalogue.
            </p>
          </div>
          <button
            onClick={() => nav('services')}
            style={{ border: 'none', background: 'none', color: '#14263B', fontWeight: 600, cursor: 'pointer' }}
          >
            Details &rarr;
          </button>
        </div>

        <div className="row">
          <img src="/assets/reception.jpg" alt="" />
          <div>
            <h3>Root Canal Treatment</h3>
            <p>
              Single-sitting RCT where the case allows it, with the tooth saved rather than pulled
              whenever that is possible.
            </p>
          </div>
          <button
            onClick={() => nav('services')}
            style={{ border: 'none', background: 'none', color: '#14263B', fontWeight: 600, cursor: 'pointer' }}
          >
            Details &rarr;
          </button>
        </div>

        <div className="row">
          <img src="/assets/lounge.jpg" alt="" />
          <div>
            <h3>Kids &amp; Family Dentistry</h3>
            <p>
              Check-ups, fillings and habit counselling for children in a waiting room built to
              keep them at ease.
            </p>
          </div>
          <button
            onClick={() => nav('services')}
            style={{ border: 'none', background: 'none', color: '#14263B', fontWeight: 600, cursor: 'pointer' }}
          >
            Details &rarr;
          </button>
        </div>

        <div className="row">
          <img src="/assets/gap-closed.jpg" alt="" />
          <div>
            <h3>Teeth Whitening &amp; Cleaning</h3>
            <p>
              Scaling, polishing and in-clinic whitening, with honest advice on what your teeth
              actually need, and what they do not.
            </p>
          </div>
          <button
            onClick={() => nav('services')}
            style={{ border: 'none', background: 'none', color: '#14263B', fontWeight: 600, cursor: 'pointer' }}
          >
            Details &rarr;
          </button>
        </div>

        <button
          onClick={() => nav('services')}
          className="center"
          style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', fontSize: '1.05rem' }}
        >
          See all treatments in detail &rarr;
        </button>
      </section>

      <section className="dark reviews">
        <p className="kicker gold">From patients</p>
        <h2>What the reviews say, in their words</h2>
        <blockquote>
          <p>
            &ldquo;I came from Shamli for my treatment after reading online about Dr Animesh. I got
            3 implants and multiple root canal and 28 zirconium crowns from him. I must say that I am
            totally satisfied with the results. It&rsquo;s worth coming from Shamli.&rdquo;
          </p>
          <cite>Subhash Verma &middot; Google review &middot; 5 stars</cite>
        </blockquote>

        <blockquote>
          <p>
            &ldquo;From my very first visit, the warmth, professionalism, and genuine care extended
            by the entire team instantly put me at ease. They didn&rsquo;t just treat my teeth. The
            smile I wear today is the greatest testimony to their skill and precision.&rdquo;
          </p>
          <cite>Anjali Chauhan &middot; Google review &middot; 5 stars</cite>
        </blockquote>

        <blockquote>
          <p>
            &ldquo;Exceptional experience for my braces treatment! The entire process was seamless,
            professional, and virtually stress-free. The doctor&rsquo;s attention to detail is
            unmatched.&rdquo;
          </p>
          <cite>Deepak Khanka &middot; Google review &middot; 5 stars</cite>
        </blockquote>

        <a
          className="btn ghost light"
          href="https://maps.google.com/?cid=7584890295485403271"
          target="_blank"
          rel="noopener noreferrer"
        >
          Read all 881 reviews on Google
        </a>
      </section>

      <section className="about">
        <div className="awrap">
          <img src="/assets/staff.jpg" alt="Reception desk at Delhi Dental Cosmetics" />
          <div>
            <p className="kicker">The clinic</p>
            <h2>Built to keep nervous patients calm</h2>
            <p>
              A dental visit makes most people anxious. This clinic was arranged the other way
              around: soft lighting, calming music, a waiting area with sofas instead of plastic
              chairs, and a team that talks you through each step before it happens. Patients in
              reviews keep mentioning the same things: the ambience, the patience, and that the price
              was agreed before the work started.
            </p>
            <p>
              Wheelchair accessible, with parking nearby and about seven seats in the waiting area,
              so appointments run on time.
            </p>
            <button
              className="btn ghost"
              onClick={() => nav('gallery')}
              style={{ cursor: 'pointer' }}
            >
              Look around the clinic &rarr;
            </button>
          </div>
        </div>
      </section>

      <section className="guides">
        <div className="gwrap">
          <p className="kicker">From the clinic desk</p>
          <h2>Patient guides, written by us</h2>

          <div
            className="fcard"
            style={{ cursor: 'pointer' }}
            onClick={() => nav({ type: 'article', slug: 'article-gum-disease-flap-surgery' })}
          >
            <div>
              <span className="btag">Featured &middot; Gum Health</span>
              <h3>Gum disease and flap surgery: when deep cleaning is not enough</h3>
              <p>
                Gum disease moves quietly through four stages, and by the time a tooth feels
                loose, much of the bone holding it is already gone.
              </p>
              <span className="bmeta">15 Oct 2026 &middot; 7 min read</span>
            </div>
            <img src="/assets/blog-gums.jpg" alt="Dentist examining a patient's gums" />
          </div>

          <div
            className="brow"
            style={{ cursor: 'pointer' }}
            onClick={() => nav({ type: 'article', slug: 'article-root-canal-gtb-nagar' })}
          >
            <img src="/assets/blog-rct.jpg" alt="" />
            <div>
              <span className="btag">Root Canal</span>
              <h3>Root canal treatment: what it costs, whether it hurts</h3>
              <p>Costs, visits and honest answers before you sit in the chair.</p>
              <span className="bmeta">15 Oct 2026 &middot; 6 min</span>
            </div>
          </div>

          <div
            className="brow"
            style={{ cursor: 'pointer' }}
            onClick={() => nav({ type: 'article', slug: 'article-dental-implants-guide' })}
          >
            <img src="/assets/veneers-before-after.jpg" alt="" />
            <div>
              <span className="btag">Implants</span>
              <h3>Dental implants: five questions to ask first</h3>
              <p>The checklist that protects your money and your jaw.</p>
              <span className="bmeta">15 Oct 2026 &middot; 6 min</span>
            </div>
          </div>

          <p className="gmore">
            <button
              onClick={() => nav('blog')}
              style={{
                background: 'none',
                border: 'none',
                color: '#14263B',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '1rem',
                padding: 0,
              }}
            >
              All patient guides &rarr;
            </button>
          </p>
        </div>
      </section>
    </>
  );
};
