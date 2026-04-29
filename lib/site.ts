export const site = {
  name: 'Stranger Atti Club',
  tagline: 'A common platform for stranger-meets.',
  city: 'Chennai',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@strangeratticlub.in',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || '917530036130',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM || 'strangeratticlub',
  url:
    process.env.NEXT_PUBLIC_SITE_URL || 'https://strangeratticlub.vercel.app',
};

export const nav = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/corporate', label: 'For Teams' },
  { href: '/code-of-conduct', label: 'Safety' },
  { href: '/contact', label: 'Contact' },
  { href: '/me', label: 'My events' },
];
