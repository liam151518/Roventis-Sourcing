"use client";

import { ReactNode, createContext, useContext } from "react";

export type AffiliateTier = "bronze" | "silver" | "gold" | "platinum";
export type DealStatus = "prospect" | "qualified" | "proposal_sent" | "negotiation" | "closed_won" | "closed_lost" | "on_hold";
export type CommissionStatus = "pending" | "approved" | "paid" | "disputed";
export type AffiliateStatus = "pending" | "approved" | "rejected" | "suspended" | "inactive";

export interface Affiliate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  linkedinUrl?: string;
  experienceLevel?: "none" | "some" | "extensive";
  affiliateCode: string;
  referralLink: string;
  status: AffiliateStatus;
  tier: AffiliateTier;
  trainingCompleted: boolean;
  trainingScore?: number;
  totalSales: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  bankName?: string;
  accountNumber?: string;
  accountType?: string;
  createdAt: Date;
}

export interface Deal {
  id: string;
  affiliateId: string;
  clientName: string;
  clientCompany?: string;
  clientEmail?: string;
  clientPhone?: string;
  dealValue: number;
  productCategory: string[];
  description?: string;
  status: DealStatus;
  commissionRate: number;
  commissionAmount: number;
  commissionStatus: CommissionStatus;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  createdAt: Date;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  orderIndex: number;
  isRequired: boolean;
  estimatedMinutes: number;
}

export interface TrainingProgress {
  id: string;
  affiliateId: string;
  moduleId: string;
  status: "not_started" | "in_progress" | "completed";
  completedAt?: Date;
  quizScore?: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  fileType: "pdf" | "video" | "image" | "link";
  category: "coaching_sheet" | "catalog" | "price_list" | "script" | "creative" | "legal";
  isPublic: boolean;
  downloadCount: number;
  createdAt: Date;
}

export interface CommissionPayout {
  id: string;
  affiliateId: string;
  amount: number;
  status: "pending" | "processing" | "paid" | "failed";
  paymentMethod?: string;
  paidAt?: Date;
  referenceNumber?: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  affiliateId: string;
  action: string;
  metadata?: Record<string, string | number | boolean | undefined>;
  createdAt: Date;
}

interface DemoDataContextType {
  affiliates: Affiliate[];
  deals: Deal[];
  trainingModules: TrainingModule[];
  trainingProgress: TrainingProgress[];
  resources: Resource[];
  commissionPayouts: CommissionPayout[];
  activityLogs: ActivityLog[];
}

const DemoDataContext = createContext<DemoDataContextType | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const value: DemoDataContextType = {
    affiliates: demoAffiliates,
    deals: demoDeals,
    trainingModules: demoTrainingModules,
    trainingProgress: demoTrainingProgress,
    resources: demoResources,
    commissionPayouts: demoCommissionPayouts,
    activityLogs: demoActivityLogs,
  };

  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
}

export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error("useDemoData must be used within DemoDataProvider");
  }
  return context;
}

