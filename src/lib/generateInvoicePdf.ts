import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ROVENTIS_COMPANY } from "./roventisConstants";

export interface LineItem {
  productName: string;
  productSubtitle?: string;
  imageDataUrl?: string;
  unitPrice: number;
  quantity: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  clientCompanyName: string;
  clientAddress1?: string;
  clientAddress2?: string;
  clientVatNumber?: string;
  clientEmail?: string;
  projectSummary?: string;
  lineItems: LineItem[];
  notes: string[];
  subtotal: number;
  total: number;
}

const ZAR = (amount: number): string => {
  return `R${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

function createInvoiceHtml(
  invoiceData: InvoiceData,
  logoBase64: string,
  isPage2: boolean = false
): string {
  const { invoiceNumber, invoiceDate, clientCompanyName, clientAddress1, clientAddress2, clientVatNumber, clientEmail, projectSummary, lineItems, notes, subtotal, total } = invoiceData;

  if (isPage2) {
    return `
      <div style="width: 794px; min-height: 1123px; padding: 40px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="border-top: 3px solid #F97316; margin-bottom: 40px;"></div>
        <h2 style="color: #1f2937; margin-bottom: 30px; font-size: 18px;">Payment Information</h2>
        <div style="display: flex; justify-content: space-between;">
          <div style="flex: 1;">
            <p style="margin: 8px 0; color: #374151;"><strong>Bank:</strong> ${ROVENTIS_COMPANY.bankName}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Account Type:</strong> ${ROVENTIS_COMPANY.accountType}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Account Number:</strong> ${ROVENTIS_COMPANY.accountNumber}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Branch Code:</strong> ${ROVENTIS_COMPANY.branchCode}</p>
            <p style="margin: 8px 0; color: #374151;"><strong>Account Holder:</strong> ${ROVENTIS_COMPANY.accountHolder}</p>
          </div>
          <div style="flex: 1;">
            <p style="margin: 8px 0; color: #374151; font-style: italic;">Please include '<strong>${clientCompanyName}</strong>' as your payment reference.</p>
            <p style="margin: 8px 0; color: #374151; margin-top: 20px;">Once payment is received, production will begin immediately and a confirmation receipt will be issued.</p>
          </div>
        </div>
      </div>
    `;
  }

  // Page 1
  let lineItemsHtml = "";
  for (const item of lineItems) {
    const imgTag = item.imageDataUrl
      ? `<img src="${item.imageDataUrl}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;" />`
      : `<div style="width: 80px; height: 80px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">No Image</div>`;

    lineItemsHtml += `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: middle;">
          ${imgTag}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600; color: #1f2937;">${item.productName}</div>
          ${item.productSubtitle ? `<div style="color: #6b7280; font-size: 13px;">${item.productSubtitle}</div>` : ""}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151;">${ZAR(item.unitPrice)}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #374151;">${item.quantity}</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 600;">${ZAR(item.amount)}</td>
      </tr>
    `;
  }

  let notesHtml = "";
  if (notes.length > 0) {
    notesHtml = `
      <div style="margin-top: 30px;">
        <h3 style="color: #1f2937; font-size: 14px; font-weight: 600; margin-bottom: 12px;">Notes:</h3>
        <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 13px;">
          ${notes.map(note => `<li style="margin-bottom: 6px;">${note}</li>`).join("")}
        </ul>
      </div>
    `;
  }

  return `
    <div style="width: 794px; min-height: 1123px; padding: 40px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${logoBase64}" alt="Roventis" style="height: 60px;" />
      </div>
      <div style="border-top: 3px solid #F97316; margin-bottom: 30px;"></div>

      <div style="display: flex; justify-content: space-between;">
        <div style="flex: 1;">
          <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 14px;">BILL TO:</h3>
          <p style="margin: 0; color: #1f2937; font-weight: 600; font-size: 14px;">${clientCompanyName}</p>
          ${clientAddress1 ? `<p style="margin: 0; color: #374151; font-size: 13px;">${clientAddress1}</p>` : ""}
          ${clientAddress2 ? `<p style="margin: 0; color: #374151; font-size: 13px;">${clientAddress2}</p>` : ""}
          ${clientVatNumber ? `<p style="margin: 0; color: #374151; font-size: 13px;">VAT: ${clientVatNumber}</p>` : ""}
          ${clientEmail ? `<p style="margin: 0; color: #374151; font-size: 13px;">${clientEmail}</p>` : ""}
        </div>
        <div style="flex: 1; text-align: right;">
          <h3 style="color: #1f2937; margin: 0 0 8px 0; font-size: 14px;">INVOICE NO. ${invoiceNumber}</h3>
          <p style="margin: 0; color: #374151; font-size: 13px;">Date: ${formatDate(invoiceDate)}</p>
          <p style="margin: 20px 0 0 0; color: #374151; font-size: 13px;">${ROVENTIS_COMPANY.email}</p>
          <p style="margin: 0; color: #374151; font-size: 13px;">${ROVENTIS_COMPANY.phone}</p>
          <p style="margin: 0; color: #374151; font-size: 13px;">${ROVENTIS_COMPANY.website}</p>
          <p style="margin: 0; color: #374151; font-size: 13px;">${ROVENTIS_COMPANY.social}</p>
        </div>
      </div>

      ${projectSummary ? `
        <div style="margin-top: 30px;">
          <h3 style="color: #1f2937; font-size: 14px; font-weight: 600; font-style: italic; margin-bottom: 8px;">Project Summary</h3>
          <p style="margin: 0; color: #374151; font-size: 13px;">${projectSummary}</p>
        </div>
      ` : ""}

      <div style="margin-top: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #1f2937;">
              <th style="padding: 12px 8px; text-align: left; color: white; font-size: 12px; font-weight: 600; width: 100px;">IMAGE</th>
              <th style="padding: 12px 8px; text-align: left; color: white; font-size: 12px; font-weight: 600;">DESCRIPTION</th>
              <th style="padding: 12px 8px; text-align: right; color: white; font-size: 12px; font-weight: 600;">UNIT PRICE</th>
              <th style="padding: 12px 8px; text-align: center; color: white; font-size: 12px; font-weight: 600;">QTY</th>
              <th style="padding: 12px 8px; text-align: right; color: white; font-size: 12px; font-weight: 600;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHtml}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 20px; text-align: right;">
        <p style="margin: 0; color: #6b7280; font-size: 13px;">Subtotal: ${ZAR(subtotal)}</p>
        <p style="margin: 8px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 700;">TOTAL ${ZAR(total)}</p>
      </div>

      ${notesHtml}

      <div style="margin-top: 60px; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 12px; font-style: italic;">${ROVENTIS_COMPANY.tagline}</p>
      </div>
    </div>
  `;
}

export async function generateInvoicePdf(
  invoiceData: InvoiceData,
  logoBase64: string
): Promise<void> {
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.visibility = "hidden";
  container.style.width = "794px";
  document.body.appendChild(container);

  try {
    // Page 1
    container.innerHTML = createInvoiceHtml(invoiceData, logoBase64, false);
    const canvas1 = await html2canvas(container.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Page 2
    container.innerHTML = createInvoiceHtml(invoiceData, logoBase64, true);
    const canvas2 = await html2canvas(container.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const img1 = canvas1.toDataURL("image/png");
    pdf.addImage(img1, "PNG", 0, 0, pageWidth, pageHeight);

    const img2 = canvas2.toDataURL("image/png");
    pdf.addPage();
    pdf.addImage(img2, "PNG", 0, 0, pageWidth, pageHeight);

    const filename = `Roventis_Invoice_${invoiceData.invoiceNumber}_${invoiceData.clientCompanyName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}