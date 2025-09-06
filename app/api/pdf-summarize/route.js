import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import PDFParser from 'pdf2json';

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    // Read uploaded PDF from FormData
    const formData = await req.formData();
    const uploadedFiles = formData.getAll('pdf'); // match your client FormData key

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const uploadedFile = uploadedFiles[0];
    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
    }

    // Convert File to Buffer
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

    // Save PDF temporarily
    const tempFilePath = `/tmp/${uuidv4()}.pdf`;
    await fs.writeFile(tempFilePath, fileBuffer);

    // Parse PDF with pdf2json
    let parsedText = '';
    await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();
      pdfParser.on('pdfParser_dataError', (err) => reject(err.parserError));
      pdfParser.on('pdfParser_dataReady', () => {
        parsedText = pdfParser.getRawTextContent();
        resolve();
      });
      pdfParser.loadPDF(tempFilePath);
    });

    return NextResponse.json({
      content: parsedText,
      summary: parsedText.slice(0, 200),
    });
  } catch (err) {
    console.error('PDF2JSON error:', err);
    return NextResponse.json({ error: err && err.message ? err.message : String(err) }, { status: 500 });
  }
}