const demoAffiliates: Affiliate[] = [
  {
    id: "aff-001",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    phone: "+27 82 123 4567",
    city: "Johannesburg",
    linkedinUrl: "https://linkedin.com/in/johnsmith",
    experienceLevel: "extensive",
    affiliateCode: "ROV-JSMITH-001",
    referralLink: "https://roventis.co.za/?ref=ROV-JSMITH-001",
    status: "approved",
    tier: "gold",
    trainingCompleted: true,
    trainingScore: 92,
    totalSales: 450000,
    totalCommissionEarned: 45000,
    totalCommissionPaid: 35000,
    bankName: "Standard Bank",
    accountNumber: "1234567890",
    accountType: "business",
    createdAt: new Date("2025-06-15"),
  },
  {
    id: "aff-002",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.j@email.com",
    phone: "+27 83 234 5678",
    city: "Cape Town",
    linkedinUrl: "https://linkedin.com/in/sarahjohnson",
    experienceLevel: "some",
    affiliateCode: "ROV-SJOHNSON-002",
    referralLink: "https://roventis.co.za/?ref=ROV-SJOHNSON-002",
    status: "approved",
    tier: "silver",
    trainingCompleted: true,
    trainingScore: 85,
    totalSales: 125000,
    totalCommissionEarned: 9375,
    totalCommissionPaid: 6250,
    bankName: "FNB",
    accountNumber: "2345678901",
    accountType: "personal",
    createdAt: new Date("2025-08-20"),
  },
  {
    id: "aff-003",
    firstName: "Mike",
    lastName: "Williams",
    email: "mike.w@email.com",
    city: "Durban",
    experienceLevel: "none",
    affiliateCode: "ROV-MWILLIAMS-003",
    referralLink: "https://roventis.co.za/?ref=ROV-MWILLIAMS-003",
    status: "approved",
    tier: "bronze",
    trainingCompleted: true,
    trainingScore: 78,
    totalSales: 35000,
    totalCommissionEarned: 1750,
    totalCommissionPaid: 0,
    bankName: "Absa",
    accountNumber: "3456789012",
    accountType: "personal",
    createdAt: new Date("2025-11-01"),
  },
  {
    id: "aff-004",
    firstName: "Emily",
    lastName: "Brown",
    email: "emily.b@email.com",
    city: "Pretoria",
    linkedinUrl: "https://linkedin.com/in/emilybrown",
    experienceLevel: "extensive",
    affiliateCode: "ROV-EBROWN-004",
    referralLink: "https://roventis.co.za/?ref=ROV-EBROWN-004",
    status: "approved",
    tier: "platinum",
    trainingCompleted: true,
    trainingScore: 98,
    totalSales: 890000,
    totalCommissionEarned: 106800,
    totalCommissionPaid: 85000,
    bankName: "Nedbank",
    accountNumber: "4567890123",
    accountType: "business",
    createdAt: new Date("2025-03-10"),
  },
  {
    id: "aff-005",
    firstName: "David",
    lastName: "Miller",
    email: "david.m@email.com",
    city: "Johannesburg",
    experienceLevel: "some",
    affiliateCode: "ROV-DMILLER-005",
    referralLink: "https://roventis.co.za/?ref=ROV-DMILLER-005",
    status: "pending",
    tier: "bronze",
    trainingCompleted: false,
    totalSales: 0,
    totalCommissionEarned: 0,
    totalCommissionPaid: 0,
    createdAt: new Date("2026-02-20"),
  },
  {
    id: "aff-006",
    firstName: "Lisa",
    lastName: "Davis",
    email: "lisa.d@email.com",
    city: "Cape Town",
    experienceLevel: "extensive",
    affiliateCode: "ROV-LDAVIS-006",
    referralLink: "https://roventis.co.za/?ref=ROV-LDAVIS-006",
    status: "approved",
    tier: "gold",
    trainingCompleted: true,
    trainingScore: 95,
    totalSales: 380000,
    totalCommissionEarned: 38000,
    totalCommissionPaid: 28000,
    bankName: "Standard Bank",
    accountNumber: "5678901234",
    accountType: "business",
    createdAt: new Date("2025-05-22"),
  },
  {
    id: "aff-007",
    firstName: "James",
    lastName: "Taylor",
    email: "james.t@email.com",
    city: "Port Elizabeth",
    experienceLevel: "some",
    affiliateCode: "ROV-JTAYLOR-007",
    referralLink: "https://roventis.co.za/?ref=ROV-JTAYLOR-007",
    status: "suspended",
    tier: "bronze",
    trainingCompleted: true,
    trainingScore: 72,
    totalSales: 15000,
    totalCommissionEarned: 750,
    totalCommissionPaid: 750,
    createdAt: new Date("2025-09-15"),
  },
  {
    id: "aff-008",
    firstName: "Anna",
    lastName: "Wilson",
    email: "anna.w@email.com",
    city: "Johannesburg",
    experienceLevel: "extensive",
    affiliateCode: "ROV-AWILSON-008",
    referralLink: "https://roventis.co.za/?ref=ROV-AWILSON-008",
    status: "approved",
    tier: "silver",
    trainingCompleted: true,
    trainingScore: 88,
    totalSales: 180000,
    totalCommissionEarned: 13500,
    totalCommissionPaid: 9000,
    bankName: "FNB",
    accountNumber: "6789012345",
    accountType: "personal",
    createdAt: new Date("2025-07-08"),
  },
  {
    id: "aff-009",
    firstName: "Robert",
    lastName: "Moore",
    email: "robert.m@email.com",
    city: "Cape Town",
    experienceLevel: "some",
    affiliateCode: "ROV-RMOORE-009",
    referralLink: "https://roventis.co.za/?ref=ROV-RMOORE-009",
    status: "approved",
    tier: "bronze",
    trainingCompleted: true,
    trainingScore: 80,
    totalSales: 45000,
    totalCommissionEarned: 2250,
    totalCommissionPaid: 0,
    bankName: "Absa",
    accountNumber: "7890123456",
    accountType: "personal",
    createdAt: new Date("2025-12-01"),
  },
  {
    id: "aff-010",
    firstName: "Jennifer",
    lastName: "White",
    email: "jennifer.w@email.com",
    city: "Durban",
    experienceLevel: "extensive",
    affiliateCode: "ROV-JWHITE-010",
    referralLink: "https://roventis.co.za/?ref=ROV-JWHITE-010",
    status: "approved",
    tier: "gold",
    trainingCompleted: true,
    trainingScore: 94,
    totalSales: 520000,
    totalCommissionEarned: 52000,
    totalCommissionPaid: 40000,
    bankName: "Nedbank",
    accountNumber: "8901234567",
    accountType: "business",
    createdAt: new Date("2025-04-18"),
  },
];

