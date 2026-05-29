import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';

export default function QRCodeModal({ url, onClose }) {
  const ref = useRef(null);

  function download() {
    const canvas = ref.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'linktrack-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success('QR code downloaded');
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-sm space-y-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">QR Code</h3>
        <p className="break-all text-xs text-slate-500 dark:text-slate-400">{url}</p>
        <div ref={ref} className="flex justify-center rounded-xl bg-white p-4">
          <QRCodeCanvas value={url} size={200} includeMargin />
        </div>
        <div className="flex gap-2">
          <button onClick={download} className="btn-primary flex-1">
            Download
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
