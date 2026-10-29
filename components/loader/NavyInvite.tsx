'use client';

import React from 'react';
import Image from 'next/image';
import { Amiri, Cinzel } from 'next/font/google';
import localFont from 'next/font/local';
import { NavyMarquee } from '@/components/loader/navy-marquee';
import { InfinityLoader } from '@/components/loader/InfinityLoader';
import './navy-invite.css';

// Same type system as the hero (components/sections/hero.tsx):
// Cinzel small caps · The Seasons display · Above the Beyond script · Sorts Mill Goudy italic (global @font-face)
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--nv-font-cinzel',
});

const theSeasons = localFont({
  src: '../../Font/Fontspring-DEMO-theseasons-reg.otf',
  display: 'swap',
  variable: '--nv-font-seasons',
});

// Arabic calligraphy for the Bismillah
const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
});

const aboveTheBeyond = localFont({
  src: '../../Font/above-the-beyond-script.otf',
  display: 'swap',
  variable: '--nv-font-script',
});

export interface NavyInviteConfig {
  decos: { topLeft: string; topRight: string; bottomLeft: string; bottomRight: string };
  curtains?: boolean;
  backgroundMarquee?: boolean;
  linesAbove: string[];
  joiner: string;
  timeInWords: boolean;
  verse: string;
  verseCitation: string;
  /** Arabic line at the very top of the card ("" hides it) */
  bismillah?: string;
  /** Translation under the Arabic line ("" hides it) */
  bismillahTranslation?: string;
  /** "top" = verse above the names; "belowNames" = verse between the names and the details */
  versePosition?: 'top' | 'belowNames';
  /** "block" = big Month · Day · Year with time and venue below; "line" = venue, then "Month D, YYYY | time" */
  dateStyle?: 'block' | 'line';
  /** "navy" = light text straight on the dark sky; "arch" = ivory arched panel over the background image */
  cardStyle?: 'navy' | 'arch';
}

interface NavyInviteProps {
  invite: NavyInviteConfig;
  groom: string;
  bride: string;
  weddingDate: Date | null;
  ceremonyTime: string;
  venueName: string;
  venueAddress: string;
  statusMessage?: string;
  statusKey: number;
  reduceMotion: boolean;
  /** Background marquee photos (already URL-encoded); empty = plain navy sky */
  photos?: readonly string[];
}

// Curtain opening, played before the card (skipped when invite.curtains is false)
const CURTAIN = {
  // A light leak glows through the seam first, then the folds are drawn to the wings
  open: 550,
  // Everything on the card is scheduled from this point (drapes are mostly open)
  stage: 1700,
};

// Card choreography (ms after the stage opens) — CSS-delay driven so it plays in sync before hydration:
// florals settle in → verse → invitation lines → names rise letter by letter → divider → date → time & venue → countdown
const T = {
  florals: 0,
  floralStagger: 160,
  frame: 300,
  bismillah: 350,
  verse: 500,
  lines: 650,
  lineStagger: 200,
  groom: 1300,
  letterStagger: 80,
  joiner: 2000,
  bride: 2350,
  divider: 3400,
  date: 3650,
  time: 4450,
  venue: 4750,
  status: 5600,
};

// Arch card choreography (ms from mount). The panel already stands behind the closed curtains,
// so the opening drapes reveal it; the header is in place as they part, then the names are written in.
const A = {
  panel: 0,
  bismillah: 150,
  translation: 300,
  title: 450,
  groom: 1500,
  joiner: 2050,
  bride: 2350,
  verse: 3200,
  venue: 3700,
  date: 4000,
};

// Folds per drape. Index 0 hangs at the wall; the last fold is the leading edge at the centre seam.
const CURTAIN_FOLDS = 8;

const NUMBER_WORDS = [
  'twelve', 'one', 'two', 'three', 'four', 'five',
  'six', 'seven', 'eight', 'nine', 'ten', 'eleven',
];

// "2:00 PM" → "At two o'clock in the afternoon"; unparseable input is returned as-is
function timeToWords(time: string) {
  const m = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp])\.?[Mm]\.?$/);
  if (!m) return time;
  const hour12 = Number(m[1]) % 12;
  const minutes = Number(m[2] ?? 0);
  const pm = m[3].toLowerCase() === 'p';
  const hour24 = hour12 + (pm ? 12 : 0);
  if (hour24 === 12 && minutes === 0) return 'At twelve noon';
  const period = hour24 < 12 ? 'in the morning' : hour24 < 17 ? 'in the afternoon' : 'in the evening';
  const hourWord = NUMBER_WORDS[hour12];
  const clock =
    minutes === 0
      ? `${hourWord} o'clock`
      : minutes === 30
        ? `half past ${hourWord}`
        : `${hourWord} ${m[2]}`;
  return `At ${clock} ${period}`;
}

