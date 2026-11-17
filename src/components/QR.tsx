import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/** QR code drawn in the browser. The link it encodes is fake (example.com). */
export function QR({ text, size = 120, label }: { text: string; size?: number; label: string }) {
  const [svg, setSvg] = useState('')
  useEffect(() => {
    let live = true
    QRCode.toString(text, { type: 'svg', margin: 1, color: { dark: '#272727', light: '#f8f8f8' } })
      .then((s) => { if (live) setSvg(s) })
      .catch(() => { if (live) setSvg('') })
    return () => { live = false }
  }, [text])
  return (
    <div role="img" aria-label={label} style={{ width: size, height: size }}
      className="border border-ink [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svg }} />
  )
}
