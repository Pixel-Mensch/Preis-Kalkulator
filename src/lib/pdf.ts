import {
  PDFDocument,
  StandardFonts,
  type PDFFont,
  type PDFPage,
} from "pdf-lib";

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

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 42;
const TOP_Y = 800;
const CONTINUATION_TOP_Y = 784;
const BOTTOM_Y = 52;
const FOOTER_Y = 24;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

function splitLongToken(
  token: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const segments: string[] = [];
  let current = "";

  for (const character of [...token]) {
    const next = `${current}${character}`;

    if (current && font.widthOfTextAtSize(next, size) > maxWidth) {
      segments.push(current);
      current = character;
      continue;
    }

    current = next;
  }

  if (current) {
    segments.push(current);
  }

  return segments.length > 0 ? segments : [token];
}

function wrapParagraph(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const tokens = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  for (const token of tokens) {
    const segments =
      font.widthOfTextAtSize(token, size) <= maxWidth
        ? [token]
        : splitLongToken(token, font, size, maxWidth);

    for (const segment of segments) {
      const nextLine = currentLine ? `${currentLine} ${segment}` : segment;

      if (currentLine && font.widthOfTextAtSize(nextLine, size) > maxWidth) {
        lines.push(currentLine);
        currentLine = segment;
        continue;
      }

      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [""];
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();

    if (!trimmedParagraph) {
      if (lines.at(-1) !== "") {
        lines.push("");
      }
      continue;
    }

    lines.push(...wrapParagraph(trimmedParagraph, font, size, maxWidth));
  }

  return lines.length > 0 ? lines : [""];
}

export async function generateInquiryPdf({
  companySettings,
  inquiry,
  snapshot,
}: GenerateInquiryPdfInput) {
  const isOutsideServiceArea =
    snapshot.estimate.travelZoneMatched === false ||
    snapshot.manualReviewReasons.some((reason) => reason.code === "OUTSIDE_SERVICE_AREA");
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const pages: PDFPage[] = [];
  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = TOP_Y;

  pages.push(page);

  function startNewPage() {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    y = CONTINUATION_TOP_Y;

    page.drawText(`${companySettings.companyName} - Anfrage ${inquiry.publicId}`, {
      x: MARGIN_X,
      y: CONTINUATION_TOP_Y + 18,
      size: 10,
      font: boldFont,
    });
  }

  function ensureSpace(requiredHeight: number) {
    if (y - requiredHeight < BOTTOM_Y) {
      startNewPage();
    }
  }

  function drawWrappedText(
    text: string,
    options?: {
      bold?: boolean;
      size?: number;
      gapBefore?: number;
      gapAfter?: number;
      indent?: number;
    },
  ) {
    const size = options?.size ?? 11;
    const lineHeight = Math.max(size + 4, 16);
    const font = options?.bold ? boldFont : regularFont;
    const indent = options?.indent ?? 0;
    const gapBefore = options?.gapBefore ?? 0;
    const gapAfter = options?.gapAfter ?? 2;
    const lines = wrapText(text, font, size, CONTENT_WIDTH - indent);

    ensureSpace(gapBefore + lineHeight * Math.max(lines.length, 1) + gapAfter);
    y -= gapBefore;

    for (const line of lines) {
      ensureSpace(lineHeight);

      if (line) {
        page.drawText(line, {
          x: MARGIN_X + indent,
          y,
          size,
          font,
        });
      }

      y -= lineHeight;
    }

    y -= gapAfter;
  }

  function drawBulletItem(text: string) {
    const size = 11;
    const lineHeight = 16;
    const bulletPrefix = "- ";
    const bulletWidth = regularFont.widthOfTextAtSize(bulletPrefix, size);
    const lines = wrapText(text, regularFont, size, CONTENT_WIDTH - bulletWidth);

    ensureSpace(lineHeight * Math.max(lines.length, 1) + 2);

    page.drawText(`${bulletPrefix}${lines[0] ?? ""}`, {
      x: MARGIN_X,
      y,
      size,
      font: regularFont,
    });
    y -= lineHeight;

    for (const line of lines.slice(1)) {
      ensureSpace(lineHeight);
      page.drawText(line, {
        x: MARGIN_X + bulletWidth,
        y,
        size,
        font: regularFont,
      });
      y -= lineHeight;
    }

    y -= 2;
  }

  function drawBulletList(items: string[], emptyText: string) {
    if (items.length === 0) {
      drawWrappedText(emptyText, { gapAfter: 4 });
      return;
    }

    for (const item of items) {
      drawBulletItem(item);
    }
  }

  function drawSection(title: string) {
    ensureSpace(34);
    drawWrappedText(title, {
      bold: true,
      size: 13,
      gapBefore: 6,
      gapAfter: 8,
    });
  }

  drawWrappedText(companySettings.companyName, {
    bold: true,
    size: 20,
    gapAfter: 6,
  });
  drawWrappedText(
    `${companySettings.street}, ${companySettings.postalCode} ${companySettings.city}`,
    { gapAfter: 2 },
  );
  drawWrappedText(`${companySettings.contactPhone} | ${companySettings.contactEmail}`, {
    gapAfter: 10,
  });

  drawWrappedText(`Anfrage ${inquiry.publicId}`, {
    bold: true,
    size: 16,
    gapAfter: 4,
  });
  drawWrappedText(
    inquiry.manualReviewRequired
      ? "Unverbindliche Einschaetzung - manuelle Pruefung empfohlen"
      : "Unverbindliche Einschaetzung",
    {
      bold: true,
      gapAfter: 10,
    },
  );

  drawWrappedText(`Kunde: ${inquiry.customerName}`);
  drawWrappedText(`Kontakt: ${inquiry.customerPhone} | ${inquiry.customerEmail}`);
  drawWrappedText(`PLZ: ${inquiry.postalCode}`);
  drawWrappedText(`Wunschdatum: ${formatDate(inquiry.desiredDate)}`, { gapAfter: 10 });

  drawSection("Objektdaten");
  drawWrappedText(`Objektart: ${objectTypeLabels[snapshot.input.objectType]}`);
  drawWrappedText(
    `Zusaetzliche Bereiche: ${
      (snapshot.input.additionalAreas ?? []).length > 0
        ? (snapshot.input.additionalAreas ?? [])
            .map((value) => additionalAreaLabels[value])
            .join(", ")
        : "Keine"
    }`,
  );
  drawWrappedText(`Flaeche: ${snapshot.input.areaSqm} m2`);
  drawWrappedText(
    `Zimmer: ${
      typeof snapshot.input.roomCount === "number"
        ? String(snapshot.input.roomCount)
        : "Nicht angegeben"
    }`,
  );
  drawWrappedText(`Fuellgrad: ${fillLevelLabels[snapshot.input.fillLevel]}`);
  drawWrappedText(`Etage: ${floorLevelLabels[snapshot.input.floorLevel]}`);
  drawWrappedText(`Aufzug: ${snapshot.input.hasElevator ? "Ja" : "Nein"}`);
  drawWrappedText(`Laufweg: ${walkDistanceLabels[snapshot.input.walkDistance]}`);
  drawWrappedText(
    `Einsatzgebiet: ${
      !isOutsideServiceArea
        ? snapshot.estimate.travelZoneLabel
        : `${snapshot.estimate.travelZoneLabel} - ausserhalb definiertes Einsatzgebiet`
    }`,
    { gapAfter: 10 },
  );

  drawSection("Preisuebersicht");
  drawWrappedText(
    `Kostenschaetzung: ${formatCurrency(snapshot.estimate.rangeMin)} bis ${formatCurrency(
      snapshot.estimate.rangeMax,
    )}`,
  );
  drawWrappedText(`Objektbasis: ${formatCurrency(snapshot.estimate.basePrice)}`);
  drawWrappedText(`Effektive Flaeche: ${snapshot.estimate.effectiveArea} m2`);
  drawWrappedText(`Zwischensumme: ${formatCurrency(snapshot.estimate.subtotal)}`, {
    gapAfter: 10,
  });

  drawSection("Extras");
  drawBulletList(
    snapshot.input.extraOptions.map((extraOption) => extraOptionLabels[extraOption]),
    "Keine Extras gewaehlt.",
  );

  drawSection("Sonderfaelle");
  drawBulletList(
    snapshot.input.problemFlags.map((problemFlag) => problemFlagLabels[problemFlag]),
    "Keine Sonderfaelle angegeben.",
  );

  if (snapshot.manualReviewReasons.length > 0) {
    drawSection("Gruende fuer manuelle Pruefung");
    drawBulletList(
      snapshot.manualReviewReasons.map((reason) => reason.message),
      "Keine Gruende gespeichert.",
    );
  }

  if (inquiry.message) {
    drawSection("Kundenhinweis");
    drawWrappedText(inquiry.message, { gapAfter: 10 });
  }

  drawSection("Hinweis");
  drawWrappedText(companySettings.estimateFootnote, {
    size: 10,
    gapAfter: 0,
  });

  const totalPages = pages.length;

  pages.forEach((pdfPage, index) => {
    const pageLabel = `Seite ${index + 1} / ${totalPages}`;
    const pageLabelWidth = regularFont.widthOfTextAtSize(pageLabel, 9);

    pdfPage.drawText(pageLabel, {
      x: PAGE_WIDTH - MARGIN_X - pageLabelWidth,
      y: FOOTER_Y,
      size: 9,
      font: regularFont,
    });
  });

  return pdfDoc.save();
}
