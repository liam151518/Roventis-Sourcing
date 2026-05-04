"use client";

import React from "react";
import { ROVENTIS_COMPANY } from "@/lib/roventisConstants";

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

// Settings interface for global invoice customization
export interface InvoiceSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyWebsite: string;
  companySocial: string;
  bankName: string;
  accountType: string;
  accountNumber: string;
  branchCode: string;
  accountHolder: string;
  tagline: string;
  defaultNotes: string[];
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  dividerColor: string;
}

interface InvoicePreviewProps {
  invoiceData: InvoiceData;
  logoBase64: string;
  scale?: number;
  settings?: InvoiceSettings | null;
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

export function InvoicePreview({ invoiceData, logoBase64, scale = 1, settings }: InvoicePreviewProps) {
  const { invoiceNumber, invoiceDate, clientCompanyName, clientAddress1, clientAddress2, clientVatNumber, clientEmail, projectSummary, lineItems, notes, subtotal, total } = invoiceData;

  // Use settings if available, otherwise fall back to constants
  const company = settings ? {
    name: settings.companyName,
    email: settings.companyEmail,
    phone: settings.companyPhone,
    website: settings.companyWebsite,
    social: settings.companySocial,
    bankName: settings.bankName,
    accountType: settings.accountType,
    accountNumber: settings.accountNumber,
    branchCode: settings.branchCode,
    accountHolder: settings.accountHolder,
    tagline: settings.tagline,
  } : ROVENTIS_COMPANY;

  const primaryColor = settings?.primaryColor || "#F97316";
  const dividerColor = settings?.dividerColor || "#F97316";
  const headerBgColor = settings?.secondaryColor || "#1f2937";

  // Page 1 content
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: "794px",
        minHeight: "1123px",
        padding: "40px",
        boxSizing: "border-box",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "white",
        color: "#1f2937",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        {logoBase64 ? (
          <img src={logoBase64} alt="Roventis" style={{ height: "60px", display: "block", margin: "0 auto" }} />
        ) : (
          <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <span style={{ fontSize: "24px", fontWeight: 700, color: primaryColor }}>ROVENTIS SOURCING</span>
          </div>
        )}
      </div>

      {/* Dynamic color divider */}
      <div style={{ borderTop: `3px solid ${dividerColor}`, marginBottom: "30px" }} />

      {/* Header two columns */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left column - Bill To */}
        <div style={{ flex: 1 }}>
          <h3 style={{ color: "#1f2937", margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600 }}>BILL TO:</h3>
          <p style={{ margin: 0, color: "#1f2937", fontWeight: 600, fontSize: "14px" }}>{clientCompanyName}</p>
          {clientAddress1 && <p style={{ margin: 0, color: "#374151", fontSize: "13px" }}>{clientAddress1}</p>}
          {clientAddress2 && <p style={{ margin: 0, color: "#374151", fontSize: "13px" }}>{clientAddress2}</p>}
          {clientVatNumber && <p style={{ margin: 0, color: "#374151", fontSize: "13px" }}>VAT: {clientVatNumber}</p>}
          {clientEmail && <p style={{ margin: 0, color: "#374151", fontSize: "13px" }}>{clientEmail}</p>}
        </div>

        {/* Right column - Invoice details */}
        <div style={{ flex: 1, textAlign: "right" }}>
          <h3 style={{ color: "#1f2937", margin: "0 0 8px 0", fontSize: "14px", fontWeight: 600 }}>INVOICE NO. {invoiceNumber}</h3>
          <p style={{ margin: 0, color: "#374151", fontSize: "13px" }}>Date: {formatDate(invoiceDate)}</p>
          <p style={{ margin: "20px 0 0 0", color: "#374151", fontSize: "13px" }}>{company.email}</p>
          <p style={{ margin: 0, color: "#374151", fontSize: "13px" }}>{company.phone}</p>
          <p style={{ margin: 0, color: "#374151", fontSize: "13px" }}>{company.website}</p>
          <p style={{ margin: 0, color: "#374151", fontSize: "13px" }}>{company.social}</p>
        </div>
      </div>

      {/* Project Summary */}
      {projectSummary && (
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ color: "#1f2937", fontSize: "14px", fontWeight: 600, fontStyle: "italic", marginBottom: "8px" }}>Project Summary</h3>
          <p style={{ margin: 0, color: "#374151", fontSize: "13px" }}>{projectSummary}</p>
        </div>
      )}

      {/* Line items table */}
      <div style={{ marginTop: "30px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: headerBgColor }}>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "white", fontSize: "12px", fontWeight: 600, width: "100px" }}>IMAGE</th>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "white", fontSize: "12px", fontWeight: 600 }}>DESCRIPTION</th>
              <th style={{ padding: "12px 8px", textAlign: "right", color: "white", fontSize: "12px", fontWeight: 600 }}>UNIT PRICE</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "white", fontSize: "12px", fontWeight: 600 }}>QTY</th>
              <th style={{ padding: "12px 8px", textAlign: "right", color: "white", fontSize: "12px", fontWeight: 600 }}>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb", verticalAlign: "middle" }}>
                  {item.imageDataUrl ? (
                    <img src={item.imageDataUrl} alt={item.productName} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }} />
                  ) : (
                    <div style={{ width: "80px", height: "80px", background: "#f3f4f6", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "12px" }}>No Image</div>
                  )}
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb" }}>
                  <div style={{ fontWeight: 600, color: "#1f2937" }}>{item.productName}</div>
                  {item.productSubtitle && <div style={{ color: "#6b7280", fontSize: "13px" }}>{item.productSubtitle}</div>}
                </td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb", textAlign: "right", color: "#374151" }}>{ZAR(item.unitPrice)}</td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb", textAlign: "center", color: "#374151" }}>{item.quantity}</td>
                <td style={{ padding: "12px 8px", borderBottom: "1px solid #e5e7eb", textAlign: "right", color: "#374151", fontWeight: 600 }}>{ZAR(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>Subtotal: {ZAR(subtotal)}</p>
        <p style={{ margin: "8px 0 0 0", color: "#1f2937", fontSize: "16px", fontWeight: 700 }}>TOTAL {ZAR(total)}</p>
      </div>

      {/* Notes - use settings defaultNotes if no custom notes provided */}
      {(notes.length > 0 || (settings?.defaultNotes && settings.defaultNotes.length > 0)) && (
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ color: "#1f2937", fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>Notes:</h3>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "#374151", fontSize: "13px" }}>
            {(notes.length > 0 ? notes : settings?.defaultNotes || []).map((note, idx) => (
              <li key={idx} style={{ marginBottom: "6px" }}>{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Tagline */}
      <div style={{ marginTop: "60px", textAlign: "center" }}>
        <p style={{ margin: 0, color: "#6b7280", fontSize: "12px", fontStyle: "italic" }}>{company.tagline}</p>
      </div>

      {/* Page 2 - Payment Information */}
      <div style={{ pageBreakBefore: "always", marginTop: "40px", paddingTop: "40px" }}>
        <div style={{ borderTop: `3px solid ${dividerColor}`, marginBottom: "40px" }} />

        <h2 style={{ color: "#1f2937", marginBottom: "30px", fontSize: "18px", fontWeight: 600 }}>Payment Information</h2>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: "8px 0", color: "#374151" }}><strong>Bank:</strong> {company.bankName}</p>
            <p style={{ margin: "8px 0", color: "#374151" }}><strong>Account Type:</strong> {company.accountType}</p>
            <p style={{ margin: "8px 0", color: "#374151" }}><strong>Account Number:</strong> {company.accountNumber}</p>
            <p style={{ margin: "8px 0", color: "#374151" }}><strong>Branch Code:</strong> {company.branchCode}</p>
            <p style={{ margin: "8px 0", color: "#374151" }}><strong>Account Holder:</strong> {company.accountHolder}</p>
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ margin: "8px 0", color: "#374151", fontStyle: "italic" }}>
              Please include <strong>{clientCompanyName}</strong> as your payment reference.
            </p>
            <p style={{ margin: "20px 0 0 0", color: "#374151" }}>
              Once payment is received, production will begin immediately and a confirmation receipt will be issued.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}