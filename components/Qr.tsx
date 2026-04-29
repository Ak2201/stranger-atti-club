import QRCode from 'qrcode';

type Props = {
  payload: string;
  size?: number;
  className?: string;
  /** Pure-black QR on cream — best contrast for scanners. */
  light?: string;
  dark?: string;
};

/**
 * Server component that renders a QR code as inline SVG. Zero client JS,
 * no extra requests.
 */
export default async function Qr({
  payload,
  size = 240,
  className = '',
  light = '#FFF8E7',
  dark = '#1A1A1A',
}: Props) {
  const svg = await QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    color: { light, dark },
  });

  // Force width/height on the <svg> (qrcode lib emits viewBox-only by default).
  let cleaned = svg;
  if (/<svg\b[^>]*\swidth=/.test(cleaned)) {
    cleaned = cleaned
      .replace(/\swidth="[^"]*"/, ` width="${size}"`)
      .replace(/\sheight="[^"]*"/, ` height="${size}"`);
  } else {
    cleaned = cleaned.replace(
      /<svg\b/,
      `<svg width="${size}" height="${size}"`
    );
  }

  return (
    <div
      className={`inline-block rounded-2xl bg-cream p-3 ${className}`}
      style={{ lineHeight: 0, width: size + 24, height: size + 24 }}
      aria-label="QR ticket code"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: cleaned }}
    />
  );
}
