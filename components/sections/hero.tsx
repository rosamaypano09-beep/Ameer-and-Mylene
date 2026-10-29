"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"
import { Amiri, Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { parseWeddingDate } from "@/lib/wedding-date"
import { InvitePhotoBackdrop } from "@/components/loader/invite-photo-backdrop"
import { BackgroundVideo } from "@/components/background-video"
import { NavyMarquee } from "@/components/loader/navy-marquee"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import "@/components/loader/loading-screen.css"
import { TintedDeco } from "@/components/tinted-deco"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

// Arabic calligraphy for the Bismillah (same as the loader card)
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
})

const theSeasons = localFont({
  src: "../../Font/Fontspring-DEMO-theseasons-reg.otf",
  display: "swap",
  variable: "--font-the-seasons",
})

const aboveTheBeyond = localFont({
  src: "../../Font/above-the-beyond-script.otf",
  display: "swap",
  variable: "--font-above-beyond",
})

const entryEase = [0.22, 1, 0.36, 1] as const
const heroTitleSize = {
  main: "clamp(3.35rem, min(16vw, 18cqi), 8.25rem)",
  script: "clamp(2.55rem, min(12vw, 14cqi), 5.6rem)",
  overlap: "clamp(-0.95rem, min(-3.8vw, -3.2cqi), -1.85rem)",
} as const
// Inside the arch panel the title has less width to fill
const archTitleSize = {
  main: "clamp(2.5rem, min(12vw, 15cqi), 5.25rem)",
  script: "clamp(2.6rem, min(12.5vw, 15cqi), 4.9rem)",
  overlap: "clamp(0rem, 0.6vw, 0.3rem)",
} as const

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function pad2(n: number) {
  return String(n).padStart(2, "0")
}

function formatCeremonyTimePhrase(raw: string) {
  const match = raw.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i)
  if (!match) return raw.toUpperCase()

  let hour24 = Number(match[1])
  const minutes = match[2] ?? "00"
  const meridiem = (match[3] || "").toUpperCase()

  if (meridiem === "PM" && hour24 !== 12) hour24 += 12
  if (meridiem === "AM" && hour24 === 12) hour24 = 0

  const period =
    hour24 >= 17 ? "IN THE EVENING" : hour24 >= 12 ? "IN THE AFTERNOON" : "IN THE MORNING"

  let displayHour = hour24 % 12
  if (displayHour === 0) displayHour = 12

  return `${displayHour}:${minutes} ${period}`
}

function useCeremonyCountdown() {
  const siteConfig = useSiteConfig()

  const targetTimestamp = useMemo(() => {
    const parsedDate = parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date)
    const monthMap: Record<string, string> = {
      January: "01",
      February: "02",
      March: "03",
      April: "04",
      May: "05",
      June: "06",
      July: "07",
      August: "08",
      September: "09",
      October: "10",
      November: "11",
      December: "12",
    }
    const monthKey =
      parsedDate.month.charAt(0) + parsedDate.month.slice(1).toLowerCase()
    const monthNum = monthMap[monthKey] ?? "11"
    const timeRaw = siteConfig.ceremony.time ?? siteConfig.wedding.time
    const timeMatch = timeRaw.match(/(\d+):(\d+)\s*(AM|PM)/i)

    let hour = 9
    let minutes = 0
    if (timeMatch) {
      hour = parseInt(timeMatch[1], 10)
      minutes = parseInt(timeMatch[2], 10)
      const ampm = timeMatch[3].toUpperCase()
      if (ampm === "PM" && hour !== 12) hour += 12
      if (ampm === "AM" && hour === 12) hour = 0
    }

    return new Date(
      Date.UTC(
        parseInt(parsedDate.year, 10),
        parseInt(monthNum, 10) - 1,
        parseInt(parsedDate.day, 10),
        hour - 8,
        minutes,
        0,
      ),
    ).getTime()
  }, [
    siteConfig.ceremony.date,
    siteConfig.ceremony.time,
    siteConfig.wedding.date,
    siteConfig.wedding.time,
  ])

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const tick = () => {
      const difference = targetTimestamp - Date.now()
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }

    tick()
    const timer = window.setInterval(tick, 1000)
    return () => window.clearInterval(timer)
  }, [targetTimestamp])

  return timeLeft
}

