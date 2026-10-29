'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import localFont from 'next/font/local';
import { Amiri, Cinzel } from 'next/font/google';
import {
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from 'motion/react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { useScreenScrollLock } from '@/hooks/use-screen-scroll-lock';
import { siteConfig as defaultSiteConfig } from '@/content/site';
import { parseWeddingDate } from '@/lib/wedding-date';
import { InviteParticles } from '@/components/loader/InviteParticles';
import { InvitePhotoBackdrop } from '@/components/loader/invite-photo-backdrop';
import { BackgroundVideo } from '@/components/background-video';
import { NavyMarquee } from '@/components/loader/navy-marquee';
import { TintedDeco } from '@/components/tinted-deco';
import './envelope-invite.css';

const theSeasons = localFont({
  src: '../../Font/Fontspring-DEMO-theseasons-reg.otf',
  display: 'swap',
});

// Arabic calligraphy for the Bismillah on the card (same face as the loader)
const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600'],
});

const aboveTheBeyond = localFont({
  src: '../../Font/above-the-beyond-script.otf',
  display: 'swap',
});

interface HeroProps {
  onOpen: () => void;
  onTransitionStart?: () => void;
  visible: boolean;
  enterFromLoading?: boolean;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Short joining words in the headline ("Save the Date") are set in script — matches the loading screen
const SCRIPT_WORDS = new Set(['the', 'of', 'and', '&', 'a']);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

const photoInteractEase: Transition = { duration: 0.38, ease: [0.22, 1, 0.36, 1] };
const focusLiftEase: Transition = { duration: 1.15, ease: [0.22, 1, 0.36, 1] };
const revealEntryEase: Transition = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };
const buttonEntryEase: Transition = { duration: 0.95, ease: [0.16, 1, 0.3, 1] };

type PhotoSide = 'left' | 'center' | 'right' | 'right-inner';

type EnvelopePhase =
  | 'idle'
  | 'seal-press'
  | 'seal-break'
  | 'flap-open'
  | 'rising'
  | 'photos'
  | 'revealed'
  | 'cta';

function getFocusLiftPhase(phase: EnvelopePhase): 'idle' | 'opening' | 'photos' | 'revealed' | 'cta' {
  if (phase === 'idle') return 'idle';
  if (
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open' ||
    phase === 'rising'
  ) {
    return 'opening';
  }
  if (phase === 'photos') return 'photos';
  if (phase === 'revealed') return 'revealed';
  return 'cta';
}

const photoEmergenceEase: Transition = { duration: 2.35, ease: [0.22, 1, 0.18, 1] };
const letterEmergenceEase: Transition = { duration: 2.6, ease: [0.33, 0, 0.15, 1] };
const letterSettleEase: Transition = { duration: 0.9, ease: [0.22, 1, 0.36, 1] };
const flapEase: Transition = { duration: 1.1, ease: [0.65, 0, 0.35, 1] };
const inviteExitEase: Transition = { duration: 1.65, ease: [0.22, 1, 0.36, 1], delay: 0.75 };
const inviteEnterEase: Transition = { duration: 1.2, ease: [0.22, 1, 0.36, 1] };
const letterExitEase: Transition = { duration: 1.55, ease: [0.16, 1, 0.3, 1] };
const inviteRevealLeadMs = 460;
const INVITE_EXIT_MS = 2500;