const demoDeals: Deal[] = [
  {
    id: "deal-001",
    affiliateId: "aff-001",
    clientName: "ABC Security Solutions",
    clientCompany: "ABC Security",
    clientEmail: "procurement@abcsecurity.co.za",
    clientPhone: "+27 11 123 4567",
    dealValue: 85000,
    productCategory: ["tactical_gear"],
    description: "Security uniforms and tactical equipment for 50 guards",
    status: "closed_won",
    commissionRate: 10,
    commissionAmount: 8500,
    commissionStatus: "paid",
    expectedCloseDate: new Date("2026-01-15"),
    actualCloseDate: new Date("2026-01-10"),
    createdAt: new Date("2025-11-20"),
  },
  {
    id: "deal-002",
    affiliateId: "aff-001",
    clientName: "XYZ Corporate Wear",
    clientCompany: "XYZ Holdings",
    clientEmail: "ops@xyzholdings.co.za",
    dealValue: 120000,
    productCategory: ["corporate_merch"],
    description: "Branded corporate gifts for year-end function",
    status: "negotiation",
    commissionRate: 10,
    commissionAmount: 12000,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-03-01"),
    createdAt: new Date("2026-01-15"),
  },
  {
    id: "deal-003",
    affiliateId: "aff-001",
    clientName: "Mega Events Co",
    clientCompany: "Mega Events",
    clientEmail: "events@megaevents.co.za",
    dealValue: 250000,
    productCategory: ["event_merch", "corporate_merch"],
    description: "Full event merchandise package",
    status: "proposal_sent",
    commissionRate: 10,
    commissionAmount: 25000,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-04-15"),
    createdAt: new Date("2026-02-01"),
  },
  {
    id: "deal-004",
    affiliateId: "aff-002",
    clientName: "Cape Trade Supplies",
    clientCompany: "Cape Trade",
    clientEmail: "orders@capetrade.co.za",
    dealValue: 45000,
    productCategory: ["workwear"],
    description: "Work uniforms for warehouse staff",
    status: "qualified",
    commissionRate: 7.5,
    commissionAmount: 3375,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-03-20"),
    createdAt: new Date("2026-02-10"),
  },
  {
    id: "deal-005",
    affiliateId: "aff-002",
    clientName: "Tech Solutions PTY",
    clientCompany: "Tech Solutions",
    dealValue: 35000,
    productCategory: ["corporate_merch"],
    description: "Welcome packs for new employees",
    status: "prospect",
    commissionRate: 7.5,
    commissionAmount: 2625,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-04-01"),
    createdAt: new Date("2026-02-20"),
  },
  {
    id: "deal-006",
    affiliateId: "aff-003",
    clientName: "Local Restaurant",
    clientCompany: "Bistro 45",
    dealValue: 15000,
    productCategory: ["branded_merch"],
    description: "Aprons and menu covers",
    status: "prospect",
    commissionRate: 5,
    commissionAmount: 750,
    commissionStatus: "pending",
    createdAt: new Date("2026-02-15"),
  },
  {
    id: "deal-007",
    affiliateId: "aff-004",
    clientName: "National Mining Corp",
    clientCompany: "Mining Corp Ltd",
    clientEmail: "procurement@miningcorp.co.za",
    dealValue: 550000,
    productCategory: ["tactical_gear", "workwear"],
    description: "Full PPE and tactical gear for mining operation",
    status: "closed_won",
    commissionRate: 12,
    commissionAmount: 66000,
    commissionStatus: "approved",
    expectedCloseDate: new Date("2026-01-30"),
    actualCloseDate: new Date("2026-01-25"),
    createdAt: new Date("2025-10-15"),
  },
  {
    id: "deal-008",
    affiliateId: "aff-004",
    clientName: "Government Department",
    clientCompany: "Dept of Public Works",
    dealValue: 320000,
    productCategory: ["workwear", "uniforms"],
    description: "Uniforms for government officials",
    status: "negotiation",
    commissionRate: 12,
    commissionAmount: 38400,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-03-15"),
    createdAt: new Date("2025-12-01"),
  },
  {
    id: "deal-009",
    affiliateId: "aff-004",
    clientName: "Logistics Plus",
    clientCompany: "Logistics Plus PTY",
    dealValue: 180000,
    productCategory: ["workwear", "tactical_gear"],
    description: "Driver and warehouse uniforms",
    status: "proposal_sent",
    commissionRate: 12,
    commissionAmount: 21600,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-04-01"),
    createdAt: new Date("2026-01-20"),
  },
  {
    id: "deal-010",
    affiliateId: "aff-006",
    clientName: "Premium Hotels Group",
    clientCompany: "Premium Hotels",
    dealValue: 95000,
    productCategory: ["hospitality"],
    description: "Hotel uniforms and linens",
    status: "closed_won",
    commissionRate: 10,
    commissionAmount: 9500,
    commissionStatus: "paid",
    expectedCloseDate: new Date("2026-01-20"),
    actualCloseDate: new Date("2026-01-18"),
    createdAt: new Date("2025-11-10"),
  },
  {
    id: "deal-011",
    affiliateId: "aff-006",
    clientName: "Restaurant Chain SA",
    clientCompany: "Eat Right PTY",
    dealValue: 145000,
    productCategory: ["branded_merch", "workwear"],
    description: "Restaurant branding and staff wear",
    status: "qualified",
    commissionRate: 10,
    commissionAmount: 14500,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-03-30"),
    createdAt: new Date("2026-01-25"),
  },
  {
    id: "deal-012",
    affiliateId: "aff-008",
    clientName: "JHB Manufacturing",
    clientCompany: "JHB MFG PTY",
    dealValue: 78000,
    productCategory: ["workwear"],
    description: "Factory worker uniforms",
    status: "closed_won",
    commissionRate: 7.5,
    commissionAmount: 5850,
    commissionStatus: "approved",
    expectedCloseDate: new Date("2026-02-01"),
    actualCloseDate: new Date("2026-01-28"),
    createdAt: new Date("2025-12-15"),
  },
  {
    id: "deal-013",
    affiliateId: "aff-008",
    clientName: "Tech Startup Hub",
    clientCompany: "Innovation Hub",
    dealValue: 28000,
    productCategory: ["corporate_merch"],
    description: "Startup welcome kits",
    status: "proposal_sent",
    commissionRate: 7.5,
    commissionAmount: 2100,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-03-15"),
    createdAt: new Date("2026-02-05"),
  },
  {
    id: "deal-014",
    affiliateId: "aff-010",
    clientName: "Financial Services Corp",
    clientCompany: "FinCorp PTY",
    dealValue: 210000,
    productCategory: ["corporate_merch"],
    description: "Executive gifts and branded items",
    status: "closed_won",
    commissionRate: 10,
    commissionAmount: 21000,
    commissionStatus: "paid",
    expectedCloseDate: new Date("2026-01-25"),
    actualCloseDate: new Date("2026-01-22"),
    createdAt: new Date("2025-11-01"),
  },
  {
    id: "deal-015",
    affiliateId: "aff-010",
    clientName: "Medical Practice Group",
    clientCompany: "HealthPlus",
    dealValue: 65000,
    productCategory: ["workwear", "medical"],
    description: "Medical scrubs and lab coats",
    status: "negotiation",
    commissionRate: 10,
    commissionAmount: 6500,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-03-10"),
    createdAt: new Date("2026-01-10"),
  },
  {
    id: "deal-016",
    affiliateId: "aff-009",
    clientName: "Beach Resort",
    clientCompany: "Sunset Beach Resort",
    dealValue: 42000,
    productCategory: ["hospitality"],
    description: "Resort staff uniforms",
    status: "prospect",
    commissionRate: 5,
    commissionAmount: 2100,
    commissionStatus: "pending",
    createdAt: new Date("2026-02-18"),
  },
  {
    id: "deal-017",
    affiliateId: "aff-001",
    clientName: "Construction Company",
    clientCompany: "BuildRight PTY",
    dealValue: 165000,
    productCategory: ["workwear", "tactical_gear"],
    description: "Construction site PPE",
    status: "qualified",
    commissionRate: 10,
    commissionAmount: 16500,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-04-20"),
    createdAt: new Date("2026-02-08"),
  },
  {
    id: "deal-018",
    affiliateId: "aff-004",
    clientName: "Retail Chain",
    clientCompany: "ShopMax PTY",
    dealValue: 280000,
    productCategory: ["workwear", "corporate_merch"],
    description: "Store staff uniforms and marketing materials",
    status: "proposal_sent",
    commissionRate: 12,
    commissionAmount: 33600,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-05-01"),
    createdAt: new Date("2026-01-30"),
  },
  {
    id: "deal-019",
    affiliateId: "aff-002",
    clientName: "Fitness Center Chain",
    clientCompany: "FitLife PTY",
    dealValue: 55000,
    productCategory: ["branded_merch", "workwear"],
    description: "Staff uniforms and promotional items",
    status: "on_hold",
    commissionRate: 7.5,
    commissionAmount: 4125,
    commissionStatus: "pending",
    expectedCloseDate: new Date("2026-04-15"),
    createdAt: new Date("2026-01-05"),
  },
  {
    id: "deal-020",
    affiliateId: "aff-006",
    clientName: "Car Dealership",
    clientCompany: "AutoMax PTY",
    dealValue: 38000,
    productCategory: ["workwear"],
    description: "Sales and service staff uniforms",
    status: "closed_won",
    commissionRate: 10,
    commissionAmount: 3800,
    commissionStatus: "paid",
    expectedCloseDate: new Date("2026-02-10"),
    actualCloseDate: new Date("2026-02-08"),
    createdAt: new Date("2025-12-20"),
  },
];

