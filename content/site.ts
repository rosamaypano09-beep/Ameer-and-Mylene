import {
  proposalRoleDefinitions,
  proposalRoleIdAliases,
} from "@/content/proposal-roles"

export type TimelineIconName =
  | "arrival"
  | "rings"
  | "departure"
  | "cocktail"
  | "fireworks"
  | "dance"
  | "arch"
  | "crescent"
  | "camera"
  | "teacup"
  | "lantern"
  | "feast"

export type AttireGroupId = "entourage" | "family" | "sponsors" | "guests"
// A palette color: "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
export type AttireColor = string | { name: string; hex: string }
// One role on an attire card; colors → small swatches under the attire text
export type AttireRole = { role: string; attire: string; colors?: AttireColor[] }

/* ============================================================================
   SOP — CREATING / UPDATING AN INVITATION
   ----------------------------------------------------------------------------
   This file is the single source of truth for the couple's content. Pages,
   metadata (link previews), robots.txt, sitemap.xml, QR codes, the table
   finder and proposal pages all read from here. Avoid hard-coding couple
   names, dates, URLs or image paths in components — add them here instead.

   NEW INVITATION (cloned from a previous couple) — work top to bottom:
     1. COUPLE          names + nicknames (nicknames drive "Groom & Bride" text)
     2. DATE & TIMES    wedding date, day, entourage/guest/ceremony/reception times
     3. VENUES          ceremony + reception name, address, Google Maps link, photos;
                        VENUE_CARDS = one combined card or two separate cards + their labels
     4. RSVP            deadline, coordinator, phone; HASHTAGS
     5. WEBSITE         SITE_URL = the live domain (keep the trailing "/").
                        LINK_PREVIEW_IMAGE = 1200×630 JPG for Facebook/Messenger.
                        Both feed app/layout.tsx, app/robots.ts, app/sitemap.ts,
                        lib/proposal-metadata.ts and the table finder.
                        NEXT_PUBLIC_SITE_URL (env, e.g. on Vercel) overrides SITE_URL.
     6. LOOK & FEEL     DISPLAY_MODE "plain" or "photos"
     7. SHARED IMAGES   monogram, couple-name lettering, wax seal, music, COUPLE_PHOTOS
     8. googleAPI       new Apps Script / Form URLs for THIS couple's sheet —
                        never reuse the previous couple's (guests would mix).
     9. SECTIONS        love story, timeline events, ATTIRE (cards + palette), reminders,
                        FAQ, registry accounts/QRs, playlist, snap & share, socials.
    10. Search for "⚠ check" and old couple names/hashtags/QRs and replace them.

   BEFORE GOING LIVE:
     • Put every referenced file in /public (paths are case-sensitive on Vercel).
     • Run `npm run build` to catch typos.
     • Paste the live URL in https://developers.facebook.com/tools/debug/ and
       click "Scrape Again" so Facebook picks up the new title + preview image.
       (Changing the preview image? Rename the file — FB caches by URL.)
     • Test RSVP search, a test RSVP submission, messages and /table on mobile.

   CONVENTIONS:
     • Image paths start with "/" and are relative to /public.
     • "" on a decoration/image hides it; show: false hides a card/account/link.
     • Placeholders like {couple}, {name}, {deadline} are filled automatically —
       keep the braces when editing text.
     • ⚠ marks values likely left over from a previous couple.
   ============================================================================ */

/* ============================================================================
   QUICK SETUP — edit these first.
   Every section below reads from here, so one change updates the whole site
   (loader, envelope, hero, details, timeline, RSVP, FAQ, footer, …).
   ============================================================================ */

// ── The couple ──────────────────────────────────────────────────────────────
const COUPLE = {
  bride: "Mylene Jechille Nuñez Mondoyo", // ⚠ add the bride's full name
  brideNickname: "Mylene",
  groom: "Ameer Khan Dequita Taba", // ⚠ add the groom's full name
  groomNickname: "Ameer",
}

// ── Date & times ────────────────────────────────────────────────────────────
const WEDDING_DATE = "December 13, 2026" // e.g. "June 5, 2027"
const WEDDING_DAY = "Sunday"
const TIMES = {
  entourageCall: "9:00 AM", // entourage call time
  guestArrival: "10:00 AM", // guests arrival (Event Details, reminders, timeline, FAQ)
  ceremony: "11:00 AM",
  reception: "12:00 PM", // walimah program (reception)
}

// ── Venues ──────────────────────────────────────────────────────────────────

const CEREMONY_VENUE = {
  name: "Venue 88 Hotel & Events Place",
  address: "Mabuhay Rd, General Santos City (Dadiangas), South Cotabato, Philippines", // ⚠ previous venue's address
  map: "https://maps.app.goo.gl/fe5SqqiSjtpowSZ37", // ⚠ previous venue's map link
  photos: ["/Details/venue (1).png", "/Details/venue (2).png", "/Details/venue (3).png","/Details/venue (4).png"],
}
const RECEPTION_VENUE = {
  name: "Venue 88 Hotel & Events Place",
  address: "Mabuhay Rd, General Santos City (Dadiangas), South Cotabato, Philippines", // ⚠ previous venue's address
  map: "https://maps.app.goo.gl/fe5SqqiSjtpowSZ37", // ⚠ previous venue's map link
  photos: ["/Details/venue (1).png", "/Details/venue (2).png", "/Details/venue (3).png","/Details/venue (4).png"],
}

// ── Venue cards (Event Details section) ─────────────────────────────────────
// layout:
//   "separate" = two cards: ceremony (CEREMONY_VENUE) + reception (RECEPTION_VENUE)
//   "combined" = ONE card for both — use when ceremony and reception share a venue.
//                Name, address, map and photos come from CEREMONY_VENUE.
// badge        = small pill on the photo (e.g. "Ceremony & Reception")
// sectionLabel = label above the venue name (e.g. "Venue")
// showDate     = show the big Month / Day / Year
// showArrival  = show "Arrival: <guest arrival time>" (otherwise "At <time>")
const VENUE_CARDS = {
  layout: "combined" as "separate" | "combined",
  // Used when layout is "combined"
  combined: {
    badge: "Nikkah & Walimah",
    sectionLabel: "Venue",
    showDate: true,
    showArrival: true,
    // Time rows on the card, e.g. "Nikkah 10:00 AM | Walimah 12:00 PM"
    ceremonyLabel: "Nikkah",
    receptionLabel: "Walimah",
    // false = show only the ceremony time on the combined card
    showReceptionTime: false,
  },
  // Used when layout is "separate"
  ceremony: {
    show: true,
    badge: "Nikkah",
    sectionLabel: "Nikkah Venue",
    showDate: true,
    showArrival: true,
  },
  reception: {
    show: true,
    badge: "Walimah",
    sectionLabel: "Walimah Venue",
    showDate: false,
    showArrival: false,
  },
}

// ── RSVP & contact ──────────────────────────────────────────────────────────
const RSVP = {
  deadline: "December 1, 2026",
  coordinator: "{groom} / {bride}", // {groom} / {bride} → couple nicknames
  phone: "to be announced",
}
const HASHTAGS = ["#AmeerAndMyleneNikkah", "#TwoPathsOneLove", "#AmeerMylene1213"]

// ── Attire guide (Event Details → Attire Guidelines) ────────────────────────
// SHOW = which cards to display AND their order, top to bottom. Examples:
//   ["guests"]                            guests only
//   ["entourage", "guests"]               entourage + guests
//   ["sponsors", "entourage", "guests"]   complete
//   ["guests", "sponsors"]                guests first, then sponsors
//   []                                    hide the whole attire guide
// Leave out a name to hide that card. Unknown or empty entries are ignored.
// Each card: fill in only what you need — anything left "" or [] is hidden.
//   image:     illustration path in /public ("" = no image; any size/shape works)
//   palette:   colors for this card — "#9CAF88" or { name: "Sage", hex: "#9CAF88" }
//              (names show on the swatches; [] = no palette)
//   ladies / gentlemen:
//     label:     e.g. "Ninang", "Bridesmaids", "Ladies"
//     details:   the dress code text ("" hides this half of the card)
//     highlight: phrase inside details shown bold + underlined ("" for none)
//     colors:    swatches under the details ([] for none)
//     roles:     [{ role, attire, colors }] — colors are the swatches under that role
// Guest dress code colors — also shown in the "Dress Code" gentle reminder
const DRESS_CODE_PALETTE: AttireColor[] = [
  { name: "Olive Green", hex: "#5F6F3A" },
  { name: "Champagne Gold", hex: "#D4B872" },
  { name: "Beige", hex: "#D8C6A5" },
  { name: "Cream", hex: "#F1E7D2" },
];