export const Hero: React.FC<HeroProps> = ({
  onOpen,
  onTransitionStart,
  visible,
  enterFromLoading = false,
}) => {
  const siteConfig = useSiteConfig();
  const content = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen;
  const isPlain = content.display === 'plain';
  const plainTheme = content.plainTheme ?? defaultSiteConfig.loadingScreen.plainTheme;
  const cornerDecos = content.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos;
  const plainInvite = content.plainInvite ?? defaultSiteConfig.loadingScreen.plainInvite;
  // Navy loader: keep its full-color corner florals in the exact same spot, so they hold still through the hand-off
  const isNavy = isPlain && (content.plainLayout ?? defaultSiteConfig.loadingScreen.plainLayout) === 'navy';
  const navyInvite = content.navyInvite ?? defaultSiteConfig.loadingScreen.navyInvite;
  const navyDecos = isNavy ? navyInvite.decos : null;
  // Arch loader: the envelope sits on the same (softly blurred) background picture
  const isArch = isNavy && navyInvite.cardStyle === 'arch';
  const archBackground = isArch
    ? content.backgroundImage ?? defaultSiteConfig.loadingScreen.backgroundImage
    : '';
  const reduceMotion = useReducedMotion();
  const openedRef = useRef(false);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<EnvelopePhase>('idle');
  const [liveMessage, setLiveMessage] = useState('');
  const [liftedPhoto, setLiftedPhoto] = useState<PhotoSide | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const groomName = siteConfig.couple.groomNickname;
  const brideName = siteConfig.couple.brideNickname;
  const coupleNames = `${groomName} & ${brideName}`;

  const letterDateNumeric = useMemo(() => {
    const parsed = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date);
    const wedding = new Date(`${parsed.month} ${parsed.day}, ${parsed.year}`);
    if (Number.isNaN(wedding.getTime())) {
      const monthDate = new Date(`${parsed.month} 1, ${parsed.year}`);
      const month = Number.isNaN(monthDate.getTime())
        ? '00'
        : String(monthDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsed.day).padStart(2, '0');
      const year = String(parsed.year).slice(-2);
      return `${month} | ${day} | ${year}`;
    }
    const month = String(wedding.getMonth() + 1).padStart(2, '0');
    const day = String(wedding.getDate()).padStart(2, '0');
    const year = String(wedding.getFullYear()).slice(-2);
    return `${month} | ${day} | ${year}`;
  }, [siteConfig.ceremony.date, siteConfig.wedding.date]);

  // Card inside the envelope: "JAN | 23 | 2027"
  const letterDate = useMemo(() => {
    const parsed = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date);
    const wedding = new Date(`${parsed.month} ${parsed.day}, ${parsed.year}`);
    if (Number.isNaN(wedding.getTime())) {
      return `${String(parsed.month).slice(0, 3).toUpperCase()} | ${String(parsed.day).padStart(2, '0')} | ${parsed.year}`;
    }
    const month = wedding.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = String(wedding.getDate()).padStart(2, '0');
    return `${month} | ${day} | ${wedding.getFullYear()}`;
  }, [siteConfig.ceremony.date, siteConfig.wedding.date]);

  // Nikkah card: "SUNDAY · DEC 13 · 2026", then time and venue
  const nikkahDate = useMemo(() => {
    const parsed = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date);
    return {
      weekday: parsed.dayOfWeek,
      line: `${String(parsed.month).slice(0, 3)} ${String(parsed.day).padStart(2, '0')} ${parsed.year}`,
    };
  }, [siteConfig.ceremony.date, siteConfig.wedding.date]);
  const ceremonyTime = siteConfig.ceremony.time ?? siteConfig.wedding.time;
  const ceremonyVenue = siteConfig.ceremony.location || siteConfig.wedding.venue;

  const weddingDateGhost = useMemo(() => {
    const [month, day, year] = letterDateNumeric.split(' | ');
    return { month, day, year };
  }, [letterDateNumeric]);

  const backgroundPhotos = useMemo(
    () => (content.backgroundPhotos ?? []).map((src) => encodeURI(src)),
    [content.backgroundPhotos],
  );
  const showPhotoBackdrop = !isPlain && backgroundPhotos.length > 0;
  // Navy loader's photo marquee carries on behind the envelope (instead of the video)
  const showNavyMarquee =
    !!navyDecos &&
    !archBackground &&
    navyInvite.backgroundMarquee !== false &&
    backgroundPhotos.length > 0;

  // envelopePhotos show in any display mode; otherwise photo mode falls back to the date-card photos
  const envelopePhotoSources = useMemo(
    () =>
      content.envelopePhotos?.length
        ? content.envelopePhotos
        : isPlain
          ? []
          : content.photos ?? [],
    [content.envelopePhotos, content.photos, isPlain],
  );
  const showEnvelopePhotos = envelopePhotoSources.length > 0;

  const envelopePolaroids = useMemo(() => {
    const photos = envelopePhotoSources.map((src) => encodeURI(src));
    const pick = (index: number) => photos[index % photos.length];
    if (!photos.length) return { mobile: [] as const, desktop: [] as const };
    const pair = [
      { src: pick(0), side: 'left' as const },
      { src: pick(1), side: 'right' as const },
    ] as const;
    return {
      mobile: pair,
      // Two photos: flank the card on desktop too instead of repeating them
      desktop:
        photos.length <= 2
          ? pair
          : ([
              { src: pick(0), side: 'left' as const },
              { src: pick(1), side: 'center' as const },
              { src: pick(2), side: 'right' as const },
              { src: pick(3), side: 'right-inner' as const },
            ] as const),
    };
  }, [envelopePhotoSources]);

  const countdownText = useMemo(() => {
    const weddingDate = new Date(siteConfig.wedding.date);
    if (Number.isNaN(weddingDate.getTime())) return '';
    const now = new Date();
    const days = Math.round((startOfDay(weddingDate) - startOfDay(now)) / MS_PER_DAY);
    if (days < 0) return content.countdownPastText;
    if (days === 0) return content.countdownTodayText;
    if (days === 1) return content.countdownOneDayText;
    return content.countdownText.replace('{days}', days.toLocaleString());
  }, [content, siteConfig.wedding.date]);

  const flapIsOpen =
    phase === 'flap-open' ||
    phase === 'rising' ||
    phase === 'photos' ||
    phase === 'revealed' ||
    phase === 'cta';

  const contentsVisible =
    phase === 'rising' ||
    phase === 'photos' ||
    phase === 'revealed' ||
    phase === 'cta';

  const sealGone =
    phase === 'seal-break' ||
    phase === 'flap-open' ||
    phase === 'rising' ||
    phase === 'photos' ||
    phase === 'revealed' ||
    phase === 'cta';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  useEffect(() => {
    if (!visible) {
      openedRef.current = false;
      setPhase('idle');
      setLiveMessage('');
      setLiftedPhoto(null);
      setIsExiting(false);
    }
  }, [visible]);

  useScreenScrollLock(visible && !isExiting);

  useEffect(() => {
    if (phase === 'cta') {
      enterBtnRef.current?.focus({ preventScroll: true });
    }
  }, [phase]);

  useEffect(() => {
    if (
      phase === 'idle' ||
      phase === 'seal-press' ||
      phase === 'seal-break' ||
      phase === 'flap-open' ||
      phase === 'rising'
    ) {
      setLiftedPhoto(null);
    }
  }, [phase]);

  const toggleLiftedPhoto = useCallback((side: PhotoSide) => {
    setLiftedPhoto((current) => (current === side ? null : side));
  }, []);

  const handleEnterInvitation = useCallback(async () => {
    if (isExiting || phase !== 'cta') return;

    setIsExiting(true);
    setLiveMessage('Opening your invitation.');

    if (reduceMotion) {
      onTransitionStart?.();
      onOpen();
      return;
    }

    await wait(inviteRevealLeadMs);
    onTransitionStart?.();
    await wait(INVITE_EXIT_MS - inviteRevealLeadMs);
    onOpen();
  }, [isExiting, onOpen, onTransitionStart, phase, reduceMotion]);

  const runOpenSequence = useCallback(async () => {
    if (reduceMotion) {
      setPhase('cta');
      setLiveMessage('Invitation opened.');
      return;
    }

    setLiveMessage('Pressing seal.');
    setPhase('seal-press');
    await wait(180);

    setLiveMessage('Breaking seal.');
    setPhase('seal-break');
    await wait(320);

    setLiveMessage('Opening envelope.');
    setPhase('flap-open');
    await wait(1100);

    setLiveMessage('Invitation rising.');
    setPhase('rising');
    await wait(isPlain ? 2400 : 3200);

    if (showEnvelopePhotos) {
      setLiveMessage('Photos revealing.');
      setPhase('photos');
      await wait(3600);
    }

    setPhase('revealed');
    await wait(650);

    setPhase('cta');
    setLiveMessage('Invitation ready.');
  }, [isPlain, reduceMotion, showEnvelopePhotos]);

  const handleSealClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      if (openedRef.current || phase !== 'idle') return;
      openedRef.current = true;
      void runOpenSequence();
    },
    [phase, runOpenSequence]
  );

  /* Match reference sample: single flap, rotateX(180deg) positive, origin top center */
  const flapVariants: Variants = {
    closed: { rotateX: 0 },
    open: { rotateX: 180 },
  };

  const sealVariants: Variants = {
    idle: { scale: 1, opacity: 1, rotate: 0, y: 0 },
    press: { scale: 0.94, opacity: 1, rotate: 0, y: 2 },
    break: { scale: 0.2, opacity: 0, rotate: 12, y: -4 },
  };

  /*
    Letter starts deep in the pocket (positive y) and pulls up through the lip.
    Mobile rises higher during entry; desktop keeps its settled position.
  */
  // The taller Nikkah card lifts less on phones, so its lower part stays inside the pocket
  const mobileLetterLift = isArch ? '-10%' : '-22%';
  const letterVariants: Variants = useMemo(
    () => ({
      hidden: { y: '100%', scale: 0.86, opacity: 1, rotate: -0.4 },
      rising: {
        y: isMobileViewport ? mobileLetterLift : '14%',
        scale: 1,
        opacity: 1,
        rotate: 0,
      },
      out: {
        y: isMobileViewport ? mobileLetterLift : '14%',
        scale: 1,
        opacity: 1,
        rotate: 0,
      },
      exitPortal: {
        y: '-118%',
        scale: 3.35,
        opacity: 1,
        rotate: 0,
        zIndex: 48,
      },
    }),
    [isMobileViewport, mobileLetterLift],
  );

  const photoLeftVariants: Variants = {
    hidden: { y: '58%', x: '12%', rotate: -4, scale: 0.72, opacity: 0, zIndex: 12 },
    emerge: { y: '0%', x: '0%', rotate: -7, scale: 1, opacity: 1, zIndex: 16 },
    hover: { y: '-6%', x: '0%', rotate: -8, scale: 1.05, opacity: 1, zIndex: 26 },
    press: { y: '-3%', x: '0%', rotate: -7.5, scale: 1.02, opacity: 1, zIndex: 24 },
    lifted: { y: '-12%', x: '0%', rotate: -8, scale: 1.08, opacity: 1, zIndex: 30 },
    exit: { y: '-18%', x: '-108%', rotate: -24, scale: 0.68, opacity: 0, zIndex: 10 },
  };

  const photoCenterVariants: Variants = {
    hidden: { y: '62%', x: '0%', rotate: 0, scale: 0.7, opacity: 0, zIndex: 11 },
    emerge: { y: '0%', x: '0%', rotate: 2, scale: 1, opacity: 1, zIndex: 15 },
    hover: { y: '-6%', x: '0%', rotate: 2.5, scale: 1.05, opacity: 1, zIndex: 27 },
    press: { y: '-3%', x: '0%', rotate: 2.2, scale: 1.02, opacity: 1, zIndex: 25 },
    lifted: { y: '-12%', x: '0%', rotate: 3, scale: 1.08, opacity: 1, zIndex: 31 },
    exit: { y: '-108%', x: '0%', rotate: 10, scale: 0.72, opacity: 0, zIndex: 10 },
  };

  const photoRightVariants: Variants = {
    hidden: { y: '58%', x: '-12%', rotate: 4, scale: 0.72, opacity: 0, zIndex: 12 },
    emerge: { y: '0%', x: '0%', rotate: 7, scale: 1, opacity: 1, zIndex: 16 },
    hover: { y: '-6%', x: '0%', rotate: 8, scale: 1.05, opacity: 1, zIndex: 26 },
    press: { y: '-3%', x: '0%', rotate: 7.5, scale: 1.02, opacity: 1, zIndex: 24 },
    lifted: { y: '-12%', x: '0%', rotate: 8, scale: 1.08, opacity: 1, zIndex: 30 },
    exit: { y: '-18%', x: '108%', rotate: 24, scale: 0.68, opacity: 0, zIndex: 10 },
  };

  const photoRightInnerVariants: Variants = {
    hidden: { y: '62%', x: '-10%', rotate: 1, scale: 0.7, opacity: 0, zIndex: 11 },
    emerge: { y: '0%', x: '0%', rotate: -2, scale: 1, opacity: 1, zIndex: 15 },
    hover: { y: '-6%', x: '0%', rotate: -2.5, scale: 1.05, opacity: 1, zIndex: 27 },
    press: { y: '-3%', x: '0%', rotate: -2.2, scale: 1.02, opacity: 1, zIndex: 25 },
    lifted: { y: '-12%', x: '0%', rotate: -3, scale: 1.08, opacity: 1, zIndex: 31 },
    exit: { y: '-18%', x: '108%', rotate: 16, scale: 0.72, opacity: 0, zIndex: 10 },
  };

  /*
    Pair layout: two small polaroids in front of the card's lower corners, still tucked
    in the pocket. They are tugged out (overshoot, dip, settle) rather than faded in.
  */
  const frontLeftVariants = useMemo(() => makeFrontPhotoVariants('left'), []);
  const frontRightVariants = useMemo(() => makeFrontPhotoVariants('right'), []);

  const revealCopyContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.16, delayChildren: 0.1 },
    },
    exit: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  const revealCopyItemVariants: Variants = {
    hidden: { opacity: 0, y: 22, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: revealEntryEase,
    },
    exit: {
      opacity: 0,
      y: 28,
      filter: 'blur(6px)',
      transition: { duration: 0.35, ease: [0.4, 0, 1, 1] },
    },
  };

  const buttonRevealVariants: Variants = {
    hidden: { opacity: 0, y: 28, scale: 0.92, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: buttonEntryEase,
    },
    exit: {
      opacity: 0,
      y: 18,
      scale: 1.06,
      filter: 'blur(8px)',
      transition: { duration: 0.32, ease: [0.4, 0, 1, 1] },
    },
  };

  const focusLiftVariants: Variants = {
    idle: { y: 0, scale: 1, opacity: 1 },
    opening: { y: 0, scale: 1, opacity: 1 },
    photos: { y: 0, scale: 1, opacity: 1 },
    revealed: { y: 0, scale: 1, opacity: 1 },
    cta: { y: 0, scale: 1, opacity: 1 },
    exit: {
      y: -18,
      scale: 0.94,
      opacity: 0,
      transition: { duration: 1.15, delay: 0.52, ease: [0.4, 0, 0.2, 1] },
    },
  };

  if (!mounted) return null;

  const letterState =
    phase === 'idle' ||
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open'
      ? 'hidden'
      : phase === 'rising'
        ? 'rising'
        : 'out';

  const photoState =
    phase === 'idle' ||
    phase === 'seal-press' ||
    phase === 'seal-break' ||
    phase === 'flap-open' ||
    phase === 'rising'
      ? 'hidden'
      : 'emerge';

  const photosInteractive = photoState === 'emerge';

  const sealState =
    phase === 'idle' ? 'idle' : phase === 'seal-press' ? 'press' : 'break';

  return (
    <motion.div
      className={`env-invite-screen${isPlain ? ' env-invite-screen--plain' : ''}${showNavyMarquee ? ' env-invite-screen--marquee' : ''}${isArch ? ' env-invite-screen--arch' : ''}${isPlain && showEnvelopePhotos ? ' env-invite-screen--with-photos' : ''}${isPlain && enterFromLoading && visible && !reduceMotion ? ' is-arriving' : ''} ${visible ? '' : 'is-hidden'}`}
      data-phase={isExiting ? 'exiting' : phase}
      aria-hidden={!visible}
      initial={false}
      animate={
        isExiting
          ? { opacity: 0, y: 0, scale: 1 }
          : visible
            ? { opacity: 1, y: 0, scale: 1 }
            : isPlain
              ? // plain: the background matches the loader's, so only fade — the envelope itself arrives (CSS .is-arriving)
                { opacity: 0, y: 0, scale: 1 }
              : { opacity: 0, y: 18, scale: 0.985 }
      }
      transition={
        isExiting
          ? inviteExitEase
          : visible && enterFromLoading && !reduceMotion
            ? inviteEnterEase
            : { duration: reduceMotion ? 0.2 : 0.01 }
      }
      style={{
        pointerEvents: !visible || isExiting ? 'none' : undefined,
        ...(isPlain && {
          '--env-plain-bg': plainTheme.background,
          '--env-plain-ink': plainTheme.text,
          '--env-plain-accent': plainTheme.accent,
        }),
      } as React.CSSProperties}
    >
      {showPhotoBackdrop && (
        <div className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--envelope" aria-hidden="true">
          <InvitePhotoBackdrop className="invite-photo-backdrop--envelope" photos={backgroundPhotos} />
        </div>
      )}

      {isPlain && (
        <>
          {archBackground ? (
            <div className="env-invite-bg-image" aria-hidden="true">
              <Image src={archBackground} alt="" fill priority sizes="100vw" className="object-cover" />
            </div>
          ) : showNavyMarquee ? (
            <NavyMarquee photos={backgroundPhotos} reduceMotion={!!reduceMotion} />
          ) : (
            <BackgroundVideo veil={0.5} />
          )}
          <div className="env-invite-plain-corners" aria-hidden="true">
            {navyDecos
              ? (
                  [
                    ['tl', navyDecos.topLeft, 650, 547],
                    ['tr', navyDecos.topRight, 646, 547],
                    ['bl', navyDecos.bottomLeft, 750, 528],
                    ['br', navyDecos.bottomRight, 745, 530],
                  ] as const
                ).map(([pos, src, w, h]) =>
                  src ? (
                    <div key={pos} className={`env-invite-navy-corner env-invite-navy-corner--${pos}`}>
                      <Image src={src} alt="" width={w} height={h} priority className="env-invite-navy-corner-img" />
                    </div>
                  ) : null,
                )
              : (
                  [
                    { src: cornerDecos.topLeft, className: 'left-0 top-0' },
                    { src: cornerDecos.topRight, className: 'right-0 top-0' },
                    { src: cornerDecos.bottomLeft, className: 'left-0 bottom-0' },
                    { src: cornerDecos.bottomRight, className: 'right-0 bottom-0' },
                  ] as const
                ).map(({ src, className }) => (
                  <div key={className} className={`pointer-events-none absolute ${className}`}>
                    <TintedDeco src={src} className="env-invite-plain-corner-img" />
                  </div>
                ))}
          </div>
        </>
      )}

      {!isPlain && <div className="env-invite-readability-scrim" aria-hidden="true" />}

      {!reduceMotion && (
        <div className="env-invite-particles pointer-events-none" aria-hidden="true">
          <InviteParticles count={28} />
        </div>
      )}

      <div className="env-invite-bg-glow pointer-events-none" aria-hidden="true" />

      <div className="env-invite-ghost-date pointer-events-none select-none" aria-hidden="true">
        <span className="env-invite-ghost-date-part">{weddingDateGhost.month}</span>
        <span className="env-invite-ghost-date-sep" aria-hidden="true" />
        <span className="env-invite-ghost-date-part">{weddingDateGhost.day}</span>
        <span className="env-invite-ghost-date-sep" aria-hidden="true" />
        <span className="env-invite-ghost-date-part">{weddingDateGhost.year}</span>
      </div>

      {isExiting && !reduceMotion && (
        <>
          <motion.div
            className="env-invite-exit-ring"
            aria-hidden="true"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 3.45, opacity: [0, 0.62, 0] }}
            transition={{ duration: 1.65, ease: [0.22, 1, 0.36, 1], times: [0, 0.34, 1], delay: 0.06 }}
          />
          <motion.div
            className="env-invite-exit-bloom"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.28 }}
            animate={{ opacity: [0, 0.96, 0.72, 0], scale: [0.28, 1.08, 1.52, 1.78] }}
            transition={{
              duration: 1.72,
              ease: [0.22, 1, 0.36, 1],
              times: [0, 0.26, 0.58, 1],
              delay: 0.1,
            }}
          />
          <motion.div
            className="env-invite-exit-shimmer"
            aria-hidden="true"
            initial={{ x: '-130%', opacity: 0 }}
            animate={{ x: '130%', opacity: [0, 0.85, 0] }}
            transition={{ duration: 1.25, ease: 'easeInOut', delay: 0.22 }}
          />
          <motion.div
            className="env-invite-exit-curtain env-invite-exit-curtain--left"
            aria-hidden="true"
            initial={{ x: '-105%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.95, delay: 1.15, ease: [0.65, 0, 0.35, 1] }}
          />
          <motion.div
            className="env-invite-exit-curtain env-invite-exit-curtain--right"
            aria-hidden="true"
            initial={{ x: '105%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.95, delay: 1.15, ease: [0.65, 0, 0.35, 1] }}
          />
        </>
      )}

      <p className="env-invite-live" aria-live="polite">
        {liveMessage}
      </p>

      <div className="env-invite-stage">
        <div className="env-invite-cluster">
          <motion.div
            className="env-invite-focus"
            variants={focusLiftVariants}
            initial="idle"
            animate={isExiting ? 'exit' : getFocusLiftPhase(phase)}
            transition={
              reduceMotion
                ? { duration: 0.01 }
                : isExiting
                  ? { duration: 1.15, delay: 0.52, ease: [0.4, 0, 0.2, 1] }
                  : focusLiftEase
            }
          >
          <motion.div
            className="env-invite-scene"
            initial={false}
            animate={
              isExiting
                ? { opacity: 0, scale: 0.98, y: 0 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            transition={
              isExiting
                ? { duration: 1.1, delay: 0.68, ease: [0.4, 0, 0.2, 1] }
                : { duration: 0.01 }
            }
          >
          <div className="env-invite-ground-shadow" aria-hidden="true" />
          <div className="env-invite-ground-contact" aria-hidden="true" />

          <div className="env-invite-envelope">
            {/* Flap behind body when open — rendered first in paint order */}
            <div className="env-invite-flap-shadow" aria-hidden="true" />
            <motion.div
              className="env-invite-flap"
              variants={flapVariants}
              initial="closed"
              animate={flapIsOpen ? 'open' : 'closed'}
              transition={flapEase}
              style={{ transformOrigin: 'top center' }}
              aria-hidden="true"
            />

            <div className="env-invite-envelope-body">
              {/* Back panel */}
              <div className="env-invite-back" aria-hidden="true" />

              {/* Interior shadow — only visible once contents rise */}
              <div className="env-invite-interior" aria-hidden="true" />

              {/* Contents — clipped inside pocket */}
              <div className="env-invite-contents-clip" aria-hidden={!contentsVisible}>
              <div className="env-invite-contents">
                <div className="env-invite-emerge-stack">
                  <motion.div
                    className="env-invite-letter"
                    variants={letterVariants}
                    initial="hidden"
                    animate={isExiting ? 'exitPortal' : letterState}
                    transition={
                      isExiting
                        ? { ...letterExitEase, delay: 0.14 }
                        : letterState === 'rising'
                          ? {
                              ...letterEmergenceEase,
                              opacity: { duration: 0 },
                            }
                          : letterState === 'out'
                            ? letterSettleEase
                            : { duration: 0.01 }
                    }
                  >
                    <div className="env-invite-letter-frame" aria-hidden="true" />
                    {isArch ? (
                      // Nikkah card: Bismillah → invitation → names → date, time & venue
                      <div className="env-invite-letter-inner env-nikkah-card">
                        {navyInvite.bismillah && (
                          <p className={`${amiri.className} env-nikkah-card__bismillah`} lang="ar" dir="rtl">
                            {navyInvite.bismillah}
                          </p>
                        )}
                        <span className="env-nikkah-card__gem" aria-hidden="true" />
                        <p className="env-nikkah-card__message">{content.letterMessage ?? content.eyebrow}</p>
                        <h2 className="env-nikkah-card__names" aria-label={`${groomName} and ${brideName}`}>
                          <span className={aboveTheBeyond.className} aria-hidden="true">{groomName}</span>
                          <span className={`${aboveTheBeyond.className} env-nikkah-card__and`} aria-hidden="true">
                            and
                          </span>
                          <span className={aboveTheBeyond.className} aria-hidden="true">{brideName}</span>
                        </h2>
                        <span className="env-nikkah-card__rule" aria-hidden="true" />
                        <p className={`${cinzel.className} env-nikkah-card__weekday`}>{nikkahDate.weekday}</p>
                        <p className={`${cinzel.className} env-nikkah-card__date`}>{nikkahDate.line}</p>
                        {(ceremonyTime || ceremonyVenue) && (
                          <p className="env-nikkah-card__venue">
                            {ceremonyTime}
                            {ceremonyTime && ceremonyVenue && <span aria-hidden="true"> · </span>}
                            {ceremonyVenue}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="env-invite-letter-inner">
                        {isPlain && plainInvite.ornament && (
                          <TintedDeco src={plainInvite.ornament} className="env-invite-letter-ornament" />
                        )}
                        <span className="env-invite-letter-label" aria-label={content.headline}>
                          {content.headline.split(/\s+/).filter(Boolean).map((word, i) => (
                            <span
                              key={i}
                              aria-hidden="true"
                              className={
                                SCRIPT_WORDS.has(word.toLowerCase())
                                  ? 'env-invite-letter-label__script'
                                  : 'env-invite-letter-label__word'
                              }
                            >
                              {word}
                            </span>
                          ))}
                        </span>
                        <span className="env-invite-letter-date">{letterDate}</span>
                        <span className="env-invite-letter-invited env-invite-letter-invited--message">
                          {content.letterMessage ?? content.eyebrow}
                        </span>
                        <h2 className="env-invite-letter-names env-invite-letter-names--text" aria-label={coupleNames}>
                          <span className={`${theSeasons.className} env-invite-names__nick`} aria-hidden="true">
                            {groomName}
                          </span>
                          <span className={`${aboveTheBeyond.className} env-invite-names__and`} aria-hidden="true">
                            and
                          </span>
                          <span className={`${theSeasons.className} env-invite-names__nick`} aria-hidden="true">
                            {brideName}
                          </span>
                        </h2>
                      </div>
                    )}
                  </motion.div>

                  {showEnvelopePhotos && (
                  <div
                    className={`env-invite-photos-emerge${
                      isMobileViewport || envelopePolaroids.desktop.length <= 2
                        ? ' env-invite-photos-emerge--front'
                        : ''
                    }`}
                  >
                    {isMobileViewport || envelopePolaroids.desktop.length <= 2
                      ? envelopePolaroids.mobile.map((photo, index) => (
                          <PolaroidPhoto
                            key={`pair-${photo.side}-${photo.src}`}
                            side={photo.side}
                            src={photo.src}
                            alt={coupleNames}
                            variants={photo.side === 'left' ? frontLeftVariants : frontRightVariants}
                            photoState={photoState}
                            liftedPhoto={liftedPhoto}
                            onToggle={toggleLiftedPhoto}
                            interactive={photosInteractive}
                            emergenceDelay={index === 0 ? 0.2 : 0.5}
                            reduceMotion={reduceMotion}
                            isExiting={isExiting}
                            envelopePair
                            pullOut
                          />
                        ))
                      : envelopePolaroids.desktop.map((photo, index) => {
                          const delays = [0.55, 1.0, 1.45, 1.7] as const;
                          const variantsBySide: Record<PhotoSide, Variants> = {
                            left: photoLeftVariants,
                            center: photoCenterVariants,
                            right: photoRightVariants,
                            'right-inner': photoRightInnerVariants,
                          };
                          return (
                            <PolaroidPhoto
                              key={`desktop-${photo.side}-${photo.src}`}
                              side={photo.side}
                              src={photo.src}
                              alt={coupleNames}
                              variants={variantsBySide[photo.side]}
                              photoState={photoState}
                              liftedPhoto={liftedPhoto}
                              onToggle={toggleLiftedPhoto}
                              interactive={photosInteractive}
                              emergenceDelay={delays[index] ?? 1.7}
                              reduceMotion={reduceMotion}
                              isExiting={isExiting}
                            />
                          );
                        })}
                  </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Closed front skin — solid cover, hides when open */}
            <div className="env-invite-front-closed" aria-hidden="true">
              <div className="env-invite-fold env-invite-fold--tl" />
              <div className="env-invite-fold env-invite-fold--bl" />
              <div className="env-invite-fold env-invite-fold--br" />
              <div className="env-invite-fold env-invite-fold--b" />
              <svg
                className="env-invite-creases"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <line x1="0" y1="0" x2="50" y2="50" />
                <line x1="100" y1="0" x2="50" y2="50" />
                <line x1="0" y1="100" x2="50" y2="50" />
                <line x1="100" y1="100" x2="50" y2="50" />
              </svg>
            </div>

            <div className="env-invite-hinge" aria-hidden="true" />
            </div>

            {/* Front pocket — above body so paper stays tucked inside */}
            <div className="env-invite-pocket" aria-hidden="true">
              <div className="env-invite-pocket-front" />
              <div className="env-invite-pocket-left" />
              <div className="env-invite-pocket-right" />
            </div>

            {/* Wax seal — centered on flap junction */}
            <div
              className="env-invite-seal-wrap"
              style={{
                display: sealGone && phase !== 'seal-break' ? 'none' : undefined,
              }}
            >
              <motion.button
                type="button"
                className="env-invite-seal-btn"
                variants={sealVariants}
                initial="idle"
                animate={sealState}
                transition={
                  sealState === 'break'
                    ? { duration: 0.28, ease: 'easeIn' }
                    : { duration: 0.16, ease: 'easeOut' }
                }
                onClick={handleSealClick}
                disabled={phase !== 'idle'}
                aria-label="Break the wax seal to open the invitation"
              >
                <Image
                  src={content.sealImage ?? defaultSiteConfig.loadingScreen.sealImage}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 768px) 148px, 132px"
                  className="env-invite-seal-img object-contain"
                />
              </motion.button>
            </div>

            {phase === 'seal-break' && !reduceMotion && (
              <>
                <motion.span
                  className="env-invite-seal-shard"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: -28, y: -30, opacity: 0, scale: 0.35 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  aria-hidden="true"
                />
                <motion.span
                  className="env-invite-seal-shard"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: 30, y: 18, opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.38, ease: 'easeOut' }}
                  aria-hidden="true"
                />
                <motion.span
                  className="env-invite-seal-shard"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: 14, y: -24, opacity: 0, scale: 0.4 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                  aria-hidden="true"
                />
              </>
            )}
          </div>
        </motion.div>

          <p className="env-invite-hint">{content.hintText}</p>

          </motion.div>
        </div>
      </div>

      <div className="env-invite-cta-bar" aria-live="off">
        <motion.div
          className="env-invite-reveal-copy"
          variants={revealCopyContainerVariants}
          initial="hidden"
          animate={
            isExiting
              ? 'exit'
              : phase === 'revealed' || phase === 'cta'
                ? 'visible'
                : 'hidden'
          }
        >
          {countdownText && (
            <motion.p
              className="env-invite-days-to-go"
              variants={revealCopyItemVariants}
            >
              {countdownText}
            </motion.p>
          )}
          <motion.h2 variants={revealCopyItemVariants}>{content.message}</motion.h2>
        </motion.div>

        <motion.button
          ref={enterBtnRef}
          type="button"
          className="env-invite-enter-btn"
          variants={buttonRevealVariants}
          initial="hidden"
          animate={
            isExiting
              ? 'exit'
              : phase === 'cta'
                ? 'visible'
                : 'hidden'
          }
          whileHover={
            phase === 'cta' && !isExiting && !reduceMotion
              ? { y: -2, scale: 1.02 }
              : undefined
          }
          whileTap={
            phase === 'cta' && !isExiting && !reduceMotion
              ? { y: 0, scale: 0.98 }
              : undefined
          }
          onClick={handleEnterInvitation}
          disabled={phase !== 'cta' || isExiting}
        >
          {content.enterButtonText}
        </motion.button>
      </div>
    </motion.div>
  );
};

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function makeFrontPhotoVariants(side: 'left' | 'right'): Variants {
  const tilt = side === 'left' ? -5 : 5;
  const towardCenter = side === 'left' ? '38%' : '-38%';
  // Only transforms change between rest states, so nothing jumps up and down
  return {
    // Fully down inside the pocket; the pocket lip hides it
    hidden: { y: '118%', x: '0%', rotate: 0, scale: 0.94, opacity: 0, zIndex: 16 },
    emerge: { y: '0%', x: '0%', rotate: tilt, scale: 1, opacity: 1, zIndex: 16 },
    hover: { y: '0%', x: '0%', rotate: tilt * 1.2, scale: 1.04, opacity: 1, zIndex: 26 },
    press: { y: '0%', x: '0%', rotate: tilt, scale: 0.98, opacity: 1, zIndex: 24 },
    // Tapped: lift clear of the pocket, straighten and enlarge toward the card's centre
    lifted: { y: '-30%', x: towardCenter, rotate: 0, scale: 1.6, opacity: 1, zIndex: 40 },
    exit: { y: '-20%', x: side === 'left' ? '-120%' : '120%', rotate: tilt * 4, scale: 0.7, opacity: 0, zIndex: 10 },
  };
}

// Long, soft ease-out for the pull; opacity is quick so the photo reads as sliding, not fading
const frontPullEase: Transition = {
  duration: 1.5,
  ease: [0.16, 1, 0.3, 1],
  opacity: { duration: 0.35, ease: 'easeOut' },
};

interface PolaroidPhotoProps {
  side: PhotoSide;
  src: string;
  alt: string;
  variants: Variants;
  photoState: 'hidden' | 'emerge';
  liftedPhoto: PhotoSide | null;
  onToggle: (side: PhotoSide) => void;
  interactive: boolean;
  emergenceDelay: number;
  reduceMotion: boolean | null;
  isExiting?: boolean;
  envelopePair?: boolean;
  /** Front-pocket pair: slow single-motion pull instead of the default emergence */
  pullOut?: boolean;
}

const PHOTO_EXIT_DELAY: Record<PhotoSide, number> = {
  left: 0.06,
  center: 0.1,
  right: 0.04,
  'right-inner': 0.14,
};

function PolaroidPhoto({
  side,
  src,
  alt,
  variants,
  photoState,
  liftedPhoto,
  onToggle,
  interactive,
  emergenceDelay,
  reduceMotion,
  isExiting = false,
  envelopePair = false,
  pullOut = false,
}: PolaroidPhotoProps) {
  const canInteract = interactive && !reduceMotion && !isExiting;

  const animateState = isExiting
    ? 'exit'
    : photoState === 'hidden'
      ? 'hidden'
      : liftedPhoto === side
        ? 'lifted'
        : 'emerge';

  return (
    <motion.button
      type="button"
      className={`env-invite-polaroid env-invite-polaroid--${side}${liftedPhoto === side ? ' is-lifted' : ''}${envelopePair ? ' env-invite-polaroid--envelope-pair' : ''}`}
      variants={variants}
      initial="hidden"
      animate={animateState}
      whileHover={canInteract && liftedPhoto !== side ? 'hover' : undefined}
      whileTap={canInteract ? 'press' : undefined}
      transition={
        reduceMotion
          ? { duration: 0.01 }
          : isExiting
            ? { duration: 0.92, ease: [0.4, 0, 0.2, 1], delay: PHOTO_EXIT_DELAY[side] }
            : photoState === 'hidden'
              ? { duration: 0.01 }
              : animateState === 'emerge' && liftedPhoto === null
                ? { ...(pullOut ? frontPullEase : photoEmergenceEase), delay: emergenceDelay }
                : photoInteractEase
      }
      onClick={(e) => {
        e.stopPropagation();
        if (interactive) onToggle(side);
      }}
      disabled={!interactive}
      aria-label={`View photo ${side}`}
      aria-pressed={liftedPhoto === side}
    >
      <div className="env-invite-polaroid-photo">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover env-invite-polaroid-img"
          sizes={envelopePair ? '(max-width: 767px) 40vw, 220px' : '(min-width: 768px) 310px, 140px'}
          priority
        />
      </div>
    </motion.button>
  );
}