const demoTrainingModules: TrainingModule[] = [
  {
    id: "mod-001",
    title: "Welcome to Roventis Sourcing",
    description: "An introduction to our company, values, and what makes us different in the industry.",
    content: "Welcome to Roventis Sourcing! In this module, you'll learn about our company history, mission, and core values that drive everything we do.",
    orderIndex: 1,
    isRequired: true,
    estimatedMinutes: 10,
  },
  {
    id: "mod-002",
    title: "Product Catalog Deep Dive",
    description: "Explore our extensive product range including tactical gear, corporate merchandise, workwear, and custom manufacturing options.",
    content: "Roventis offers over 5,000 products across multiple categories. This module covers our core offerings and how to match client needs with our products.",
    orderIndex: 2,
    isRequired: true,
    estimatedMinutes: 20,
  },
  {
    id: "mod-003",
    title: "Our Competitive Advantages",
    description: "Understand what sets Roventis apart - pricing, quality, turnaround times, and custom manufacturing capabilities.",
    content: "Our competitive edge includes: Direct factory pricing, 48-hour turnaround on rush orders, South African manufacturing, and dedicated account management.",
    orderIndex: 3,
    isRequired: true,
    estimatedMinutes: 15,
  },
  {
    id: "mod-004",
    title: "The Sales Process",
    description: "Learn our proven sales methodology from lead generation to closing deals.",
    content: "The Roventis sales process: 1. Discovery 2. Needs Analysis 3. Solution Design 4. Proposal 5. Negotiation 6. Close 7. Delivery & Follow-up.",
    orderIndex: 4,
    isRequired: true,
    estimatedMinutes: 25,
  },
  {
    id: "mod-005",
    title: "Using Your Tools",
    description: "Navigate the affiliate dashboard, create deals, track commissions, and access resources.",
    content: "Your dashboard includes: Deal pipeline, commission tracker, resource library, training center, and profile settings. This module walks through each feature.",
    orderIndex: 5,
    isRequired: true,
    estimatedMinutes: 15,
  },
  {
    id: "mod-006",
    title: "Compliance & Ethics",
    description: "Important guidelines for ethical selling, data privacy (POPIA), and professional conduct.",
    content: "As a Roventis affiliate, you must adhere to our code of conduct, respect client privacy under POPIA, and represent our brand professionally at all times.",
    orderIndex: 6,
    isRequired: true,
    estimatedMinutes: 10,
  },
];

