"use client"

import { Section } from "@/components/section"
import { Fragment, useState, useEffect, type ReactNode } from "react"
import { useQrColors } from "@/hooks/use-css-color"
import { QRCodeSVG } from "qrcode.react"
import { useSiteConfig } from "@/hooks/use-site-config"
import type { AttireColor } from "@/content/site"
import Image from "next/image"
import localFont from "next/font/local"
import { Cinzel } from "next/font/google"
import { Shirt, Copy, Check, Navigation, Heart, MapPin } from "lucide-react"
import { motion, useReducedMotion, type Variants } from "motion/react"
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
const C = {
  heading: "var(--color-welcome-navy)",
  body: "var(--color-welcome-text)",
  soft: "var(--color-welcome-text-soft)",
  label: "var(--color-welcome-heading)",
  script: "var(--color-welcome-script)",
  accent: "var(--color-motif-accent)",
  // Deeper gold for small labels on the white attire cards (plain #D4AF37 is too faint there)
  rose: "color-mix(in srgb, var(--color-motif-accent) 78%, #8B6F2A)",
  blue: "var(--color-welcome-heading)",
  green: "var(--color-welcome-green)",
  paper: "var(--color-welcome-bg-soft)",
  light: "var(--color-motif-soft)",
} as const

// Section background: cream under the loader's (softly blurred) background picture
const sectionBg = "var(--color-motif-soft, #FDF8EC)"

// Text sitting directly on the background picture: olive ink with a soft white edge
const onBg = {
  color: "var(--color-ink-deep, #556B2F)",
  textShadow: "0 1px 0 rgb(255 255 255 / 90%), 0 0 14px rgb(255 255 255 / 85%)",
} as const
// Eyebrow + script lines in a gold deep enough to read on the light picture
const onBgAccent = {
  ...onBg,
  color: "color-mix(in srgb, var(--color-motif-accent, #D4AF37) 62%, #4A3A0C)",
} as const

const hairline = "color-mix(in srgb, var(--color-motif-medium) 55%, transparent)"

const cardStyle = {
  background: "#FFFFFF",
  borderColor: "color-mix(in srgb, var(--color-motif-medium) 70%, transparent)",
  borderWidth: "1px",
  borderStyle: "solid",
  boxShadow:
    "0 22px 48px -26px color-mix(in srgb, var(--color-welcome-navy) 55%, transparent), inset 0 1px 0 rgb(255 255 255 / 80%)",
} as const

const softPanelStyle = {
  borderColor: hairline,
  backgroundColor: "color-mix(in srgb, var(--color-motif-medium) 14%, white)",
} as const

// Primary button: dusty blue → navy with white text (matches the rest of the invitation)
const primaryButtonBg =
  "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)"



function SectionIconDivider({ icon }: { icon: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-2 pt-1 sm:pt-2">
      <span
        className="h-px w-10 sm:w-16 md:w-20"
        style={{ background: "var(--color-on-pattern-line)" }}
      />
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full sm:h-8 sm:w-8"
        style={{ border: `1px solid ${hairline}`, background: C.paper }}
      >
        {icon}
      </span>
      <span
        className="h-px w-10 sm:w-16 md:w-20"
        style={{ background: "var(--color-on-pattern-line)" }}
      />
    </div>
  )
}

function DetailsTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <h2
      className="relative mx-auto w-full max-w-full text-center"
      style={
        {
          "--title-size": "clamp(2.15rem, 11vw, 4.5rem)",
          "--script-size": "clamp(1.1rem, 4.5vw, 2.25rem)",
        } as React.CSSProperties
      }
    >
      <span
        className={`${theSeasons.className} block uppercase leading-[0.78] tracking-[0.08em] min-[400px]:tracking-[0.11em] sm:tracking-[0.15em] md:tracking-[0.18em] pb-1 sm:pb-1.5`}
        style={{ fontSize: "var(--title-size)", ...onBg }}
      >
        {title}
      </span>
      <span
        aria-hidden
        className={`${aboveTheBeyond.className} mx-auto block w-fit max-w-full px-1 leading-[0.88] sm:leading-[0.9] mt-2 sm:mt-2.5 md:mt-3`}
        style={{ fontSize: "var(--script-size)", ...onBgAccent }}
      >
        {subtitle}
      </span>
      <span className="sr-only">{subtitle}</span>
    </h2>
  )
}

// Slightly compact type inside card containers (not the page header)
const ct = {
  label: "text-[11px] sm:text-xs md:text-sm",
  labelSm: "text-[10px] sm:text-[11px] md:text-xs",
  body: "text-xs sm:text-sm md:text-base",
  bodyLg: "text-sm sm:text-base md:text-lg",
  month: "text-base sm:text-xl md:text-2xl lg:text-3xl",
  dayNum: "text-2xl sm:text-4xl md:text-5xl lg:text-6xl",
  year: "text-base sm:text-xl md:text-2xl lg:text-3xl",
  sectionTitle: "text-sm sm:text-lg md:text-xl lg:text-2xl",
  attireCardTitle: "text-sm sm:text-lg md:text-xl lg:text-2xl",
  btn: "text-xs sm:text-sm md:text-base",
} as const

type PaletteColor = { name: string; hex: string }

