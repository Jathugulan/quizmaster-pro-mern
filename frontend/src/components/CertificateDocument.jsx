import { forwardRef } from 'react';

/**
 * Apple HIG-inspired luxury certificate of achievement.
 * 
 * Styled with fixed paper colors (pure white, gold accents, deep cobalt, crisp slate)
 * to guarantee 100% pixel-perfect high-contrast output on:
 * - JPG image downloads
 * - PDF print & document downloads
 * - Screen modal previews (in both light and dark UI themes)
 */
const CertificateDocument = forwardRef(
  (
    {
      studentName = 'Student',
      quizTitle = 'General Knowledge Examination',
      category = 'General',
      percent = 100,
      correct = 10,
      of = 10,
      timeLabel = '5m 00s',
      dateLabel = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      serial = 'QM-88214-CERT',
      difficulty = 'Medium',
      className = '',
    },
    ref
  ) => {
    return (
      <div ref={ref} className={`certificate-doc w-full max-w-[840px] mx-auto bg-white text-[#1d1d1f] ${className}`}>
        {/* Certificate Frame Outer */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-7 sm:p-9 shadow-xl border-[8px] border-[#0a84ff]/10">
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-3 left-3 h-10 w-10 border-t-2 border-l-2 border-[#0071e3]" />
          <div className="absolute top-3 right-3 h-10 w-10 border-t-2 border-r-2 border-[#0071e3]" />
          <div className="absolute bottom-3 left-3 h-10 w-10 border-b-2 border-l-2 border-[#0071e3]" />
          <div className="absolute bottom-3 right-3 h-10 w-10 border-b-2 border-r-2 border-[#0071e3]" />

          {/* Inner Border */}
          <div className="relative border-2 border-dashed border-[#d1d1d6] rounded-xl px-6 sm:px-12 py-8 sm:py-10 text-center bg-gradient-to-b from-[#fbfbfd] via-white to-[#fbfbfd]">
            
            {/* Top Apple / QuizMaster Crest */}
            <div className="mx-auto mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#0071e3]" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#0056b3] text-white shadow-md">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#0071e3]" />
            </div>

            {/* Header Titles */}
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-[0.25em] text-[#0071e3]">
              QuizMaster
            </h1>
            <p className="mt-1 text-[11px] sm:text-xs font-bold uppercase tracking-[0.35em] text-[#86868b]">
              Official Certificate of Excellence
            </p>

            {/* Gold Ribbon Divider */}
            <div className="my-5 flex items-center justify-center gap-3">
              <div className="h-0.5 w-20 bg-gradient-to-r from-transparent to-[#d4af37]" />
              <span className="text-[#d4af37] text-sm">★ ★ ★</span>
              <div className="h-0.5 w-20 bg-gradient-to-l from-transparent to-[#d4af37]" />
            </div>

            {/* Recipient Certification Statement */}
            <p className="text-xs sm:text-sm font-medium text-[#6e6e73]">
              This official credential certifies that
            </p>
            
            {/* Student Name */}
            <h2 className="my-2 text-2xl sm:text-4xl font-black tracking-tight text-[#1d1d1f] font-serif">
              {studentName}
            </h2>

            <p className="mx-auto max-w-lg text-xs sm:text-sm leading-relaxed text-[#515154]">
              has demonstrated outstanding academic proficiency and successfully completed the examination{' '}
              <strong className="text-[#1d1d1f] font-bold">“{quizTitle}”</strong> in{' '}
              <span className="font-semibold text-[#0071e3]">{category}</span> with verified distinction.
            </p>

            {/* Metrics Badge Box */}
            <div className="my-6 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-8 rounded-xl bg-[#f5f5f7] border border-[#e5e5ea] px-5 py-2.5 text-xs text-[#515154]">
              <div>
                <span className="text-[#86868b] mr-1">Date:</span>
                <span className="font-semibold text-[#1d1d1f]">{dateLabel}</span>
              </div>
              <div className="hidden sm:block h-3.5 w-px bg-[#d1d1d6]" />
              <div>
                <span className="text-[#86868b] mr-1">Certificate ID:</span>
                <span className="font-mono font-bold text-[#0071e3]">{serial}</span>
              </div>
              <div className="hidden sm:block h-3.5 w-px bg-[#d1d1d6]" />
              <div>
                <span className="text-[#86868b] mr-1">Difficulty:</span>
                <span className="font-semibold text-[#1d1d1f] capitalize">{difficulty}</span>
              </div>
            </div>

            {/* Footer Signatures and Verification Seal */}
            <div className="mt-6 pt-4 border-t border-[#e5e5ea] flex flex-wrap items-end justify-between gap-6 px-4 text-xs text-[#86868b]">
              <div className="text-left w-36 sm:w-44">
                <div className="h-8 border-b border-[#1d1d1f]/30 flex items-end pb-1 font-serif italic text-sm text-[#1d1d1f]">
                  QuizMaster Academic Board
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
                  Authorized Signature
                </div>
              </div>

              {/* Gold Official Stamp Seal */}
              <div className="flex flex-col items-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#d4af37] bg-[#fffbf0] text-[#d4af37] shadow-sm">
                  <div className="text-center leading-tight">
                    <span className="block text-[8px] font-bold uppercase tracking-wider">VERIFIED</span>
                    <span className="block text-[11px] font-black">100%</span>
                  </div>
                </div>
                <span className="mt-1 text-[9px] uppercase tracking-widest text-[#86868b]">Official Seal</span>
              </div>

              <div className="text-right w-36 sm:w-44">
                <div className="h-8 border-b border-[#1d1d1f]/30 flex items-end justify-end pb-1 font-mono text-xs font-bold text-[#1d1d1f]">
                  SECURE VERIFIED
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
                  Platform Validation
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
);

CertificateDocument.displayName = 'CertificateDocument';

export default CertificateDocument;