const demoTrainingProgress: TrainingProgress[] = [
  { id: "tp-001", affiliateId: "aff-001", moduleId: "mod-001", status: "completed", completedAt: new Date("2025-06-16"), quizScore: 95 },
  { id: "tp-002", affiliateId: "aff-001", moduleId: "mod-002", status: "completed", completedAt: new Date("2025-06-17"), quizScore: 92 },
  { id: "tp-003", affiliateId: "aff-001", moduleId: "mod-003", status: "completed", completedAt: new Date("2025-06-18"), quizScore: 90 },
  { id: "tp-004", affiliateId: "aff-001", moduleId: "mod-004", status: "completed", completedAt: new Date("2025-06-19"), quizScore: 94 },
  { id: "tp-005", affiliateId: "aff-001", moduleId: "mod-005", status: "completed", completedAt: new Date("2025-06-20"), quizScore: 88 },
  { id: "tp-006", affiliateId: "aff-001", moduleId: "mod-006", status: "completed", completedAt: new Date("2025-06-21"), quizScore: 92 },
  { id: "tp-007", affiliateId: "aff-002", moduleId: "mod-001", status: "completed", completedAt: new Date("2025-08-21"), quizScore: 85 },
  { id: "tp-008", affiliateId: "aff-002", moduleId: "mod-002", status: "completed", completedAt: new Date("2025-08-22"), quizScore: 82 },
  { id: "tp-009", affiliateId: "aff-002", moduleId: "mod-003", status: "completed", completedAt: new Date("2025-08-23"), quizScore: 88 },
  { id: "tp-010", affiliateId: "aff-002", moduleId: "mod-004", status: "completed", completedAt: new Date("2025-08-24"), quizScore: 80 },
  { id: "tp-011", affiliateId: "aff-002", moduleId: "mod-005", status: "completed", completedAt: new Date("2025-08-25"), quizScore: 85 },
  { id: "tp-012", affiliateId: "aff-002", moduleId: "mod-006", status: "completed", completedAt: new Date("2025-08-26"), quizScore: 90 },
  { id: "tp-013", affiliateId: "aff-004", moduleId: "mod-001", status: "completed", completedAt: new Date("2025-03-11"), quizScore: 98 },
  { id: "tp-014", affiliateId: "aff-004", moduleId: "mod-002", status: "completed", completedAt: new Date("2025-03-12"), quizScore: 96 },
  { id: "tp-015", affiliateId: "aff-004", moduleId: "mod-003", status: "completed", completedAt: new Date("2025-03-13"), quizScore: 100 },
  { id: "tp-016", affiliateId: "aff-004", moduleId: "mod-004", status: "completed", completedAt: new Date("2025-03-14"), quizScore: 98 },
  { id: "tp-017", affiliateId: "aff-004", moduleId: "mod-005", status: "completed", completedAt: new Date("2025-03-15"), quizScore: 96 },
  { id: "tp-018", affiliateId: "aff-004", moduleId: "mod-006", status: "completed", completedAt: new Date("2025-03-16"), quizScore: 100 },
  { id: "tp-019", affiliateId: "aff-006", moduleId: "mod-001", status: "completed", completedAt: new Date("2025-05-23"), quizScore: 95 },
  { id: "tp-020", affiliateId: "aff-006", moduleId: "mod-002", status: "completed", completedAt: new Date("2025-05-24"), quizScore: 92 },
  { id: "tp-021", affiliateId: "aff-006", moduleId: "mod-003", status: "completed", completedAt: new Date("2025-05-25"), quizScore: 96 },
  { id: "tp-022", affiliateId: "aff-006", moduleId: "mod-004", status: "completed", completedAt: new Date("2025-05-26"), quizScore: 94 },
  { id: "tp-023", affiliateId: "aff-006", moduleId: "mod-005", status: "completed", completedAt: new Date("2025-05-27"), quizScore: 98 },
  { id: "tp-024", affiliateId: "aff-006", moduleId: "mod-006", status: "completed", completedAt: new Date("2025-05-28"), quizScore: 94 },
];

