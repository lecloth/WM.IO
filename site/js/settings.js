// The studio's contact details and the switches for the ways to reach us: the ONE place to change them.
// Everything that shows or uses them reads from here (page 3's work slip and its hand-offs to WhatsApp, email and
// the phone; later the final room). Testing placeholders until Wajih gives the real ones.
export const settings = {
  email: 'hello@testing',
  whatsapp: '+216 00 000 000',
  phone: '+216 00 000 000',
  location: 'Tunis',

  // Sending from the page and booking a call slot need an outside service once the site is public.
  // Both are built; each stays OFF until it has a real endpoint. While off, both hand over to the visitor's own
  // email app with the slip filled in (nothing leaves the page).
  // When ON, the page posts the slip as JSON to `endpoint`, with a honeypot field and a rate limit (below).
  // The endpoint must repeat both guards on its side (length caps, a per-IP rate limit, drop any request whose
  // honeypot is filled): the browser's guards only stop casual abuse.
  sendFromPage: { on: false, endpoint: '' },
  booking: {
    on: false, endpoint: '',
    days: 5,                          // how many working days ahead to offer
    workdays: [1, 2, 3, 4, 5],        // Mon-Fri (0 = Sunday)
    times: ['10:00', '13:00', '16:00'],   // in the studio's own time
    studioUtcOffsetMin: 60,           // Tunis is UTC+1 all year; slots show in the visitor's own time
  },

  // every typed field is capped here (and again by the browser's maxlength), then safely encoded into the links
  limits: { name: 60, note: 500, url: 2000, sendsPer10Min: 3, minGapSec: 30 },
};

export default settings;
