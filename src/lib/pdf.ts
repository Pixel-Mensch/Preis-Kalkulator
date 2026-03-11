import { PDFDocument, StandardFonts } from "pdf-lib";

import { formatCurrency, formatDate } from "@/lib/format";
import type { InquiryCalculationSnapshot } from "@/lib/inquiries";
import {
  additionalAreaLabels,
  extraOptionLabels,
  fillLevelLabels,
  floorLevelLabels,
  objectTypeLabels,
  problemFlagLabels,
  walkDistanceLabels,
} from "@/lib/pricing/types";

type GenerateInquiryPdfInput = {
  companySettings: {
    companyName: string;
    contactEmail: string;
    contactPhone: string;
    street: string;
    postalCode: string;
    city: string;
    estimateFootnote: string;
  };
  inquiry: {
    publicId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    postalCode: string;
    desiredDate: Date | null;
    message: string | null;
    manualReviewRequired: boolean;
  };
  snapshot: InquiryCalculationSnapshot;
};

function wrapText(text: string, maxCharacters: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    if (nextLine.length > maxCharacters) {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export async function generateInquiryPdf({
  companySettings,
  inquiry,
  snapshot,
}: GenerateInquiryPdfInput) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 800;

  function drawLine(text: string, options?: { bold?: boolean; size?: number; gap?: number }) {
    page.drawText(text, {
      x: 42,
      y,
      size: options?.size ?? 11,
      font: options?.bold ? boldFont : regularFont,
    });
    y -= options?.gap ?? 18;
  }

  drawLine(companySettings.companyName, { bold: true, size: 20, gap: 24 });
  drawLine(
    `${companySettings.street}, ${companySettings.postalCode} ${companySettings.city}`,
    { gap: 16 },
  );
  drawLine(`${companySettings.contactPhone} | ${companySettings.contactEmail}`, { gap: 24 });

  drawLine(`Anfrage ${inquiry.publicId}`, { bold: true, size: 16, gap: 20 });
  drawLine(
    inquiry.manualReviewRequired
      ? "Unverbindliche Einschätzung - manuelle Prüfung empfohlen"
      : "Unverbindliche Einschätzung",
    { bold: true, gap: 22 },
  );

  drawLine(`Kunde: ${inquiry.customerName}`);
  drawLine(`Kontakt: ${inquiry.customerPhone} | ${inquiry.customerEmail}`);
  drawLine(`PLZ: ${inquiry.postalCode}`);
  drawLine(`Wunschdatum: ${formatDate(inquiry.desiredDate)}`, { gap: 24 });

  drawLine("Objektdaten", { bold: true, gap: 18 });
  drawLine(`Objektart: ${objectTypeLabels[snapshot.input.objectType]}`);
  drawLine(
    `Zusätzliche Bereiche: ${
      (snapshot.input.additionalAreas ?? []).length > 0
        ? (snapshot.input.additionalAreas ?? [])
            .map((value) => additionalAreaLabels[value])
            .join(", ")
        : "Keine"
    }`,
  );
  drawLine(`Fläche: ${snapshot.input.areaSqm} m²`);
  drawLine(`Füllgrad: ${fillLevelLabels[snapshot.input.fillLevel]}`);
  drawLine(`Etage: ${floorLevelLabels[snapshot.input.floorLevel]}`);
  drawLine(`Aufzug: ${snapshot.input.hasElevator ? "Ja" : "Nein"}`);
  drawLine(`Laufweg: ${walkDistanceLabels[snapshot.input.walkDistance]}`);
  drawLine(`Zone: ${snapshot.estimate.travelZoneLabel}`, { gap: 22 });

  drawLine("Preisübersicht", { bold: true, gap: 18 });
  drawLine(
    `Kostenschätzung: ${formatCurrency(snapshot.estimate.rangeMin)} bis ${formatCurrency(snapshot.estimate.rangeMax)}`,
  );
  drawLine(`Objektbasis: ${formatCurrency(snapshot.estimate.basePrice)}`);
  drawLine(`Effektive Fläche: ${snapshot.estimate.effectiveArea} m²`);
  drawLine(`Zwischensumme: ${formatCurrency(snapshot.estimate.subtotal)}`, { gap: 22 });

  drawLine("Extras", { bold: true, gap: 18 });
  if (snapshot.input.extraOptions.length === 0) {
    drawLine("Keine Extras gewählt.");
  } else {
    for (const extraOption of snapshot.input.extraOptions) {
      drawLine(`- ${extraOptionLabels[extraOption]}`);
    }
  }

  y -= 8;
  drawLine("Sonderfälle", { bold: true, gap: 18 });
  if (snapshot.input.problemFlags.length === 0) {
    drawLine("Keine Sonderfälle angegeben.");
  } else {
    for (const problemFlag of snapshot.input.problemFlags) {
      drawLine(`- ${problemFlagLabels[problemFlag]}`);
    }
  }

  if (snapshot.manualReviewReasons.length > 0) {
    y -= 8;
    drawLine("Gründe für manuelle Prüfung", { bold: true, gap: 18 });
    for (const reason of snapshot.manualReviewReasons) {
      drawLine(`- ${reason.message}`);
    }
  }

  if (inquiry.message) {
    y -= 8;
    drawLine("Kundenhinweis", { bold: true, gap: 18 });
    for (const line of wrapText(inquiry.message, 82)) {
      drawLine(line);
    }
  }

  y -= 12;
  for (const line of wrapText(companySettings.estimateFootnote, 86)) {
    drawLine(line, { gap: 16 });
  }

  return pdfDoc.save();
}