// Blush dust drifting up through the navy sky
const SPARKLES = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 41 + 7) % 100,
  size: 2 + ((i * 7) % 4),
  dur: 11 + ((i * 5) % 9),
  delay: -((i * 2.7) % 16),
  drift: (i % 2 === 0 ? 1 : -1) * (10 + ((i * 13) % 26)),
}));

// One name as individually animated letters: each rises into place, then a slow light wave runs across them
function NameLetters({ name, start, at }: { name: string; start: number; at: (ms: number) => React.CSSProperties }) {
  const letters = Array.from(name);
  return (
    <span className={`${theSeasons.className} nv-names__name`} aria-hidden="true">
      {letters.map((ch, i) => (
        <span
          key={i}
          className="nv-letter"
          style={
            {
              ...at(start + i * T.letterStagger),
              '--i': i,
              '--n': letters.length,
            } as React.CSSProperties
          }
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

export function NavyInvite({
  invite,
  groom,
  bride,
  weddingDate,
  ceremonyTime,
  venueName,
  venueAddress,
  statusMessage,
  statusKey,
  reduceMotion,
  photos = [],
}: NavyInviteProps) {
  const curtains = invite.curtains !== false;
  const arch = invite.cardStyle === 'arch';
  // The arch card is revealed by the curtains rather than played in after them
  const stage = curtains && !arch ? CURTAIN.stage : 0;
  const at = (ms: number) => ({ '--nv-d': `${stage + ms}ms` }) as React.CSSProperties;

  const date = weddingDate
    ? {
        month: weddingDate.toLocaleString('en-US', { month: 'long' }),
        day: String(weddingDate.getDate()).padStart(2, '0'),
        year: String(weddingDate.getFullYear()),
        label: weddingDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      }
    : null;
  const timeLine = ceremonyTime && invite.timeInWords ? timeToWords(ceremonyTime) : ceremonyTime;
  const lines = invite.linesAbove.filter(Boolean);
  const verseBelow = invite.versePosition === 'belowNames';
  const dateLine = invite.dateStyle === 'line';
  // Verse below the names plays where the divider used to; the divider follows it
  const dividerAt = verseBelow ? T.divider + 500 : T.divider;
  const verse = (position: 'top' | 'below', delay: number) =>
    invite.verse ? (
      <figure className={`nv-verse nv-verse--${position} nv-in`} style={at(delay)}>
        {position === 'top' && invite.verseCitation && (
          <figcaption className="nv-verse__cite">{invite.verseCitation}</figcaption>
        )}
        <blockquote className="nv-verse__text">“{invite.verse}”</blockquote>
        {position === 'below' && invite.verseCitation && (
          <figcaption className="nv-verse__cite">{invite.verseCitation}</figcaption>
        )}
      </figure>
    ) : null;

  const archCard = (
    <main className="nv-card nv-card--arch">
      <div className="nv-arch" style={at(A.panel)}>
        {/* Sun rising in the dome (clipped to the panel) */}
        <span className="nv-arch__sky" aria-hidden="true">
          <span className="nv-arch__sun" />
        </span>
        {/* Light with a fading tail that travels around the outside edge */}
        <span className="nv-arch__orbit" aria-hidden="true" />

        {/* Content is grouped so the groups can spread evenly down the tall panel */}
        {(invite.bismillah || invite.bismillahTranslation) && (
          <header className="nv-arch__group nv-arch__group--top">
            {invite.bismillah && (
              <p className={`${amiri.className} nv-arch__arabic nv-in`} style={at(A.bismillah)} lang="ar" dir="rtl">
                {invite.bismillah}
              </p>
            )}
            {invite.bismillahTranslation && (
              <p className="nv-arch__translation nv-in" style={at(A.translation)}>
                “{invite.bismillahTranslation}”
              </p>
            )}
          </header>
        )}

        <div className="nv-arch__group nv-arch__group--names">
          {lines.map((line, i) => (
            <p key={i} className={`${theSeasons.className} nv-arch__title nv-in`} style={at(A.title + i * T.lineStagger)}>
              {line}
            </p>
          ))}

          <h1 className="nv-arch__names" aria-label={`${groom} ${invite.joiner} ${bride}`}>
            <span className={`${aboveTheBeyond.className} nv-arch__name nv-pen-in`} style={at(A.groom)} aria-hidden="true">
              {groom}
            </span>
            {invite.joiner && (
              // "and" on its own row, centred between the names
              <span className={`${aboveTheBeyond.className} nv-arch__joiner nv-pen-in`} style={at(A.joiner)} aria-hidden="true">
                {invite.joiner}
              </span>
            )}
            <span className={`${aboveTheBeyond.className} nv-arch__name nv-pen-in`} style={at(A.bride)} aria-hidden="true">
              {bride}
            </span>
          </h1>
        </div>

        {invite.verse && (
          <figure className="nv-arch__group nv-arch__verse nv-in" style={at(A.verse)}>
            <blockquote className="nv-arch__verse-text">“{invite.verse}”</blockquote>
            {invite.verseCitation && <figcaption className="nv-arch__verse-cite">{invite.verseCitation}</figcaption>}
          </figure>
        )}

        {(venueName || date) && (
          <div className="nv-arch__group nv-arch__group--details">
            {/* Gold hairline with a gem, setting the details apart */}
            <span className="nv-arch__rule nv-in" style={at(A.venue - 200)} aria-hidden="true" />
            <ul className="nv-arch__details">
              {venueName && (
                <li className="nv-arch__detail nv-in" style={at(A.venue)}>
                  <svg className="nv-arch__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
                    <circle cx="12" cy="10" r="2.4" />
                  </svg>
                  <span>{venueName}</span>
                </li>
              )}
              {date && (
                <li className="nv-arch__detail nv-in" style={at(A.date)}>
                  <svg className="nv-arch__icon" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
                    <path d="M3.5 9.5h17M8 3v4M16 3v4M8 13.5h2M14 13.5h2M8 17h2M14 17h2" />
                  </svg>
                  <span>
                    {date.label}
                    {ceremonyTime && (
                      <>
                        <span className="nv-arch__sep" aria-hidden="true">|</span>
                        {ceremonyTime}
                      </>
                    )}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </main>
  );

  return (
    <div
      className={`nv-root${arch ? ' nv-root--arch' : ''} ${cinzel.variable} ${theSeasons.variable} ${aboveTheBeyond.variable}${curtains ? ' has-curtains' : ''}${photos.length ? ' has-marquee' : ''}`}
    >
      <NavyMarquee photos={photos} reduceMotion={reduceMotion} />

      <div className="nv-sky" aria-hidden="true">
        <div className="nv-sky__stars" />
        <div className="nv-sky__stars nv-sky__stars--slow" />
        <div className="nv-sky__spot" style={at(-700)} />
      </div>

      {!reduceMotion && (
        <div className="nv-dust" aria-hidden="true">
          {SPARKLES.map((s, i) => (
            <span
              key={i}
              className="nv-dust__mote"
              style={
                {
                  '--x': `${s.x}%`,
                  '--size': `${s.size}px`,
                  '--dur': `${s.dur}s`,
                  '--delay': `${s.delay}s`,
                  '--drift': `${s.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {curtains && (
        <div className="nv-curtains" aria-hidden="true" style={{ '--nv-d': `${CURTAIN.open}ms` } as React.CSSProperties}>
          {(['left', 'right'] as const).map((side) => (
            <div key={side} className={`nv-curtain nv-curtain--${side}`}>
              {Array.from({ length: CURTAIN_FOLDS }, (_, i) => (
                <span
                  key={i}
                  className="nv-curtain__fold"
                  style={
                    {
                      '--i': i,
                      // Folds nearest the seam are pulled first; the rest follow like real fabric
                      '--inner': CURTAIN_FOLDS - 1 - i,
                    } as React.CSSProperties
                  }
                />
              ))}
            </div>
          ))}
          <span className="nv-seam" />
        </div>
      )}

      <div className="nv-frame" style={at(T.frame)} aria-hidden="true" />

      <div className="nv-corners" aria-hidden="true">
        {(
          [
            ['tl', invite.decos.topLeft, 650, 547],
            ['tr', invite.decos.topRight, 646, 547],
            ['bl', invite.decos.bottomLeft, 750, 528],
            ['br', invite.decos.bottomRight, 745, 530],
          ] as const
        ).map(([pos, src, w, h], i) =>
          src ? (
            <div key={pos} className={`nv-corner nv-corner--${pos}`} style={at(T.florals + i * T.floralStagger)}>
              <div className="nv-corner__bloom">
                <Image src={src} alt="" width={w} height={h} priority className="nv-corner__img" />
              </div>
            </div>
          ) : null,
        )}
      </div>

      {arch ? archCard : (
      <main className="nv-card">
        {(invite.bismillah || invite.bismillahTranslation) && (
          <div className="nv-bismillah nv-in" style={at(T.bismillah)}>
            {invite.bismillah && (
              <p className={`${amiri.className} nv-bismillah__arabic`} lang="ar" dir="rtl">
                {invite.bismillah}
              </p>
            )}
            {invite.bismillahTranslation && (
              <p className="nv-bismillah__translation">“{invite.bismillahTranslation}”</p>
            )}
          </div>
        )}

        {!verseBelow && verse('top', T.verse)}

        {lines.length > 0 && (
          <div className="nv-lines">
            {lines.map((line, i) => (
              <p key={i} className="nv-line nv-track-in" style={at(T.lines + i * T.lineStagger)}>
                {line}
              </p>
            ))}
          </div>
        )}

        <h1 className="nv-names" aria-label={`${groom} ${invite.joiner} ${bride}`}>
          <NameLetters name={groom} start={T.groom} at={at} />
          {invite.joiner && (
            // "and" sits on its own row, with rose-gold hairlines drawing out to either side once it is written
            <span className="nv-names__joiner-row" style={at(T.joiner)} aria-hidden="true">
              <span className="nv-names__flourish nv-names__flourish--left" />
              <span className={`${aboveTheBeyond.className} nv-names__joiner`}>{invite.joiner}</span>
              <span className="nv-names__flourish nv-names__flourish--right" />
            </span>
          )}
          <NameLetters name={bride} start={T.bride} at={at} />
        </h1>

        {verseBelow && verse('below', T.divider)}

        <div className="nv-divider" style={at(dividerAt)} aria-hidden="true">
          <span className="nv-divider__line" />
          <span className="nv-divider__gem" />
          <span className="nv-divider__line" />
        </div>

        {dateLine && (venueName || date) && (
          <div className="nv-details">
            {venueName && (
              <p className="nv-venue__name nv-wipe" style={at(T.date)}>
                {venueName}
              </p>
            )}
            {date && (
              <p className="nv-time nv-wipe" style={at(T.time)}>
                {[date.label, ceremonyTime].filter(Boolean).join('  |  ')}
              </p>
            )}
          </div>
        )}

        {!dateLine && date && (
          <div className="nv-date" role="img" aria-label={date.label}>
            <div className="nv-date__row">
              <span className="nv-date__side nv-date__side--month" style={at(T.date + 350)}>
                {date.month}
              </span>
              <span className="nv-date__rule" style={at(T.date + 150)} />
              <span className={`${theSeasons.className} nv-date__day`}>
                {Array.from(date.day).map((digit, i) => (
                  <span key={i} className="nv-date__digit">
                    <span className="nv-date__digit-inner" style={at(T.date + 150 + i * 150)}>
                      {digit}
                    </span>
                  </span>
                ))}
              </span>
              <span className="nv-date__rule" style={at(T.date + 150)} />
              <span className="nv-date__side nv-date__side--year" style={at(T.date + 350)}>
                {date.year}
              </span>
            </div>
          </div>
        )}

        {!dateLine && timeLine && (
          <p className="nv-time nv-wipe" style={at(T.time)}>
            {timeLine}
          </p>
        )}

        {!dateLine && (venueName || venueAddress) && (
          <div className="nv-venue" style={at(T.venue)}>
            {venueName && <p className="nv-venue__name nv-wipe">{venueName}</p>}
            {venueAddress && (
              <p className="nv-venue__address nv-in" style={at(T.venue + 300)}>
                {venueAddress}
              </p>
            )}
          </div>
        )}

      </main>
      )}

      {/* Loading progress, anchored to the bottom of the screen below the card */}
      <div className="nv-status nv-in" style={at(T.status)}>
        <InfinityLoader className="nv-loader" label="Loading invitation" />
        {statusMessage && (
          <p key={statusKey} className="nv-status__message">
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}
