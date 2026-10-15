import React, { useState } from 'react';
import { Appointment, ClinicSettings } from '../types';
import {
  generateApptId,
  isSundayDate,
  checkAppointmentDuplicate,
  mutateStoreData,
  fetchStoreData,
} from '../services/store';

interface ContactPageProps {
  settings: ClinicSettings;
}

const QUICK_SLOTS = [
  { label: '9:30 AM', value: 'Morning: 9:30 to 11:00 AM' },
  { label: '11:00 AM', value: 'Morning: 11:00 AM to 1:30 PM' },
  { label: '5:00 PM', value: 'Evening: 5:00 to 6:30 PM' },
  { label: '6:30 PM', value: 'Evening: 6:30 to 8:00 PM' },
];

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('General check-up');
  const [doctor, setDoctor] = useState('Any available dentist');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('Morning: 9:30 to 11:00 AM');
  const [note, setNote] = useState('');
  const [honeypot, setHoneypot] = useState('');

  const [feedback, setFeedback] = useState<{ text: string; type: 'ok' | 'bad' | '' }>({
    text: '',
    type: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitAt, setLastSubmitAt] = useState(0);

  const handleDateChange = (val: string) => {
    setDate(val);
    if (!val) {
      setFeedback({ text: '', type: '' });
      return;
    }
    if (isSundayDate(val)) {
      setFeedback({
        text: 'The clinic is closed on Sundays. Please pick a Monday to Saturday date.',
        type: 'bad',
      });
    } else if (val === todayIso) {
      setFeedback({
        text: 'Same-day requests: the clinic may already be full. A call is faster for today.',
        type: '',
      });
    } else {
      setFeedback({ text: '', type: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      setFeedback({ text: 'Something went wrong, please retry.', type: 'bad' });
      return;
    }

    const trimmedName = name.trim();
    const cleanPh = phone.replace(/[^0-9+ ]/g, '').trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 3) {
      setFeedback({ text: 'Please give your name.', type: 'bad' });
      return;
    }

    const digitsOnly = cleanPh.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 10) {
      setFeedback({ text: 'Please give a 10-digit phone number.', type: 'bad' });
      return;
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFeedback({
        text: 'That email address does not look right. Leave it empty or correct it.',
        type: 'bad',
      });
      return;
    }

    if (!date) {
      setFeedback({ text: 'Please pick a preferred date.', type: 'bad' });
      return;
    }

    if (isSundayDate(date)) {
      setFeedback({
        text: 'The clinic is closed on Sundays. Please pick a Monday to Saturday date.',
        type: 'bad',
      });
      return;
    }

    const now = Date.now();
    if (now - lastSubmitAt < 30000) {
      setFeedback({ text: 'Request already sent. Please wait a moment.', type: 'bad' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ text: 'Checking slot availability and sending request...', type: '' });

    try {
      const store = await fetchStoreData(true);
      const duplicate = checkAppointmentDuplicate(store.appointments, cleanPh, date);

      if (duplicate) {
        setIsSubmitting(false);
        setFeedback({
          text: `You already have a request for this date (reference ${duplicate.id}). The clinic will confirm it. To change it, please call the clinic.`,
          type: 'bad',
        });
        return;
      }

      const newAppt: Appointment = {
        id: generateApptId(),
        name: trimmedName,
        phone: cleanPh,
        email: trimmedEmail || undefined,
        service,
        doctor,
        date,
        time,
        note: note.slice(0, 400),
        created: new Date().toISOString(),
        status: 'new',
      };

      const result = await mutateStoreData((d) => {
        d.appointments.push(newAppt);
        return newAppt.id;
      });

      setLastSubmitAt(Date.now());
      setIsSubmitting(false);

      if (result.success || result.data.appointments.some((a) => a.id === newAppt.id)) {
        setName('');
        setPhone('');
        setEmail('');
        setNote('');
        setDate('');
        setFeedback({
          text: `Request received. Reference ${newAppt.id}. Save this reference, the clinic will confirm your slot by call or WhatsApp during working hours.`,
          type: 'ok',
        });
      } else {
        setFeedback({
          text: 'Could not reach the clinic server right now. Please call +91 95605 53331 instead.',
          type: 'bad',
        });
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setFeedback({
        text: 'Could not connect right now. Please call +91 95605 53331.',
        type: 'bad',
      });
    }
  };

  const clinicPhone = settings.phone || '+91 95605 53331';
  const clinicWa = settings.whatsapp || '919560553331';
  const clinicAddr = settings.address || '2413 Basement, Hudson Lane, Kingsway Camp, GTB Nagar, Delhi 110009';
  const clinicHours = settings.hours || 'Mon to Sat: 9:30 AM – 1:30 PM and 5:00 – 8:00 PM\nSunday closed';

  return (
    <>
      <header className="pagehead">
        <h1>Contact &amp; Appointments</h1>
        <p>
          Appointments are required before visiting, so the doctor you need has time for you. Request
          a slot below, or call during clinic hours.
        </p>
      </header>

      <section className="booksec" id="book">
        <div className="bwrap">
          <div>
            <h2>Request an Appointment</h2>
            <p>
              Fill this and the clinic will confirm your slot by call or WhatsApp during working
              hours. Appointment is required before visiting.
            </p>

            <form id="bookform" onSubmit={handleSubmit} noValidate>
              <label>
                Your name
                <input
                  type="text"
                  id="f-name"
                  maxLength={60}
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. / Mr. / Ms. Name"
                />
              </label>

              <label>
                Phone number
                <input
                  type="tel"
                  id="f-phone"
                  maxLength={15}
                  required
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>

              <label>
                Treatment
                <select
                  id="f-service"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                >
                  <option>General check-up</option>
                  <option>Dental Implants</option>
                  <option>Braces &amp; Aligners</option>
                  <option>Smile Makeover / Veneers</option>
                  <option>Root Canal Treatment</option>
                  <option>Crowns &amp; Bridges</option>
                  <option>Teeth Whitening</option>
                  <option>Gum Treatment / Cleaning</option>
                  <option>Kids Dentistry</option>
                  <option>Emergency / Pain</option>
                </select>
              </label>

              <label>
                Email (optional)
                <input
                  type="email"
                  id="f-email"
                  maxLength={80}
                  autoComplete="email"
                  placeholder="For the confirmation, if you use email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              <label>
                Preferred dentist
                <select
                  id="f-doctor"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                >
                  <option>Any available dentist</option>
                  <option>Dr. Animesh Agarwal</option>
                  <option>Dr. Neha Singhal</option>
                </select>
              </label>

              <label>
                Preferred date
                <input
                  type="date"
                  id="f-date"
                  required
                  min={todayIso}
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </label>

              <div className="chips" id="quickslots">
                <span>Quick slots:</span>
                {QUICK_SLOTS.map((slot) => (
                  <button
                    key={slot.label}
                    type="button"
                    className={time === slot.value ? 'on' : ''}
                    onClick={() => setTime(slot.value)}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>

              <label>
                Preferred time
                <select
                  id="f-time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                >
                  <option>Morning: 9:30 to 11:00 AM</option>
                  <option>Morning: 11:00 AM to 1:30 PM</option>
                  <option>Evening: 5:00 to 6:30 PM</option>
                  <option>Evening: 6:30 to 8:00 PM</option>
                </select>
              </label>

              <label>
                Anything we should know?
                <textarea
                  id="f-note"
                  maxLength={400}
                  rows={3}
                  placeholder="Briefly describe pain, previous treatments or specific questions (optional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>

              {/* Honeypot field */}
              <input
                type="text"
                name="website"
                className="hp"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />

              <button
                className="btn"
                type="submit"
                id="f-send"
                disabled={isSubmitting}
                style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                {isSubmitting ? 'Sending Request...' : 'Request Appointment'}
              </button>

              {feedback.text && (
                <p className={`fmsg ${feedback.type}`} role="status">
                  {feedback.text}
                </p>
              )}
            </form>
          </div>

          <div className="binfo">
            <h3>Reach us directly</h3>
            <a href={`tel:${clinicPhone.replace(/[^0-9+]/g, '')}`}>&#9742; Call {clinicPhone}</a>
            <a
              href={`https://wa.me/${clinicWa.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp the clinic
            </a>
            <a href="mailto:dranimeshagarwal@yahoo.in">dranimeshagarwal@yahoo.in</a>

            <h3>Timings</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{clinicHours}</p>

            <h3>Address</h3>
            <p>{clinicAddr}</p>
            <p>Near GTB Nagar Metro Station, Gate No. 4</p>
            <a
              className="btn ghost"
              href="https://maps.google.com/?cid=7584890295485403271"
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: '12px' }}
            >
              Open in Google Maps &rarr;
            </a>
          </div>
        </div>
      </section>

      <section className="faqsec">
        <h2>Questions patients ask before coming</h2>
        <div className="faqs">
          <details open>
            <summary>Do I need an appointment, or can I walk in?</summary>
            <p>
              Appointments are required before visiting, so the doctor you need has proper time for
              you. Request a slot through the form above or call during clinic hours.
            </p>
          </details>
          <details>
            <summary>Where exactly is the clinic?</summary>
            <p>
              2413 Basement, Hudson Lane, Kingsway Camp, GTB Nagar, Delhi 110009, about a minute
              from GTB Nagar Metro Station Gate No. 4.
            </p>
          </details>
          <details>
            <summary>What are the timings?</summary>
            <p>
              Monday to Saturday, 9:30 AM to 1:30 PM and 5:00 PM to 8:00 PM. Sunday is closed.
            </p>
          </details>
          <details>
            <summary>Is the clinic wheelchair accessible?</summary>
            <p>Yes. The clinic is on the ground level of the building and wheelchair accessible.</p>
          </details>
          <details>
            <summary>Which payments do you accept?</summary>
            <p>
              Cash, and Paytm is accepted at the clinic. Carry a card as backup for larger treatment
              plans.
            </p>
          </details>
          <details>
            <summary>How much does a consultation cost?</summary>
            <p>
              Consultation is charged per visit and depends on the treatment planned. The fee and
              the full treatment cost are explained before any work begins.
            </p>
          </details>
        </div>
      </section>

      <iframe
        className="map"
        src="https://maps.google.com/maps?q=Delhi+Dental+Cosmetics+Hudson+Lane+GTB+Nagar+Delhi&output=embed"
        loading="lazy"
        title="Map to Delhi Dental Cosmetics"
      />
    </>
  );
};
