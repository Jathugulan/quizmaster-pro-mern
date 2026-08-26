import jsPDF from 'jspdf';

export const exportResultPdf = async (result) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const { student, quiz, scoreCard } = result;

  // Header Banner
  doc.setFillColor(0, 113, 227); // #0071e3
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('QuizMaster Examination Result Report', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Official Academic Assessment Record • Verified System Generation`, 14, 25);

  // Student & Assessment Metadata
  doc.setTextColor(15, 23, 42); // #0f172a
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Candidate & Examination Details', 14, 44);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Candidate Name: ${student.name}`, 14, 52);
  doc.text(`Username: @${student.username}`, 14, 58);
  doc.text(`Email Address: ${student.email}`, 14, 64);

  doc.text(`Quiz Title: ${quiz.title}`, 110, 52);
  doc.text(`Category: ${quiz.category || 'General'}`, 110, 58);
  doc.text(`Date of Attempt: ${scoreCard.submittedAt ? new Date(scoreCard.submittedAt).toLocaleDateString() : 'N/A'}`, 110, 64);

  // Horizontal divider
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 70, 196, 70);

  // Score Summary Card
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 76, 182, 36, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Score Summary', 20, 84);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Marks Gained: ${scoreCard.obtainedMarks} / ${scoreCard.totalMarks}`, 20, 92);
  doc.text(`Percentage Attainment: ${scoreCard.percentage}%`, 20, 98);
  doc.text(`Assigned Academic Grade: ${scoreCard.grade}`, 20, 104);

  doc.text(`Correct Answers: ${scoreCard.correct}`, 110, 92);
  doc.text(`Wrong / Skipped: ${scoreCard.wrong} / ${scoreCard.skipped}`, 110, 98);
  doc.text(`Final Outcome: ${scoreCard.passed ? 'PASSED (Criteria Met)' : 'FAILED'}`, 110, 104);

  // Question Analysis Section Header
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Question-by-Question Analysis', 14, 124);

  let y = 132;
  const questions = result.questionsAnalysis || [];

  questions.slice(0, 8).forEach((q, idx) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Q${idx + 1}: ${q.text.substring(0, 80)}${q.text.length > 80 ? '...' : ''}`, 14, y);

    doc.setFont('helvetica', 'normal');
    doc.text(`Outcome: ${q.outcome.toUpperCase()} | Candidate Answer: ${q.studentAnswer.substring(0, 35)} | Correct: ${q.correctAnswer.substring(0, 35)}`, 14, y + 5);

    y += 13;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('© QuizMaster Examination Engine • Generated for Academic Records', 14, 285);

  doc.save(`QuizMaster_Result_${student.username}_${quiz.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};

export const exportReportsToCsv = (rows = [], filename = 'QuizMaster_Report.csv') => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const val = r[h] === null || r[h] === undefined ? '' : String(r[h]);
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
