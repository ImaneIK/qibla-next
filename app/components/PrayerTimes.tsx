import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface PrayerTime {
  name: string;
  time: string;
  arabicName: string;
  icon: string;
}

interface PrayerTimesProps {
  latitude: number;
  longitude: number;
  t: any; // Translations object
}

/**
 * Calculate Islamic prayer times using standard astronomical methods.
 * Based on ISNA (Islamic Society of North America) method.
 */
function calculatePrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): Record<string, string> {
  const J2000 = 2451545.0;
  const JD =
    Math.floor(date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440 - 0.5) + 2440588;

  const T = (JD - J2000) / 36525;
  const L0 = (280.46646 + T * (36000.76983 + T * 0.0003032)) % 360;
  const M = (357.52911 + T * (35999.05029 - T * 0.0001536)) % 360;
  const M_rad = (M * Math.PI) / 180;

  const C =
    (1.914602 - T * (0.004817 + T * 0.000014)) * Math.sin(M_rad) +
    (0.019993 - T * 0.000101) * Math.sin(2 * M_rad) +
    0.000029 * Math.sin(3 * M_rad);

  const SunLong = (L0 + C) % 360;
  const SunLong_rad = (SunLong * Math.PI) / 180;

  const lat_rad = (latitude * Math.PI) / 180;
  const decl = Math.asin(Math.sin(SunLong_rad) * Math.sin((23.439 * Math.PI) / 180));

  const sunrise = calculateSunTime(JD, latitude, longitude, true);
  const sunset = calculateSunTime(JD, latitude, longitude, false);
  const noon = 12 - longitude / 15;

  const fajrAngle = -18;
  const ishaAngle = -18;
  const asrFactor = 1;

  const fajr = calculatePrayerTime(JD, latitude, longitude, fajrAngle, true);
  const dhuhr = noon;
  const asr = calculateAsrTime(JD, latitude, longitude);
  const maghrib = sunset;
  const isha = calculatePrayerTime(JD, latitude, longitude, ishaAngle, false);

  return {
    fajr: formatTime(fajr),
    dhuhr: formatTime(dhuhr),
    asr: formatTime(asr),
    maghrib: formatTime(maghrib),
    isha: formatTime(isha),
  };
}

function calculateSunTime(JD: number, lat: number, lon: number, isSunrise: boolean): number {
  const lat_rad = (lat * Math.PI) / 180;
  const h = isSunrise ? -0.833 : -0.833;
  const h_rad = (h * Math.PI) / 180;

  const cosH = -Math.tan(lat_rad) * Math.tan((23.439 * Math.PI) / 180);
  const H = Math.acos(Math.max(-1, Math.min(1, cosH)));

  return 12 + (isSunrise ? -H : H) / (Math.PI * 2) * 24 - lon / 15;
}

function calculatePrayerTime(JD: number, lat: number, lon: number, angle: number, isMorning: boolean): number {
  const decl = 23.439;
  const lat_rad = (lat * Math.PI) / 180;
  const angle_rad = (angle * Math.PI) / 180;
  const decl_rad = (decl * Math.PI) / 180;

  const cosH = Math.tan(angle_rad) / Math.tan(lat_rad);
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / (Math.PI * 2) * 24;

  return 12 + (isMorning ? -H : H) - lon / 15;
}

function calculateAsrTime(JD: number, lat: number, lon: number): number {
  const lat_rad = (lat * Math.PI) / 180;
  const decl_rad = (23.439 * Math.PI) / 180;

  const shadowRatio = 1;
  const angleRad = Math.atan(1 / (shadowRatio + Math.tan(Math.abs(lat_rad - decl_rad))));

  const cosH = Math.tan(angleRad) / Math.tan(lat_rad);
  const H = Math.acos(Math.max(-1, Math.min(1, cosH))) / (Math.PI * 2) * 24;

  return 12 + H - lon / 15;
}

function formatTime(decimalTime: number): string {
  let hours = Math.floor(decimalTime);
  let minutes = Math.floor((decimalTime - hours) * 60);

  // Handle timezone offset
  hours = (hours + 24) % 24;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export default function PrayerTimes({ latitude, longitude, t }: PrayerTimesProps) {
  const [prayerTimes, setPrayerTimes] = useState<Record<string, string> | null>(null);
  const [nextPrayer, setNextPrayer] = useState<string>('');

  useEffect(() => {
    const times = calculatePrayerTimes(latitude, longitude);
    setPrayerTimes(times);

    // Find next prayer
    const now = new Date();
    const currentTime = now.getHours() + now.getMinutes() / 60;

    const prayers = [
      { key: 'fajr', time: times.fajr },
      { key: 'dhuhr', time: times.dhuhr },
      { key: 'asr', time: times.asr },
      { key: 'maghrib', time: times.maghrib },
      { key: 'isha', time: times.isha },
    ];

    const next = prayers.find((p) => {
      const [h, m] = p.time.split(':').map(Number);
      return h + m / 60 > currentTime;
    }) || prayers[0];

    setNextPrayer(next.key);
  }, [latitude, longitude]);

  if (!prayerTimes) return null;

  const prayerList: PrayerTime[] = [
    { name: 'Fajr', arabicName: 'الفجر', time: prayerTimes.fajr, icon: '🌙' },
    { name: 'Dhuhr', arabicName: 'الظهر', time: prayerTimes.dhuhr, icon: '☀️' },
    { name: 'Asr', arabicName: 'العصر', time: prayerTimes.asr, icon: '🌤️' },
    { name: 'Maghrib', arabicName: 'المغرب', time: prayerTimes.maghrib, icon: '🌅' },
    { name: 'Isha', arabicName: 'العشاء', time: prayerTimes.isha, icon: '⭐' },
  ];

  return (
    <div className="w-full max-w-[420px] animate-fade-up" style={{ animationDelay: '0.4s' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-lg font-semibold text-foreground">{t.Prayer_Times}</h2>
      </div>

      {/* Prayer times grid */}
      <div className="glass-strong rounded-2xl p-4 space-y-3">
        {prayerList.map((prayer) => (
          <div
            key={prayer.name}
            className={`flex items-center justify-between p-3 rounded-lg transition-all ${
              nextPrayer === prayer.name.toLowerCase()
                ? 'bg-primary/20 border border-primary/50'
                : 'bg-muted/50 hover:bg-muted/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{prayer.icon}</span>
              <div>
                <div className="font-semibold text-foreground text-sm">{prayer.name}</div>
                <div className="text-xs text-muted-foreground">{prayer.arabicName}</div>
              </div>
            </div>
            <div className="text-lg font-mono font-bold text-primary">{prayer.time}</div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="mt-3 text-xs text-muted-foreground/70 text-center">
        {t.Times_calculated} • {t.Updates_daily}
      </div>
    </div>
  );
}