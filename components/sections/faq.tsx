"use client"

import { useState, type CSSProperties, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"
import { Cinzel } from "next/font/google"
import localFont from "next/font/local"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"
import Image from "next/image"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { CornerFlorals } from "@/components/corner-florals"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
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

// Palette lives in globals.css → motif / welcome tokens.
// White card, navy questions, body-blue answers; dusty blue marks the open question,
// sage hairlines and a sunshine diamond for ornaments.
const TEAL = "var(--color-welcome-navy)"
const BUTTON = "var(--color-welcome-heading)" // dusty blue — open question number
const IVORY = "#FFFFFF"
const BODY = "var(--color-welcome-text)"
const ACCENT = "var(--color-welcome-heading)"
const SKY_TINT = (pct: number) => `color-mix(in srgb, var(--color-motif-medium) ${pct}%, white)`

// Section background: cream under the loader's (softly blurred) background picture — same as Details
const sectionBg = "var(--color-motif-soft, #FDF8EC)"

// Text sitting directly on the background picture: olive ink with a soft white edge
const textGlow = "0 1px 0 rgb(255 255 255 / 90%), 0 0 14px rgb(255 255 255 / 85%)"
const onBg = {
  color: "var(--color-ink-deep, #556B2F)",
  textShadow: textGlow,
} as const
// Eyebrow + script lines in a gold deep enough to read on the light picture
const onBgBlue = {
  color: "color-mix(in srgb, var(--color-motif-accent, #D4AF37) 62%, #4A3A0C)",
  textShadow: textGlow,
} as const

const cardStyle = {
  background:
    "radial-gradient(90% 30% at 50% 0%, rgb(255 255 255 / 95%) 0%, transparent 70%), linear-gradient(180deg, #FFFFFF 0%, color-mix(in srgb, var(--color-motif-medium) 10%, white) 100%)",
  border: "1px solid color-mix(in srgb, var(--color-motif-medium) 70%, transparent)",
  boxShadow:
    "0 0 0 6px rgb(255 255 255 / 45%), 0 26px 56px -30px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)",
} as const

const dividerLineStyle = {
  background: "linear-gradient(to right, transparent, var(--color-motif-yellow), transparent)",
} as const

const ct = {
  body: sectionType.textRelaxed,
  question: sectionType.text,
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
}

// Sage hairlines either side of a sunshine diamond
function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to right, transparent, var(--color-motif-accent))" }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-motif-accent)" }} />
      <span className="h-px w-10 sm:w-16" style={{ background: "linear-gradient(to left, transparent, var(--color-motif-accent))" }} />
    </div>
  )
}

function FaqTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="welcome-title-lockup relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": layeredSectionTitleSize.main,
          "--script-size": layeredSectionTitleSize.script,
        } as CSSProperties
      }
    >
      <span className="sr-only">
        {title} — {subtitle}
      </span>
      <span
        aria-hidden
        className={`${theSeasons.className} block uppercase leading-[0.9] tracking-[0.04em] min-[400px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.14em]`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} relative z-10 mx-auto mt-1.5 block w-fit max-w-full px-1 leading-[0.88] sm:mt-2 sm:leading-[0.9]`}
        style={{ fontSize: "var(--script-size)", ...onBgBlue }}
      >
        {subtitle}
      </span>
    </h2>
  )
}

// "[guest list](#guest-list)" → smooth-scrolling link; "[label](https://…)" → opens in a
// new tab; everything else stays text
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\[[^\]]+\]\((?:#|https?:\/\/)[^)]+\))/g)
  return parts.map((part, i) => {
    const match = part.match(/^\[([^\]]+)\]\(((?:#|https?:\/\/)[^)]+)\)$/)
    if (!match) return part
    const [, label, href] = match
    const isAnchor = href.startsWith("#")
    return (
      <a
        key={i}
        href={href}
        {...(isAnchor ? {} : { target: "_blank", rel: "noopener noreferrer" })}
        className="font-semibold underline decoration-[color-mix(in_srgb,var(--color-motif-yellow)_70%,transparent)] underline-offset-2 transition-opacity hover:opacity-80"
        style={{ color: "var(--color-welcome-heading)" }}
        onClick={
          isAnchor
            ? (e) => {
                e.preventDefault()
                document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" })
              }
            : undefined
        }
      >
        {label}
      </a>
    )
  })
}

// Paragraphs split on blank lines; lines starting with "• " render as a list
function FaqAnswer({ answer }: { answer: string }) {
  const blocks = answer.split(/\n{2,}/)
  return (
    <div className={`font-goudy-italic ${ct.body} space-y-2.5`} style={{ color: BODY }}>
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter(Boolean)
        if (lines.length > 0 && lines.every((line) => line.trim().startsWith("•"))) {
          return (
            <ul key={i} className="space-y-1.5">
              {lines.map((line, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rotate-45"
                    style={{ background: "var(--color-motif-yellow)" }}
                  />
                  <span>{renderInline(line.replace(/^\s*•\s*/, ""))}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {renderInline(block)}
          </p>
        )
      })}
    </div>
  )
}

export function FAQ() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.faq
  const { cornerDecos } = content
  const reduceMotion = useReducedMotion()
  const backgroundImage =
    siteConfig.loadingScreen?.backgroundImage ?? defaultSiteConfig.loadingScreen.backgroundImage
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const rsvp = siteConfig.details.rsvp
  const rsvpPhone = rsvp.phone.trim()
  const showRsvpPhone = rsvpPhone.length > 0 && !/to be announced/i.test(rsvpPhone)
  const fillAnswer = (text: string) =>
    text
      .split("{deadline}").join(rsvp.deadline.replace(/\.\s*$/, ""))
      .split("{coordinator}").join(rsvp.coordinator)
      // coordinator may itself use {groom} / {bride}
      .split("{groom}").join(siteConfig.couple.groomNickname || siteConfig.couple.groom)
      .split("{bride}").join(siteConfig.couple.brideNickname || siteConfig.couple.bride)
      .split("{contact}").join(showRsvpPhone ? ` at ${rsvpPhone}` : "")

  const initial = reduceMotion ? false : "hidden"

  return (
    <div
      // overflow-clip (not hidden) so the sticky background can stick
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-clip`}
      style={{ background: sectionBg }}
    >
      {/* Same blurred picture as the loader, hero and Details (styles: .details-bg in loading-screen.css) */}
      {backgroundImage ? (
        <div className="details-bg" aria-hidden="true">
          <div className="details-bg__frame">
            <Image src={backgroundImage} alt="" fill sizes="100vw" className="details-bg__img object-cover" />
            <div className="details-bg__veil" />
          </div>
        </div>
      ) : null}
      <section
        id="faq"
        // Extra top / bottom room so the corner florals clear the header and the card
        className="relative z-10 overflow-hidden pt-24 pb-28 sm:pt-28 sm:pb-36 md:pt-32 md:pb-44 lg:pt-36 lg:pb-52"
      >
        <CornerFlorals decos={cornerDecos} compact />

        {/* Header */}
        <motion.div
          className="relative z-20 mx-auto mb-8 max-w-5xl px-3 text-center @container/faq sm:mb-10 sm:px-4 md:mb-12"
          variants={revealVariants}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <DiamondDivider />
          <p
            className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-semibold uppercase leading-snug tracking-[0.16em] min-[400px]:max-w-none min-[400px]:text-[0.75rem] sm:mt-5 sm:text-[0.875rem] sm:tracking-[0.22em]`}
            style={onBgBlue}
          >
            {content.eyebrow}
          </p>
          <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
            <FaqTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 md:mt-6 ${ct.body}`}
            style={{ ...onBg, fontWeight: 600 }}
          >
            {content.description}
          </p>
          <div className="mt-4 flex items-center justify-center sm:mt-5">
            <span
              className="h-px w-16 sm:w-24 md:w-32"
              style={dividerLineStyle}
            />
          </div>
        </motion.div>

        {/* Questions */}
        <div className="relative z-20 mx-auto max-w-3xl px-4 sm:px-6 md:px-8">
          <motion.div
            className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem]"
            style={cardStyle}
            variants={revealVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            <motion.ul
              className="relative z-20 space-y-2 px-4 py-5 sm:space-y-2.5 sm:px-6 sm:py-7 md:px-8"
              variants={listVariants}
              initial={initial}
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {content.items.map((item, index) => {
                const isOpen = openIndex === index
                const contentId = `faq-item-${index}`
                return (
                  <motion.li
                    key={item.question}
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-2xl transition-all duration-300"
                    style={{
                      background: isOpen ? SKY_TINT(14) : SKY_TINT(5),
                      border: `1px solid ${isOpen ? "color-mix(in srgb, var(--color-motif-medium) 70%, transparent)" : "color-mix(in srgb, var(--color-motif-medium) 30%, transparent)"}`,
                      boxShadow: isOpen
                        ? "inset 3px 0 0 var(--color-motif-yellow), 0 12px 24px -16px color-mix(in srgb, var(--color-welcome-navy) 45%, transparent)"
                        : "none",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="group flex w-full items-center gap-3 px-3.5 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:px-5 sm:py-3.5"
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                    >
                      <span
                        className={`${cinzel.className} flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.66rem] font-semibold tabular-nums tracking-[0.02em] transition-all duration-300 sm:h-8 sm:w-8 sm:text-[0.72rem]`}
                        style={
                          isOpen
                            ? {
                                background:
                                  "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)",
                                color: IVORY,
                                boxShadow: "0 0 0 2px #FFFFFF, 0 0 0 3px color-mix(in srgb, var(--color-motif-medium) 70%, transparent)",
                              }
                            : {
                                background: "#FFFFFF",
                                color: TEAL,
                                boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-motif-yellow) 70%, transparent)",
                              }
                        }
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`${cinzel.className} ${ct.question} flex-1 font-semibold leading-snug transition-colors duration-200 ${
                          isOpen
                            ? "text-[var(--color-welcome-heading)]"
                            : "text-[var(--color-welcome-navy)] group-hover:text-[var(--color-welcome-heading)]"
                        }`}
                      >
                        {item.question}
                      </span>
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen ? "rotate-180" : "group-hover:translate-y-0.5"}`}
                        style={{ background: isOpen ? BUTTON : SKY_TINT(22) }}
                        aria-hidden
                      >
                        <ChevronDown className="h-4 w-4" style={{ color: isOpen ? IVORY : ACCENT }} />
                      </span>
                    </button>

                    <div
                      id={contentId}
                      role="region"
                      className={`grid transition-all duration-300 ease-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-3.5 pb-4 sm:px-5 sm:pb-5">
                          <span className="mb-3 block h-px w-full" style={dividerLineStyle} aria-hidden />
                          <div className="sm:pl-11">
                            <FaqAnswer answer={fillAnswer(item.answer)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                )
              })}
            </motion.ul>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