// Attire groups shown in the Details section (components/sections/details.tsx).
//   show      → which groups appear, in order
//   dressCode → small line under the palette title, e.g. "Formal Attire"
//   Each side (ladies / gentlemen) has a label, an optional intro (details, with an
//   optional highlighted phrase) and an optional list of roles with what they wear.
const ATTIRE = {
  show: ["guests"] as AttireGroupId[],

  entourage: {
    title: "Entourage",
    image: "/Details/attire/entourage.png",
    dressCode: "Formal Attire",
    palette: [
      { name: "Pastel Yellow", hex: "#F7DE8F" },
      { name: "Dark Yellow", hex: "#E0A93A" },
      { name: "Light Blue", hex: "#A6BEDD" },
      { name: "Off-White", hex: "#EDE3D3" },
      { name: "Navy Blue", hex: "#1F3A5F" },
      { name: "Black", hex: "#1E1E1E" },
    ] as AttireColor[],
    ladies: {
      label: "Ladies",
      details: "",
      highlight: "",
      colors: [] as AttireColor[],
      roles: [
        {
          role: "Bridesmaids",
          attire: "Pastel Yellow Gowns with Yellow & Light Blue Bouquets",
          colors: [{ name: "Pastel Yellow", hex: "#F7DE8F" }, { name: "Light Blue", hex: "#A6BEDD" }],
        },
        {
          role: "Maid of Honor",
          attire: "Dark Yellow Gown with Yellow & Light Blue Bouquet",
          colors: [{ name: "Dark Yellow", hex: "#E0A93A" }, { name: "Light Blue", hex: "#A6BEDD" }],
        },
      ] as AttireRole[],
    },
    gentlemen: {
      label: "Gentlemen",
      details: "",
      highlight: "",
      colors: [] as AttireColor[],
      roles: [
        {
          role: "Best Man",
          attire: "Off-White Barong Tagalog with Black Trousers and Blue Corsage",
          colors: [
            { name: "Off-White", hex: "#EDE3D3" },
            { name: "Black", hex: "#1E1E1E" },
            { name: "Navy Blue", hex: "#1F3A5F" },
          ],
        },
        {
          role: "Groomsmen",
          attire: "Off-White Barong Tagalog with Black Trousers and Yellow Corsage",
          colors: [
            { name: "Off-White", hex: "#EDE3D3" },
            { name: "Black", hex: "#1E1E1E" },
            { name: "Yellow", hex: "#F7DE8F" },
          ],
        },
      ] as AttireRole[],
    },
  },

  family: {
    title: "Family",
    image: "/Details/Family.png",
    dressCode: "Formal Attire",
    palette: [
      { name: "Blue", hex: "#4E86B7" },
      { name: "Yellow", hex: "#F6D35B" },
      { name: "Black", hex: "#1E1E1E" },
    ] as AttireColor[],
    ladies: {
      label: "Ladies",
      details: "",
      highlight: "",
      colors: [] as AttireColor[],
      roles: [
        { role: "Mothers of the Bride & Groom", attire: "Blue long dress." },
        { role: "Sisters", attire: "Yellow gown." },
      ] as AttireRole[],
    },
    gentlemen: {
      label: "Gentlemen",
      details: "",
      highlight: "",
      colors: [] as AttireColor[],
      roles: [
        { role: "Fathers of the Bride & Groom", attire: "Black suit with a blue necktie." },
        { role: "Brothers", attire: "All-black suit and necktie." },
      ] as AttireRole[],
    },
  },

  sponsors: {
    title: "Principal & Secondary Sponsors",
    image: "/Details/attire/sponsors.png",
    dressCode: "Formal Attire",
    palette: [
      { name: "Champagne", hex: "#EBD0BA" },
      { name: "Beige", hex: "#D6AE8A" },
      { name: "Yellow", hex: "#F0C04F" },
      { name: "Blue", hex: "#7E9ED3" },
      { name: "Light Blue", hex: "#A9C6EC" },
      { name: "Off-White", hex: "#EDE3D3" },
      { name: "Black", hex: "#1E1E1E" },
    ] as AttireColor[],
    ladies: {
      label: "Ladies",
      details: "",
      highlight: "",
      colors: [] as AttireColor[],
      roles: [
        {
          role: "Ninang",
          attire: "Champagne or Beige Long Gown",
          colors: [{ name: "Champagne", hex: "#EBD0BA" }, { name: "Beige", hex: "#D6AE8A" }],
        },
        {
          role: "Secondary Sponsors (Female)",
          attire: "Light Blue Long Dress",
          colors: [{ name: "Light Blue", hex: "#A9C6EC" }],
        },
      ] as AttireRole[],
    },
    gentlemen: {
      label: "Gentlemen",
      details: "",
      highlight: "",
      colors: [] as AttireColor[],
      roles: [
        {
          role: "Ninong",
          attire: "Off-White Barong Tagalog with Black Trousers and Yellow Corsage",
          colors: [
            { name: "Off-White", hex: "#EDE3D3" },
            { name: "Black", hex: "#1E1E1E" },
            { name: "Yellow", hex: "#F0C04F" },
          ],
        },
        {
          role: "Secondary Sponsors (Male)",
          attire: "Off-White Barong Tagalog with Black Trousers and Blue Corsage",
          colors: [
            { name: "Off-White", hex: "#EDE3D3" },
            { name: "Black", hex: "#1E1E1E" },
            { name: "Blue", hex: "#7E9ED3" },
          ],
        },
      ] as AttireRole[],
    },
  },

  guests: {
    title: "Attire Guideline",
    image: "/Details/guestAttire.png",
    dressCode: "Formal Attire",
    palette: DRESS_CODE_PALETTE,
    // Shown in this order, with the palette underneath (replaces ladies / gentlemen on this card)
    lines: [
      { label: "Women", text: "Long dresses, abayas, or formal dresses with appropriate coverage.", highlight: "appropriate coverage" },
      { label: "Men", text: "Wear suits or traditional formal attire.", highlight: "" },
    ],
    ladies: {
      label: "Women",
      details: "",
      highlight: "",
      colors: [] as AttireColor[],
      roles: [] as AttireRole[],
    },
    gentlemen: {
      label: "Men",
      details: "",
      highlight: "",
      colors: [] as AttireColor[],
      roles: [] as AttireRole[],
    },
  },
}

// ── Website address (used for QR codes, link previews, table finder) ────────
// NEXT_PUBLIC_SITE_URL (env) overrides this when set.
const SITE_URL = "https://ameer-and-mylene.weddinginvitationrsvp.com/"
// Image shown when the link is shared (Facebook, Messenger, Viber, X, …) — 1200×630 JPG in /public
// URL-encoded (spaces → %20) because it goes straight into the og:image URL
const LINK_PREVIEW_IMAGE = "/Details/LinkPreview.png"

// Site address with env override applied and no trailing slash — no need to edit
export const canonicalSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE_URL).replace(/\/$/, "")

// ── Look & feel ─────────────────────────────────────────────────────────────
// "plain"  = no photo backgrounds anywhere (botanical cards, hides photo-only blocks)
// "photos" = photo backgrounds on the loader, envelope and closing section
const DISPLAY_MODE = "plain" as "photos" | "plain"

// ── Shared images ───────────────────────────────────────────────────────────
const BRAND = {
  monogram: "/monogram/monogram.png",
  coupleNameImage: "/Details/newcoupelNames.png", // couple-name lettering (loader, envelope)
  seal: "/monogram/seal.png", // envelope wax seal
  backgroundMusic: "/background_music/For The Rest Of My Life - Maher Zain - Electric Violin Cover - Barbara The Violinist (mp3cut.net).mp3",
}

// Couple photos reused across the site (gallery, loader, reminders, snap & share, closing)
// Couple photos in public/mobile-background-new — the loader / envelope / home hero photo marquee
const COUPLE_PHOTOS = Array.from({ length: 8 }, (_, i) => `/mobile-background-new/loveStory (${i + 1}).png`)

// ── Decorations ─────────────────────────────────────────────────────────────
// Change a path here to swap it on every section at once.
// To change ONE section only, override it there, e.g. decos: { ...SECTION_DECOS, footerVine: "" }
// These are drawn as tinted silhouettes (TintedDeco). The old eucalyptus set was removed from
// /public, so they're "" (hidden) — the full-color rose florals are FLORAL_CORNERS below.
// Put a path back here to bring a silhouette decoration back everywhere at once.
const DECOR = {
  cornerTopLeft: "",
  cornerTopRight: "",
  cornerBottomLeft: "",
  cornerBottomRight: "",
  headerOrnament: "", // small sprig above titles
  footerVine: "", // long vine at section ends
  sideLeft: "", // love story side sprigs
  sideRight: "",
}

// The four corners as one set
const CORNER_DECOS = {
  topLeft: DECOR.cornerTopLeft,
  topRight: DECOR.cornerTopRight,
  bottomLeft: DECOR.cornerBottomLeft,
  bottomRight: DECOR.cornerBottomRight,
}

// Full-color rose florals (public/deco/deco), shown as-is — love story + gallery corners
const FLORAL_CORNERS = {
  topLeft: "/deco/top-left-deco.png",
  topRight: "/deco/top-right-deco.png",
  bottomLeft: "/deco/bottom-left-deco.png",
  bottomRight: "/deco/bottom-right-deco.png",
}

// Default decoration set used by most sections (corners + ornament + vine)
const SECTION_DECOS = {
  ...CORNER_DECOS,
  headerOrnament: DECOR.headerOrnament,
  footerVine: DECOR.footerVine,
}

// Handy derived values — no need to edit
const COUPLE_LABEL = `${COUPLE.groomNickname} & ${COUPLE.brideNickname}`

/* ============================================================================
   SECTIONS — wording and per-section options. Values above are referenced here.
   ============================================================================ */

// Principal sponsors Google Apps Script — used by the main page and /inviteone
const SPONSORS_API = "https://script.google.com/macros/s/AKfycbxlbI2mDggKsesIRrvmEWOr5NMYbN5XqzYnDxSW1SctfnMGMA-NiFsCOmi73wKScEn07Q/exec"