// Palette entries may be a plain "#HEX" or { name, hex }
function toPaletteColors(colors: readonly AttireColor[]): PaletteColor[] {
  return colors.map((c) => (typeof c === "string" ? { name: "", hex: c } : c))
}

function DressCodePaletteHeader({
  title,
  subtitle,
  guideTitle,
  guideNote,
}: {
  title: string
  subtitle: string
  guideTitle: string
  guideNote: string
}) {
  return (
    <div className="px-4 pt-5 pb-1 text-center sm:px-6 sm:pt-6">
      <h5
        className={`${cinzel.className} text-sm font-semibold uppercase tracking-[0.16em] sm:text-base md:text-lg`}
        style={{ color: C.heading }}
      >
        {title}
      </h5>
      {subtitle ? (
        <p
          className={`${aboveTheBeyond.className} mt-1 text-[1.65rem] leading-none sm:mt-1.5 sm:text-3xl md:text-[2.1rem]`}
          style={{ color: C.accent }}
        >
          {subtitle}
        </p>
      ) : null}

      <div className="mx-auto mt-3 flex max-w-xs items-center justify-center gap-2 sm:mt-4 sm:max-w-sm">
        <span className="h-px flex-1" style={{ background: "linear-gradient(to right, transparent, var(--color-motif-medium))" }} />
        <Heart className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" style={{ color: C.accent, fill: C.accent }} aria-hidden />
        <span className="h-px flex-1" style={{ background: "linear-gradient(to left, transparent, var(--color-motif-medium))" }} />
      </div>

      <p
        className={`${cinzel.className} mt-4 text-[0.75rem] font-semibold uppercase tracking-[0.18em] sm:text-xs md:text-sm`}
        style={{ color: C.rose }}
      >
        {guideTitle}
      </p>
      <p className="font-goudy-italic mt-1.5 text-[0.9rem] leading-relaxed sm:text-sm md:text-base" style={{ color: C.heading }}>
        {guideNote}
      </p>
    </div>
  )
}

// True for pale swatches (cream, beige) that need dark text instead of white
function isLightColor(hex: string) {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!m) return false
  const [r, g, b] = m.slice(1).map((v) => parseInt(v, 16))
  return 0.299 * r + 0.587 * g + 0.114 * b > 170
}

// Full-width strip of equal swatches, color names written vertically
function DressCodePaletteSwatches({ palette }: { palette: readonly PaletteColor[] }) {
  const named = palette.filter((c) => c.name)
  return (
    <div
      className="flex w-full overflow-hidden rounded-xl border-2"
      style={{
        borderColor: "#FFFFFF",
        boxShadow:
          "0 0 0 1px color-mix(in srgb, var(--color-motif-medium) 60%, transparent), 0 10px 22px -14px color-mix(in srgb, var(--color-welcome-navy) 50%, transparent)",
      }}
      role="img"
      aria-label={`Dress code color palette: ${(named.length ? named.map((c) => c.name) : palette.map((c) => c.hex)).join(", ")}`}
    >
      {palette.map((color, index) => (
        <div
          key={`${color.hex}-${index}`}
          className={`relative flex min-h-[96px] min-w-0 flex-1 items-center justify-center sm:min-h-[116px] md:min-h-[136px] ${
            index === palette.length - 1 ? "" : "border-r border-white/90"
          }`}
          style={{ backgroundColor: color.hex }}
          title={color.name || color.hex}
        >
          {color.name ? (
            <span
              className="text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[10px] md:text-[11px]"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                ...(isLightColor(color.hex)
                  ? { color: "var(--color-ink-deep, #556B2F)", textShadow: "none" }
                  : { color: "#FFFFFF", textShadow: "0 1px 2px rgb(0 0 0 / 45%), 0 0 6px rgb(0 0 0 / 25%)" }),
              }}
            >
              {color.name}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  )
}

function ColorPalette({ colors }: { colors: readonly string[] }) {
  const widthClass = colors.length > 4 ? "max-w-md" : "max-w-xs sm:max-w-sm"

  return (
    <div
      className={`mx-auto flex h-8 w-full overflow-hidden rounded-full border-2 shadow-sm sm:h-9 ${widthClass}`}
      style={{ borderColor: C.light }}
      role="img"
      aria-label={`Color palette: ${colors.join(", ")}`}
    >
      {colors.map((color) => (
        <div key={color} className="min-w-0 flex-1" style={{ backgroundColor: color }} title={color} />
      ))}
    </div>
  )
}

function CoupleImagesCarousel({
  coupleImages,
  currentImageIndex,
  rotationOffset,
}: {
  coupleImages: readonly string[]
  currentImageIndex: number
  rotationOffset: number
}) {
  return (
    <div className="mb-4 flex justify-center gap-2 sm:mb-5 sm:gap-2.5">
      {coupleImages.map((image, index) => {
        const isActive = index === currentImageIndex
        const baseRotation = index % 2 === 0 ? -5 + index : 5 - index
        const currentRotation = isActive
          ? baseRotation + Math.sin((rotationOffset * Math.PI) / 180) * 2
          : baseRotation
        const scale = isActive ? "scale(1.1)" : "scale(1)"

        return (
          <div
            key={image}
            className={`relative h-14 w-14 overflow-hidden rounded-lg border-[3px] shadow-md transition-all duration-700 ease-in-out sm:h-16 sm:w-16 ${
              isActive ? "z-10" : "opacity-75"
            }`}
            style={{ transform: `rotate(${currentRotation}deg) ${scale}`, borderColor: C.light }}
          >
            <Image src={image} alt={`Wedding couple ${index + 1}`} fill className="object-cover" sizes="64px" />
          </div>
        )
      })}
    </div>
  )
}

function FadeRule({ className = "" }: { className?: string }) {
  return (
    <span
      className={`mx-auto block h-px w-24 sm:w-32 ${className}`}
      style={{ background: "linear-gradient(to right, transparent, var(--color-motif-accent), transparent)" }}
      aria-hidden
    />
  )
}

const revealEase = [0.22, 1, 0.36, 1] as const

// Gentle Reminders card; set to false to hide it
const SHOW_REMINDERS = true

const reminderListVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
}

const reminderItemVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: revealEase } },
}

