"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import localFont from "next/font/local"
import { Amiri, Cinzel } from "next/font/google"
import { Download, Gift, Heart, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react"
import { useSiteConfig } from "@/hooks/use-site-config"
import { layeredSectionTitleSize, sectionType } from "@/lib/section-typography"

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

// Text outside the card sits on the dark olive page backdrop: white with a soft dark edge
const onBg = {
  color: "white",
  textShadow:
    "0 1px 2px color-mix(in srgb, var(--color-welcome-navy) 50%, transparent), 0 2px 14px color-mix(in srgb, var(--color-welcome-navy) 40%, transparent)",
} as const
// Script subtitle in soft gold
const onBgScript = { ...onBg, color: "var(--color-motif-accent, #D4AF37)" } as const

const onBgLine = "color-mix(in srgb, white 85%, transparent)"

const ct = {
  body: sectionType.text,
  bodyLg: sectionType.textRelaxed,
  // Same sizes as the Details venue panel
  label: "text-[11px] sm:text-xs md:text-sm",
  panelBody: "text-xs sm:text-sm md:text-base",
} as const

const ease = [0.22, 1, 0.36, 1] as const

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
}

const staggerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

// Sits outside the card, drawn in white
function DiamondDivider() {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to right, transparent, ${onBgLine})` }} />
      <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-motif-accent)" }} />
      <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to left, transparent, ${onBgLine})` }} />
    </div>
  )
}

