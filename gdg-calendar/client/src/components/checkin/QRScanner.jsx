import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScan }) {
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'gdg-qr-reader',
      { fps: 10, qrbox: { width: 240, height: 240 } },
      false
    );

    scanner.render(
      (decodedText) => {
        if (onScanRef.current) {
          onScanRef.current(decodedText);
        }
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return <div id="gdg-qr-reader" className="overflow-hidden rounded-xl border border-slate-200 bg-white" />;
}