// One reminder: gold diamond, gold small-caps title, then upright serif sized for phones
function ReminderItem({ title, children }: { title: string; children: ReactNode }) {
  return (
    <motion.div variants={reminderItemVariants} className="mx-auto flex max-w-xl flex-col items-center text-center">
      <span
        className="mb-2.5 block h-2 w-2 rotate-45"
        style={{ background: C.accent, boxShadow: "0 0 0 3px #FFFFFF, 0 0 0 4px color-mix(in srgb, var(--color-motif-accent) 40%, transparent)" }}
        aria-hidden
      />
      <h4
        className={`${cinzel.className} text-[0.8rem] font-semibold uppercase tracking-[0.2em] sm:text-sm`}
        style={{ color: C.rose }}
      >
        {title}
      </h4>
      <div
        className="mt-2 text-[1rem] leading-[1.6] sm:text-[1.05rem]"
        style={{ fontFamily: '"SortsMillGoudy", Georgia, "Times New Roman", serif', color: C.heading }}
      >
        {children}
      </div>
    </motion.div>
  )
}

function highlightPhrase(text: string, phrase?: string): ReactNode {
  if (!phrase) return text
  // Case-insensitive so "Formal Dresses" still matches "formal dresses" in the text
  const index = text.toLowerCase().indexOf(phrase.toLowerCase())
  if (index === -1) return text

  return (
    <>
      {text.slice(0, index)}
      <strong className="font-bold underline decoration-[var(--color-motif-medium)] underline-offset-2" style={{ color: C.heading }}>
        {text.slice(index, index + phrase.length)}
      </strong>
      {text.slice(index + phrase.length)}
    </>
  )
}

// One attire line, sized for phones: gold small-caps label over upright serif text
function AttireLine({ label, text }: { label: string; text: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-md text-center">
      <p
        className={`${cinzel.className} text-[0.78rem] font-semibold uppercase tracking-[0.2em] sm:text-sm`}
        style={{ color: C.rose }}
      >
        {label}
      </p>
      <p
        className="mt-1.5 px-1 text-[1.05rem] leading-[1.55] sm:text-lg"
        style={{ fontFamily: '"SortsMillGoudy", Georgia, "Times New Roman", serif', color: C.heading }}
      >
        {text}
      </p>
    </div>
  )
}

// Small round swatches under an attire line (e.g. Ninang: Champagne • Beige)
function ColorDots({ colors }: { colors?: readonly AttireColor[] }) {
  const palette = toPaletteColors(colors ?? [])
  if (palette.length === 0) return null
  return (
    <div
      className="mt-1.5 flex items-center justify-center gap-1.5 sm:mt-2 sm:gap-2"
      role="img"
      aria-label={`Colors: ${palette.map((c) => c.name || c.hex).join(", ")}`}
    >
      {palette.map((color, i) => (
        <span
          key={`${color.hex}-${i}`}
          className="h-4 w-4 rounded-full sm:h-5 sm:w-5"
          style={{
            backgroundColor: color.hex,
            boxShadow: "0 0 0 2px #FFFFFF, 0 0 0 3px color-mix(in srgb, var(--color-motif-medium) 60%, transparent)",
          }}
          title={color.name || color.hex}
        />
      ))}
    </div>
  )
}