function CountdownUnit({
  value,
  label,
  pad = false,
}: {
  value: number
  label: string
  pad?: boolean
}) {
  const display = pad ? pad2(value) : String(value)

  return (
    <div className="flex min-w-[2.5rem] flex-1 flex-col items-center sm:min-w-[3rem]">
      <span
        className={`${cinzel.className} home-hero-countdown-value text-[clamp(0.95rem,4.3vw,1.4rem)] font-semibold leading-none tabular-nums tracking-[0.04em]`}
      >
        {display}
      </span>
      <span
        className={`${cinzel.className} home-hero-countdown-label mt-1 text-[0.42rem] font-medium uppercase tracking-[0.16em] sm:mt-1.5 sm:text-[0.48rem]`}
      >
        {label}
      </span>
    </div>
  )
}

function HeroCountdown() {
  const timeLeft = useCeremonyCountdown()
  const colonClass = `${cinzel.className} home-hero-countdown-value shrink-0 self-start px-0.5 text-[clamp(0.95rem,4.3vw,1.4rem)] font-semibold leading-none tabular-nums sm:px-1`

  return (
    <div className="relative z-10 w-full px-4 py-3 sm:px-6 sm:py-4">
      <p
        className={`${cinzel.className} home-hero-countdown-heading text-center text-[0.5rem] font-semibold uppercase tracking-[0.22em] sm:text-[0.56rem] sm:tracking-[0.26em]`}
      >
        Time left til we say I do
      </p>
      <div
        className="mx-auto mt-1.5 flex max-w-xs items-start justify-center sm:mt-2 sm:max-w-sm"
        aria-live="polite"
        aria-label={`${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds`}
      >
        <CountdownUnit value={timeLeft.days} label="Days" />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.hours} label="Hours" pad />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.minutes} label="Minutes" pad />
        <span className={colonClass} aria-hidden="true">
          :
        </span>
        <CountdownUnit value={timeLeft.seconds} label="Seconds" pad />
      </div>
    </div>
  )
}

