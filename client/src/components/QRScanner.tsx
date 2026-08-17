import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef } from "react";

interface Props {
  onScan: (decodedText: string) => void;
}

const ELEMENT_ID = "qr-scanner-region";

/** Escáner de QR con la cámara del navegador, usando html5-qrcode. */
export function QRScanner({ onScan }: Props) {
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      ELEMENT_ID,
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => onScanRef.current(decodedText),
      () => {
        /* errores de frame sin QR visible: se ignoran, son esperables */
      }
    );

    return () => {
      scanner.clear().catch(() => {
        /* el escáner ya pudo haberse limpiado */
      });
    };
  }, []);

  return <div id={ELEMENT_ID} className="qr-scanner" />;
}