function AttirePaletteGroup({
  label,
  description,
  colors,
  roles = [],
}: {
  label: string
  description?: ReactNode
  colors?: readonly AttireColor[]
  roles?: readonly { role: string; attire: string; colors?: readonly AttireColor[] }[]
}) {
  return (
    <div className="mx-auto w-full max-w-md space-y-2 sm:space-y-2.5">
      <p
        className={`${cinzel.className} text-center text-[0.68rem] font-semibold uppercase tracking-[0.22em] sm:text-xs`}
        style={{ color: C.rose }}
      >
        {label}
      </p>
      {description ? (
        <p className="font-goudy-italic px-1 text-center text-[0.84rem] leading-relaxed sm:text-[0.95rem]" style={{ color: C.heading }}>
          {description}
        </p>
      ) : null}
      <ColorDots colors={colors} />
      {roles.length > 0 && (
        <ul className="space-y-3 sm:space-y-4">
          {roles.map(({ role, attire, colors: roleColors }) => (
            <li key={role} className="text-center">
              <p
                className={`${cinzel.className} text-[0.6rem] font-semibold uppercase leading-tight tracking-[0.12em] sm:text-[0.68rem]`}
                style={{ color: C.heading }}
              >
                <SpecialCharFont text={role} />
              </p>
              <p className="font-goudy-italic text-[0.78rem] leading-snug sm:text-sm" style={{ color: C.body }}>
                {attire}
              </p>
              <ColorDots colors={roleColors} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AttireCard({
  title,
  image,
  alt,
  children,
  belowImage,
}: {
  title: string
  image?: string
  alt: string
  children: ReactNode
  belowImage?: ReactNode
}) {
  return (
    <div className="relative group h-full">
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "color-mix(in srgb, var(--color-motif-accent) 14%, transparent)",
        }}
      />
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
        style={{ background: cardStyle.background, boxShadow: cardStyle.boxShadow }}
      >
        <div className="px-4 pt-5 pb-3 sm:pt-7 sm:pb-4">
          <h4
            className={`${cinzel.className} ${ct.attireCardTitle} text-center uppercase tracking-[0.22em] font-semibold leading-tight`}
            style={{ color: C.heading }}
          >
            {title}
          </h4>
        </div>

        {image ? (
          <div
            className="relative flex w-full shrink-0 items-center justify-center overflow-hidden"
            style={{
              background:
                "radial-gradient(70% 80% at 50% 40%, #FFFFFF 0%, color-mix(in srgb, var(--color-motif-medium) 16%, white) 100%)",
            }}
          >
            {/* Any image shape works: the 3/2 size is only a placeholder until the
                file loads, then h-auto switches to the image's real proportions */}
            <Image
              src={image}
              alt={alt}
              width={1500}
              height={1000}
              className="h-auto w-full object-contain transition-transform duration-700 group-hover:scale-[1.01]"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 80vw, 1024px"
            />
          </div>
        ) : null}

        {belowImage}

        <div className="flex flex-1 flex-col px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-8">
          {children}
        </div>
      </div>
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

type VenueLabels = {
  arrival: string
  at: string
  scanForDirections: string
  getDirections: string
  copyAddress: string
  copied: string
}

type EventVenueCardProps = {
  badge: string
  images: readonly string[]
  activeImageIndex: number
  locationName: string
  venueAddress: string
  day: string
  dateString: string
  time: string
  arrivalTime?: string
  // Combined card: one row per event (e.g. Ceremony 3:00 PM / Reception 6:00 PM)
  schedule?: { label: string; time: string }[]
  venueSectionLabel: string
  mapsLink: string
  copyId: string
  fullVenue: string
  copiedItems: Set<string>
  onCopy: (text: string, id: string) => void
  onOpenMaps: (link: string) => void
  showDateDetails?: boolean
  labels: VenueLabels
}

function EventVenueCard({
  badge,
  images,
  activeImageIndex,
  locationName,
  venueAddress,
  day,
  dateString,
  time,
  arrivalTime,
  schedule,
  venueSectionLabel,
  mapsLink,
  copyId,
  fullVenue,
  copiedItems,
  onCopy,
  onOpenMaps,
  showDateDetails = true,
  labels,
}: EventVenueCardProps) {
  const { fg: qrFg, bg: qrBg } = useQrColors() // --color-qr-fg / --color-qr-bg in globals.css
  const eventDate = showDateDetails ? new Date(dateString) : null
  const copied = copiedItems.has(copyId)

  return (
    <div className="relative group">
      <div
        className="absolute -inset-1 rounded-2xl opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "color-mix(in srgb, var(--color-motif-accent) 14%, transparent)",
        }}
      />

      <div
        className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
        style={{ background: cardStyle.background, boxShadow: cardStyle.boxShadow }}
      >
        <div className="relative w-full h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[30rem] overflow-hidden" style={{ background: "color-mix(in srgb, var(--color-motif-medium) 25%, white)" }}>
          {images.map((src, index) => {
            const isActive = index === activeImageIndex
            return (
              <div
                key={src}
                className={`absolute inset-0 transition-[opacity,transform] duration-[1600ms] ease-[cubic-bezier(0.45,0.05,0.55,0.95)] ${
                  isActive ? "opacity-100 scale-100 z-10" : "opacity-0 scale-[1.06] z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={src}
                  alt={locationName}
                  fill
                  className={`object-cover transition-transform duration-[9000ms] ease-out ${
                    isActive && images.length > 1 ? "scale-[1.08] group-hover:scale-[1.12]" : "scale-100"
                  }`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px"
                  // Load every slide up front so the next one is ready before it fades in
                  priority={index === 0}
                  loading={index === 0 ? undefined : "eager"}
                />
              </div>
            )
          })}
          <div
            className="absolute inset-0 z-20 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, color-mix(in srgb, var(--color-welcome-navy) 82%, transparent) 0%, color-mix(in srgb, var(--color-welcome-navy) 25%, transparent) 45%, transparent 100%)",
            }}
          />

          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 md:bottom-6 md:left-6 right-3 sm:right-4 md:right-6 z-30">
            <span
              className={`${cinzel.className} inline-block mb-2 px-3 py-1 rounded-full backdrop-blur-sm text-[10px] sm:text-xs uppercase tracking-[0.2em] border`}
              style={{
                color: C.light,
                background: "color-mix(in srgb, var(--color-motif-soft) 18%, transparent)",
                borderColor: "color-mix(in srgb, var(--color-motif-soft) 45%, transparent)",
              }}
            >
              {badge}
            </span>
            <h3
              className={`${theSeasons.className} text-base sm:text-lg md:text-xl lg:text-2xl font-semibold mb-1 sm:mb-1.5 drop-shadow-lg uppercase tracking-[0.12em] leading-tight`}
              style={{ color: C.light }}
            >
              <SpecialCharFont text={locationName} />
            </h3>
            <p
              className={`${theSeasons.className} text-[10px] sm:text-xs md:text-sm lg:text-base drop-shadow-md tracking-[0.06em] leading-snug`}
              style={{ color: "var(--color-motif-silver)" }}
            >
              <SpecialCharFont text={venueAddress} />
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-5 md:p-7 lg:p-9">
          <div className="text-center mb-5 sm:mb-8 md:mb-10 space-y-2 sm:space-y-2.5 md:space-y-3">
            {showDateDetails && eventDate && !Number.isNaN(eventDate.getTime()) && (
              <>
                <p className={`${cinzel.className} ${ct.label} font-semibold uppercase tracking-[0.2em]`} style={{ color: C.label }}>
                  {day}
                </p>
                <p className={`${cinzel.className} ${ct.month} font-semibold leading-none`} style={{ color: C.heading }}>
                  {eventDate.toLocaleString("default", { month: "long" })}
                </p>
                <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 py-1 sm:py-2">
                  <p className={`${cinzel.className} ${ct.dayNum} font-semibold leading-none`} style={{ color: C.blue }}>
                    {eventDate.getDate()}
                  </p>
                  <div
                    className="h-10 sm:h-12 md:h-14 w-[2px] rounded-full"
                    style={{ background: "var(--color-motif-medium)" }}
                  />
                  <p className={`${cinzel.className} ${ct.year} font-semibold leading-none`} style={{ color: C.heading }}>
                    {eventDate.getFullYear()}
                  </p>
                </div>
              </>
            )}

            {(!schedule || arrivalTime) && (
              <p
                className={`${cinzel.className} text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-[0.12em] uppercase ${showDateDetails ? "" : "py-2 sm:py-3"}`}
                style={{ color: C.heading }}
              >
                {arrivalTime ? `${labels.arrival}: ${arrivalTime}` : `${labels.at} ${time}`}
              </p>
            )}

            {schedule && schedule.length > 0 && (
              <div className="mx-auto flex max-w-sm items-stretch justify-center gap-3 pt-2 sm:gap-5 sm:pt-3">
                {schedule.map((item, i) => (
                  <div key={item.label} className="flex items-stretch gap-3 sm:gap-5">
                    {i > 0 && <span className="w-px self-stretch" style={{ background: hairline }} aria-hidden />}
                    <div className="flex flex-col items-center">
                      <p className={`${cinzel.className} ${ct.labelSm} font-semibold uppercase tracking-[0.2em]`} style={{ color: C.label }}>
                        {item.label}
                      </p>
                      <p className={`${cinzel.className} ${ct.bodyLg} mt-1 font-semibold tracking-[0.08em]`} style={{ color: C.blue }}>
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl p-3 sm:p-4 md:p-5 mb-4 sm:mb-6" style={{ backgroundColor: softPanelStyle.backgroundColor }}>
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mt-0.5 flex-shrink-0" style={{ color: C.blue }} />
              <div className="flex-1 min-w-0">
                <p className={`${cinzel.className} ${ct.label} font-semibold mb-1.5 sm:mb-2 uppercase tracking-wide`} style={{ color: C.label }}>
                  {venueSectionLabel}
                </p>
                <p
                  className={`${theSeasons.className} text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-snug tracking-[0.06em] uppercase`}
                  style={{ color: C.heading }}
                >
                  <SpecialCharFont text={locationName} />
                </p>
                <p className={`${theSeasons.className} ${ct.body} leading-relaxed mt-1 tracking-[0.04em]`} style={{ color: C.body }}>
                  <SpecialCharFont text={venueAddress} />
                </p>
              </div>
              <div className="flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <div className="p-1.5 sm:p-2 md:p-2.5 rounded-lg shadow-sm" style={{ backgroundColor: qrBg }}>
                  <QRCodeSVG value={mapsLink} size={80} level="M" includeMargin={false} fgColor={qrFg} bgColor={qrBg} />
                </div>
                <p className={`font-goudy-italic ${ct.label} text-center max-w-[90px]`} style={{ color: C.label }}>
                  {labels.scanForDirections}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => onOpenMaps(mapsLink)}
              className={`${cinzel.className} flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 md:py-3.5 rounded-full border font-semibold uppercase tracking-[0.12em] ${ct.btn} transition-all duration-300 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]`}
              style={{
                background: primaryButtonBg,
                borderColor: "rgb(255 255 255 / 70%)",
                color: "#FFFFFF",
                boxShadow: "0 12px 24px -10px color-mix(in srgb, var(--color-welcome-navy) 60%, transparent)",
              }}
              aria-label={`Get directions to ${badge.toLowerCase()} venue`}
            >
              <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span>{labels.getDirections}</span>
            </button>
            <button
              type="button"
              onClick={() => onCopy(fullVenue, copyId)}
              className={`${cinzel.className} flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2.5 sm:py-3 md:py-3.5 border rounded-full font-semibold uppercase tracking-[0.12em] ${ct.btn} transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
              style={{
                color: C.heading,
                backgroundColor: "#FFFFFF",
                borderColor: "color-mix(in srgb, var(--color-motif-medium) 80%, transparent)",
              }}
              aria-label={`Copy ${badge.toLowerCase()} venue address`}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" style={{ color: C.blue }} />
              ) : (
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
              )}
              <span>{copied ? labels.copied : labels.copyAddress}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Details() {
  const siteConfig = useSiteConfig()
  const content = siteConfig.eventDetails
  const { cornerDecos, venues, labels, attire, reminders } = content
  const { ceremony, reception } = siteConfig

  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set())
  const [ceremonyImageIndex, setCeremonyImageIndex] = useState(0)
  const [receptionImageIndex, setReceptionImageIndex] = useState(0)
  const [reminderImageIndex, setReminderImageIndex] = useState(0)
  const [rotationOffset, setRotationOffset] = useState(0)
  const reduceMotion = useReducedMotion()
  const backgroundImage =
    siteConfig.loadingScreen?.backgroundImage ?? defaultSiteConfig.loadingScreen.backgroundImage

  // "combined" = one card for both events at the ceremony venue (eventDetails.venues.layout)
  const isCombined = venues.layout === "combined"
  const ceremonyImages = ceremony.image
  const receptionImages = isCombined ? [] : reception.image
  // "plain" display mode (loadingScreen.display) shows no photos above the reminders
  const isPlain = siteConfig.loadingScreen?.display === "plain"
  const reminderImages = !SHOW_REMINDERS || isPlain ? [] : reminders.images
  const paletteHexes = toPaletteColors(attire.palette).map((c) => c.hex)
  // Guard against null entries (e.g. a stray comma in ATTIRE.show).
  // Principal & Secondary Sponsors and Entourage cards are never shown here.
  const HIDDEN_ATTIRE_GROUPS = ["sponsors", "entourage"]
  const attireGroups = attire.groups.filter((g) => g && !HIDDEN_ATTIRE_GROUPS.includes(g.id))

  useEffect(() => {
    if (ceremonyImages.length <= 1) return
    const timer = setInterval(() => setCeremonyImageIndex((prev) => (prev + 1) % ceremonyImages.length), 4500)
    return () => clearInterval(timer)
  }, [ceremonyImages.length])

  useEffect(() => {
    if (receptionImages.length <= 1) return
    const timer = setInterval(() => setReceptionImageIndex((prev) => (prev + 1) % receptionImages.length), 4500)
    return () => clearInterval(timer)
  }, [receptionImages.length])

  // Gentle reminders couple photos — subtle carousel + wobble animation
  useEffect(() => {
    if (reminderImages.length === 0) return
    const interval = setInterval(() => {
      setReminderImageIndex((prev) => (prev + 1) % reminderImages.length)
      setRotationOffset((prev) => (prev + 10) % 360)
    }, 2600)
    return () => clearInterval(interval)
  }, [reminderImages.length])

  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems((prev) => new Set(prev).add(itemId))
      setTimeout(() => {
        setCopiedItems((prev) => {
          const next = new Set(prev)
          next.delete(itemId)
          return next
        })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const openInMaps = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer")
  }

  const fillTimes = (text: string) =>
    text.split("{guestsTime}").join(ceremony.guestsTime).split("{ceremonyTime}").join(ceremony.time)

  const ceremonyVenue = `${ceremony.location}, ${ceremony.venue}`
  const receptionVenue = `${reception.location}, ${reception.venue}`
  const receptionMapsLink = reception.map || `https://maps.google.com/?q=${encodeURIComponent(receptionVenue)}`

  return (
    <div
      // overflow-clip (not hidden) so the sticky background can stick
      className={`${theSeasons.variable} ${aboveTheBeyond.variable} relative w-full overflow-clip`}
      style={{ background: sectionBg }}
    >
      {/* Same blurred picture as the loader and hero; it stays put (sticky) while the long section scrolls */}
      {backgroundImage ? (
        <div className="details-bg" aria-hidden="true">
          <div className="details-bg__frame">
            <Image src={backgroundImage} alt="" fill sizes="100vw" className="details-bg__img object-cover" />
            <div className="details-bg__veil" />
          </div>
        </div>
      ) : null}
      <Section
        id="details"
        // Extra top / bottom room so the corner florals clear the header and the last card
        className="relative z-10 pt-24 pb-28 sm:pt-28 sm:pb-36 md:pt-32 md:pb-44 lg:pt-36 lg:pb-52 overflow-hidden"
      >
        <CornerFlorals decos={cornerDecos} compact />

        {/* Header */}
        <div className="relative z-20 mb-6 px-6 text-center sm:mb-8 sm:px-10 md:mb-10 md:px-12">
          <p
            className={`${cinzel.className} mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.34em] min-[400px]:tracking-[0.38em] sm:text-[0.65rem] sm:tracking-[0.44em]`}
            style={onBgAccent}
          >
            {content.eyebrow}
          </p>
          <div className="my-4 sm:my-5 md:my-6">
            <DetailsTitle title={content.title} subtitle={content.subtitle} />
          </div>
          <p
            className="font-goudy-italic mx-auto max-w-2xl px-2 text-[0.8rem] leading-[1.62] sm:text-[0.875rem] sm:leading-[1.65] md:text-[0.9375rem]"
            style={{ ...onBg, fontWeight: 600 }}
          >
            {content.description}
          </p>

          <div className="mt-4 sm:mt-5">
            <SectionIconDivider icon={<MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: C.blue }} aria-hidden />} />
          </div>
        </div>

        {/* Venue and Event Information */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mb-10 sm:mb-12 md:mb-14 space-y-6 sm:space-y-10 md:space-y-14">
          {isCombined && (
            <EventVenueCard
              badge={venues.combined.badge}
              images={ceremonyImages}
              activeImageIndex={ceremonyImageIndex}
              locationName={ceremony.location}
              venueAddress={ceremony.venue}
              day={ceremony.day}
              dateString={ceremony.date}
              time={ceremony.time}
              arrivalTime={venues.combined.showArrival ? ceremony.guestsTime : undefined}
              schedule={[
                { label: venues.combined.ceremonyLabel, time: ceremony.time },
                ...(venues.combined.showReceptionTime
                  ? [{ label: venues.combined.receptionLabel, time: reception.time }]
                  : []),
              ]}
              venueSectionLabel={venues.combined.sectionLabel}
              mapsLink={ceremony.map}
              copyId="combined"
              fullVenue={ceremonyVenue}
              copiedItems={copiedItems}
              onCopy={copyToClipboard}
              onOpenMaps={openInMaps}
              showDateDetails={venues.combined.showDate}
              labels={labels}
            />
          )}

          {!isCombined && venues.ceremony.show && (
            <EventVenueCard
              badge={venues.ceremony.badge}
              images={ceremonyImages}
              activeImageIndex={ceremonyImageIndex}
              locationName={ceremony.location}
              venueAddress={ceremony.venue}
              day={ceremony.day}
              dateString={ceremony.date}
              time={ceremony.time}
              arrivalTime={venues.ceremony.showArrival ? ceremony.guestsTime : undefined}
              venueSectionLabel={venues.ceremony.sectionLabel}
              mapsLink={ceremony.map}
              copyId="ceremony"
              fullVenue={ceremonyVenue}
              copiedItems={copiedItems}
              onCopy={copyToClipboard}
              onOpenMaps={openInMaps}
              showDateDetails={venues.ceremony.showDate}
              labels={labels}
            />
          )}

          {!isCombined && venues.reception.show && (
            <EventVenueCard
              badge={venues.reception.badge}
              images={receptionImages}
              activeImageIndex={receptionImageIndex}
              locationName={reception.location}
              venueAddress={reception.venue}
              day={reception.day}
              dateString={reception.date}
              time={reception.time}
              arrivalTime={venues.reception.showArrival ? ceremony.guestsTime : undefined}
              venueSectionLabel={venues.reception.sectionLabel}
              mapsLink={receptionMapsLink}
              copyId="reception"
              fullVenue={receptionVenue}
              copiedItems={copiedItems}
              onCopy={copyToClipboard}
              onOpenMaps={openInMaps}
              showDateDetails={venues.reception.showDate}
              labels={labels}
            />
          )}
        </div>

        {/* Attire Guidelines (id = navbar "Attire" link) */}
        <div id="attire" className="relative z-20 mx-auto max-w-7xl scroll-mt-16 px-4 sm:scroll-mt-20 sm:px-6 md:scroll-mt-24 md:px-8">
          {attireGroups.length > 0 && (
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <SectionIconDivider icon={<Shirt className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: C.blue }} aria-hidden />} />
            <h3
              className={`${theSeasons.className} ${ct.sectionTitle} mt-3 uppercase font-semibold leading-tight tracking-[0.12em] sm:mt-4 md:tracking-[0.15em]`}
              style={onBg}
            >
              {attire.title}
            </h3>
            <p className={`font-goudy-italic ${ct.bodyLg} mt-3 leading-relaxed sm:mt-4`} style={{ ...onBg, fontWeight: 600 }}>
              {attire.description}
            </p>
          </div>
          )}


          <div className="mx-auto mb-6 w-full max-w-3xl space-y-5 sm:mb-8 sm:space-y-6 md:mb-10">
            {attireGroups.map((group) => {
              const palette = toPaletteColors(group.palette)
              const hasPalette = palette.length > 0
              const halves = [group.ladies, group.gentlemen].filter(
                (half) => half.details.trim() || half.roles.length > 0,
              )
              // Cards with "lines" read top to bottom, then show the palette underneath
              const lines = "lines" in group ? group.lines : []
              if (lines.length > 0) {
                return (
                  <AttireCard
                    key={group.id}
                    title={group.title}
                    image={group.image}
                    alt={`${group.title} attire guide`}
                    belowImage={
                      group.dressCode ? (
                        <p
                          className={`${aboveTheBeyond.className} px-4 pt-5 text-center text-[2rem] leading-none sm:pt-6 sm:text-[2.4rem]`}
                          style={{ color: C.rose }}
                        >
                          {group.dressCode}
                        </p>
                      ) : null
                    }
                  >
                    <div className="space-y-5 sm:space-y-6">
                      {lines.map((line, i) => (
                        <Fragment key={line.label}>
                          {i > 0 ? (
                            <span
                              className="mx-auto block h-px w-1/3 max-w-[8rem]"
                              style={{ background: "linear-gradient(to right, transparent, var(--color-motif-accent), transparent)" }}
                              aria-hidden
                            />
                          ) : null}
                          <AttireLine label={line.label} text={highlightPhrase(line.text, line.highlight)} />
                        </Fragment>
                      ))}
                      {hasPalette ? (
                        <div className="pt-1">
                          <DressCodePaletteHeader
                            title={attire.paletteTitle}
                            subtitle=""
                            guideTitle={attire.colorGuideTitle}
                            guideNote={attire.colorGuideNote}
                          />
                          <div className="mt-4">
                            <DressCodePaletteSwatches palette={palette} />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </AttireCard>
                )
              }
              return (
                <AttireCard
                  key={group.id}
                  title={group.title}
                  image={group.image}
                  alt={`${group.title} attire guide`}
                  belowImage={
                    hasPalette ? (
                      <DressCodePaletteHeader
                        title={attire.paletteTitle}
                        // The card's dress code ("Semi-Formal Attire") is the script line
                        subtitle={group.dressCode || attire.paletteSubtitle}
                        guideTitle={attire.colorGuideTitle}
                        guideNote={attire.colorGuideNote}
                      />
                    ) : null
                  }
                >
                  <div className="space-y-6 sm:space-y-7">
                    {halves.map((half, i) => (
                      <Fragment key={half.label}>
                        {/* Palette sits between the two halves (or after the only one) */}
                        {hasPalette && i === 1 ? <DressCodePaletteSwatches palette={palette} /> : null}
                        <AttirePaletteGroup
                          label={half.label}
                          description={half.details.trim() ? highlightPhrase(half.details, half.highlight) : undefined}
                          colors={half.colors}
                          roles={half.roles}
                        />
                      </Fragment>
                    ))}
                    {hasPalette && halves.length < 2 ? <DressCodePaletteSwatches palette={palette} /> : null}
                  </div>
                </AttireCard>
              )
            })}
          </div>

          {/* Gentle Reminders (hidden — see SHOW_REMINDERS) */}
          {SHOW_REMINDERS && (
          <motion.div
            className="relative mx-auto mt-10 max-w-2xl sm:mt-12"
            initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, ease: revealEase }}
          >
            <div
              className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem]"
              style={{ background: cardStyle.background, boxShadow: cardStyle.boxShadow }}
            >
              <motion.div
                className="relative z-10 flex flex-col items-center px-5 py-7 text-center sm:px-10 sm:py-9 md:px-12"
                variants={reminderListVariants}
                initial={reduceMotion ? false : "hidden"}
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
              >
                <motion.div variants={reminderItemVariants} className="flex flex-col items-center">
                  {reminderImages.length > 0 ? (
                    <CoupleImagesCarousel
                      coupleImages={reminderImages}
                      currentImageIndex={reminderImageIndex}
                      rotationOffset={rotationOffset}
                    />
                  ) : (
                    <Heart className="mb-3 h-4 w-4 sm:h-5 sm:w-5" style={{ color: C.accent, fill: C.accent }} aria-hidden />
                  )}
                  <h3
                    className={`${theSeasons.className} ${ct.sectionTitle} font-semibold uppercase tracking-[0.18em]`}
                    style={{ color: C.heading }}
                  >
                    {reminders.title}
                  </h3>
                  <p className="font-goudy-italic mx-auto mt-2 max-w-md text-[0.95rem] leading-relaxed sm:text-base" style={{ color: C.heading }}>
                    {reminders.description}
                  </p>
                  <FadeRule className="mt-3.5 sm:mt-4" />
                </motion.div>

                <div className="mt-5 w-full sm:mt-6">
                  {reminders.items.map((item, index) => (
                    <div key={item.title}>
                      {index > 0 ? (
                        <motion.span
                          variants={reminderItemVariants}
                          className="mx-auto my-5 block h-px w-1/3 max-w-[9rem] sm:my-6"
                          style={{ background: "linear-gradient(to right, transparent, var(--color-motif-medium), transparent)" }}
                          aria-hidden
                        />
                      ) : null}
                      <ReminderItem title={item.title}>
                        <div className="space-y-2">
                          {item.paragraphs.map((text, i) => (
                            <div key={i} className="space-y-2.5">
                              <p>{fillTimes(text)}</p>
                              {item.showPalette && i === 0 ? <ColorPalette colors={paletteHexes} /> : null}
                            </div>
                          ))}
                        </div>
                      </ReminderItem>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
          )}

        </div>
      </Section>
    </div>
  )
}
