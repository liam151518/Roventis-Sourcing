# Lead Sourcing Playbook

This guide covers free methods to source leads for your affiliate program at zero cost.

## 1. Google Maps "My Maps"

Best for: Lodges, construction companies, mines, manufacturing

### Steps:
1. Go to [Google My Maps](https://www.google.com/maps)
2. Sign in and create a new map
3. Search for your target industry + location (e.g., "lodges in Mpumalanga")
4. Click "Add to map" for each result
5. Once complete: Click the 3 dots menu > Export to KML
6. Convert KML to CSV using a tool like [ConvertCSV](https://www.convertcsv.com/kml-to-csv.htm)

### Fields you'll get:
- Business name
- Address
- Phone (sometimes)
- Website (sometimes)

---

## 2. Google Places API (Free Tier)

**Note**: The free tier gives $200/month credit - enough for ~40,000 nearby search calls.

### Simple Node script:
```typescript
// scripts/scrapePlaces.ts
import { Client } from "@googlemaps/google-maps-services-js";

const client = new Client();

async function searchPlaces(query: string, location: { lat: number; lng: number }) {
  const results = await client.placesNearby({
    params: {
      key: process.env.GOOGLE_PLACES_API_KEY!,
      location: `${location.lat},${location.lng}`,
      radius: 50000, // 50km radius
      keyword: query,
    },
  });
  
  return results.data.results.map(place => ({
    name: place.name,
    address: place.vicinity,
    phone: place.formatted_phone_number,
    website: place.website,
    lat: place.geometry?.location.lat,
    lng: place.geometry?.location.lng,
  }));
}

// Run
searchPlaces(" lodge ", { lat: -25.4715, lng: 31.0352 }); // Nelspruit
```

---

## 3. Public Directories (SA)

Harvest legally from these sources:

### Tourism & Hospitality
- **Tourism Grading Council**: [tgcsa.co.za](https://www.tgcsa.co.za) - Member list of graded establishments
- **SATourism.co.za** - Accommodation directory
- **SA Venues** - Wedding/conference venues

### Mining & Industry
- **Chamber of Mines**: [mineweb.co.za](https://www.mineweb.co.za)
- **SA Mining Directory**: [miningweb.co.za/directory](https://www.miningweb.co.za)
- **Industrial Development Corporation** (IDC) - Supplier databases

### Business Directories
- **Yellow Pages SA**: [yellowpages.co.za](https://www.yellowpages.co.za)
- **SA Company Directory**: [sacompanydirectories.co.za](https://www.sacompanydirectories.co.za)

### BBBEE / Supplier Directories
- **SAB**: Supplier portals
- **Transnet**: Supplier registration
- **Eskom**: Supplier database

---

## 4. LinkedIn Sales Navigator

**Important**: Follow LinkedIn's Terms of Service - no scraping.

### How to use:
1. Get a free trial (30 days)
2. Use advanced filters: Location, Industry, Company Size
3. Create leads lists
4. Export manually (max 2500 contacts per export)

### Tips:
- Rotate through free trials using different emails
- Use it for research, not bulk exports
- Connect with prospects personally

---

## 5. Content/Inbound Strategy

Capture leads who find you:

### Free "Workwear ROI Calculator"
Create a simple landing page that captures email in exchange for a calculator:
- Input: Number of employees, industry
- Output: Estimated annual workwear spend, potential savings

Build this with Next.js + a form that saves directly to the leads table.

### Lead magnet ideas:
- "2026 Industry Report" PDF
- "Sourcing Guide" checklist
- "Supplier Pricing Comparison" spreadsheet

---

## 6. Referral Program

Incentivize existing customers:

```
Refer a business that places an order:
- You get 10% commission on their first order
- They get 10% discount
```

Add this to your order confirmation emails.

---

## 7. CSV Template

Use this template for manual entry:

```csv
companyName,contactName,contactEmail,contactPhone,city,province,industry,productInterest,estimatedBudget,notes,source,poolTier
"Kruger Bush Lodge","Jan van der Merwe","jan@krugerbuslodge.co.za","+27 82 111 2222","Nelspruit","Mpumalanga","Lodge","workwear;merchandise",75000,"Looking for workwear",google_maps,standard
```

Columns required: `companyName`
Optional: `contactName`, `contactEmail`, `contactPhone`, `city`, `province`, `industry`, `productInterest`, `estimatedBudget`, `notes`, `source`, `poolTier`

For productInterest: separate multiple with semicolons (;)
For poolTier: use `standard`, `priority`, or `premium`

---

## 8. Workflow: Weekly Lead Generation

### Monday:
1. Review Google Maps exports from last week
2. Clean data in Google Sheets
3. Add to CSV template

### Wednesday:
1. Check LinkedIn for new connections
2. Manually copy interesting profiles

### Friday:
1. Upload to admin dashboard
2. Send notification to affiliates

### Total time investment: ~2-3 hours/week for 20-50 new leads