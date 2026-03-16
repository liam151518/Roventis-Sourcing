import { createConvexClient } from "convex/client";
import { api } from "../convex/_generated/api";

const convexUrl = "https://perfect-platypus-307.eu-west-1.convex.cloud";
const deployKey = "prod:perfect-platypus-307|eyJ2MiI6IjAyNjZhMTA3N2I3YTQ1ZmNhYzE4YTU2YmNiMjBjNzA3In0=";

async function seed() {
  const client = createConvexClient(convexUrl, {
    deployKey,
  });

  console.log("Seeding data...");

  // Create training modules
  const moduleIds = [];
  
  const modules = [
    { title: "Welcome to Roventis Sourcing", description: "Learn about our company history, mission, and core values", content: "Welcome to Roventis Sourcing! In this module, you'll learn about our company history, mission, and core values that drive everything we do.", orderIndex: 0, isRequired: true, estimatedMinutes: 15 },
    { title: "Product Catalog Overview", description: "Understand our product offerings and categories", content: "Roventis offers over 5,000 products across multiple categories.", orderIndex: 1, isRequired: true, estimatedMinutes: 20 },
    { title: "Pricing & Commission Structure", description: "Understand pricing, margins, and how you earn", content: "Commission rates: Bronze 5%, Silver 7.5%, Gold 10%, Platinum 12%.", orderIndex: 2, isRequired: true, estimatedMinutes: 15 },
    { title: "Sales Process", description: "Master the Roventis sales methodology", content: "Discovery, Needs Analysis, Solution Design, Proposal, Negotiation, Close, Delivery & Follow-up.", orderIndex: 3, isRequired: true, estimatedMinutes: 25 },
    { title: "Code of Conduct", description: "Professional standards and compliance requirements", content: "As a Roventis affiliate, you must adhere to our code of conduct.", orderIndex: 4, isRequired: true, estimatedMinutes: 15 },
  ];

  for (const m of modules) {
    const id = await client.insert(api.training.createTrainingModule, m);
    moduleIds.push(id);
    console.log(`Created module: ${m.title}`);
  }

  // Create resources
  const resources = [
    { title: "2024 Product Catalog", description: "Complete product catalog with pricing", fileUrl: "/resources/catalog-2024.pdf", fileType: "pdf", category: "catalog", isPublic: true, downloadCount: 0 },
    { title: "Sales Script - Cold Calls", description: "Script for initial client outreach", fileUrl: "/resources/sales-script.pdf", fileType: "pdf", category: "script", isPublic: true, downloadCount: 0 },
    { title: "Objection Handling Guide", description: "Common objections and how to handle them", fileUrl: "/resources/objection-handling.pdf", fileType: "pdf", category: "coaching_sheet", isPublic: true, downloadCount: 0 },
    { title: "Brand Guidelines", description: "Official brand assets and usage guidelines", fileUrl: "/resources/brand-guidelines.pdf", fileType: "pdf", category: "creative", isPublic: true, downloadCount: 0 },
    { title: "Commission Rate Sheet", description: "Current commission rates by tier", fileUrl: "/resources/commission-rates.pdf", fileType: "pdf", category: "price_list", isPublic: true, downloadCount: 0 },
  ];

  for (const r of resources) {
    await client.insert(api.resources.createResource, r);
    console.log(`Created resource: ${r.title}`);
  }

  // Create demo affiliate
  const affiliateId = await client.insert(api.affiliates.createAffiliate, {
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "+27 82 123 4567",
    city: "Cape Town",
    linkedinUrl: "https://linkedin.com/in/johnsmith",
    experienceLevel: "some",
    affiliateCode: "ROV-JSMITH-001",
    referralLink: "https://roventis.co.za/?ref=ROV-JSMITH-001",
    status: "approved",
    tier: "gold",
    trainingCompleted: true,
    trainingScore: 92,
    totalSales: 450000,
    totalCommissionEarned: 45000,
    totalCommissionPaid: 35000,
    bankName: "First National Bank",
    accountNumber: "1234567890",
    accountType: "business",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
  });
  console.log(`Created affiliate: ${affiliateId}`);

  // Create demo deals
  const deals = [
    { affiliateId, clientName: "Sarah Johnson", clientCompany: "TechCorp Solutions", clientEmail: "sarah@techcorp.co.za", dealValue: 85000, productCategory: ["corporate merchandise", "workwear"], description: "Annual corporate merchandise order", status: "closed_won", commissionRate: 10, commissionAmount: 8500, commissionStatus: "paid", createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000 },
    { affiliateId, clientName: "Michael Chen", clientCompany: "SecureForce Ltd", clientEmail: "mchen@secureforce.co.za", dealValue: 120000, productCategory: ["tactical gear"], description: "Tactical equipment order", status: "closed_won", commissionRate: 10, commissionAmount: 12000, commissionStatus: "approved", createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000 },
    { affiliateId, clientName: "Emily van der Merwe", clientCompany: "HealthFirst Clinic", dealValue: 45000, productCategory: ["workwear", "uniforms"], description: "Staff uniforms", status: "negotiation", commissionRate: 10, commissionAmount: 4500, commissionStatus: "pending", createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000 },
    { affiliateId, clientName: "David Botha", clientCompany: "BuildRight Construction", dealValue: 200000, productCategory: ["workwear", "safety gear"], description: "Bulk workwear order", status: "proposal_sent", commissionRate: 10, commissionAmount: 20000, commissionStatus: "pending", createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000 },
  ];

  for (const d of deals) {
    await client.insert(api.deals.createDeal, d);
    console.log(`Created deal: ${d.clientName} - R${d.dealValue}`);
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
