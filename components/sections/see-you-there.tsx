"use client"

import { Amiri, Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { CornerFlorals } from "@/components/corner-florals"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

// Arabic calligraphy — same face as the Bismillah on the loader and home hero
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

// Olive ink and gold on an ivory card — matches the arch loader and home hero
const OLIVE = "var(--color-ink-deep, #556B2F)"
const OLIVE_TEXT = "color-mix(in srgb, var(--color-ink-deep, #556B2F) 85%, black)"
const GOLD = "var(--color-motif-accent, #D4AF37)"
const GOLD_INK = "color-mix(in srgb, var(--color-motif-accent, #D4AF37) 62%, #4A3A0C)"
const PAPER = "var(--color-motif-soft, #FDF8EC)"
const entryEase = [0.22, 1, 0.36, 1] as const

const titleSize = "clamp(2.85rem, 13.5vw, 6.25rem)"

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
}

const rise: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.85, ease: entryEase } },
}

// "!" and other symbols in Cinzel, letters in The Seasons
function SpecialCharFont({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${cinzel.className} relative -top-[0.06em] inline-block font-normal tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function GemDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: GOLD }} />
      <span className="h-px w-12 sm:w-20" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
    </div>
  )
}

export function SeeYouThere() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.seeYouThere ?? defaultSiteConfig.seeYouThere
  const cornerDecos = content.cornerDecos ?? defaultSiteConfig.seeYouThere.cornerDecos
  const reduceMotion = useReducedMotion()
  const { groomNickname, brideNickname } = siteConfig.couple
  const couple = `${groomNickname} & ${brideNickname}`
  const fill = (text: string) => text.split("{couple}").join(couple)

  return (
    <section
      id="see-you-there"
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative isolate w-full overflow-hidden`}
      style={{
        background: `radial-gradient(80% 50% at 50% 45%, #fff 0%, transparent 70%), ${PAPER}`,
      }}
    >
      <CornerFlorals decos={cornerDecos} />
      {/* Thin gold frame just inside the edges */}
      <div
        className="pointer-events-none absolute inset-[clamp(10px,2.4vw,20px)] z-[1] rounded-md"
        style={{ border: `1px solid color-mix(in srgb, ${GOLD} 40%, transparent)` }}
        aria-hidden
      />

      <motion.div
        className="relative z-20 mx-auto flex min-h-[80svh] max-w-3xl flex-col items-center justify-center px-6 py-36 text-center sm:py-40"
        variants={stagger}
        initial={reduceMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        {content.arabic ? (
          <motion.p
            variants={rise}
            className={`${amiri.className} text-[clamp(1.6rem,7vw,2.4rem)] font-bold leading-[1.4]`}
            style={{ color: OLIVE }}
            lang="ar"
            dir="rtl"
          >
            {content.arabic}
          </motion.p>
        ) : null}

        {content.eyebrow ? (
          <motion.p
            variants={rise}
            className={`${cinzel.className} mt-1 text-[0.75rem] font-semibold uppercase tracking-[0.3em] sm:text-[0.8125rem]`}
            style={{ color: GOLD_INK }}
          >
            {content.eyebrow}
          </motion.p>
        ) : null}

        <motion.div variants={rise} className="mt-5 sm:mt-6">
          <GemDivider />
        </motion.div>

        <motion.h2 variants={rise} className="relative mt-5 sm:mt-6">
          <span className="sr-only">
            {content.titleLine1} {content.titleLine2}
          </span>
          <span
            aria-hidden
            className={`${theSeasons.className} block uppercase leading-[0.88] tracking-[0.06em] sm:tracking-[0.08em]`}
            style={{ fontSize: titleSize, color: OLIVE, textShadow: "0 1px 0 rgb(255 255 255 / 80%)" }}
          >
            <SpecialCharFont text={content.titleLine1} />
            <br />
            <SpecialCharFont text={content.titleLine2} />
          </span>
        </motion.h2>

        {content.script ? (
          <motion.p
            variants={rise}
            className={`${aboveTheBeyond.className} mt-4 text-[1.6rem] leading-tight sm:mt-5 sm:text-[2.1rem] md:text-[2.4rem]`}
            style={{ color: GOLD_INK }}
          >
            {fill(content.script)}
          </motion.p>
        ) : null}

        {content.message ? (
          <motion.p
            variants={rise}
            className="font-goudy-italic mx-auto mt-4 max-w-md text-[1rem] leading-relaxed sm:mt-5 sm:text-[1.1rem]"
            style={{ color: OLIVE_TEXT }}
          >
            {fill(content.message)}
          </motion.p>
        ) : null}
      </motion.div>
    </section>
  )
}
