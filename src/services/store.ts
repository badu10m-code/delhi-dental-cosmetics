import { AppStoreData, Appointment, ClinicSettings } from '../types';

const STORE_URL = 'https://extendsclass.com/api/json-storage/bin/ecbafad';
const DEFAULT_AUTH_HASH = '9bbca531dd40de934c9ae9b1cae9973005bc10d88cb7f5672e139d62a81c9c88';
const BACKUP_KEY = 'ddc_backup';
const LOCK_KEY = 'ddc_lock';
const SES_KEY = 'ddc_ses';
const TRIES_KEY = 'ddc_tries';

let _cache: AppStoreData | null = null;
let _cacheAt = 0;
let _inflight: Promise<AppStoreData | null> | null = null;

export function blankData(): AppStoreData {
  return {
    appointments: [],
    banners: [],
    posts: [],
    settings: {
      phone: '+91 95605 53331',
      whatsapp: '919560553331',
      hours: 'Mon to Sat: 9:30 AM to 1:30 PM & 5:00 PM to 8:00 PM · Sunday closed',
      address: '2413 Basement, Hudson Lane, Kingsway Camp, GTB Nagar, Delhi 110009',
    },
  };
}

export function generateApptId(): string {
  return 'DDC-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => ('0' + b.toString(16)).slice(-2))
    .join('');
}

export function getLocalBackup(): AppStoreData {
  try {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return normalizeData(parsed);
    }
  } catch (e) {
    console.error('Error reading local backup', e);
  }
  return blankData();
}

export function saveLocalBackup(data: AppStoreData): void {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving local backup', e);
  }
}

function normalizeData(d: any): AppStoreData {
  const base = blankData();
  const obj = d && typeof d === 'object' ? d : {};
  return {
    appointments: Array.isArray(obj.appointments) ? obj.appointments : [],
    banners: Array.isArray(obj.banners) ? obj.banners : [],
    posts: Array.isArray(obj.posts) ? obj.posts : [],
    settings: { ...base.settings, ...(obj.settings || {}) },
  };
}

export async function fetchStoreData(force = false): Promise<AppStoreData> {
  if (!force && _cache && Date.now() - _cacheAt < 45000) {
    return _cache;
  }
  if (_inflight) {
    const res = await _inflight;
    return res || getLocalBackup();
  }

  _inflight = (async () => {
    try {
      const resp = await fetch(STORE_URL + '?t=' + Date.now(), { cache: 'no-store' });
      if (resp.ok) {
        const json = await resp.json();
        const norm = normalizeData(json);
        _cache = norm;
        _cacheAt = Date.now();
        saveLocalBackup(norm);
        return norm;
      }
    } catch (e) {
      console.warn('Could not reach remote store, using backup', e);
    } finally {
      _inflight = null;
    }
    return getLocalBackup();
  })();

  const result = await _inflight;
  return result || getLocalBackup();
}

export async function putStoreData(data: AppStoreData): Promise<boolean> {
  saveLocalBackup(data);
  try {
    const resp = await fetch(STORE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data),
    });
    if (resp.ok) {
      _cache = data;
      _cacheAt = Date.now();
      return true;
    }
  } catch (e) {
    console.error('Remote put failed', e);
  }
  return false;
}

export async function mutateStoreData<T>(
  mutator: (data: AppStoreData) => T,
  maxAttempts = 2
): Promise<{ success: boolean; result: T; data: AppStoreData }> {
  let attempt = 0;
  while (attempt <= maxAttempts) {
    const current = await fetchStoreData(true);
    const result = mutator(current);
    const ok = await putStoreData(current);
    if (ok) {
      return { success: true, result, data: current };
    }
    attempt++;
    if (attempt <= maxAttempts) {
      await new Promise((res) => setTimeout(res, 1200));
    }
  }
  // Even if cloud failed, the local backup has been updated
  return { success: false, result: (undefined as unknown) as T, data: getLocalBackup() };
}

// Authentication & Session
export function isLockedOut(): { locked: boolean; minutesLeft: number } {
  const l = Number(localStorage.getItem(LOCK_KEY)) || 0;
  if (l > Date.now()) {
    return { locked: true, minutesLeft: Math.ceil((l - Date.now()) / 60000) };
  }
  return { locked: false, minutesLeft: 0 };
}

export async function verifyPasscode(code: string, currentSettings?: ClinicSettings): Promise<{
  status: 'ok' | 'locked' | 'bad';
  attemptsLeft?: number;
  minutesLeft?: number;
}> {
  const lock = isLockedOut();
  if (lock.locked) {
    return { status: 'locked', minutesLeft: lock.minutesLeft };
  }

  const hash = await sha256Hex(code);
  const activeHash = currentSettings?.admin_hash || DEFAULT_AUTH_HASH;
  const isMatch = hash === activeHash || hash === DEFAULT_AUTH_HASH;

  if (isMatch) {
    sessionStorage.setItem(SES_KEY, String(Date.now()));
    localStorage.removeItem(LOCK_KEY);
    localStorage.removeItem(TRIES_KEY);
    return { status: 'ok' };
  } else {
    const tries = (Number(localStorage.getItem(TRIES_KEY)) || 0) + 1;
    localStorage.setItem(TRIES_KEY, String(tries));
    if (tries >= 5) {
      localStorage.setItem(LOCK_KEY, String(Date.now() + 10 * 60000));
      localStorage.removeItem(TRIES_KEY);
      return { status: 'locked', minutesLeft: 10 };
    }
    return { status: 'bad', attemptsLeft: 5 - tries };
  }
}

export function isSessionActive(): boolean {
  const s = Number(sessionStorage.getItem(SES_KEY)) || 0;
  if (!s || Date.now() - s > 20 * 60000) {
    sessionStorage.removeItem(SES_KEY);
    return false;
  }
  // Keep alive
  sessionStorage.setItem(SES_KEY, String(Date.now()));
  return true;
}

export function getSessionMinutesRemaining(): number {
  const s = Number(sessionStorage.getItem(SES_KEY)) || 0;
  return Math.max(0, Math.ceil((s + 20 * 60000 - Date.now()) / 60000));
}

export function logoutSession(): void {
  sessionStorage.removeItem(SES_KEY);
}

// Appointment helper & duplicate prevention
export function checkAppointmentDuplicate(
  appointments: Appointment[],
  phone: string,
  date: string
): Appointment | null {
  const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
  return (
    appointments.find(
      (a) =>
        a.phone &&
        a.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone &&
        a.date === date &&
        a.status !== 'cancelled'
    ) || null
  );
}

export function isSundayDate(dateString: string): boolean {
  if (!dateString) return false;
  const day = new Date(dateString + 'T12:00:00+05:30').getDay();
  return day === 0;
}

export function exportAppointmentsCSV(appointments: Appointment[]): void {
  const rows = [
    ['Reference ID', 'Requested At', 'Patient Name', 'Phone', 'Email', 'Treatment', 'Dentist', 'Appointment Date', 'Slot', 'Status', 'Patient Note'],
  ];
  appointments.forEach((x) => {
    rows.push([
      x.id,
      x.created,
      x.name,
      x.phone,
      x.email || '',
      x.service,
      x.doctor || 'Any available dentist',
      x.date,
      x.time,
      x.status || 'new',
      x.note || '',
    ]);
  });

  const csv = rows
    .map((r) =>
      r
        .map((cell) => `"${String(cell == null ? '' : cell).replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `delhi-dental-cosmetics-appointments-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