const demoResources: Resource[] = [
  {
    id: "res-001",
    title: "2026 Product Catalog",
    description: "Complete product catalog with pricing for all categories",
    fileUrl: "/resources/catalog-2026.pdf",
    fileType: "pdf",
    category: "catalog",
    isPublic: false,
    downloadCount: 156,
    createdAt: new Date("2026-01-01"),
  },
  {
    id: "res-002",
    title: "Sales Script - Cold Calls",
    description: "Proven cold call script for reaching potential clients",
    fileUrl: "/resources/cold-call-script.pdf",
    fileType: "pdf",
    category: "script",
    isPublic: false,
    downloadCount: 89,
    createdAt: new Date("2025-06-15"),
  },
  {
    id: "res-003",
    title: "Objection Handling Guide",
    description: "Common objections and how to overcome them",
    fileUrl: "/resources/objections.pdf",
    fileType: "pdf",
    category: "coaching_sheet",
    isPublic: false,
    downloadCount: 124,
    createdAt: new Date("2025-07-01"),
  },
  {
    id: "res-004",
    title: "Corporate Merchandise Pricing Matrix",
    description: "Tiered pricing for bulk corporate orders",
    fileUrl: "/resources/pricing-matrix.xlsx",
    fileType: "pdf",
    category: "price_list",
    isPublic: false,
    downloadCount: 98,
    createdAt: new Date("2025-08-01"),
  },
  {
    id: "res-005",
    title: "Brand Guidelines",
    description: "Roventis brand assets and guidelines",
    fileUrl: "/resources/brand-guidelines.pdf",
    fileType: "pdf",
    category: "creative",
    isPublic: false,
    downloadCount: 67,
    createdAt: new Date("2025-05-01"),
  },
  {
    id: "res-006",
    title: "Proposal Template",
    description: "Professional proposal template for clients",
    fileUrl: "/resources/proposal-template.docx",
    fileType: "pdf",
    category: "legal",
    isPublic: false,
    downloadCount: 145,
    createdAt: new Date("2025-06-01"),
  },
  {
    id: "res-007",
    title: "Tactical Gear Catalog",
    description: "Specialized tactical and security equipment catalog",
    fileUrl: "/resources/tactical-catalog.pdf",
    fileType: "pdf",
    category: "catalog",
    isPublic: false,
    downloadCount: 78,
    createdAt: new Date("2025-09-01"),
  },
  {
    id: "res-008",
    title: "Email Templates",
    description: "Follow-up and introduction email templates",
    fileUrl: "/resources/email-templates.pdf",
    fileType: "pdf",
    category: "script",
    isPublic: false,
    downloadCount: 112,
    createdAt: new Date("2025-07-15"),
  },
  {
    id: "res-009",
    title: "Workwear Size Guide",
    description: "Size charts and measurement guide for workwear",
    fileUrl: "/resources/size-guide.pdf",
    fileType: "pdf",
    category: "coaching_sheet",
    isPublic: false,
    downloadCount: 56,
    createdAt: new Date("2025-08-15"),
  },
  {
    id: "res-010",
    title: "Q1 2026 Price List",
    description: "Updated pricing for Q1 2026",
    fileUrl: "/resources/prices-q1-2026.xlsx",
    fileType: "pdf",
    category: "price_list",
    isPublic: false,
    downloadCount: 134,
    createdAt: new Date("2026-01-15"),
  },
  {
    id: "res-011",
    title: "Social Media Kit",
    description: "Ready-to-use social media graphics and posts",
    fileUrl: "/resources/social-kit.zip",
    fileType: "image",
    category: "creative",
    isPublic: false,
    downloadCount: 45,
    createdAt: new Date("2025-10-01"),
  },
  {
    id: "res-012",
    title: "Event Merchandise Guide",
    description: "Guide to event merchandise options and pricing",
    fileUrl: "/resources/event-merch-guide.pdf",
    fileType: "pdf",
    category: "coaching_sheet",
    isPublic: false,
    downloadCount: 67,
    createdAt: new Date("2025-11-01"),
  },
  {
    id: "res-013",
    title: "Medical Uniforms Catalog",
    description: "Healthcare and medical uniform options",
    fileUrl: "/resources/medical-catalog.pdf",
    fileType: "pdf",
    category: "catalog",
    isPublic: false,
    downloadCount: 43,
    createdAt: new Date("2025-12-01"),
  },
  {
    id: "res-014",
    title: "Terms and Conditions",
    description: "Standard terms and conditions for clients",
    fileUrl: "/resources/terms.pdf",
    fileType: "pdf",
    category: "legal",
    isPublic: false,
    downloadCount: 89,
    createdAt: new Date("2025-04-01"),
  },
  {
    id: "res-015",
    title: "Presentation Deck",
    description: "Company presentation for client meetings",
    fileUrl: "/resources/presentation.pptx",
    fileType: "pdf",
    category: "creative",
    isPublic: false,
    downloadCount: 167,
    createdAt: new Date("2025-05-15"),
  },
];

