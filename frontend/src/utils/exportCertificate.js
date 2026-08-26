// ============================================================================
// exportCertificate.js — client-side certificate export (JPG + PDF).
//
// Renders the certificate DOM (src/components/CertificateDocument.jsx) to a
// high-resolution canvas with html-to-image, then:
//   - JPG: downloads the canvas as high-quality JPEG image.
//   - PDF : embeds the JPEG into an A4 page with jsPDF.
// ============================================================================

import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';

// Captures the node at a fixed 840px logical width for crisp, consistent output
async function captureCanvas(node) {
  if (!node) throw new Error('Certificate element not found. Please try again.');
  if (document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font ready errors in edge environments
    }
  }

  const prevWidth = node.style.width;
  node.style.width = '840px';
  try {
    return await toCanvas(node, {
      pixelRatio: 2,
      skipFonts: true,
      backgroundColor: '#ffffff',
      cacheBust: true,
    });
  } finally {
    if (prevWidth === '') node.style.width = '';
    else node.style.width = prevWidth;
  }
}

export async function captureAsJpeg(node) {
  const canvas = await captureCanvas(node);
  return { dataUrl: canvas.toDataURL('image/jpeg', 0.96), width: canvas.width, height: canvas.height };
}

function triggerDownload(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadCertificateJpg(node, filename) {
  const { dataUrl } = await captureAsJpeg(node);
  triggerDownload(dataUrl, filename);
  return true;
}

export async function downloadCertificatePdf(node, filename) {
  const { dataUrl, width, height } = await captureAsJpeg(node);

  const horizontal = width >= height;
  const pageW = 297; // mm (A4 landscape)
  const pageH = 210; // mm (A4 portrait)
  const margin = 8;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;
  const aspect = width / height;
  let w = maxW;
  let h = w / aspect;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }

  const doc = new jsPDF({
    orientation: horizontal ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });
  const x = (pageW - w) / 2;
  const y = (pageH - h) / 2;
  doc.addImage(dataUrl, 'JPEG', x, y, w, h, undefined, 'FAST');
  doc.save(filename);
  return true;
}

export const exportCertificate = {
  captureAsJpeg,
  downloadCertificateJpg,
  downloadCertificatePdf,
};