// Khmer font base64 encoded - Preahvihear font (supports Khmer Unicode)
// You can also use other Khmer fonts like: Khmer OS, Moul, Battambang, etc.
export const KHMER_FONT_BASE64 = `
/* Base64 encoded Khmer font (Preahvihear) */
/* For production, load from actual font file */
`;

// Alternative: Load font from URL or local file
export const loadKhmerFont = async () => {
  try {
    // Method 1: Load from public folder
    const response = await fetch('/fonts/Preahvihear.ttf');
    const fontBlob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(fontBlob);
    });
  } catch (error) {
    console.error('Failed to load Khmer font:', error);
    return null;
  }
};

// PDF configuration for Khmer language
export const PDF_CONFIG = {
  orientation: 'landscape',
  unit: 'mm',
  format: 'a4',
  compress: true
};

// Table styles for Khmer text
export const TABLE_STYLES = {
  headStyles: {
    fillColor: [41, 128, 185],
    textColor: 255,
    fontStyle: 'bold',
    fontSize: 10,
    halign: 'center',
    valign: 'middle'
  },
  bodyStyles: {
    fontSize: 9,
    textColor: 50,
    cellPadding: 3,
    valign: 'middle'
  },
  alternateRowStyles: {
    fillColor: [248, 248, 248]
  },
  columnStyles: {
    0: { // Student No
      cellWidth: 15,
      halign: 'center'
    },
    1: { // Student Name
      cellWidth: 40,
      halign: 'left'
    },
    2: { // Gender
      cellWidth: 15,
      halign: 'center'
    }
  },
  margin: { top: 20, right: 10, bottom: 20, left: 10 },
  pageBreak: 'auto',
  startY: 30
};