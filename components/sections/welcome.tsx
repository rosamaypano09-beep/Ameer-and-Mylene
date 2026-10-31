"use client"

import localFont from "next/font/local"
import { motion } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { sectionType, welcomeTitleSize } from "@/lib/section-typography"
import { Amiri, Cinzel } from "next/font/google"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

// Arabic calligraphy — same face as the Bismillah on the loader and home hero
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
})

// Gold deep enough to read on ivory (matches the arch card's citations)
const GOLD_INK = "color-mix(in srgb, var(--color-motif-accent, #D4AF37) 62%, #4A3A0C)"

// The marriage verse read at most Nikkahs (Sahih International translation)
const VERSE = {
  arabic: "وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
  text: "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.",
  citation: "Surah Ar-Rum 30:21",
}

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

function OrnamentalDivider({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex items-center justify-center ${compact ? "gap-1.5" : "gap-2"}`}>
      <span
        className={`h-px ${compact ? "w-6 sm:w-10" : "w-8 sm:w-12"}`}
        style={{
          background:
            "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-welcome-navy) 45%, transparent))",
        }}
      />
      <span className="h-0.5 w-0.5 rounded-full bg-motif-teal/55 sm:h-1 sm:w-1" aria-hidden />
      <span
        className={`h-px ${compact ? "w-6 sm:w-10" : "w-8 sm:w-12"}`}
        style={{
          background:
            "linear-gradient(to left, transparent, color-mix(in srgb, var(--color-welcome-navy) 45%, transparent))",
        }}
      />
    </div>
  )
}

function LayeredWelcomeTitle() {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--welcome-size": welcomeTitleSize.main,
          "--script-size": welcomeTitleSize.script,
          "--script-overlap": welcomeTitleSize.overlap,
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em] md:tracking-[0.14em]`}
        style={{
          fontSize: "var(--welcome-size)",
          color: "var(--color-welcome-navy)",
        }}
      >
        Welcome
      </span>

      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9]`}
        style={{
          fontSize: "var(--script-size)",
          color: "var(--color-welcome-navy)",
        }}
      >
        to our love story
      </span>

      <span className="sr-only"> to our love story</span>
    </h2>
  )
}

export function Welcome() {
  const siteConfig = useSiteConfig()
  const brideName = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const groomName = siteConfig.couple.groomNickname || siteConfig.couple.groom

  return (
    <section
      id="welcome"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative px-4 py-10 sm:px-6 sm:py-14 md:px-8 md:py-16`}
    >
      <div className="mx-auto w-full max-w-3xl">
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative @container/welcome overflow-visible rounded-xl border px-5 py-8 sm:rounded-2xl sm:px-9 sm:py-10 md:px-11 md:py-12"
          style={{
            borderColor: "color-mix(in srgb, var(--color-welcome-navy) 22%, transparent)",
            background: "var(--color-motif-soft)",
            boxShadow:
              "0 10px 30px color-mix(in srgb, var(--color-welcome-navy) 18%, transparent)",
          }}
        >
          <div
            className="wedding-frame-inner hidden min-[400px]:block"
            style={{ borderColor: "color-mix(in srgb, var(--color-welcome-navy) 22%, transparent)" }}
            aria-hidden
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px sm:inset-x-10 md:inset-x-12"
            style={{
              background:
                "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
            }}
          />

          <div className="relative flex flex-col gap-8 sm:gap-9 md:gap-10">
            <header className="space-y-3 pt-2 text-center sm:space-y-3.5 sm:pt-3 md:space-y-4 md:pt-4">
              {/* Salam greeting above the title */}
              <div className="mb-4 sm:mb-5">
                <p
                  className={`${amiri.className} text-[clamp(1.5rem,6.5vw,2.1rem)] font-bold leading-[1.4]`}
                  style={{ color: "var(--color-welcome-navy)" }}
                  lang="ar"
                  dir="rtl"
                >
                  السَّلَامُ عَلَيْكُمْ
                </p>
                <p
                  className={`${cinzel.className} mt-1 text-[clamp(0.6rem,2.4vw,0.72rem)] font-semibold uppercase tracking-[0.24em]`}
                  style={{ color: GOLD_INK }}
                >
                  Peace be upon you
                </p>
              </div>
              <LayeredWelcomeTitle />
              <OrnamentalDivider compact />
            </header>

            {/* Qur'anic verse: Arabic line, translation, gold citation */}
            <figure
              className="relative mx-auto max-w-[34rem] rounded-xl px-4 py-5 text-center sm:px-8 sm:py-6"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 0%, color-mix(in srgb, var(--color-motif-accent, #D4AF37) 10%, transparent), transparent 70%)",
                border: "1px solid color-mix(in srgb, var(--color-motif-accent, #D4AF37) 35%, transparent)",
              }}
            >
              <p
                className={`${amiri.className} text-[clamp(1.45rem,6vw,2rem)] font-bold leading-[1.6]`}
                style={{ color: "var(--color-welcome-navy)" }}
                lang="ar"
                dir="rtl"
              >
                {VERSE.arabic}
              </p>
              <blockquote className="mt-2 sm:mt-3">
                <p
                  className={`font-goudy-italic ${sectionType.textSnug}`}
                  style={{ color: "var(--color-welcome-navy)" }}
                >
                  &ldquo;{VERSE.text}&rdquo;
                </p>
              </blockquote>
              <figcaption className="mt-3 flex items-center justify-center gap-2.5">
                <span className="h-px w-6 sm:w-8" style={{ background: `linear-gradient(to right, transparent, ${GOLD_INK})` }} aria-hidden />
                <cite
                  className={`${cinzel.className} ${sectionType.label} font-semibold not-italic uppercase tracking-[0.2em] sm:tracking-[0.24em]`}
                  style={{ color: GOLD_INK }}
                >
                  {VERSE.citation}
                </cite>
                <span className="h-px w-6 sm:w-8" style={{ background: `linear-gradient(to left, transparent, ${GOLD_INK})` }} aria-hidden />
              </figcaption>
            </figure>

            <div
              className={`font-goudy-italic mx-auto max-w-[36rem] space-y-3 text-center sm:space-y-3.5 md:space-y-4 ${sectionType.textRelaxed}`}
              style={{ color: "var(--color-welcome-navy)" }}
            >
              <p>
                Alhamdulillah — with full hearts we are completing half of our deen through the
                blessed bond of Nikkah. Your presence and your du&rsquo;a (prayer) mean the world to us.
              </p>
              <p>
                Inside you&rsquo;ll find the schedule, venue details, and a few gentle reminders for
                the day. Whether you join us in person or from afar, you are in our hearts.
              </p>
            </div>

            <footer className="space-y-2 border-t pt-8 text-center sm:space-y-2.5 sm:pt-9 md:pt-10"
              style={{
                borderColor: "color-mix(in srgb, var(--color-welcome-navy) 18%, transparent)",
              }}
            >
              <p
                className={`${aboveTheBeyond.className} ${sectionType.script}`}
                style={{ color: "var(--color-welcome-navy)" }}
              >
                With love and du&rsquo;a (prayer),
              </p>
              <p
                className={`${cinzel.className} ${sectionType.subheader} font-semibold tracking-[0.12em] sm:tracking-[0.16em] md:tracking-[0.18em]`}
                style={{ color: "var(--color-welcome-navy)" }}
              >
                {groomName} &amp; {brideName}
              </p>
            </footer>
          </div>
        </motion.article>
      </div>
    </section>
  )
}