const demoCommissionPayouts: CommissionPayout[] = [
  { id: "payout-001", affiliateId: "aff-001", amount: 8500, status: "paid", paymentMethod: "eft", paidAt: new Date("2026-01-25"), referenceNumber: "EFT-2026-001", createdAt: new Date("2026-01-12") },
  { id: "payout-002", affiliateId: "aff-004", amount: 66000, status: "paid", paymentMethod: "eft", paidAt: new Date("2026-02-01"), referenceNumber: "EFT-2026-002", createdAt: new Date("2026-01-27") },
  { id: "payout-003", affiliateId: "aff-006", amount: 9500, status: "paid", paymentMethod: "eft", paidAt: new Date("2026-01-30"), referenceNumber: "EFT-2026-003", createdAt: new Date("2026-01-20") },
  { id: "payout-004", affiliateId: "aff-002", amount: 6250, status: "paid", paymentMethod: "eft", paidAt: new Date("2026-01-28"), referenceNumber: "EFT-2026-004", createdAt: new Date("2026-01-18") },
  { id: "payout-005", affiliateId: "aff-010", amount: 21000, status: "paid", paymentMethod: "eft", paidAt: new Date("2026-02-05"), referenceNumber: "EFT-2026-005", createdAt: new Date("2026-01-25") },
  { id: "payout-006", affiliateId: "aff-008", amount: 5850, status: "paid", paymentMethod: "eft", paidAt: new Date("2026-02-10"), referenceNumber: "EFT-2026-006", createdAt: new Date("2026-01-30") },
  { id: "payout-007", affiliateId: "aff-006", amount: 3800, status: "paid", paymentMethod: "eft", paidAt: new Date("2026-02-15"), referenceNumber: "EFT-2026-007", createdAt: new Date("2026-02-10") },
  { id: "payout-008", affiliateId: "aff-001", amount: 26500, status: "pending", paymentMethod: "eft", referenceNumber: "EFT-2026-008", createdAt: new Date("2026-02-20") },
  { id: "payout-009", affiliateId: "aff-004", amount: 19000, status: "pending", paymentMethod: "eft", referenceNumber: "EFT-2026-009", createdAt: new Date("2026-02-22") },
  { id: "payout-010", affiliateId: "aff-007", amount: 750, status: "paid", paymentMethod: "eft", paidAt: new Date("2025-12-15"), referenceNumber: "EFT-2025-045", createdAt: new Date("2025-12-01") },
];

