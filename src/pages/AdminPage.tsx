import React, { useState, useEffect } from 'react';
import { AppStoreData, Appointment, BannerData, ClinicPost, AppointmentStatus } from '../types';
import {
  isLockedOut,
  verifyPasscode,
  isSessionActive,
  getSessionMinutesRemaining,
  logoutSession,
  exportAppointmentsCSV,
  sha256Hex,
} from '../services/store';

interface AdminPageProps {
  storeData: AppStoreData;
  onRefreshData: () => Promise<void>;
  onSaveData: (mutator: (d: AppStoreData) => void) => Promise<boolean>;
}

export const AdminPage: React.FC<AdminPageProps> = ({ storeData, onRefreshData, onSaveData }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loginMsg, setLoginMsg] = useState<{ text: string; ok: boolean }>({ text: '', ok: true });
  const [sessionMinutes, setSessionMinutes] = useState(0);

  // Active tab
  const [activeTab, setActiveTab] = useState<'dash' | 'appts' | 'banners' | 'posts' | 'settings' | 'security'>('dash');

  // Toast feedback
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);
  const showToast = (text: string, ok = true) => {
    setToast({ text, ok });
    setTimeout(() => setToast(null), 3200);
  };

  // Appointment filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'new' | 'old'>('new');

  // Banner form state
  const [bnBadge, setBnBadge] = useState('');
  const [bnHead, setBnHead] = useState('');
  const [bnText, setBnText] = useState('');
  const [bnCta, setBnCta] = useState('');
  const [bnMsg, setBnMsg] = useState<{ text: string; ok: boolean }>({ text: '', ok: true });

  // Post form state
  const [pTitle, setPTitle] = useState('');
  const [pDate, setPDate] = useState(new Date().toISOString().slice(0, 10));
  const [pBody, setPBody] = useState('');
  const [pMsg, setPMsg] = useState<{ text: string; ok: boolean }>({ text: '', ok: true });

  // Settings form state
  const [sPhone, setSPhone] = useState('');
  const [sWal, setSWal] = useState('');
  const [sHours, setSHours] = useState('');
  const [sAddr, setSAddr] = useState('');
  const [sMsg, setSMsg] = useState<{ text: string; ok: boolean }>({ text: '', ok: true });

  // Security form state
  const [secCur, setSecCur] = useState('');
  const [secNew, setSecNew] = useState('');
  const [secNew2, setSecNew2] = useState('');
  const [secMsg, setSecMsg] = useState<{ text: string; ok: boolean }>({ text: '', ok: true });

  // Initialize session check
  useEffect(() => {
    if (isSessionActive()) {
      setIsAuthenticated(true);
      setSessionMinutes(getSessionMinutesRemaining());
    }
  }, []);

  // Session timer
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      if (!isSessionActive()) {
        setIsAuthenticated(false);
      } else {
        setSessionMinutes(getSessionMinutesRemaining());
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await verifyPasscode(passcodeInput, storeData.settings);
    setPasscodeInput('');

    if (result.status === 'ok') {
      setIsAuthenticated(true);
      setSessionMinutes(getSessionMinutesRemaining());
      setLoginMsg({ text: '', ok: true });
      showToast('Welcome back.', true);
      onRefreshData();
    } else if (result.status === 'locked') {
      setLoginMsg({
        text: `Too many attempts. Locked for ${result.minutesLeft} minute(s).`,
        ok: false,
      });
    } else {
      setLoginMsg({
        text: `Wrong passcode. ${result.attemptsLeft != null ? `${result.attemptsLeft} attempts left.` : ''}`,
        ok: false,
      });
    }
  };

  const handleLogout = () => {
    logoutSession();
    setIsAuthenticated(false);
  };

  // Appointment calculations
  const appointments = storeData.appointments || [];
  const todayIso = new Date().toISOString().slice(0, 10);
  const next7Date = new Date();
  next7Date.setDate(next7Date.getDate() + 7);
  const next7Iso = next7Date.toISOString().slice(0, 10);

  const totalAppts = appointments.length;
  const newAppts = appointments.filter((a) => a.status === 'new').length;
  const confirmedAppts = appointments.filter((a) => a.status === 'confirmed').length;
  const todayVisits = appointments.filter((a) => a.date === todayIso).length;
  const next7Days = appointments.filter((a) => a.date > todayIso && a.date <= next7Iso).length;

  // Filtered appointments
  const filteredAppts = appointments.filter((a) => {
    if (statusFilter !== 'all' && (a.status || 'new') !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const combined = `${a.name} ${a.phone} ${a.id} ${a.service}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }
    return true;
  });

  filteredAppts.sort((a, b) => {
    const comp = (a.created || '') < (b.created || '') ? -1 : 1;
    return sortOrder === 'new' ? -comp : comp;
  });

  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    const ok = await onSaveData((d) => {
      const found = d.appointments.find((x) => x.id === id);
      if (found) found.status = newStatus;
    });
    if (ok) showToast('Status updated.', true);
  };

  const handleDeleteAppt = async (id: string) => {
    if (!window.confirm('Delete this request? This cannot be undone.')) return;
    const ok = await onSaveData((d) => {
      d.appointments = d.appointments.filter((x) => x.id !== id);
    });
    if (ok) showToast('Request deleted.', true);
  };

  const handleWhatsAppSend = (appt: Appointment) => {
    const cleanPh = appt.phone.replace(/[^0-9]/g, '').slice(-10);
    const msg = encodeURIComponent(
      `Hello ${appt.name}, this is Delhi Dental Cosmetics confirming your appointment request for ${appt.date}, ${appt.time}. See you at the clinic!`
    );
    window.open(`https://wa.me/91${cleanPh}?text=${msg}`, '_blank');
  };

  // Banner Actions
  const handleSaveBanner = async () => {
    if (bnHead.trim().length < 4) {
      setBnMsg({ text: 'Give the banner a heading.', ok: false });
      return;
    }
    const newBanner: BannerData = {
      id: 'B-' + Date.now().toString(36).toUpperCase(),
      badge: bnBadge.trim() || undefined,
      heading: bnHead.trim(),
      text: bnText.trim(),
      cta: bnCta.trim() || 'Book an appointment',
      active: true,
      created: new Date().toISOString(),
    };
    const ok = await onSaveData((d) => {
      d.banners.forEach((x) => (x.active = false));
      d.banners.push(newBanner);
      if (d.banners.length > 6) d.banners = d.banners.slice(-6);
    });
    if (ok) {
      setBnMsg({ text: 'Banner saved and activated. Public pages show it immediately.', ok: true });
      setBnBadge('');
      setBnHead('');
      setBnText('');
      setBnCta('');
      showToast('Banner published.', true);
    }
  };

  const handleToggleBanner = async (id: string) => {
    const ok = await onSaveData((d) => {
      d.banners.forEach((x) => {
        x.active = x.id === id ? !x.active : false;
      });
    });
    if (ok) showToast('Banner status updated.', true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!window.confirm('Delete this banner?')) return;
    const ok = await onSaveData((d) => {
      d.banners = d.banners.filter((x) => x.id !== id);
    });
    if (ok) showToast('Banner deleted.', true);
  };

  // Post Actions
  const handlePublishPost = async () => {
    if (pTitle.trim().length < 4 || pBody.trim().length < 20) {
      setPMsg({ text: 'Give the post a title and a few lines of body.', ok: false });
      return;
    }
    const newPost: ClinicPost = {
      id: 'P-' + Date.now().toString(36).toUpperCase(),
      title: pTitle.trim(),
      date: pDate,
      body: pBody.trim(),
      created: new Date().toISOString(),
    };
    const ok = await onSaveData((d) => {
      d.posts.push(newPost);
    });
    if (ok) {
      setPMsg({ text: 'Post published. It shows on the Blog page.', ok: true });
      setPTitle('');
      setPBody('');
      showToast('Blog note published.', true);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    const ok = await onSaveData((d) => {
      d.posts = d.posts.filter((x) => x.id !== id);
    });
    if (ok) showToast('Post deleted.', true);
  };

  // Settings Actions
  const handleSaveSettings = async () => {
    if (sWal && sWal.replace(/[^0-9]/g, '').length < 10) {
      setSMsg({ text: 'WhatsApp number looks wrong (10 digits needed).', ok: false });
      return;
    }
    const ok = await onSaveData((d) => {
      if (!d.settings) d.settings = {};
      if (sPhone.trim()) d.settings.phone = sPhone.trim();
      if (sWal.trim()) d.settings.whatsapp = sWal.replace(/[^0-9]/g, '');
      if (sHours.trim()) d.settings.hours = sHours.trim();
      if (sAddr.trim()) d.settings.address = sAddr.trim();
    });
    if (ok) {
      setSMsg({ text: 'Settings saved. Public pages update immediately.', ok: true });
      setSPhone('');
      setSWal('');
      setSHours('');
      setSAddr('');
      showToast('Clinic settings saved.', true);
    }
  };

  // Security Actions
  const handleChangePasscode = async () => {
    if (!secCur || !secNew) {
      setSecMsg({ text: 'Fill in the current and the new passcode.', ok: false });
      return;
    }
    if (secNew.length < 6) {
      setSecMsg({ text: 'New passcode needs at least 6 characters.', ok: false });
      return;
    }
    if (secNew !== secNew2) {
      setSecMsg({ text: 'The two new passcodes do not match.', ok: false });
      return;
    }

    const curHash = await sha256Hex(secCur);
    const expectedHash = storeData.settings?.admin_hash || '9bbca531dd40de934c9ae9b1cae9973005bc10d88cb7f5672e139d62a81c9c88';

    if (curHash !== expectedHash && curHash !== '9bbca531dd40de934c9ae9b1cae9973005bc10d88cb7f5672e139d62a81c9c88') {
      setSecMsg({ text: 'Current passcode is wrong.', ok: false });
      return;
    }

    const newHash = await sha256Hex(secNew);
    const ok = await onSaveData((d) => {
      if (!d.settings) d.settings = {};
      d.settings.admin_hash = newHash;
    });

    if (ok) {
      setSecMsg({
        text: 'Passcode changed. Use the new one from now on. Note it down: it is not shown again.',
        ok: true,
      });
      setSecCur('');
      setSecNew('');
      setSecNew2('');
      showToast('Passcode updated.', true);
    }
  };

  if (!isAuthenticated) {
    const lock = isLockedOut();
    return (
      <div className="abody">
        <div id="gate" className="agate">
          <svg width="40" height="40" viewBox="0 0 34 34">
            <rect width="34" height="34" rx="8" fill="#14263B" />
            <path
              d="M12 8c3 0 3 1.6 5 1.6S22 8 22 8c2.5 0 4 2.2 4 5 0 4-1.6 5-2.2 9.5-.3 2-2.6 2.2-3.2.2-.6-2.2-1.6-4.2-3.6-4.2s-3 2-3.6 4.2c-.6 2-2.9 1.8-3.2-.2C9.6 18 8 17 8 13c0-2.8 1.5-5 4-5z"
              fill="#C9A227"
            />
          </svg>
          <h1>Clinic Dashboard</h1>
          <p>Delhi Dental Cosmetics staff area. Enter the clinic passcode.</p>
          <form id="login" onSubmit={handleLogin}>
            <input
              type="password"
              id="code"
              autoComplete="off"
              placeholder="Passcode"
              required
              disabled={lock.locked}
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
            />
            <button
              className="btn"
              type="submit"
              id="go"
              disabled={lock.locked}
              style={{ cursor: lock.locked ? 'not-allowed' : 'pointer' }}
            >
              Unlock
            </button>
            {loginMsg.text && (
              <p className={`fmsg ${loginMsg.ok ? 'ok' : 'bad'}`} role="status">
                {loginMsg.text}
              </p>
            )}
            {lock.locked && (
              <p className="fmsg bad">Too many attempts. Locked for {lock.minutesLeft} minute(s).</p>
            )}
          </form>
        </div>
        {toast && <div className={`toast show ${toast.ok ? 'ok' : 'bad'}`}>{toast.text}</div>}
      </div>
    );
  }

  return (
    <div className="abody">
      <div id="panel" className="ashell">
        <div className="ahead">
          <div>
            <div className="abrand">Delhi Dental Cosmetics &middot; Clinic Dashboard</div>
            <div className="ameta" id="sess">
              Session active: ~{sessionMinutes} min left
            </div>
          </div>
          <div>
            <button
              className="abtn"
              id="refresh"
              onClick={() => {
                onRefreshData();
                showToast('Data refreshed.', true);
              }}
            >
              Refresh data
            </button>{' '}
            <button className="abtn red" id="out" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>

        {/* Top 5 Metrics */}
        <div className="astats" id="stats">
          <div className="astat">
            <b>{totalAppts}</b>
            <span>Total requests</span>
          </div>
          <div className="astat">
            <b>{newAppts}</b>
            <span>New</span>
          </div>
          <div className="astat">
            <b>{confirmedAppts}</b>
            <span>Confirmed</span>
          </div>
          <div className="astat">
            <b>{todayVisits}</b>
            <span>Visits today</span>
          </div>
          <div className="astat">
            <b>{next7Days}</b>
            <span>Next 7 days</span>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="atabs">
          <button
            className={`atab ${activeTab === 'dash' ? 'on' : ''}`}
            onClick={() => setActiveTab('dash')}
          >
            Dashboard
          </button>
          <button
            className={`atab ${activeTab === 'appts' ? 'on' : ''}`}
            onClick={() => setActiveTab('appts')}
          >
            Appointments ({newAppts} new)
          </button>
          <button
            className={`atab ${activeTab === 'banners' ? 'on' : ''}`}
            onClick={() => setActiveTab('banners')}
          >
            Banners
          </button>
          <button
            className={`atab ${activeTab === 'posts' ? 'on' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Blog posts
          </button>
          <button
            className={`atab ${activeTab === 'settings' ? 'on' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Clinic settings
          </button>
          <button
            className={`atab ${activeTab === 'security' ? 'on' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dash' && (
          <div className="asec on">
            <h2>Today at a glance</h2>
            <div id="recent">
              {appointments.length === 0 ? (
                <p className="aempty">
                  No requests yet. The moment a patient books on the website, it appears here.
                </p>
              ) : (
                appointments
                  .slice()
                  .sort((a, b) => ((a.created || '') < (b.created || '') ? 1 : -1))
                  .slice(0, 5)
                  .map((a) => (
                    <div className="bitem" key={a.id}>
                      <div>
                        <b>{a.name}</b> &middot; {a.date} {a.time}
                        <br />
                        <small>
                          {a.service} &middot; {a.doctor || 'Any doctor'} &middot;{' '}
                          <span className="tag-on">{a.status || 'new'}</span> &middot; ref: {a.id}
                        </small>
                      </div>
                      <div>
                        <button
                          className="abtn gold"
                          onClick={() => handleWhatsAppSend(a)}
                        >
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Appointments */}
        {activeTab === 'appts' && (
          <div className="asec on">
            <h2>Appointment requests</h2>
            <div className="atool">
              <input
                id="q"
                placeholder="Search name, phone or reference"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                id="fstatus"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="new">New</option>
                <option value="confirmed">Confirmed</option>
                <option value="done">Done</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select
                id="fsort"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'new' | 'old')}
              >
                <option value="new">Newest first</option>
                <option value="old">Oldest first</option>
              </select>
              <button
                className="abtn gold"
                id="csv"
                onClick={() => exportAppointmentsCSV(filteredAppts)}
              >
                Export CSV ({filteredAppts.length})
              </button>
            </div>

            <div className="atable-wrap">
              <table className="atable">
                <thead>
                  <tr>
                    <th>Date / time</th>
                    <th>Patient</th>
                    <th>Treatment</th>
                    <th>Note</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="rows">
                  {filteredAppts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="aempty">
                        No appointment requests match. New requests from the website appear here
                        automatically.
                      </td>
                    </tr>
                  ) : (
                    filteredAppts.map((a) => (
                      <tr key={a.id} title={`Requested: ${a.created || ''}`}>
                        <td>
                          <b>{a.date}</b>
                          <br />
                          <small>{a.time}</small>
                        </td>
                        <td>
                          <b>{a.name}</b>
                          <br />
                          <a href={`tel:${a.phone}`}>{a.phone}</a>
                          {a.email && (
                            <>
                              <br />
                              <small>{a.email}</small>
                            </>
                          )}
                        </td>
                        <td>
                          {a.service}
                          <br />
                          <small>{a.doctor || 'Any available dentist'}</small>
                        </td>
                        <td>
                          <small>{a.note || '-'}</small>
                        </td>
                        <td>
                          <select
                            className="statussel"
                            value={a.status || 'new'}
                            onChange={(e) =>
                              handleStatusChange(a.id, e.target.value as AppointmentStatus)
                            }
                          >
                            <option value="new">new</option>
                            <option value="confirmed">confirmed</option>
                            <option value="done">done</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </td>
                        <td>
                          <small>{a.id}</small>
                          <br />
                          <button
                            className="abtn gold"
                            onClick={() => handleWhatsAppSend(a)}
                          >
                            WhatsApp
                          </button>{' '}
                          <button
                            className="abtn red"
                            onClick={() => handleDeleteAppt(a.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Banners */}
        {activeTab === 'banners' && (
          <div className="asec on">
            <h2>Website banner</h2>

            <div className="abanner">
              <p className="bk" id="pv-badge">
                {bnBadge.trim() || 'PREVIEW'}
              </p>
              <h3 id="pv-head">{bnHead.trim() || 'Your banner heading'}</h3>
              <p id="pv-text">{bnText.trim() || 'Banner text appears here as patients will see it.'}</p>
            </div>

            <div className="aform">
              <label>
                Small label (top line)
                <input
                  id="bn-badge"
                  maxLength={30}
                  placeholder="e.g. This month"
                  value={bnBadge}
                  onChange={(e) => setBnBadge(e.target.value)}
                />
              </label>
              <label>
                Heading
                <input
                  id="bn-head"
                  maxLength={60}
                  placeholder="e.g. Now accepting new patients"
                  value={bnHead}
                  onChange={(e) => setBnHead(e.target.value)}
                />
              </label>
              <label>
                Text
                <input
                  id="bn-text"
                  maxLength={140}
                  placeholder="One or two lines patients should know"
                  value={bnText}
                  onChange={(e) => setBnText(e.target.value)}
                />
              </label>
              <label>
                Button text
                <input
                  id="bn-cta"
                  maxLength={30}
                  placeholder="Book an appointment"
                  value={bnCta}
                  onChange={(e) => setBnCta(e.target.value)}
                />
              </label>
              <button className="btn" id="bn-save" onClick={handleSaveBanner}>
                Save &amp; activate banner
              </button>
              {bnMsg.text && (
                <p className={`fmsg ${bnMsg.ok ? 'ok' : 'bad'}`} role="status">
                  {bnMsg.text}
                </p>
              )}
            </div>

            <h3 style={{ marginTop: '24px', fontSize: '1.1rem' }}>Existing Banners</h3>
            <div id="bn-list" className="blist">
              {storeData.banners.length === 0 ? (
                <p className="aempty">
                  No saved banners. Create one above and it appears at the top of every public page.
                </p>
              ) : (
                storeData.banners
                  .slice()
                  .reverse()
                  .map((b) => (
                    <div className="bitem" key={b.id}>
                      <div>
                        <b>{b.heading}</b>
                        <br />
                        <small>
                          {b.badge || ''} &middot;{' '}
                          {b.active ? (
                            <span className="tag-on">ACTIVE</span>
                          ) : (
                            <span className="tag-off">inactive</span>
                          )}
                        </small>
                      </div>
                      <div>
                        <button
                          className="abtn gold"
                          onClick={() => handleToggleBanner(b.id)}
                        >
                          {b.active ? 'Deactivate' : 'Activate'}
                        </button>{' '}
                        <button
                          className="abtn red"
                          onClick={() => handleDeleteBanner(b.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Blog Posts */}
        {activeTab === 'posts' && (
          <div className="asec on">
            <h2>Blog posts (shown on the Blog page)</h2>
            <div className="aform">
              <label>
                Title
                <input
                  id="p-title"
                  maxLength={80}
                  placeholder="Title of clinic update or advice"
                  value={pTitle}
                  onChange={(e) => setPTitle(e.target.value)}
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  id="p-date"
                  value={pDate}
                  onChange={(e) => setPDate(e.target.value)}
                />
              </label>
              <label>
                Body
                <textarea
                  id="p-body"
                  rows={5}
                  maxLength={2000}
                  placeholder="Write clear, plain-language patient advice..."
                  value={pBody}
                  onChange={(e) => setPBody(e.target.value)}
                />
              </label>
              <button className="btn" id="p-save" onClick={handlePublishPost}>
                Publish post
              </button>
              {pMsg.text && (
                <p className={`fmsg ${pMsg.ok ? 'ok' : 'bad'}`} role="status">
                  {pMsg.text}
                </p>
              )}
            </div>

            <h3 style={{ marginTop: '24px', fontSize: '1.1rem' }}>Published Posts</h3>
            <div id="p-list" className="blist">
              {storeData.posts.length === 0 ? (
                <p className="aempty">No dynamic posts yet.</p>
              ) : (
                storeData.posts
                  .slice()
                  .reverse()
                  .map((p) => (
                    <div className="bitem" key={p.id}>
                      <div>
                        <b>{p.title}</b>
                        <br />
                        <small>{p.date || ''}</small>
                      </div>
                      <div>
                        <button
                          className="abtn red"
                          onClick={() => handleDeletePost(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Clinic Settings */}
        {activeTab === 'settings' && (
          <div className="asec on">
            <h2>Clinic settings</h2>
            <p className="fine" style={{ marginBottom: '12px' }}>
              These values update every public page immediately. Leave a field empty to keep the current value.
            </p>
            <div className="aform">
              <label>
                Phone (currently: {storeData.settings?.phone || '+91 95605 53331'})
                <input
                  id="s-phone"
                  placeholder="+91 95605 53331"
                  value={sPhone}
                  onChange={(e) => setSPhone(e.target.value)}
                />
              </label>
              <label>
                WhatsApp number (currently: {storeData.settings?.whatsapp || '919560553331'})
                <input
                  id="s-wal"
                  placeholder="919560553331"
                  value={sWal}
                  onChange={(e) => setSWal(e.target.value)}
                />
              </label>
              <label>
                Hours line (currently: {storeData.settings?.hours || 'Mon to Sat: 9:30 AM to 1:30 PM & 5:00 PM to 8:00 PM · Sunday closed'})
                <input
                  id="s-hours"
                  placeholder="Mon to Sat: 9:30 AM to 1:30 PM & 5:00 PM to 8:00 PM · Sunday closed"
                  value={sHours}
                  onChange={(e) => setSHours(e.target.value)}
                />
              </label>
              <label>
                Address (currently: {storeData.settings?.address || '2413 Basement, Hudson Lane...'})
                <input
                  id="s-addr"
                  maxLength={160}
                  placeholder="2413 Basement, Hudson Lane, Kingsway Camp, GTB Nagar, Delhi 110009"
                  value={sAddr}
                  onChange={(e) => setSAddr(e.target.value)}
                />
              </label>
              <button className="btn" id="s-save" onClick={handleSaveSettings}>
                Save settings
              </button>
              {sMsg.text && (
                <p className={`fmsg ${sMsg.ok ? 'ok' : 'bad'}`} role="status">
                  {sMsg.text}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: Security */}
        {activeTab === 'security' && (
          <div className="asec on">
            <h2>Security</h2>
            <p className="fine" style={{ marginBottom: '12px' }}>
              Changing the passcode stores a new hash in the clinic cloud store. The old passcode
              keeps working as a fallback until the next website update.
            </p>
            <div className="aform">
              <label>
                Current passcode
                <input
                  type="password"
                  id="sec-cur"
                  autoComplete="off"
                  value={secCur}
                  onChange={(e) => setSecCur(e.target.value)}
                />
              </label>
              <label>
                New passcode (6+ characters)
                <input
                  type="password"
                  id="sec-new"
                  autoComplete="new-password"
                  value={secNew}
                  onChange={(e) => setSecNew(e.target.value)}
                />
              </label>
              <label>
                Repeat new passcode
                <input
                  type="password"
                  id="sec-new2"
                  autoComplete="new-password"
                  value={secNew2}
                  onChange={(e) => setSecNew2(e.target.value)}
                />
              </label>
              <button className="btn" id="sec-save" onClick={handleChangePasscode}>
                Change passcode
              </button>
              {secMsg.text && (
                <p className={`fmsg ${secMsg.ok ? 'ok' : 'bad'}`} role="status">
                  {secMsg.text}
                </p>
              )}
            </div>
            <p className="fine" style={{ marginTop: '16px' }}>
              Sessions end automatically after 20 minutes. After 5 wrong passcode attempts, this device
              waits 10 minutes. Appointment data keeps a local backup copy on this device in case the
              cloud store is briefly unreachable.
            </p>
          </div>
        )}
      </div>

      {toast && <div className={`toast show ${toast.ok ? 'ok' : 'bad'}`}>{toast.text}</div>}
    </div>
  );
};