// The Seasons has no clean glyphs for symbols / digits — render only those
// characters (e.g. "&", ",", "-", numbers) in Cinzel, keep letters in The Seasons.
function SpecialCharFont({ text }: { text: string }) {
  return (
    <>
      {text.split(/([^\p{L}\s]+)/u).map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className={`${cinzel.className} tracking-normal`}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

function RegistryTitle({ title, subtitle }: { title: string; subtitle: string }) {
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
        style={{ fontSize: "var(--script-size)", ...onBgScript }}
      >
        {subtitle}
      </span>
    </h2>
  )
}

export function Registry() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.registry
  const c = content.colors // siteConfig.registry.colors (content/site.ts)
  const { brideNickname, groomNickname } = siteConfig.couple
  const reduceMotion = useReducedMotion()
  const initial = reduceMotion ? false : "hidden"

  const buttonBg = c.button
  const buttonText = "#FFFFFF"
  const cardStyle = {
    background: c.card,
    border: `1px solid ${c.cardEdge}`,
    boxShadow: `0 0 0 6px rgb(255 255 255 / 30%), 0 26px 56px -30px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)`,
  }
  const dividerLineStyle = { background: `linear-gradient(to right, transparent, ${onBgLine}, transparent)` }

  // Enlarged QR (tap the QR to open; Esc / backdrop / X closes)
  const [zoomQr, setZoomQr] = useState<{ src: string; label: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!zoomQr) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoomQr(null)
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [zoomQr])
  const qrFileName = (label: string, src: string) =>
    `${(label || "Gift").replace(/[^a-z0-9]+/gi, "-")}-QR${src.slice(src.lastIndexOf(".")) || ".png"}`

  const accounts = content.showAccounts
    ? content.accounts.filter((a) => a.show && (a.accountNumber || a.qr))
    : []
  // Which account the toggle shows
  const [activeTab, setActiveTab] = useState(0)
  const activeIndex = Math.min(activeTab, Math.max(0, accounts.length - 1))
  const active = accounts[activeIndex]

  return (
    // Transparent: the page backdrop shows through; only the card has a background
    <div className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-hidden`}>
      <section
        id="registry"
        className="relative z-10 overflow-hidden pt-14 pb-12 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16 lg:pt-24 lg:pb-20"
      >
        {/* Header */}
        <motion.div
          className="relative z-20 mx-auto mb-8 max-w-5xl px-3 text-center @container/registry sm:mb-10 sm:px-4 md:mb-12"
          variants={revealVariants}
          initial={initial}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <DiamondDivider />
          <p
            className={`${cinzel.className} mx-auto mt-4 max-w-[20rem] px-2 text-[0.6875rem] font-semibold uppercase leading-snug tracking-[0.16em] min-[400px]:max-w-none min-[400px]:text-[0.75rem] sm:mt-5 sm:text-[0.875rem] sm:tracking-[0.22em]`}
            style={onBg}
          >
            {content.eyebrow}
          </p>
          <div className="mx-auto mt-3 sm:mt-4 md:mt-5">
            <RegistryTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className={`font-goudy-italic mx-auto mt-4 max-w-xl px-2 sm:mt-5 md:mt-6 ${ct.bodyLg}`}
            style={{ ...onBg, fontWeight: 600 }}
          >
            {content.description}
          </p>
          <div className="mt-4 flex items-center justify-center sm:mt-5">
            <span className="h-px w-16 sm:w-24 md:w-32" style={dividerLineStyle} />
          </div>
        </motion.div>

        <div className="relative z-20 mx-auto max-w-2xl px-4 sm:px-6 md:px-8">
          {/* Letter card */}
          <motion.div
            className="relative mt-8 rounded-[1.75rem] px-4 pb-10 pt-12 text-center sm:mt-10 sm:rounded-[2.25rem] sm:px-8 sm:pb-12 sm:pt-14 md:px-10"
            style={cardStyle}
            variants={staggerVariants}
            initial={initial}
            whileInView="show"
            viewport={{ once: true, amount: 0.05 }}
          >
            {/* Seal sitting on the top edge */}
            <motion.div variants={itemVariants} className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full sm:h-16 sm:w-16"
                style={{
                  background: buttonBg,
                  boxShadow: `0 0 0 5px ${c.card}, 0 0 0 6px ${c.cardEdge}, 0 16px 30px -12px color-mix(in srgb, ${c.title} 55%, transparent)`,
                }}
                aria-hidden
              >
                <Gift className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: buttonText }} />
              </span>
            </motion.div>

            <div className={`font-goudy-italic relative mx-auto max-w-xl space-y-4 ${ct.bodyLg} leading-relaxed`} style={{ color: c.body }}>
              {content.paragraphs.map((text, i) => (
                <motion.p key={i} variants={itemVariants} className={i === 0 ? "text-left sm:text-center" : ""}>
                  {i === 0 && text.length > 1 ? (
                    <>
                      {/* Drop cap on the first paragraph */}
                      <span
                        className={`${theSeasons.className} float-left mr-2 mt-1 text-[2.6rem] leading-[0.8] sm:float-none sm:mr-1 sm:inline sm:text-[2.2rem] sm:leading-none`}
                        style={{ color: c.script }}
                        aria-hidden
                      >
                        {text.charAt(0)}
                      </span>
                      <span className="sr-only">{text.charAt(0)}</span>
                      {text.slice(1)}
                    </>
                  ) : (
                    text
                  )}
                </motion.p>
              ))}
            </div>

            <div className="h-6 sm:h-7" aria-hidden />

            {/* Sign-off */}
            <motion.div variants={itemVariants} className="relative space-y-1.5">
              {content.thankYou ? (
                <p className={`font-goudy-italic ${ct.body}`} style={{ color: c.body }}>
                  {content.thankYou}
                </p>
              ) : null}
              <p className={`font-goudy-italic ${ct.body}`} style={{ color: c.soft }}>
                {content.signOff}
              </p>
              {/* Couple signature: names in script, "&" in an italic serif, sage hairlines either side */}
              {(() => {
                const signature = (content.signature || "{groom} & {bride}")
                  .split("{groom}").join(groomNickname)
                  .split("{bride}").join(brideNickname)
                const [first, ...rest] = signature.split("&")
                const second = rest.join("&")
                return (
                  <div className="flex items-center justify-center gap-2.5 pt-2 sm:gap-3.5">
                    <span className="h-px w-8 shrink-0 sm:w-14" style={{ background: `linear-gradient(to right, transparent, ${c.line})` }} aria-hidden />
                    <p
                      className={`${aboveTheBeyond.className} flex items-baseline gap-2 text-[1.9rem] leading-none sm:text-[2.4rem]`}
                      style={{ color: c.script }}
                      aria-label={signature}
                    >
                      <span aria-hidden>{first.trim()}</span>
                      {second ? (
                        <>
                          <span
                            aria-hidden
                            className="font-goudy-italic text-[0.62em] italic"
                            style={{ color: c.line }}
                          >
                            &amp;
                          </span>
                          <span aria-hidden>{second.trim()}</span>
                        </>
                      ) : null}
                    </p>
                    <span className="h-px w-8 shrink-0 sm:w-14" style={{ background: `linear-gradient(to left, transparent, ${c.line})` }} aria-hidden />
                  </div>
                )
              })()}
              <Heart className="mx-auto mt-3 h-3.5 w-3.5" style={{ color: "var(--color-motif-accent)", fill: "var(--color-motif-accent)" }} aria-hidden />
            </motion.div>

            {/* Toggle: one equal-width segment per account */}
            {accounts.length > 1 && (
              <motion.div
                variants={itemVariants}
                role="tablist"
                aria-label={content.accountsTitle || "Gift accounts"}
                className="mx-auto mt-7 grid w-full max-w-[17rem] gap-1 rounded-full p-1"
                style={{
                  gridTemplateColumns: `repeat(${accounts.length}, minmax(0, 1fr))`,
                  background: "#FFFFFF",
                  boxShadow: `inset 0 0 0 1px ${c.cardEdge}, 0 6px 16px -10px color-mix(in srgb, var(--color-welcome-navy) 40%, transparent)`,
                }}
              >
                {accounts.map((account, i) => {
                  const selected = i === activeIndex
                  return (
                    <button
                      key={`${account.label}-${i}`}
                      type="button"
                      role="tab"
                      id={`registry-tab-${i}`}
                      aria-selected={selected}
                      aria-controls="registry-tabpanel"
                      onClick={() => setActiveTab(i)}
                      className={`${cinzel.className} relative rounded-full py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:text-[0.74rem]`}
                      style={{ color: selected ? buttonText : c.title }}
                    >
                      {selected && (
                        <motion.span
                          layoutId="registry-tab-pill"
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: buttonBg,
                            boxShadow: "0 6px 14px -8px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
                          }}
                          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                          aria-hidden
                        />
                      )}
                      <span className="relative">{account.label || `Option ${i + 1}`}</span>
                    </button>
                  )
                })}
              </motion.div>
            )}

            {/* Gift panel — mirrors the Details venue panel: icon + copy on the left, QR on the right (all screen sizes) */}
            <motion.div
              variants={itemVariants}
              id="registry-tabpanel"
              role={accounts.length > 1 ? "tabpanel" : undefined}
              aria-labelledby={accounts.length > 1 ? `registry-tab-${activeIndex}` : undefined}
              className="relative mt-7 rounded-2xl p-3 text-left sm:mt-8 sm:p-4 md:p-5"
              style={{ background: c.accountCard }}
            >
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                {/* Left: the copy */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`${theSeasons.className} mb-1 text-base uppercase leading-tight tracking-[0.14em] sm:mb-1.5 sm:text-lg md:text-xl`}
                    style={{ color: c.title }}
                  >
                    <SpecialCharFont text={content.accountsTitle || "Love Gift"} />
                  </p>
                  {active?.label ? (
                    <p
                      className={`${theSeasons.className} text-sm font-semibold uppercase leading-snug tracking-[0.06em] sm:text-base md:text-lg`}
                      style={{ color: c.title }}
                    >
                      {active.label}
                    </p>
                  ) : null}
                  {content.qrText ? (
                    <p className={`${theSeasons.className} ${ct.panelBody} leading-relaxed tracking-[0.04em]`} style={{ color: c.body }}>
                      <SpecialCharFont text={content.qrText} />
                    </p>
                  ) : null}
                  {content.accountsNote ? (
                    <p className={`font-goudy-italic mt-2 ${ct.panelBody}`} style={{ color: c.soft }}>
                      {content.accountsNote}
                    </p>
                  ) : null}
                  {active && (active.accountName || active.accountNumber) ? (
                    <div className="mt-2.5 border-t pt-2" style={{ borderColor: c.glow }}>
                      {active.accountName ? (
                        <p className={`font-goudy-italic ${ct.panelBody}`} style={{ color: c.body }}>
                          {active.accountName}
                        </p>
                      ) : null}
                      {active.accountNumber ? (
                        <p
                          className={`${cinzel.className} mt-0.5 text-xs font-semibold tabular-nums tracking-[0.12em] sm:text-sm`}
                          style={{ color: c.title }}
                        >
                          {active.accountNumber}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {/* Right: QR — tap to enlarge */}
                {active?.qr ? (
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeIndex}
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25, ease }}
                      className="flex flex-shrink-0 flex-col items-center gap-1.5 sm:gap-2"
                    >
                      <button
                        type="button"
                        onClick={() => setZoomQr({ src: active.qr, label: active.label })}
                        className="relative rounded-lg bg-white p-1.5 shadow-sm transition-transform duration-300 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-motif-accent)] sm:p-2 md:p-2.5"
                        aria-label={`Enlarge ${active.label || "gift"} QR code`}
                      >
                        <span className="relative block h-20 w-20 sm:h-24 sm:w-24">
                          <Image
                            src={active.qr}
                            alt={`${active.label || "Gift"} QR code`}
                            fill
                            unoptimized
                            sizes="96px"
                            className="object-contain"
                          />
                        </span>
                      </button>
                      <p className={`font-goudy-italic ${ct.label} max-w-[90px] text-center leading-snug`} style={{ color: c.eyebrow }}>
                        {content.scanLabel || "Tap to enlarge"}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                ) : null}
              </div>
            </motion.div>

            {/* Closing du'a: Arabic, transliteration, meaning */}
            {content.closing && (content.closing.arabic || content.closing.title || content.closing.text) ? (
              <motion.div variants={itemVariants} className="relative mt-8 sm:mt-10">
                <div className="flex items-center justify-center gap-2" aria-hidden>
                  <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to right, transparent, ${c.line})` }} />
                  <span className="h-1.5 w-1.5 rotate-45" style={{ background: "var(--color-motif-accent)" }} />
                  <span className="h-px w-10 sm:w-16" style={{ background: `linear-gradient(to left, transparent, ${c.line})` }} />
                </div>
                {content.closing.arabic ? (
                  <p
                    className={`${amiri.className} mt-4 text-[1.7rem] font-bold leading-[1.5] sm:text-[2rem]`}
                    style={{ color: c.title }}
                    lang="ar"
                    dir="rtl"
                  >
                    {content.closing.arabic}
                  </p>
                ) : null}
                {content.closing.title ? (
                  <p
                    className={`${cinzel.className} mt-1 text-[0.85rem] font-semibold uppercase tracking-[0.2em] sm:text-[0.95rem]`}
                    style={{ color: "color-mix(in srgb, var(--color-motif-accent) 62%, #4A3A0C)" }}
                  >
                    {content.closing.title}
                  </p>
                ) : null}
                {content.closing.text ? (
                  <p className="font-goudy-italic mt-1.5 text-[1rem] sm:text-[1.08rem]" style={{ color: c.body }}>
                    {content.closing.text}
                  </p>
                ) : null}
              </motion.div>
            ) : null}

          </motion.div>
        </div>
      </section>

      {mounted && zoomQr && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-5 backdrop-blur-md animate-in fade-in duration-200"
          style={{ background: "color-mix(in srgb, var(--color-welcome-navy) 55%, transparent)" }}
          role="dialog"
          aria-modal="true"
          aria-label={`${zoomQr.label} QR code`}
          onClick={() => setZoomQr(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-[1.75rem] p-5 text-center sm:p-6"
            style={cardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomQr(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform hover:rotate-90"
              style={{ background: buttonBg }}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            {zoomQr.label ? (
              <p className={`${theSeasons.className} mb-3 text-lg uppercase tracking-[0.12em]`} style={{ color: c.title }}>
                {zoomQr.label}
              </p>
            ) : null}
            <div className="relative mx-auto aspect-square w-full max-w-[18rem] overflow-hidden rounded-xl bg-white" style={{ boxShadow: `0 0 0 1px ${c.glow}` }}>
              <Image src={zoomQr.src} alt={`${zoomQr.label} QR code`} fill unoptimized sizes="288px" className="object-contain p-2" />
            </div>
            <p className="font-goudy-italic mt-3 text-sm" style={{ color: c.body }}>
              {content.zoomNote}
            </p>
            {content.saveQrLabel ? (
              <a
                href={zoomQr.src}
                download={qrFileName(zoomQr.label, zoomQr.src)}
                className={`${cinzel.className} mt-4 inline-flex items-center gap-1.5 rounded-full border px-5 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] transition-all duration-300 hover:scale-[1.03] hover:brightness-110`}
                style={{ background: buttonBg, color: buttonText, borderColor: "rgb(255 255 255 / 70%)" }}
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                {content.saveQrLabel}
              </a>
            ) : null}
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}