const demoActivityLogs: ActivityLog[] = [
  { id: "log-001", affiliateId: "aff-001", action: "deal_closed", metadata: { dealId: "deal-001", clientName: "ABC Security Solutions", value: 85000 }, createdAt: new Date("2026-01-10") },
  { id: "log-002", affiliateId: "aff-001", action: "commission_paid", metadata: { amount: 8500 }, createdAt: new Date("2026-01-25") },
  { id: "log-003", affiliateId: "aff-004", action: "deal_closed", metadata: { dealId: "deal-007", clientName: "National Mining Corp", value: 550000 }, createdAt: new Date("2026-01-25") },
  { id: "log-004", affiliateId: "aff-004", action: "tier_upgraded", metadata: { from: "gold", to: "platinum" }, createdAt: new Date("2026-01-26") },
  { id: "log-005", affiliateId: "aff-002", action: "deal_created", metadata: { dealId: "deal-005", clientName: "Tech Solutions PTY" }, createdAt: new Date("2026-02-20") },
  { id: "log-006", affiliateId: "aff-010", action: "deal_closed", metadata: { dealId: "deal-014", clientName: "Financial Services Corp", value: 210000 }, createdAt: new Date("2026-01-22") },
  { id: "log-007", affiliateId: "aff-010", action: "commission_paid", metadata: { amount: 21000 }, createdAt: new Date("2026-02-05") },
  { id: "log-008", affiliateId: "aff-006", action: "deal_closed", metadata: { dealId: "deal-010", clientName: "Premium Hotels Group", value: 95000 }, createdAt: new Date("2026-01-18") },
  { id: "log-009", affiliateId: "aff-001", action: "resource_downloaded", metadata: { resourceId: "res-004", title: "Corporate Merchandise Pricing Matrix" }, createdAt: new Date("2026-02-15") },
  { id: "log-010", affiliateId: "aff-008", action: "deal_closed", metadata: { dealId: "deal-012", clientName: "JHB Manufacturing", value: 78000 }, createdAt: new Date("2026-01-28") },
];