export const siteConfig = {
  siteUrl: SITE_URL,
  linkPreviewImage: LINK_PREVIEW_IMAGE,
  couple: {
    ...COUPLE,
    monogram: BRAND.monogram,
    backgroundMusic: BRAND.backgroundMusic,
  },
  googleAPI:{
    messageForm: "https://docs.google.com/forms/d/e/1FAIpQLSfZic1VJ-ebQ0fZoVRD-zZkW3PelfXSRV9az8u-YMB9iKsKnQ/formResponse",   //done
    message: "https://script.google.com/macros/s/AKfycbw1JfbNFyayf6H-hyiMOsTbU1JI11qU7SHx3S3kNLYja8iLsjSuSpQkSsZAmbkWfvbl6g/exec",  //done
    guestList: "https://script.google.com/macros/s/AKfycbx1AfUJW8iq7bEvQywqfg1DXKC50dbDbEQtM3FSpOwDZzDBhXm9IFtThr4-jbHYa_-V_Q/exec",  //done
    guestRequest: "https://script.google.com/macros/s/AKfycbw8RXkorgBWclowWXQyEcy5tSltpz2fk611WmNS2GXABPYk9wOinAHsuZZgf0AzdnAsOw/exec",   //done
    entourage: "https://script.google.com/macros/s/AKfycbzHGQ1d0Qzp37kG-iBX6-0XdNbDo2RlgikE0PcG0Z4yjnR462MzrJK2wXcUIAz0PYvxVA/exec",  //done
    sponsors: SPONSORS_API,  //done 
    // Principal sponsors shown on /inviteone and /invitetwo (entourage section)
    sponsorsInviteOne: SPONSORS_API, // same sheet as sponsors above
    sponsorsInviteTwo: "https://script.google.com/macros/s/AKfycbxlbI2mDggKsesIRrvmEWOr5NMYbN5XqzYnDxSW1SctfnMGMA-NiFsCOmi73wKScEn07Q/exec",
////google share 
    googleShare: "https://docs.google.com/spreadsheets/d/1D1P7GEd3-MU0S0u6sx_P1KpZuoKArYL6XgwnLlRHtMs/edit?usp=sharing",
    videoMessageForm:
      "https://docs.google.com/forms/d/e/1FAIpQLSfeGlEl4CMXWefdvCw6AOPHFS1ROku_rs-Gbofa2LkVJ0sLGQ/viewform", 
  },
  wedding: {
    date: WEDDING_DATE,
    time: TIMES.ceremony,
    venue: CEREMONY_VENUE.name,
    tagline: "are getting married!!!!!",
    theme: "Olive Green & Gold",
    motif: "#556B2F, #D4AF37, #EADCC6, #FDF8EC",
  },
  // Opening "Save the Date" loading screen (components/loader/LoadingScreen.tsx).
  // Couple names, wedding date and ceremony details come from couple / wedding / ceremony above.
  loadingScreen: {
    // "photos" = sliding photo background + photo date cards
    // "plain"  = no images at all: soft solid background + plain date cards
    display: DISPLAY_MODE,
    // Plain mode look:
    //   "navy"    = deep navy & rose-gold invitation card with full-color floral corners
    //   "classic" = light botanical card (plainTheme / cornerDecos / plainInvite below)
    plainLayout: "navy" as "navy" | "classic",
    // Full-screen image behind the loading screen (file in /public; "" = none)
    backgroundImage: "/Details/backgroundimage.png",
    // Navy invitation card (plainLayout "navy"). Names, date, time and venue come from
    // couple / wedding / ceremony above. Any line left "" is hidden.
    navyInvite: {
      // Full-color corner florals (shown as-is, not tinted)
      decos: {
        topLeft: "/deco/top-left-deco.png",
        topRight: "/deco/top-right-deco.png",
        bottomLeft: "/deco/bottom-left-deco.png",
        bottomRight: "/deco/bottom-right-deco.png",
      },
      // true = velvet curtains are drawn open before the card appears
      curtains: true,
      // true = couple photos (loadingScreen.backgroundPhotos) slide past under a navy tint behind the
      // envelope and the home hero (the loading screen itself stays plain deep blue)
      backgroundMarquee: true,
      // Arabic line at the very top of the card, with its translation underneath ("" hides either)
      bismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      bismillahTranslation: "In the Name of Allah,\nThe Most Gracious, The Most Merciful",
      // Lines above the couple's names, top to bottom
      linesAbove: ["The Nikkah Of"],
      // Joins the two names
      joiner: "and",
      // true = spell the ceremony time out ("At two o'clock in the afternoon") — only for dateStyle "block"
      timeInWords: false,
      // Verse and its citation
      verse: "And We created you in pairs.",
      verseCitation: "Surah An-Naba 78:8",
      // "top" = above the names; "belowNames" = between the names and the venue/date
      versePosition: "belowNames" as "top" | "belowNames",
      // "block" = big Month · Day · Year, then time and venue
      // "line"  = venue name, then "December 13, 2026 | 10:00 AM"
      dateStyle: "line" as "block" | "line",
      // "arch" = ivory arched panel over loadingScreen.backgroundImage (olive text, gold ornaments)
      // "navy" = light text straight on the dark sky
      cardStyle: "arch" as "navy" | "arch",
    },
    // Colors used when display is "plain"
    plainTheme: {
      background: "var(--color-welcome-bg)",
      text: "var(--color-welcome-text)",
      accent: "var(--color-welcome-gold)",
    },
    // Sliding background photos (display: "photos"); files live in /public
    backgroundPhotos: COUPLE_PHOTOS,
    headline: "Save the Date",
    // {days} is replaced with the number of days left before wedding.date
    countdownText: "{days} more days to go",
    countdownOneDayText: "1 more day to go",
    countdownTodayText: "Today is the day",
    countdownPastText: "Thank you for celebrating with us",
    coupleNameImage: BRAND.coupleNameImage,
    // Shown in the three date cards (Month / Day / Year), left to right (display: "photos")
    photos: [
      "/frontboxes/couple (1).webp",
      "/frontboxes/couple (2).webp",
      "/frontboxes/couple (3).webp",
    ],
    dateLabels: ["Month", "Day", "Year"],
    // Polaroids that rise out of the envelope next to the invitation card (components/loader/Hero.tsx).
    // Shown in both "plain" and "photos" display. Two photos = one each side; [] = no envelope photos in plain mode.
    envelopePhotos: [] as string[],
    // Plain mode invitation card — classic invitation wording around the couple's names ("" to hide a line)
    plainInvite: {
      ornament: DECOR.headerOrnament,
      lineAbove: "Together with their families",
      lineBelow: "request the honour of your presence",
    },
    // false = the opening page shows only the verse, names and date (no time, venue or countdown)
    showCeremonyDetails: true,
    eyebrow: "You are invited",
    // Line on the card inside the envelope, between the date and the names (components/loader/Hero.tsx)
    letterMessage: "With gratitude to Allah, we joyfully invite you to witness the Nikkah of",
    message: "In shaa Allah, see you there",
    // Rotates under the progress bar while the invitation loads
    statusMessages: [
      "Gathering our favorite moments",
      "Setting the table for you",
      "Crafting your invitation experience",
    ],
    durationMs: 11000, // the navy card plays a curtain opening first, so it needs a little longer
    // Invitation envelope (components/loader/Hero.tsx) — shares display + photos with loader above
    hintText: "Tap the Seal to Open",
    enterButtonText: "View the Invitation",
    sealImage: BRAND.seal,
    cornerDecos: { ...CORNER_DECOS },
  },
  // Couple video (components/sections/couple-video.tsx)
  coupleVideo: {
    title: "A Glimpse of Our Love",
    script: "Our Journey Together",
    subtitle: "Watch the journey that brought our hearts together",
    closingNote: "A glimpse into the moments that made our hearts one",
    // Your own video file in /public (e.g. "/video/our-story.mp4"). When set it is
    // played directly with no YouTube at all; leave "" to use youtubeId instead.
    videoSrc: "",
    // YouTube video ID — the part after "watch?v=" (or after "youtu.be/")
    youtubeId: "ojZmsQf8_AM",
    // Cover image shown before the video plays
    thumbnail: "/desktop-background/couples (2).jpeg",
    thumbnailAlt: `${COUPLE_LABEL} — video cover`,
    playLabel: "Play our video",
  },
  // Love story section (components/sections/love-story.tsx): plain ivory background, corner florals
  loveStory: {
    title: "Our Love Story",
    subtitle: "two paths, one love",
    // One block per paragraph; label → small gold caps above it ("" hides it)
    chapters: [
      {
        label: "Where It Began",
        text: "Five years ago, our story began at work, from simple conversations to little dates that turned into love.",
      },
      {
        label: "Through It All",
        text: "Our journey wasn't always easy. We faced distance, challenges, and differences in faith and traditions. But through it all, we chose to understand, accept, and love each other.",
      },
      {
        label: "Our Forever",
        text: "After five years of choosing one another, with Allah's blessings, we are finally beginning our forever together.",
      },
    ],
    // Closing line, set large in script
    highlight: "Two different paths, one love, one beautiful forever.",
    // Verse under the closing line (Arabic + translation + citation; "" hides a line)
    closingArabic: "هُنَّ لِبَاسٌ لَّكُمْ وَأَنتُمْ لِبَاسٌ لَّهُنَّ",
    closingQuote: "They are clothing for you and you are clothing for them.",
    closingCitation: "Surah Al-Baqarah 2:187",
    // Full-color florals in the four corners of the section
    cornerDecos: { ...FLORAL_CORNERS },
  },
  // Gallery section (components/sections/gallery.tsx)
  // Verse & invitation section below the love story (components/sections/countdown.tsx, id "countdown")
  invitationVerse: {
    verse: "He has made everything beautiful in His time.",
    citation: "Ecclesiastes 3:11",
    // Each entry is one line of the invitation message
    message: [
      "With hearts full of gratitude to God,",
      "we joyfully invite you to celebrate",
      "the beginning of our forever as we unite",
      "in love and faith through His grace.",
    ],
    // Sign-off under the message; names come from couple.groomNickname / brideNickname
    signOffJoiner: "&",
  },
  gallery: {
    eyebrow: "Our Moments",
    title: "Gallery",
    subtitle: "our favorite moments",
    description:
      "From our first chapter to this beautiful season of commitment — every moment has been a testament to love, faith, and grace.",
    footnote:
      "More pictures will be added as we gather the rest of our favorite moments. Please check back — this gallery is still growing.",
    // Tinted decos for the /gallery page
    decos: { ...SECTION_DECOS },
    // Full-color florals in the four corners of the home-page gallery section
    cornerDecos: { ...FLORAL_CORNERS },
    // Photos from public/mobile-background-new (portrait).
    // text → caption used as the photo's description (leave "" for none)
    images: [
      { image: "/mobile-background-new/loveStory (1).png", text: "" },
      { image: "/mobile-background-new/loveStory (2).png", text: "" },
      { image: "/mobile-background-new/loveStory (3).png", text: "" },
      { image: "/mobile-background-new/loveStory (4).png", text: "" },
      { image: "/mobile-background-new/loveStory (5).png", text: "" },
      { image: "/mobile-background-new/loveStory (6).png", text: "" },
      { image: "/mobile-background-new/loveStory (7).png", text: "" },
      { image: "/mobile-background-new/loveStory (8).png", text: "" },
    ],
  },
  // Event details section (components/sections/details.tsx)
  // Venue names, addresses, dates, times, maps and venue photos come from ceremony / reception below.
  // In reminder text, {guestsTime} and {ceremonyTime} are replaced from ceremony below.
  eventDetails: {
    eyebrow: "Our Celebration",
    title: "Event Details",
    subtitle: "our special day",
    description: "Everything you need to know about our special day.",
    decos: { ...SECTION_DECOS },
    // Full-color florals in the four corners of the section
    cornerDecos: { ...FLORAL_CORNERS },
    // Venue cards layout:
    //   "separate" = one card each for ceremony and reception (uses ceremony / reception below)
    //   "combined" = ONE card for both — use when ceremony and reception share a venue.
    //                Venue name, address, map and photos come from CEREMONY_VENUE;
    //                the card lists both times (ceremony.time + reception.time).
    // Set in QUICK SETUP → VENUE_CARDS
    venues: VENUE_CARDS,
    labels: {
      arrival: "Arrival",
      at: "At",
      scanForDirections: "Scan for directions",
      getDirections: "Get Directions",
      copyAddress: "Copy Address",
      copied: "Copied!",
    },
    // Cards, colors, images and which groups show → QUICK SETUP → ATTIRE
    attire: {
      title: "Attire Guidelines",
      description: "Kindly dress modestly and elegantly in the colors of our day: olive green, champagne gold, beige and cream.",
      // Shown above a card's palette
      paletteTitle: "Dress Code Palette",
      paletteSubtitle: "", // script line under the palette title — "" hides it
      colorGuideTitle: "Color Guide",
      colorGuideNote: "Please refer to the exact colors below for dress code.",
      // Order and visibility come from ATTIRE.show (skips blanks, typos and repeats)
      groups: ATTIRE.show
        .filter((id, i, list) => ["entourage", "family", "sponsors", "guests"].includes(id) && list.indexOf(id) === i)
        .map((id) => ({ id, ...ATTIRE[id] })),
      // Shared dress code palette (used by the "Strictly Formal" reminder)
      palette: DRESS_CODE_PALETTE,
    },
    reminders: {
      title: "Gentle Reminders",
      description: "A few thoughtful notes so we can all honor this blessed day together.",
      images: COUPLE_PHOTOS.slice(0, 4),
      // showPalette: shows the dress code palette after the first paragraph
      items: [
        {
          title: "Arrival",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Kindly arrive by {guestsTime} so you can find your seat and settle in before the Nikkah begins at {ceremonyTime}.",
          ],
        },
        {
          title: "During the Nikkah",
          variant: "accent" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "The Nikkah is a sacred moment. We kindly ask everyone to remain seated, keep conversations to a minimum, and set phones to silent during the khutbah and the exchange of vows.",
          ],
        },
        {
          title: "Modest Attire",
          variant: "accent" as "accent" | "soft",
          showPalette: true,
          paragraphs: [
            "Kindly dress modestly in formal attire, in our olive green, champagne gold, beige and cream palette.",
            "Loose, full-coverage outfits are appreciated, and sisters are welcome to bring a light scarf or shawl. Please avoid casual clothes and all-white outfits.",
          ],
        },
        {
          title: "Unplugged Nikkah",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "We kindly ask that photos during the Nikkah be kept to a minimum and that our official photographers are not blocked. Please be present with us — professional photos will be shared after the event.",
          ],
        },
        {
          title: "Walimah",
          variant: "accent" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Please stay and join us for the walimah, our wedding feast, after the Nikkah. All food served is halal, and our celebration is alcohol-free.",
          ],
        },
        {
          title: "Adults-Only Celebration",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "As much as we love your little ones, we kindly request that our celebration be for adults only. Thank you for your understanding.",
          ],
        },
        {
          title: "Parking",
          variant: "soft" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Parking for both cars and motorcycles is available inside the venue.",
          ],
        },
        {
          title: "Your Du’a (prayer)",
          variant: "accent" as "accent" | "soft",
          showPalette: false,
          paragraphs: [
            "Your presence is a blessing, and your du’a (prayer) for our marriage is the most beautiful gift you can give us. Jazakum Allahu khayran.",
          ],
        },
      ],
    },
  },
  // Wedding day timeline (components/sections/wedding-timeline.tsx)
  weddingTimeline: {
    kicker: "Join us as we begin our journey together, in shaa Allah",
    title: "Nikkah Timeline",
    subtitle: "our blessed day",
    description:
      "From the first arrival to the closing du’a (prayer), here is how we will spend this blessed day together.",
    quote: "", // "" hides the quote + citation under the timeline
    quoteCitation: "",
    // Optional corner decorations — leave "" to hide
    decos: {
      topLeft: "",
      topRight: "",
      bottomLeft: "",
      bottomRight: "",
    },
    // Each event — shown top to bottom in this order (move a block to reorder):
    //   show:     true = display on the site, false = hide it (still kept here to edit later)
    //   time:     shown above the title; TIMES.* come from QUICK SETUP, others are typed in, e.g. "4:00 PM"
    //   location: text shown under the title; {ceremony} / {reception} are replaced
    //             with ceremony.location / reception.location ("" to hide)
    //   image:    line-art illustration from /public/weddingtimeline; "" to use the icon instead
    //   icon:     line icon drawn in the section (used when image is "") —
    //             "arch" | "crescent" | "camera" | "teacup" | "lantern" | "feast" | "departure"
    //             (also "arrival" | "rings" | "cocktail" | "fireworks" | "dance")
    //   description: optional extra line ("" to hide)
    events: [
      {
        show: true,
        time: TIMES.guestArrival,
        title: "Arrival of Guests",
        description: "Welcome and seating of guests",
        location: "",
        image: "/weddingtimeline/arrivalimage.png",
        icon: "arch" as TimelineIconName,
      },
      {
        show: true,
        time: TIMES.ceremony,
        title: "Nikah Ceremony",
        description: "Khutbah, Ijab & Qabul, and signing of the Nikah Contract",
        location: "",
        image: "/weddingtimeline/WeddingCeremony.png",
        icon: "crescent" as TimelineIconName,
      },
      {
        show: true,
        time: "11:30 AM",
        title: "Photo Session",
        description: "Family portraits and group photographs",
        location: "",
        image: "/weddingtimeline/PhotoSession.png",
        icon: "camera" as TimelineIconName,
      },
      {
        show: false,
        time: "11:30 AM",
        title: "Refreshments",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/CockTailHour.png",
        icon: "teacup" as TimelineIconName,
      },
      {
        show: true,
        time: TIMES.reception,
        title: "Walimah Reception",
        description: "Wedding celebration and luncheon",
        location: "",
        image: "/weddingtimeline/reception welcom.png",
        icon: "lantern" as TimelineIconName,
      },
      {
        show: false,
        time: "12:30 PM",
        title: "Walimah Feast",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/DinnerService.png",
        icon: "feast" as TimelineIconName,
      },
      {
        show: false,
        time: "2:00 PM",
        title: "Closing Du’a (prayer) & Farewell",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/SendOff.png",
        icon: "departure" as TimelineIconName,
      },
      // Spare illustrations — set show: true and a time to use them
      {
        show: false,
        time: "",
        title: "Assembly",
        description: "",
        location: "{ceremony}",
        image: "/weddingtimeline/assemble.png",
        icon: "arch" as TimelineIconName,
      },
      {
        show: false,
        time: "",
        title: "Cake Cutting",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/cakecutting.png",
        icon: "fireworks" as TimelineIconName,
      },
      {
        show: false,
        time: "",
        title: "First Dance",
        description: "",
        location: "{reception}",
        image: "/weddingtimeline/dance.png",
        icon: "dance" as TimelineIconName,
      },
    ],
  },
  // Wedding entourage (components/sections/entourage.tsx)
  // Names and roles come from the Google Sheet (googleAPI.entourage); couple names from couple above.
  entourage: {
    eyebrow: "Our Beloved Families & Friends",
    title: "Nikkah Entourage",
    subtitle: "witnesses to our union",
    description: "Honoring our families, sponsors and loved ones who stand with us as we complete half of our deen",
    coupleKicker: "United in Nikkah",
    coupleLine: "By the will of Allah, our forever begins",
    coupleHeading: "The Couple",
    groomRole: "Groom",
    brideRole: "Bride",
    loadingText: "Loading entourage...",
    retryingText: "Still gathering the wedding party. Trying again...",
    errorText: "Unable to load entourage",
    retryText: "Try again",
    // Full-color florals in the four corners of the section (leave a path "" to hide it)
    cornerDecos: { ...FLORAL_CORNERS },
    // Rename any heading shown in the entourage card: "Heading as shown": "Your text"
    headingLabels: {
      "Parents of the Groom": "Parents of the Groom",
      "Parents of the Bride": "Parents of the Bride",
      "Principal Sponsors": "Principal Sponsors",
      "Peer Sponsors": "Peer Sponsors",
      "Family of the Groom": "Siblings of the Groom",
      "Family of the Bride": "Sibling of the Bride",
      "Man of Honor": "Man of Honor",
      "Best Man": "Best Man",
      "Maid of Honor": "Maid of Honor",
      "Matron of Honor": "Matron of Honor",
      "Little Groom": "Little Groom",
      "Little Bride": "Little Bride",
      "Flower Girls": "Flower Girls",
      Groomsmen: "Groomsmen",
      Bridesmaids: "Bridesmaids",
      "To light our path": "To light our path",
      "To Cloth us as one": "To Cloth us as one",
      "To bind us together": "To bind us together",
      // Nikkah wording for headings carried over from the sheet
      "Officiating Minister": "Officiating Imam",
      "OFFICIATING MINISTER": "Officiating Imam",
      "Bible Bearer": "Qur’an Bearer",
    } as Record<string, string>,
  },
  // RSVP / guest list (components/sections/guest-list.tsx) — card, search, RSVP form and all modals.
  // Placeholders in curly braces are filled in automatically: {name}, {count}, {n}.
  // The RSVP deadline itself comes from details.rsvp.deadline.
  rsvp: {
    headerOrnament: DECOR.headerOrnament, // "" to hide
    title: "RSVP",
    script: "will you join us",
    intro: "Kindly confirm your attendance so we may prepare a place for you at our Nikkah and walimah, in shaa Allah.",
    deadlineLabel: "RSVP Deadline",
    openButton: "Tap here to respond",
    search: {
      title: "RSVP",
      script: "Find your Name",
      placeholder: "Begin with your first name",
      loading: "Preparing the guest list. We'll keep trying until names appear.",
      refine: "Keep typing to refine results",
      notFoundTitle: "Not finding your name?",
      notFoundText: "We'd love to have you with us, in shaa Allah. Send a request to join our celebration.",
      requestButton: "Request to Join",
    },
    invite: {
      title: "You are Invited",
      scriptFallback: "to our nikkah",
      greeting: "Assalamu alaikum, {name}! You are warmly invited to our Nikkah and walimah.",
      seats: "We've reserved {count} for you.",
      seatSingular: "seat",
      seatPlural: "seats",
    },
    responded: {
      title: "Thank You for Responding!",
      text: "We've received your RSVP. Jazakum Allahu khayran — we look forward to celebrating with you, in shaa Allah!",
      attending: "You're Attending!",
      declined: "Unable to Attend",
      guestCountLabel: "Number of Guests",
      closeButton: "Close",
    },
    form: {
      attendLabel: "Can you attend? *",
      yes: "Yes, in shaa Allah",
      no: "Unable to Attend",
      companionsLabel: "Who's Coming With You?",
      companionsHint: "Please provide names and relationships for your {count} additional {guests}",
      guestSingular: "guest",
      guestPlural: "guests",
      companionTitle: "Guest {n}",
      companionNameLabel: "Full Name",
      companionNamePlaceholder: "Name of guest {n}",
      relationshipLabel: "Relationship with {name}",
      relationshipFallbackName: "Primary Guest",
      relationshipPlaceholder: "e.g., Spouse, Child, Parent, Relative",
      // One-tap relationship choices shown under the relationship field
      relationshipOptions: ["Spouse", "Child", "Parent", "Sibling", "Relative", "Friend"],
      companionProgress: "Guest {n} of {total}",
      companionsAdded: "{done} of {total} added",
      prevButton: "Back",
      nextButton: "Next guest",
      phoneLabel: "Phone Number *",
      phonePlaceholder: "09XX XXX XXXX",
      phoneNote: "For wedding updates only. Your number stays private and will never be shown to other guests.",
      submitting: "Submitting...",
      submit: "Submit RSVP",
    },
    phoneAlert: {
      title: "A phone number is needed",
      paragraphs: [
        "We ask for your number so we can reach you with important updates — seating, timing, or anything you may need on the day.",
        "Your number will not appear on this invitation, and it will not be shared with other guests. It is kept private and used only by us and our coordinators to take care of you.",
      ],
      button: "Add my number",
    },
    success: {
      title: "RSVP Confirmed",
      attending: "Alhamdulillah, we're delighted you'll be joining us — your seat is saved!",
      declined: "We'll miss you. Thank you for letting us know, and please keep us in your du’a (prayer).",
      neutral: "Jazakum Allahu khayran for your response!",
      messagePrompt:
        "Before you go, leave a du’a (prayer) for the couple — your words will be a cherished memory they can always look back on.",
      messageButton: "Leave a Du’a (prayer)",
      laterButton: "Maybe later — close",
    },
    request: {
      title: "Request",
      script: "to join us",
      greetingNamed: "Assalamu alaikum, {name} — would you like to join our celebration? Send a request!",
      greeting: "Would you like to join our celebration? Send a request!",
      optional: "(Optional)",
      nameLabel: "Full Name *",
      namePlaceholder: "Enter your full name",
      emailLabel: "Email Address",
      emailPlaceholder: "your.email@example.com",
      phoneLabel: "Phone Number",
      phonePlaceholder: "+63 912 345 6789",
      guestsLabel: "Number of Guests *",
      guestsPlaceholder: "How many guests?",
      messageLabel: "Message",
      messagePlaceholder: "Share why you'd like to join...",
      submitting: "Submitting...",
      submit: "Send Request",
      sentTitle: "Request Sent!",
      sentText: "We've received your request",
      sentSubtext: "We'll review it and get back to you soon",
      autoClose: "This will close automatically",
    },
    messages: {
      thankYou: "Jazakum Allahu khayran for your response!",
      requestSubmitted: "Request submitted! We'll review and get back to you.",
      loadFailed: "Failed to load guest list",
      selectAttendance: "Please select if you can attend",
      nameRequired: "Name is required",
      requestFailed: "Failed to submit request. Please try again.",
      submitFailed: "We couldn't save your RSVP. Please check your connection and try again.",
    },
  },
  // Messages wall (components/sections/message-wall-display.tsx)
  // Small decorations on each message card — leave "" to hide
  messageWall: {
    cardDecos: {
      topRight: DECOR.cornerTopRight, // sprig tucked in the card's top-right corner
      bottomLeft: "", // e.g. DECOR.cornerBottomLeft (sits behind the text — keep it subtle)
    },
  },
  // Book of guests (components/sections/book-of-guests.tsx) — confirmed guests come from the guest list API.
  bookOfGuests: {
    title: "Book of Guests",
    subtitle: "honored to have you",
    description:
      "Meet the beloved family and friends joining us, in shaa Allah — your presence makes this blessed day complete.",
    statsEyebrow: "Our Blessed Gathering",
    guestSingular: "Guest",
    guestPlural: "Guests",
    statsCaption: "Joining Our Nikkah",
    rsvpSingular: "RSVP",
    rsvpPlural: "RSVPs",
    partySingular: "Party",
    partyPlural: "Parties",
    thankYou: "Jazakum Allahu khayran for confirming your RSVP — your presence and du’a (prayer) mean the world to us.",
    updatedLabel: "Updated",
    refreshLabel: "Refresh guest counts",
    listEyebrow: "Joining Us",
    listDescription: "A glimpse of the beloved guests sharing this blessed day with us",
    vipLabel: "VIP",
    noTable: "No Table Yet",
    companionsLabel: "With Them",
    // Shown when a guest has more than 4 companions
    companionsMore: "+{count} more",
    companionsLess: "Show less",
    confirmedLabel: "Confirmed",
    emptyTitle: "Guest list updating",
    emptyText: "Confirmed guests will appear here as RSVPs come in.",
    // How many guest cards show at once (rotates every few seconds when there are more)
    cardsPerView: 4,
    // Full-color florals in the four corners of the section (leave a path "" to hide it)
    cornerDecos: { ...FLORAL_CORNERS },
  },
  // FAQ (components/sections/faq.tsx)
  // In answers you can use:
  //   {deadline}    → details.rsvp.deadline
  //   {coordinator} → details.rsvp.coordinator
  //   {contact}     → " at <phone>" when details.rsvp.phone is set (empty while "to be announced")
  //   [link text](#section-id) → a link that smoothly scrolls to that section
  //   A blank line (\n\n) starts a new paragraph; lines starting with "• " show as a bulleted list
  faq: {
    eyebrow: "A Few Notes",
    title: "Frequently Asked Questions",
    subtitle: "everything you need to know",
    description:
      "Helpful notes so you can simply arrive, witness our Nikkah, and celebrate this blessed day with us, in shaa Allah.",
    // Full-color florals in the four corners of the section (leave a path "" to hide it)
    cornerDecos: { ...FLORAL_CORNERS },
    // Answers: blank line = new paragraph, "• " = bullet, [label](#section) or [label](https://…) = link.
    // {deadline} {coordinator} {contact} {groom} {bride} are filled in automatically.
    // Kept in step with the Gentle Reminders in Event Details (eventDetails.reminders).
    items: [
      {
        question: "When and where is the Nikkah?",
        answer: `In shaa Allah, our Nikkah will be held on ${WEDDING_DAY}, ${WEDDING_DATE}, at ${TIMES.ceremony}, at ${CEREMONY_VENUE.name}, ${CEREMONY_VENUE.address}. The walimah (wedding feast) follows at the same venue. [Open in Google Maps](${CEREMONY_VENUE.map})`,
      },
      {
        question: "What time should I arrive?",
        answer: `Kindly arrive by ${TIMES.guestArrival} so you can find your seat and settle in before the Nikkah begins at ${TIMES.ceremony}.`,
      },
      {
        question: "What happens during the Nikkah?",
        answer:
          "The Nikkah is a short and sacred ceremony:\n\n• A khutbah (marriage sermon)\n• The ijab and qabul — the offer and acceptance — in the presence of the wali and witnesses\n• The signing of the Nikkah contract\n• A closing du\u2019a (prayer) for the couple\n\nWe kindly ask everyone to remain seated, keep conversations to a minimum, and set phones to silent during the ceremony.",
      },
      {
        question: "I am not Muslim. Am I welcome to attend?",
        answer:
          "Absolutely! Our families and friends of every faith are warmly welcome. There is nothing special you need to do — simply dress modestly and join us in witnessing and celebrating this blessed day.",
      },
      {
        question: "What is the dress code?",
        answer:
          "Modest formal attire in our olive green, champagne gold, beige and cream palette. Please see the [attire guide](#attire) in Event Details.\n\n• Women: long dresses, abayas, or formal dresses with appropriate coverage\n• Men: suits or traditional formal attire\n• Principal Sponsors: Filipiniana and Barong\n\nKindly avoid casual clothes and all-white outfits.",
      },
      {
        question: "Do women need to cover their hair?",
        answer:
          "It is not required for guests, but sisters are welcome to bring a light scarf or shawl, especially during the Nikkah. Loose, full-coverage outfits are always appreciated.",
      },
      {
        question: "Is the food halal? Will alcohol be served?",
        answer:
          "All food served at the walimah is halal, and our celebration is alcohol-free. We kindly ask that no alcoholic drinks be brought to the venue.",
      },
      {
        question: "How do I RSVP?",
        answer:
          "Please RSVP using the [guest list](#guest-list) on this invitation: search for your name and confirm your attendance.\n\nPlease respond by {deadline}.\n\nIf you have questions, please contact {coordinator}{contact}.",
      },
      {
        question: 'Do we really need to RSVP? We already said "Yes" to the couple.',
        answer:
          "Yes, please. We need your formal RSVP to finalize the headcount for the walimah and the seating arrangement.",
      },
      {
        question: "May we choose our own seats at the walimah?",
        answer:
          "We kindly ask that you take the place reserved for you. Each seat has been arranged with care so everyone may be comfortably seated with family and friends.",
      },
      {
        question: 'Can I bring a "Plus One"?',
        answer:
          "As much as we would love to accommodate all our friends and family, our guest list is limited. Kindly understand that this celebration is strictly by invitation only.",
      },
      {
        question: "Can I bring my child?",
        answer:
          "As much as we love your little ones, we kindly request that our celebration be for adults only. Thank you for your understanding.",
      },
      {
        question:
          'I said "No" to the RSVP but my plans changed — I can attend now. What should I do?',
        answer:
          "Please check with us first, as we have a strict guest list. If seats become available, we will let you know as soon as possible. Kindly do not attend unannounced, as we may not have a seat for you.",
      },
      {
        question: "What if I RSVP'd but can no longer attend?",
        answer:
          "We understand that some things are beyond our control. Please let us know as soon as possible so we can reallocate your seat, and do keep us in your du\u2019a (prayer).",
      },
      {
        question: "Is there parking available?",
        answer:
          "Yes, parking for both cars and motorcycles is available inside the venue. Please arrive a little early so you have time to park comfortably.",
      },
      {
        question: "Will the Nikkah be unplugged?",
        answer:
          "Mostly. We kindly ask that photos during the Nikkah be kept to a minimum and that our official photographers are not blocked. Please be present with us — professional photos will be shared after the event.",
      },
      {
        question: "Can I take photos or videos during the walimah?",
        answer:
          "Yes! We would love for you to capture the joy of the walimah and share it with us.",
      },
      {
        question: "What if I have dietary restrictions or allergies?",
        answer:
          "Please let us know about any dietary restrictions or allergies when you RSVP, so we can make sure everyone enjoys the feast comfortably.",
      },
      {
        question: "What gift should we give?",
        answer:
          "Your presence and your du\u2019a (prayer) are the greatest gifts of all. If you wish to give, please see our [gift guide](#registry).",
      },
      {
        question: "When would it be most thoughtful to take our leave?",
        answer:
          "It would mean so much if you could stay with us until the closing du\u2019a (prayer) at the end of the program.",
      },
      {
        question: "How can I help make the day special?",
        answer:
          "• Make du\u2019a (prayer) for us, that Allah blesses our marriage with love, mercy and barakah.\n• RSVP as soon as your schedule is cleared.\n• Dress modestly according to the attire guide and color palette.\n• Arrive on time.\n• Follow the seating arrangement at the walimah.\n• Stay with us until the closing du\u2019a (prayer).",
      },
    ],
  },
  // Gift guide (components/sections/registry.tsx). The signature uses couple.groomNickname / brideNickname.
  registry: {
    eyebrow: "A Token of Love",
    title: "Gift Guide",
    subtitle: "with gratitude",
    description: "Your presence and your du’a (prayer) on our wedding day are the greatest gifts of all.",
    paragraphs: [
      "Having you with us on our wedding day is already a precious blessing, Alhamdulillah. If you wish to give, we humbly prefer a love gift rather than material presents. Your du’a (prayer), kindness, and generosity mean so much to us as we begin this new chapter together, by the will of Allah.",
    ],
    thankYou: "", // "" hides the line
    signOff: "With love and du’a (prayer),",
    signature: "{groom} & {bride}", // Ameer & Mylene — keep groom first, same as every other section
    // Colors — any CSS color or a palette token from app/globals.css (e.g. "var(--color-motif-accent)")
    colors: {
      title: "var(--color-welcome-navy)",                                              // "Gift Guide", account names
      script: "var(--color-welcome-heading)",                                          // drop cap, couple signature
      eyebrow: "var(--color-welcome-heading)",                                         // small caps labels, icons
      body: "var(--color-welcome-text)",                                               // paragraphs
      soft: "color-mix(in srgb, var(--color-welcome-text) 75%, white)",                // "With joyful hearts," and secondary text
      card: "#FFFFFF",                                                                 // letter card
      cardEdge: "color-mix(in srgb, var(--color-motif-medium) 65%, transparent)",      // letter card border
      accountCard: "color-mix(in srgb, var(--color-motif-medium) 12%, white)",         // e-gift account card
      button: "linear-gradient(180deg, var(--color-welcome-heading) 0%, color-mix(in srgb, var(--color-welcome-heading) 72%, var(--color-welcome-navy)) 100%)", // gift seal, selected tab, Save QR
      line: "var(--color-motif-yellow)",                                               // sage dividers
      glow: "color-mix(in srgb, var(--color-motif-medium) 30%, transparent)",          // tab track / borders
      background: "var(--color-motif-cream)",                                          // section background
    },
    // E-gift accounts — optional, as many as you like.
    //   showAccounts: false hides the whole block
    //   show:  false hides one account
    //   qr:    "/QR/BPI.png" to show a QR image, or "" when you have no QR (card shows name + number only).
    //          Guests can tap the QR to enlarge it and save it with the "Save QR" button.
    //   accountNumber: shown under the name (display only)
    //   With 2+ visible accounts, guests switch between them with a toggle; each shows its QR and a "Save QR" button
    showAccounts: true,
    accountsTitle: "",
    accountsNote: "",
    // Short text beside the QR (left of the QR panel, below the couple names)
    qrText: "Should you wish to send a gift, simply scan this QR code. May Allah bless you for your generosity.",
    saveQrLabel: "Save QR",
    scanLabel: "Tap to enlarge", // caption under the QR
    zoomNote: "Scan with your banking or e-wallet app, or save it and upload from your gallery.",
    accounts: [
      { show: true, label: "BPI", accountName: "Mylene", accountNumber: "********266", qr: "/QR/BPI.png" },
      { show: true, label: "MariBank", accountName: "Mylene Jechille", accountNumber: "****7386", qr: "/QR/Maribank.png" },
    ] as { show: boolean; label: string; accountName: string; accountNumber: string; qr: string }[],
    // Closing at the bottom of the card ("" hides a line)
    closing: {
      arabic: "جَزَاكُمُ اللَّهُ خَيْرًا",
      title: "Jazakum Allahu Khairan",
      text: "May Allah reward you with goodness.",
    },
    // Leave any path "" to hide that decoration
    decos: { ...SECTION_DECOS },
  },
  // Table finder page (/table — components/table-finder.tsx)
  tableFinder: {
    decos: { ...CORNER_DECOS },
    // "Find Your Table" QR card on the dashboard (components/table-finder-qr-card.tsx)
    // {couple} → "Groom & Bride" nicknames. "" hides a line or image.
    qrCard: {
      coupleNameImage: BRAND.coupleNameImage, // unused: the card sets the names in type like the loader
      coupleImage: "/Details/Cheerful Pastel Wedding Party Cutout.pngg", // couple illustration beside the text
      eyebrow: "The wedding of",
      title: "Find Your Table",
      script: "please be seated",
      description:
        "Place this code at the entrance. Guests scan it, search their name, and go straight to their table.",
      scanLabel: "Scan to find your table",
      buttonText: "Download QR",
      downloadNote: "Saves a print-ready PNG for signs and table cards.",
      previewText: "Preview seating page",
    },
  },
  // Entourage proposal pages (components/proposal-page.tsx)
  // Text placeholders: {name} = invitee, {role} = role title, {groom} / {bride} = nicknames.
  // Each invitation type has its own wording:
  //   party      → Best Man, Maid/Matron of Honor, Bridesmaid, Groomsman, Little Bride, secondary sponsors
  //   sponsor    → Principal Sponsors (Ninong / Ninang)
  //   bearer     → Ring / Coin / Bible / Herald Bearer
  //   flowerGirl → Flower Girl
  // A list ([...]) shows one paragraph per line; "" or [] hides that part.
  proposal: {
    // Full-color rose florals: the four screen corners, plus small ones on the card's bottom corners
    decos: { ...FLORAL_CORNERS },
    coupleNameImage: BRAND.coupleNameImage, // unused: names are set in type like the loader
    coupleImage: "/Details/Cheerful Pastel Wedding Party Cutout.png", // couple illustration above the question
    ornament: BRAND.seal, // wax seal at the top of the card (shown in full color); "" to hide
    // Sprigs on either side of the couple name (tinted); "" to hide one
    nameDecos: { left: "", right: "" },
    showDate: true, // big date under the couple name (Month / Day / Day-number / Time / Year)
    // Use "Maid of Honor" for unmarried, "Matron of Honor" for married
    honorAttendant: "Matron of Honor" as "Matron of Honor" | "Maid of Honor",
    roles: proposalRoleDefinitions,
    roleIdAliases: proposalRoleIdAliases,
    // Optional personal note per role id (e.g. { "best-man": "..." }); falls back to that type's askNote
    roleMessages: {} as Record<string, string>,
    // Shared labels used on every invitation.
    // Placeholders: {name} invitee, {role} role title, {groom} / {bride} nicknames.
    labels: {
      headerEyebrow: "A Personal Invitation",
      headline: "From Our Hearts to Yours", // big title under the eyebrow ("" hides it)
      placeEyebrow: "A Special Place", // lines under the couple illustration ("" hides them)
      placeTitle: "In Our Nikkah",
      headerScript: "written just for you",
      saveTheDate: "Save the Date",
      roleOffered: "Your role",
      preparedFor: "Written for",
      askQuestion: "Will you be our",
      registeredName: "Your name on our list",
      returnButton: "Return to Our Nikkah Page",
      saving: "Saving...",
      sending: "Sending...",
      sendButton: "Send My Response",
      goBack: "Go Back",
      saveError: "We couldn't save your response just now. Please try again.",
      // Shown when the invite link has no name and the guest says yes
      nameForm: {
        title: "You Said Yes",
        script: "our hearts are full",
        subheader: "Just one little thing",
        body: "We're so happy to have you with us! How would you like your name to appear on our invitation and guest list?",
        label: "Your Preferred Name",
        placeholder: "e.g. Tita Maria Clara / Mr. James Reyes",
        required: "Please type your preferred name so we can include you properly.",
        submit: "Confirm My Name",
        cancel: "Cancel",
      },
    },
    copy: {
      party: {
        greeting: "Assalamu alaikum,",
        intro: [
          "Before anything else, we wanted you to hear this from us personally.",
          "In shaa Allah, we're getting married! After everything we've shared so far, we're ready to begin the next chapter of our lives together through the blessed bond of Nikkah, and we couldn't wait to tell you.",
        ],
        body: [
          "This little letter isn't a general invitation. We wrote it with you in mind.",
          "When we pictured our Nikkah day, we thought about the people who have walked with us, laughed with us and cheered us on. Your name came up right away.",
          "We would love for you to be more than a guest. We'd love you right beside us, sharing the nerves, the joy, the happy tears and every memory we'll keep from that day.",
        ],
        askLead: "So, with all our hearts, we'd like to ask you",
        askNote:
          "We know it takes a bit of your time and effort, and we don't take that lightly. More than anything, we just want you there with us, celebrating this moment together.",
        yesButton: "Yes, I'd Love To!",
        noButton: "I Can't, But With Love",
        signOff: "With all our love,",
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "You just made our day",
          roleLine: "Standing with us as our {role}",
          body: [
            "Jazakallahu khayran, {name}. Knowing you'll be right beside us makes our Nikkah feel even more like us. We can't wait to celebrate, laugh, and make memories with you, in shaa Allah. We'll be in touch soon with all the little details!",
          ],
          signOff: "With love and du\u2019a (prayer),",
        },
        no: {
          title: "Thank You",
          script: "for telling us",
          subheader: "We completely understand",
          body: [
            "Thank you for taking the time to read our letter and think it over. There are truly no hard feelings. Whether you're beside us or making du\u2019a (prayer) for us from wherever you are, we're grateful to have you in our lives.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "with love",
          subheader: "Your reply has reached us",
          body: [
            "We hope you'll still celebrate with us in your own way. Your love and du\u2019a (prayer) mean the world to us.",
          ],
          signOff: "With love and warmest wishes,",
        },
      },
      sponsor: {
        greeting: "Assalamu alaikum,",
        intro: [
          "We wanted to share some happy news with you, and we wanted you to hear it from us first.",
          "In shaa Allah, we're getting married, and we're about to begin a new life together as husband and wife through the blessed bond of Nikkah.",
        ],
        body: [
          "This letter is not a general invitation. It's a personal request, written especially for you.",
          "As we prepare for this day, we keep thinking of the people we look up to. You have shown us, in ways you may not even realize, what a loving and faithful life looks like.",
          "To us, a {role} is more than a name in our program. It is someone whose wisdom we trust, whose du\u2019a (prayer) we hold dear, and whose example we hope to follow as we build our own home.",
        ],
        askLead: "With deep respect and sincerity, we'd like to ask you",
        askNote: "Having you stand with us, and having your du\u2019a (prayer) for our marriage, would mean more to us than we can say.",
        yesButton: "Yes, I'd Be Honored 🤍",
        noButton: "I Can't, But With Love",
        signOff: "With love and respect,",
        yes: {
          title: "You Said Yes",
          script: "thank you",
          subheader: "We are truly honored",
          roleLine: "Our {role}",
          body: [
            "Jazakallahu khayran, {name}, for accepting this role with such an open heart. Your guidance and du\u2019a (prayer) mean so much to us, and we're grateful to begin our marriage with you beside us. We'll reach out soon with the details.",
          ],
          signOff: "With love and heartfelt gratitude,",
        },
        no: {
          title: "Thank You",
          script: "for your kindness",
          subheader: "We completely understand and respect your decision",
          body: [
            "Thank you for reading our letter and giving our request your thought. There are no hard feelings at all. We're simply grateful for you, and we'd be happy to have your du\u2019a (prayer) in whatever way you can share it.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "with gratitude",
          subheader: "Your reply has reached us",
          body: [
            "Thank you for being part of our story. Your love and du\u2019a (prayer) mean the world to us.",
          ],
          signOff: "With love and warmest wishes,",
        },
      },
      bearer: {
        greeting: "Assalamu alaikum,",
        intro: [
          "Guess what? We have the happiest news, and we wanted to tell you first! 🤍",
          "In shaa Allah, {groom} & {bride} are getting married!",
        ],
        body: [
          "Our Nikkah is going to be a very special day, and it wouldn't feel complete without you there with us.",
        ],
        askLead: "So we have a super important question, just for you:",
        askNote: "You'd get to walk with us and carry something very precious for our Nikkah. We think you'd be amazing at it!",
        yesButton: "Yes, I'd Love To! 🤍",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "You're officially on our team!",
          roleLine: "Our {role}",
          body: [
            "We're so excited to have you as our {role}! We can't wait to see you walk in with us. You have a very special job, and we know you'll do great. See you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "No worries at all 😊",
          body: [
            "Thank you for thinking about being our {role}. You are special to us no matter what, and we'd love to celebrate with you either way.",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "thank you",
          subheader: "Thanks for letting us know",
          body: ["You are so special to us, and we can't wait to celebrate with you."],
          signOff: "With lots of love,",
        },
      },
      flowerGirl: {
        greeting: "Assalamu alaikum,",
        intro: [
          "Guess what? We have the happiest news, and we wanted to tell you first! 🤍",
          "In shaa Allah, {groom} & {bride} are getting married!",
        ],
        body: [
          "Our Nikkah celebration needs a little extra sweetness, lots of smiles, and a sprinkle of magic. We thought of you right away.",
        ],
        askLead: "And we have a very special role we'd love for you to have:",
        askNote: "You'd get to walk in before the bride and make our day even more beautiful. We think you'd be perfect!",
        yesButton: "Yes, I'd Love To! 🌸",
        noButton: "Maybe Next Time 🤍",
        signOff: "With lots of love,",
        yes: {
          title: "Yay!",
          script: "you said yes!",
          subheader: "We're so happy you'll be our Flower Girl!",
          roleLine: "Our {role}",
          body: [
            "We can't wait to see you walk in before the bride! Have fun, smile big, and enjoy every moment. See you on our big day! 🤍",
          ],
          signOff: "With lots of love,",
        },
        no: {
          title: "That's Okay!",
          script: "we understand",
          subheader: "No worries at all 😊",
          body: [
            "Thank you for thinking about being our Flower Girl. You are special to us no matter what, and we'd love to celebrate with you either way!",
          ],
        },
        sent: {
          title: "Response Sent",
          script: "thank you",
          subheader: "Thanks for letting us know",
          body: ["You are so special to us, and we can't wait to celebrate with you."],
          signOff: "With lots of love,",
        },
      },
    },
  },
  details: {
    rsvp: { ...RSVP },
  },
  contact: {
    bridePhone: "to be announced",
    groomPhone: "to be announced",
    email: "to be announced",
  },
  giftRegistry: {
    // QR_1:{
    // id: "BPI",
    // src: "/QR/BPI.png",
    // label: "BPI",
    // accountNumber: "KAMS : ***********569",
    // },
    // QR_2:{
    // id: "MariBank",
    // src: "/QR/MariBank.png",
    // label: "MariBank",
    // accountNumber: "****7672",
    // }
    // ,
    // QR_3:{
    // id: "Gcash",
    // src: "/QR/pleaseProvideQR.png",
    // label: "Gcash",
    // accountNumber: "to be announced",
    // }
  },
  // Built from QUICK SETUP — edit the values at the top of the file
  ceremony: {
    location: CEREMONY_VENUE.name,
    venue: CEREMONY_VENUE.address,
    map: CEREMONY_VENUE.map,
    date: WEDDING_DATE,
    day: WEDDING_DAY,
    time: TIMES.ceremony,
    entourageTime: TIMES.entourageCall,
    guestsTime: TIMES.guestArrival,
    image: CEREMONY_VENUE.photos,
  },
  reception: {
    location: RECEPTION_VENUE.name,
    venue: RECEPTION_VENUE.address,
    map: RECEPTION_VENUE.map,
    date: WEDDING_DATE,
    day: WEDDING_DAY,
    time: TIMES.reception,
    image: RECEPTION_VENUE.photos,
  },
  dressCode: {
    theme: "Whimsical Spring Minimalist",
    sponsors: {
      title: "Sponsors",
      ninang: {
        label: "Ninang",
        description: "Long gown in the shade of silver gray.",
        image: "/Details/Ninang.png",
        palette: ["#D8D3CD", "#C0C0C0", "#A9A9A9", "#969090", "#8C8686"],
      },
      ninong: {
        label: "Ninong",
        description: "Barong Tagalog and black slacks.",
        image: "/Details/Ninong.png",
        palette: ["#D0A386", "#E3C5B3", "#E4DCD1"],
      },
    },
    entourage: {
      title: "Entourage",
      bridesmaid: {
        label: "Bridesmaids",
        description: "Long gown that suits our color motif.",
        image: "/Details/bridesmaid.png",
        palette: ["#B4A3D4", "#C8A2C8"],
      },
      groomsmen: {
        label: "Groomsmen",
        description: "Long sleeve Barong Tagalog and black slacks.",
        image: "/Details/Groomsmen.png",
        palette: ["#D0A386", "#E3C5B3", "#E4DCD1"],
      },
    },
    guests: {
      title: "Guests",
      label: "Guests",
      description: "Casual attire: Whimsical Spring.",
      image: "/Details/guest.png",
      palette: ["#835643", "#C48C73", "#E3CAC5", "#CBAFA1", "#F2E9E2"],
    },
    paletteNote:
      "Our theme is Whimsical Spring Minimalist. Entourage: women, a flowy spring sage green dress, strictly floor length; gentlemen, a black and white suit, a white and gray suit, or sage green long sleeves with gray or brown pants — strictly no rubber shoes. Guests: casual attire, Whimsical Spring.",
    closing:
      "Thank you for helping us bring our wedding vision to life. We can't wait to celebrate with you!",
    note: "We kindly request our guests to dress in attire following our Whimsical Spring Minimalist palette.",
  },
  narratives: {
    ourStory: `Once upon a signature…

Our story began with a simple signature, one that slowly turned into something magical. He was my financial advisor, and I was there to sign documents. It was July 5, 2021, and we met at the Lobby of the building. Little did we know, that ordinary day would start a story neither of us expected.

I wasn't looking for anything, yet somehow, our connection grew in its own gentle, unexpected way. And then, on June 1, 2022, our story truly began—we became us. We found a love that feels like home.

Our journey wasn't rushed, but perfectly timed. We believe that God brought us together in His own way and season.

With hearts full of gratitude, we step into this new chapter hand in hand, trusting His plan and celebrating a love rooted in faith, patience, and grace.

Today, we choose each other- again and again- and we can't wait to celebrate this new chapter with the people we love most.`,
    groom: `The first time Mark saw Catherine, time seemed to slow down. It was an ordinary day that instantly became unforgettable: one smile, one hello, and suddenly his world had a new center. He didn't have the perfect words ready, but he knew he had met someone who felt like home.

Early conversations turned into late-night talks, sharing dreams, favorite meals, and whispered prayers for a future together. With every small adventure—coffee runs, long drives, quiet walks—Mark found himself choosing her over and over again. He loved how she laughed freely, how she listened with her whole heart, and how her faith steadied him.

There were seasons of distance and long workdays, but every reunion reminded him why he stayed patient: because Catherine was worth every mile and every minute apart. When he finally knelt to ask for her hand, it wasn't a question of "if," only "when can we start forever?"`,
    bride: `Catherine remembers the first time Mark said her name. It was gentle but sure, a kindness that made her feel both seen and safe. In that softness, she found a partner who met her with the same grace she prayed to give.

Mark's steadiness won her heart: the way he showed up, even when schedules were tight, and how he always found lightness in the small things. He celebrated her wins, held space for her worries, and never hesitated to choose "us" in every decision.

Now, as they prepare to say yes before God and the people they love most, Catherine is grateful for the patience, humor, and hope Mark brings to every day. She knows this next chapter is just the start of the love story they get to write together.`,
  },
  colors: {
    primary: "#87AE73",
    secondary: "#F5F5DC",
  },
  // Wedding playlist (components/sections/wedding-playlist.tsx). {couple} → "Groom & Bride" nicknames.
  playlist: {
    eyebrow: "Our Soundtrack",
    title: "Melodies of Our Journey",
    script: "from our hearts",
    subtitle: "The songs that have accompanied our journey together, Alhamdulillah",
    // Shown on the playlist card
    cardEyebrow: "Spotify Playlist",
    playlistName: `${COUPLE_LABEL} Nikkah`,
    cardNote: "Press play and listen along — every song holds a little piece of our story.",
    buttonText: "Open in Spotify",
    // Full-color florals in the four corners of the section (leave a path "" to hide it)
    cornerDecos: { ...FLORAL_CORNERS },
    embedUrl:
    //https://open.spotify.com/embed/playlist/5sT43YjdM8pJ3xtEkrxyEY?utm_source=generator&si=e5e64aa63fd04356
      "https://open.spotify.com/embed/playlist/6ft808LQg0IuXBcu0jaZBC?utm_source=generator&si=0f55045919a9473a",
    spotifyUrl: "https://open.spotify.com/playlist/6ft808LQg0IuXBcu0jaZBC",
  },
  // Closing "See you there!" section (components/sections/see-you-there.tsx).
  //   photos mode (loadingScreen.display "photos") → full-screen couple photo
  //   plain mode  (loadingScreen.display "plain")  → botanical card, no photo
  // {couple} → "Groom & Bride" nicknames.
  seeYouThere: {
    // Plain ivory card with corner florals (no photos)
    arabic: "إِنْ شَاءَ اللَّه", // "" hides it
    eyebrow: "In shaa Allah",
    titleLine1: "See you",
    titleLine2: "there!",
    script: "with love and du’a (prayer), {couple}",
    message: "We look forward to celebrating this blessed day with you. May Allah gather us in goodness.",
    // Full-color florals in the four corners of the section (leave a path "" to hide it)
    cornerDecos: { ...FLORAL_CORNERS },
  },
  // Footer (components/sections/footer.tsx).
  // {couple} → "Groom & Bride" nicknames, {year} → current year. Date comes from ceremony, deadline from details.rsvp.
  footer: {
    showMonogram: true, // couple.monogram, tinted to the motif
    dateLabel: "Nikkah Date",
    // Ceremony & reception at a glance (times and places come from ceremony / reception)
    summary: {
      show: true,
      ceremonyLabel: "Nikkah",
      receptionLabel: "Walimah",
    },
    noteTitle: "A Note From Us",
    // Typed out one after another
    quotes: [
      '"And He placed between you affection and mercy." – Surah Ar-Rum 30:21',
      "Welcome to our wedding website! Alhamdulillah, we have found a love that is a true blessing, and we thank Allah for writing the beautiful story of our journey together.",
      "Jazakum Allahu khayran for your love, du’a (prayer), and support. We can't wait to celebrate this blessed day with you, in shaa Allah!",
    ],
    rsvp: {
      show: true,
      title: "RSVP Deadline",
      label: "Please respond by",
      note: "Please confirm your attendance by this date.",
      button: "Tap here to respond",
      href: "#guest-list",
    },
    // Social links — replace each href with your own profile link.
    //   show: false hides one; platforms: facebook | instagram | tiktok | youtube | twitter | threads | messenger | email
    //   email: use "mailto:you@example.com"; messenger: use "https://m.me/yourpage"
    followTitle: "Follow Us",
    followNote: "Share your photos and tag us — we'd love to see the day through your eyes.",
    socials: [
      { show: true, platform: "facebook", href: "https://www.facebook.com" },
      { show: true, platform: "instagram", href: "https://www.instagram.com/" },
      { show: true, platform: "tiktok", href: "https://www.tiktok.com/" },
      { show: true, platform: "youtube", href: "https://www.youtube.com" },
      { show: true, platform: "twitter", href: "https://x.com/" },
      { show: false, platform: "threads", href: "https://www.threads.net/" },
      { show: false, platform: "messenger", href: "https://m.me/" },
      { show: false, platform: "email", href: "mailto:" },
    ] as {
      show: boolean
      platform: "facebook" | "instagram" | "tiktok" | "youtube" | "twitter" | "threads" | "messenger" | "email"
      href: string
    }[],
    quickLinksTitle: "Quick Links",
    links: [
      { label: "Home", href: "#home" },
      { label: "Gallery", href: "#gallery" },
      { label: "Event Details", href: "#details" },
      { label: "RSVP", href: "#guest-list" },
      { label: "Messages", href: "#messages" },
      { label: "FAQ", href: "#faq" },
    ],
    copyright: "© {year} {couple} — crafted with love, du’a (prayer), and gratitude.",
    tagline: "This celebration site was designed to share our story and joy with you.",
    credit: {
      show: true,
      developedBy: "Developed by",
      developerName: "Lance Valle",
      developerUrl: "https://lance28-beep.github.io/portfolio-website/",
      promoText: "Want a website like this? Visit",
      promoName: "Wedding Invitation Naga",
      promoUrl: "https://www.facebook.com/WeddingInvitationNaga",
    },
    // Full-color florals in the four corners of the section (leave a path "" to hide it)
    cornerDecos: { ...FLORAL_CORNERS },
  },
  // Snap & Share (components/sections/snap-share.tsx). {couple} → "Groom & Bride" nicknames.
  snapShare: {
    googleDriveLink:
      "https://drive.google.com/drive/folders/1qVjxLcmkcWEmoDRYv_cgFgCKiYMmcf6j?usp=sharing",
    albumQR: "/QR/AlbumQR.png",
    hashtag: HASHTAGS,
    instructions: "Please scan this QR code to upload the photos and videos you take during our walimah. Kindly keep photos to a minimum during the Nikkah itself — we would love to see your snaps afterwards!",
    title: "Snap and Share",
    subtitle: "Share your memories",
    description:
      "Help us remember the little moments of {couple}'s Nikkah and walimah — every smile, du\u2019a (prayer), and joyful laugh. Your photos and clips complete our story.",
    // "Our Favorite Moments" photo card — always hidden when loadingScreen.display is "plain"
    moments: {
      show: true,
      title: "Our Favorite Moments",
      caption: "Share your snapshots to be featured in our keepsake gallery.",
      // 3 photos: two squares on top, one wide photo below
      images: COUPLE_PHOTOS.slice(0, 3),
    },
    // Website QR card — lets guests share the invitation page
    website: {
      show: true,
      title: "Share Our Nikkah Website",
      description:
        "Spread the word about {couple}'s celebration. Share this QR code so friends and family can join us.",
      downloadButton: "Download QR",
      note: "Scan with any camera app to open the full invitation and schedule.",
    },
    hashtags: {
      show: true,
      title: "Our Nikkah Hashtags",
      copy: "Copy",
      copied: "Copied",
      copyAll: "Copy All",
      allCopied: "All Copied!",
    },
    social: {
      show: true,
      title: "Share on Social Media",
      description: "Help spread the word about {couple}'s Nikkah across your favorite platforms.",
      // Remove any you don't want: "instagram" | "facebook" | "tiktok" | "twitter"
      platforms: ["instagram", "facebook", "tiktok", "twitter"] as ("instagram" | "facebook" | "tiktok" | "twitter")[],
      shareText: "Celebrate {couple}'s Nikkah! Explore the details and share your special memories:",
    },
    // Shown only when googleDriveLink is set
    upload: {
      badge: "Upload Your Photos & Videos",
      scanNote: "Scan with your camera app",
      copyLink: "Copy Link",
      copied: "Copied!",
      downloadQr: "Download QR",
      uploadButton: "Upload Photos",
    },
    closing:
      "Jazakum Allahu khayran for helping make {couple}'s Nikkah memorable. Your photos, messages, and du\u2019a (prayer) create beautiful memories we will treasure for a lifetime.",
    closingTag: "Jazakum Allahu khayran for sharing the joy",
    // Qur'an verse panel at the bottom (Sahih International); photos cross-fade behind the verses
    verses: {
      show: true,
      eyebrow: "Words We Hold Dear",
      images: [
        "/mobile-background-new/loveStory (1).png",
        "/mobile-background-new/loveStory (2).png",
        "/mobile-background-new/loveStory (3).png",
        "/mobile-background-new/loveStory (4).png",
        "/mobile-background-new/loveStory (5).png",
        "/mobile-background-new/loveStory (6).png",
        "/mobile-background-new/loveStory (7).png",
        "/mobile-background-new/loveStory (8).png",
      ],
      quotes: [
        { text: "And of His signs is that He created for you from yourselves mates that you may find tranquility in them; and He placed between you affection and mercy.", reference: "Surah Ar-Rum 30:21" },
        { text: "They are clothing for you and you are clothing for them.", reference: "Surah Al-Baqarah 2:187" },
        { text: "And We created you in pairs.", reference: "Surah An-Naba 78:8" },
        { text: "Our Lord, grant us from among our wives and offspring comfort to our eyes and make us an example for the righteous.", reference: "Surah Al-Furqan 25:74" },
      ],
    },
  },
  accommodation: {
    coordinator: {
      name: RSVP.coordinator,
      phone: RSVP.phone,
    },
    hotels: [
      {
        name: "La Luna Resort",
        discount: "Offered 20% discount for early booking",
        facebook: "https://www.facebook.com/lalunabeachresortofficial",
      },
      {
        name: "GOSAM Beach Resort",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/profile.php?id=100083461714073",
      },
      {
        name: "Calicoan Villa",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/CalicoanVilla",
      },
      {
        name: "G Camp Beachfront",
        discount: "Offered 10% discount",
        facebook: "https://www.facebook.com/profile.php?id=100085772194096",
      },
      {
        name: "Punta Viajero Beach Resort",
        discount: "Offered 15% discount",
        phone: "0932 214 6408",
        facebook: "https://www.facebook.com/puntoviajeroresort",
      },
      { name: "Balay Sunset" },
      { name: "Balay Pacifico" },
      { name: "Casa Nala" },
      { name: "The Grey Inn" },
    ],
    carRentals: [
      {
        name: "Apex Car Rental Tacloban",
        facebook: "https://www.facebook.com/profile.php?id=61574882327115",
      },
      {
        name: "Cassey Wheels Car Rental",
        facebook: "https://www.facebook.com/search/top?q=casseywheels%20car%20rental",
      },
    ],
  },
}
