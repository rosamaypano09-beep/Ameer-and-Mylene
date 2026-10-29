"use client"

import React, { useRef, useState } from "react"
import localFont from "next/font/local"
import { Amiri, Cinzel } from "next/font/google"
import { motion, useReducedMotion, useScroll, useSpring, type Variants } from "motion/react"
import { layeredSectionTitleSize } from "@/lib/section-typography"
import { useSiteConfig } from "@/hooks/use-site-config"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { CornerFlorals } from "@/components/corner-florals"
import "./love-story.css"

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

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
})

// Arabic calligraphy — same face as the Bismillah on the loader and home hero
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
})

const revealEase = [0.22, 1, 0.36, 1] as const

// One story step plays in order: diamond pops in → label settles → text rises out of a soft blur
const stepVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.18 } },
}
const markerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.2, rotate: -90 },
  shown: { opacity: 1, scale: 1, rotate: 45, transition: { duration: 0.7, ease: revealEase } },
}
const labelVariants: Variants = {
  hidden: { opacity: 0, letterSpacing: "0.6em" },
  shown: { opacity: 1, letterSpacing: "0.24em", transition: { duration: 0.9, ease: revealEase } },
}
const textVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: revealEase } },
}

// Gold hairlines with a diamond in the middle
function GemDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`ls-story-divider ${className}`} aria-hidden="true">
      <span />
      <i />
      <span />
    </div>
  )
}

export function LoveStory() {
  const siteConfig = useSiteConfig()
  const loveStory = siteConfig.loveStory ?? defaultSiteConfig.loveStory
  const chapters = loveStory.chapters ?? defaultSiteConfig.loveStory.chapters
  const cornerDecos = loveStory.cornerDecos ?? defaultSiteConfig.loveStory.cornerDecos
  const reduceMotion = useReducedMotion()

  // The gold thread draws down the story as it scrolls through the screen
  const threadRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: threadRef, offset: ["start 85%", "end 55%"] })
  const threadDraw = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  // The closing line is written in (CSS pen stroke) once it scrolls into view
  const [highlightWritten, setHighlightWritten] = useState(false)

  // Steps start hidden and play once when scrolled into view (static with reduced motion)
  const playOnView = reduceMotion
    ? {}
    : { initial: "hidden", whileInView: "shown", viewport: { once: true, amount: 0.45 } }

  const reveal = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.75, delay, ease: revealEase },
        }

  return (
    <section
      id="love-story"
      className={`ls-story ${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}
    >
      <CornerFlorals decos={cornerDecos} />
      {/* Thin gold frame just inside the edges */}
      <div className="ls-story__frame" aria-hidden="true" />

      <div className="relative z-20 mx-auto w-full max-w-2xl px-6 sm:px-10">
        <motion.header className="text-center" {...reveal()}>
          <h2
            className="relative mx-auto w-full max-w-full text-center"
            style={
              {
                "--title-size": layeredSectionTitleSize.main,
                "--script-size": layeredSectionTitleSize.script,
              } as React.CSSProperties
            }
          >
            <span
              className={`${theSeasons.className} ls-story__title block uppercase leading-[0.85] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.13em]`}
              style={{ fontSize: "var(--title-size)" }}
            >
              {loveStory.title}
            </span>
            <span
              aria-hidden
              className={`${aboveTheBeyond.className} ls-story__subtitle mx-auto mt-2 block w-fit max-w-full px-1 leading-[1.05] sm:mt-3`}
              style={{ fontSize: "var(--script-size)" }}
            >
              {loveStory.subtitle}
            </span>
            <span className="sr-only"> {loveStory.subtitle}</span>
          </h2>
          <GemDivider className="mt-5 sm:mt-6" />
        </motion.header>

        {/* Story told down a gold thread, a diamond marking each step */}
        <ol ref={threadRef} className="ls-story__thread">
          <motion.span
            className="ls-story__thread-line"
            style={reduceMotion ? undefined : { scaleY: threadDraw }}
            aria-hidden="true"
          />
          {chapters.map((chapter, index) => (
            <motion.li key={index} className="ls-story__step" variants={stepVariants} {...playOnView}>
              <motion.span className="ls-story__marker" variants={markerVariants} aria-hidden="true" />
              {chapter.label && (
                <motion.p className={`${cinzel.className} ls-story__label`} variants={labelVariants}>
                  {chapter.label}
                </motion.p>
              )}
              <motion.p className="ls-story__text" variants={textVariants}>
                {chapter.text}
              </motion.p>
            </motion.li>
          ))}
        </ol>

        <footer className="text-center">
          {loveStory.highlight && (
            // Written in left to right, like a pen stroke
            <motion.p
              className={`${aboveTheBeyond.className} ls-story__highlight${
                reduceMotion ? "" : highlightWritten ? " is-pen is-written" : " is-pen"
              }`}
              viewport={{ once: true, amount: 0.5 }}
              onViewportEnter={() => setHighlightWritten(true)}
            >
              {loveStory.highlight}
            </motion.p>
          )}

          {(loveStory.closingArabic || loveStory.closingQuote) && (
            <motion.figure className="ls-story__verse" {...reveal(0.2)}>
              <GemDivider />
              {loveStory.closingArabic && (
                <p className={`${amiri.className} ls-story__verse-arabic`} lang="ar" dir="rtl">
                  {loveStory.closingArabic}
                </p>
              )}
              {loveStory.closingQuote && (
                <blockquote className="font-goudy-italic ls-story__verse-text">
                  &ldquo;{loveStory.closingQuote}&rdquo;
                </blockquote>
              )}
              {loveStory.closingCitation && (
                <figcaption className={`${cinzel.className} ls-story__verse-cite`}>
                  {loveStory.closingCitation}
                </figcaption>
              )}
            </motion.figure>
          )}
        </footer>
      </div>
    </section>
  )
}
