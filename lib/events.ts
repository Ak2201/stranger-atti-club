export type Tier = {
  id: string;
  label: string;
  priceInr: number;
  description: string;
  capacity?: number;
  soldOut?: boolean;
  /** Optional bar/vendor credit included with this ticket. Only honoured if the event has couponEnabled = true. */
  couponInr?: number;
};

export type EventItem = {
  slug: string;
  name: string;
  tagline: string;
  date: string; // human-readable
  dateISO: string; // YYYY-MM-DD for sorting / past-vs-upcoming split
  /** Toggle redeemable bar/vendor credit feature on this event. */
  couponEnabled?: boolean;
  doors: string;
  closes: string;
  venue: string;
  area: string;
  city: string;
  capacity: number;
  spotsLeft: number;
  heroEmoji: string;
  accent: 'marigold' | 'crimson' | 'leaf';
  description: string;
  whatYouDo: string[];
  whatYouWont: string[];
  schedule: { time: string; block: string }[];
  faq: { q: string; a: string }[];
  dressCode: string;
  tiers: Tier[];
};

export const events: EventItem[] = [
  {
    slug: 'fake-sangeeth',
    name: 'Fake Sangeeth Night',
    tagline: 'A wedding for nobody. A dance floor for everyone.',
    date: 'Sat, May 24, 2026',
    dateISO: '2026-05-24',
    doors: '7:00 PM',
    closes: '11:00 PM',
    venue: '[Rooftop venue — TBD]',
    area: 'Nungambakkam',
    city: 'Chennai',
    capacity: 60,
    spotsLeft: 47,
    heroEmoji: '✺',
    accent: 'marigold',
    description:
      "We threw a sangeeth without a wedding. You come dressed for a wedding that isn't happening, learn a 3-minute Bollywood routine with 60 strangers, vote in a 'couple of the night' who only met that evening, and eat cake at the end. It is exactly as ridiculous as it sounds — and the most fun you'll have on a Saturday in Chennai this month.",
    whatYouDo: [
      "Wear something you've been waiting for an excuse to wear",
      'Learn a Bollywood routine in 30 minutes (so does everyone else)',
      'Eat, dance, take an embarrassing number of photos',
      'Probably leave with a few WhatsApp numbers — only if you want to',
    ],
    whatYouWont: [
      'Be made to network',
      'Be put on the spot',
      'Be left alone in a corner — the format prevents it',
      'Be photographed without your permission',
    ],
    schedule: [
      { time: '7:00 PM', block: 'Doors · name tags · mandap photos' },
      { time: '7:30 PM', block: 'Welcome · group photo · dance teach' },
      { time: '8:30 PM', block: 'Food · mocktails · table mingles' },
      { time: '9:00 PM', block: 'Couple of the Night game' },
      { time: '9:40 PM', block: 'Cake-cutting · open dance floor' },
      { time: '11:00 PM', block: 'Closing circle · we send you home glowing' },
    ],
    faq: [
      {
        q: 'Can I come alone?',
        a: 'Yes — most people do. The format is built for solo attendees.',
      },
      {
        q: 'Is this a dating event?',
        a: "No. It's a celebration. Connections happen, but pressure doesn't.",
      },
      {
        q: "What if I don't dance?",
        a: "You'll be in a room of 60 people who also can't dance. Within 30 minutes, none of you will care.",
      },
      {
        q: 'Refund policy?',
        a: 'Full refund up to 72 hours before the event. After that, transfer your ticket to a friend — message us and we update the name.',
      },
      {
        q: 'Is this safe?',
        a: 'Published code of conduct, trained vibe-watchers, a discreet help-word. We enforce, not just publish.',
      },
    ],
    dressCode:
      'Anything wedding-ish. Lehenga, sherwani, kurta, saree, suit, half-saree, a really good shirt. If stuck, message us — we help.',
    tiers: [
      {
        id: 'early',
        label: 'Early Bird',
        priceInr: 999,
        description: 'First 30 spots. Closes 14 days before the event.',
      },
      {
        id: 'regular',
        label: 'Regular',
        priceInr: 1299,
        description: 'Standard ticket.',
      },
      {
        id: 'pair',
        label: 'Bring-a-Stranger',
        priceInr: 1799,
        description: 'For two. Bring a friend, save ₹500.',
      },
    ],
  },
  {
    slug: 'glow-up-gala',
    name: 'Glow-Up Gala',
    tagline: "A party for the wins nobody else celebrated.",
    date: 'Sat, Jun 21, 2026',
    dateISO: '2026-06-21',
    doors: '7:00 PM',
    closes: '10:30 PM',
    venue: '[Cozy venue — TBD]',
    area: 'Adyar',
    city: 'Chennai',
    capacity: 40,
    spotsLeft: 40,
    heroEmoji: '✦',
    accent: 'crimson',
    description:
      'Bring one win you had this year — a new job, finished marathon, learned to cook, moved cities, quit smoking, anything. Everyone gets a 60-second open mic. The room cheers. Strangers vote a "win of the night." You leave certain that what you did mattered.',
    whatYouDo: [
      'Share a 60-second win on open mic',
      'Cheer 39 strangers through theirs',
      'Eat dessert and write thank-you notes',
      'Vote on the win of the night',
    ],
    whatYouWont: [
      'Be made to share if you change your mind',
      'Be ranked or judged',
      'Sit alone — every table mingles',
      'Be on social media unless you opt in',
    ],
    schedule: [
      { time: '7:00 PM', block: 'Doors · welcome · "what win are you bringing?"' },
      { time: '7:30 PM', block: 'Opening ritual · gratitude wall' },
      { time: '7:45 PM', block: 'Open mic round 1 (10 wins)' },
      { time: '8:30 PM', block: 'Dessert · table mingles · letter station' },
      { time: '9:00 PM', block: 'Open mic round 2 (10 wins)' },
      { time: '9:45 PM', block: 'Win of the night · group toast' },
      { time: '10:30 PM', block: 'Closing circle' },
    ],
    faq: [
      {
        q: 'What counts as a "win"?',
        a: 'Anything you did that nobody else celebrated enough. Big wins, tiny wins, awkward wins. The bar is low on purpose.',
      },
      {
        q: 'Do I have to speak?',
        a: 'No. About 30% of attendees just listen and clap. That is a complete and welcome way to attend.',
      },
      {
        q: 'Refund policy?',
        a: 'Full refund up to 72 hours before. After that, transferable.',
      },
    ],
    dressCode: 'Smart casual with one item that makes you feel celebratory.',
    tiers: [
      {
        id: 'early',
        label: 'Early Bird',
        priceInr: 999,
        description: 'First 20 spots.',
      },
      {
        id: 'regular',
        label: 'Regular',
        priceInr: 1299,
        description: 'Standard ticket.',
      },
    ],
  },
];

export function getEvent(slug: string) {
  return events.find((e) => e.slug === slug);
}