export function Hero() {
  const siteConfig = useSiteConfig()
  const loading = siteConfig.loadingScreen ?? defaultSiteConfig.loadingScreen
  const isPlain = loading.display === "plain"
  const cornerDecos =
    loading.cornerDecos ?? defaultSiteConfig.loadingScreen.cornerDecos
  const backgroundPhotos = loading.backgroundPhotos ?? []
  const reduceMotion = useReducedMotion()
  const isNavy =
    isPlain && (loading.plainLayout ?? defaultSiteConfig.loadingScreen.plainLayout) === "navy"
  const navyInvite = loading.navyInvite ?? defaultSiteConfig.loadingScreen.navyInvite
  // Arch loader: same softly blurred background picture and full-color florals as the loader and envelope
  const isArch = isNavy && navyInvite.cardStyle === "arch"
  const archBackground = isArch
    ? loading.backgroundImage ?? defaultSiteConfig.loadingScreen.backgroundImage
    : ""
  const titleSize = isArch ? archTitleSize : heroTitleSize
  // Navy loader's photo marquee carries on from the loader and envelope (instead of the video)
  const navyMarqueePhotos = useMemo(
    () =>
      isNavy && !archBackground && navyInvite.backgroundMarquee !== false
        ? backgroundPhotos.map((src) => encodeURI(src))
        : [],
    [isNavy, archBackground, navyInvite.backgroundMarquee, backgroundPhotos],
  )
  const showNavyMarquee = navyMarqueePhotos.length > 0
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 40)
    return () => window.clearTimeout(id)
  }, [])

  const parsedDate = useMemo(
    () => parseWeddingDate(siteConfig.ceremony.date ?? siteConfig.wedding.date),
    [siteConfig.ceremony.date, siteConfig.wedding.date],
  )

  const ceremonyTimePhrase = formatCeremonyTimePhrase(
    siteConfig.ceremony.time ?? siteConfig.wedding.time,
  )
  const ceremonyName =
    siteConfig.ceremony.location || siteConfig.wedding.venue

  const fadeUp = (delay: number) => {
    if (reduceMotion) {
      return { initial: false as const, animate: { opacity: 1, y: 0 } }
    }
    return {
      initial: { opacity: 0, y: 18 },
      animate: visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
      transition: { duration: 0.9, delay, ease: entryEase },
    }
  }

  return (
    <section
      id="home"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} home-hero relative -mt-12 flex min-h-[100dvh] w-full flex-col overflow-hidden sm:-mt-14 md:-mt-16${isPlain ? " home-hero--plain" : " home-hero--photos"}${showNavyMarquee ? " home-hero--marquee" : ""}${isArch ? " home-hero--arch" : ""}`}
    >
      {isArch ? (
        <>
          <div className="home-hero-bg-image" aria-hidden="true">
            <Image src={archBackground} alt="" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="home-hero-arch-corners" aria-hidden="true">
            {(
              [
                ["tl", navyInvite.decos.topLeft, 650, 547],
                ["tr", navyInvite.decos.topRight, 646, 547],
              ] as const
            ).map(([pos, src, w, h]) =>
              src ? (
                <Image
                  key={pos}
                  src={src}
                  alt=""
                  width={w}
                  height={h}
                  className={`home-hero-arch-corner home-hero-arch-corner--${pos}`}
                />
              ) : null,
            )}
          </div>
        </>
      ) : isPlain ? (
        <>
          {showNavyMarquee ? (
            <NavyMarquee photos={navyMarqueePhotos} reduceMotion={!!reduceMotion} />
          ) : (
            <BackgroundVideo veil={0.45} />
          )}
          <div className="home-hero-plain-corners" aria-hidden="true">
            {(
              [
                { src: cornerDecos.topLeft, className: "left-0 top-0" },
                { src: cornerDecos.topRight, className: "right-0 top-0" },
              ] as const
            ).map(({ src, className }) => (
              <TintedDeco key={className} src={src} className={`home-hero-plain-corner-img absolute ${className}`} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div
            className="invite-photo-backdrop-wrap invite-photo-backdrop-wrap--section"
            aria-hidden="true"
          >
            <InvitePhotoBackdrop
              className="invite-photo-backdrop--section"
              photos={backgroundPhotos}
            />
          </div>
          <div className="home-hero-photo-scrim pointer-events-none absolute inset-0 z-[1]" aria-hidden="true" />
        </>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-5 pb-[clamp(1rem,4vh,2rem)] pt-[clamp(6rem,24vw,7.5rem)] sm:pb-[clamp(2.5rem,9vh,5rem)] sm:pt-[clamp(3.75rem,10vw,6rem)] text-center sm:px-8">
        {/* Soft frosted mist behind the whole text block — no edges, fades into the video */}
        <span aria-hidden className="home-hero-mist pointer-events-none" />
        {/* Arch mode: the text sits on an ivory arched panel like the loader card */}
        <div className={isArch ? "home-hero-arch" : "contents"}>
          {isArch && (navyInvite.bismillah || navyInvite.bismillahTranslation) && (
            <motion.div className="home-hero-bismillah" {...fadeUp(0)}>
              {navyInvite.bismillah && (
                <p className={`${amiri.className} home-hero-bismillah__arabic`} lang="ar" dir="rtl">
                  {navyInvite.bismillah}
                </p>
              )}
              {navyInvite.bismillahTranslation && (
                <p className="home-hero-bismillah__translation">
                  &ldquo;{navyInvite.bismillahTranslation}&rdquo;
                </p>
              )}
            </motion.div>
          )}
          <motion.h1
            className="relative mx-auto w-full max-w-full @container text-center"
            style={
              {
                "--hero-title-size": titleSize.main,
                "--hero-script-size": titleSize.script,
                "--hero-script-overlap": titleSize.overlap,
              } as React.CSSProperties
            }
            {...fadeUp(0.08)}
          >
            <span
              aria-hidden
              className="home-hero-title-glow pointer-events-none absolute left-1/2 top-[42%] h-[min(18rem,58vw)] w-[min(36rem,96%)] -translate-x-1/2 -translate-y-1/2 rounded-full"
            />
            <span className="sr-only">You&apos;re Invited!</span>
            <span
              aria-hidden
              className={`${theSeasons.className} home-hero-title-main relative block uppercase leading-[0.78] tracking-[0.06em] min-[400px]:tracking-[0.09em] sm:tracking-[0.11em] md:tracking-[0.12em]`}
              style={{ fontSize: "var(--hero-title-size)" }}
            >
              You
              <span
                className={`${cinzel.className} relative -top-[0.04em] mx-[0.02em] inline-block font-normal tracking-normal`}
              >
                &rsquo;
              </span>
              re
            </span>
            <span
              aria-hidden
              className={`${aboveTheBeyond.className} home-hero-title-script relative z-10 mx-auto block w-fit max-w-full px-1 leading-[0.82] sm:leading-[0.84]`}
              style={{
                marginTop: "var(--hero-script-overlap)",
                fontSize: "var(--hero-script-size)",
              }}
            >
              Invited
              <span
                className={`${cinzel.className} home-hero-title-script relative -top-[0.08em] ml-[0.05em] inline-block font-normal`}
              >
                !
              </span>
            </span>
          </motion.h1>

          <motion.p
            className="home-hero-eyebrow mt-5 text-[clamp(1.05rem,4.6vw,1.4rem)] italic leading-snug sm:mt-6"
            {...fadeUp(0.2)}
          >
            We are getting married
          </motion.p>

          <motion.div className="home-hero-date-block mt-5 flex flex-col items-center sm:mt-6" {...fadeUp(0.28)}>
            <span
              className={`${cinzel.className} home-hero-date-weekday text-[clamp(0.66rem,2.8vw,0.8rem)] font-semibold uppercase tracking-[0.42em]`}
            >
              {parsedDate.dayOfWeek}
            </span>
            <div className="home-hero-date-row mt-2 flex items-center justify-center gap-[clamp(0.75rem,4vw,1.5rem)]">
              <span
                className={`${cinzel.className} home-hero-date-side text-[clamp(0.72rem,3vw,0.9rem)] font-semibold uppercase tracking-[0.24em]`}
              >
                {/* Short month ("DEC") keeps the date row compact */}
                {parsedDate.month.slice(0, 3)}
              </span>
              <span
                className={`${theSeasons.className} home-hero-date-day text-[clamp(3rem,14vw,4.75rem)] leading-none`}
              >
                {pad2(Number(parsedDate.day))}
              </span>
              <span
                className={`${cinzel.className} home-hero-date-side text-[clamp(0.72rem,3vw,0.9rem)] font-semibold uppercase tracking-[0.24em]`}
              >
                {parsedDate.year}
              </span>
            </div>
          </motion.div>

          <motion.div className="home-hero-meta mt-5 flex flex-col items-center gap-1 sm:mt-6" {...fadeUp(0.36)}>
            <span
              className={`${cinzel.className} home-hero-meta-time text-[clamp(0.68rem,2.9vw,0.82rem)] font-semibold uppercase tracking-[0.22em]`}
            >
              {ceremonyTimePhrase}
            </span>
            <span className="home-hero-meta-venue text-[clamp(1.05rem,4.6vw,1.4rem)] italic leading-tight">
              {ceremonyName}
            </span>
          </motion.div>

          {isArch && navyInvite.verse && (
            <motion.figure className="home-hero-verse" {...fadeUp(0.44)}>
              <span className="home-hero-verse__gem" aria-hidden="true" />
              <blockquote className="home-hero-verse__text">&ldquo;{navyInvite.verse}&rdquo;</blockquote>
              {navyInvite.verseCitation && (
                <figcaption className={`${cinzel.className} home-hero-verse__cite`}>
                  {navyInvite.verseCitation}
                </figcaption>
              )}
            </motion.figure>
          )}
        </div>
      </div>

      <motion.div className="home-hero-countdown-bar relative z-10 mt-auto w-full" {...fadeUp(0.42)}>
        <HeroCountdown />
      </motion.div>
    </section>
  )
}