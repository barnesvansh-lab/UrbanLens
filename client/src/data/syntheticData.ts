// SYNTHETIC DEMO DATA — for demonstration purposes only. Not real market data.

export const DEMO_NOTICE =
  "⚠️ All data shown is synthetic and generated for demonstration purposes only. It does not represent real market conditions, actual property valuations, or investment advice.";

export interface PriceDataPoint {
  month: string;
  timestamp: string; // ISO format for date parsing
  avgPrice: number;
  medianPrice: number;
  transactions: number;
  mumbaiCentral: number;
  bandraWest: number;
  andheriEast: number;
  thaneWest: number;
  naviMumbai: number;
}

export interface NeighborhoodData {
  id: string;
  name: string;
  avgPrice: number; // ₹ per sq ft
  priceChange1Y: number; // percentage
  priceChange5Y: number; // percentage
  affordabilityScore: number; // 0 to 100
  walkScore: number; // 0 to 100
  transitScore: number; // 0 to 100
  gentrificationRisk: 'Low' | 'Medium' | 'High';
  amenities: {
    schools: number;
    hospitals: number;
    parks: number;
    malls: number;
  };
  coordinates: [number, number]; // [lat, lng]
  description: string;
  rentalYield: number; // %
  medianRent2BHK: number; // ₹ per month
  infrastructure: {
    metroAccess: boolean;
    highwayAccess: boolean;
    airportProximityKm: number;
    greenCoverPct: number;
    evChargingStations: number;
  };
}

export interface MarketIndicator {
  label: string;
  value: string;
  change: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
  sparklineData?: number[];
  description?: string;
}

export interface ForecastDataPoint {
  month: string;
  historical?: number;
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
  isAnomaly?: boolean;
  anomalyReason?: string;
}

export interface AffordabilityBracket {
  category: string;
  incomeMin: number;
  incomeMax: number;
  affordablePrice: number;
  populationPct: number;
}

export interface RentalYieldData {
  neighborhoodId: string;
  neighborhoodName: string;
  avgRentalYield: number;
  monthlyRentAvg: number;
  priceToRentRatio: number;
}

// 5 Synthetic Indian Metro Neighborhoods
export const neighborhoods: NeighborhoodData[] = [
  {
    id: 'mumbai-central',
    name: 'Mumbai Central',
    avgPrice: 32450,
    priceChange1Y: 5.8,
    priceChange5Y: 34.2,
    affordabilityScore: 32,
    walkScore: 89,
    transitScore: 95,
    gentrificationRisk: 'Medium',
    amenities: { schools: 18, hospitals: 12, parks: 8, malls: 6 },
    coordinates: [18.9696, 72.8194],
    description: 'High-density commercial and transport transit interchange with heritage and upscale redevelopment pockets.',
    rentalYield: 2.7,
    medianRent2BHK: 82000,
    infrastructure: {
      metroAccess: true,
      highwayAccess: true,
      airportProximityKm: 18,
      greenCoverPct: 14,
      evChargingStations: 22,
    },
  },
  {
    id: 'bandra-west',
    name: 'Bandra West',
    avgPrice: 36200,
    priceChange1Y: 7.4,
    priceChange5Y: 41.5,
    affordabilityScore: 24,
    walkScore: 94,
    transitScore: 88,
    gentrificationRisk: 'High',
    amenities: { schools: 22, hospitals: 14, parks: 11, malls: 9 },
    coordinates: [19.0596, 72.8295],
    description: 'Prime western coastal suburb featuring high lifestyle amenities, heritage enclaves, and premium waterfront properties.',
    rentalYield: 2.4,
    medianRent2BHK: 110000,
    infrastructure: {
      metroAccess: true,
      highwayAccess: true,
      airportProximityKm: 11,
      greenCoverPct: 19,
      evChargingStations: 34,
    },
  },
  {
    id: 'andheri-east',
    name: 'Andheri East',
    avgPrice: 19800,
    priceChange1Y: 6.2,
    priceChange5Y: 36.8,
    affordabilityScore: 54,
    walkScore: 82,
    transitScore: 92,
    gentrificationRisk: 'Medium',
    amenities: { schools: 31, hospitals: 19, parks: 14, malls: 8 },
    coordinates: [19.1136, 72.8697],
    description: 'Major corporate & IT corridor with direct metro accessibility, airport adjacency, and robust mid-market housing supply.',
    rentalYield: 3.4,
    medianRent2BHK: 56000,
    infrastructure: {
      metroAccess: true,
      highwayAccess: true,
      airportProximityKm: 4,
      greenCoverPct: 16,
      evChargingStations: 28,
    },
  },
  {
    id: 'thane-west',
    name: 'Thane West',
    avgPrice: 13650,
    priceChange1Y: 8.9,
    priceChange5Y: 48.4,
    affordabilityScore: 68,
    walkScore: 74,
    transitScore: 76,
    gentrificationRisk: 'Medium',
    amenities: { schools: 42, hospitals: 24, parks: 26, malls: 12 },
    coordinates: [19.2183, 72.9781],
    description: 'Rapidly transforming suburban epicenter supported by comprehensive retail social infrastructure, lakes, and upcoming transit links.',
    rentalYield: 3.6,
    medianRent2BHK: 34000,
    infrastructure: {
      metroAccess: false,
      highwayAccess: true,
      airportProximityKm: 27,
      greenCoverPct: 32,
      evChargingStations: 19,
    },
  },
  {
    id: 'navi-mumbai',
    name: 'Navi Mumbai',
    avgPrice: 11950,
    priceChange1Y: 9.6,
    priceChange5Y: 52.1,
    affordabilityScore: 78,
    walkScore: 71,
    transitScore: 78,
    gentrificationRisk: 'Low',
    amenities: { schools: 38, hospitals: 21, parks: 34, malls: 10 },
    coordinates: [19.0771, 72.9986],
    description: 'Master-planned modern satellite city benefiting from wide arterial avenues, new international airport development, and port connectivity.',
    rentalYield: 3.9,
    medianRent2BHK: 27500,
    infrastructure: {
      metroAccess: true,
      highwayAccess: true,
      airportProximityKm: 9,
      greenCoverPct: 38,
      evChargingStations: 25,
    },
  },
];

// Helper to generate 60 months (2020-01 to 2024-12) of synthetic historical data
function generateHistoricalPrices(): PriceDataPoint[] {
  const points: PriceDataPoint[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Base prices in 2020
  let mc = 24200;
  let bw = 25600;
  let ae = 14500;
  let tw = 9200;
  let nm = 7850;

  for (let year = 2020; year <= 2024; year++) {
    for (let m = 0; m < 12; m++) {
      const monthStr = `${months[m]} ${year}`;
      const isoMonth = `${year}-${String(m + 1).padStart(2, '0')}`;
      
      // Seasonality adjustments:
      // March (+1%), Monsoon July/Aug (-2%), Festive Oct/Nov (+2.5%)
      let seasonalFactor = 1.0;
      if (m === 2) seasonalFactor = 1.008; // March fiscal surge
      else if (m === 6 || m === 7) seasonalFactor = 0.985; // Monsoon slowdown
      else if (m === 9 || m === 10) seasonalFactor = 1.025; // Festive bump

      // COVID impact in Q2 2020
      if (year === 2020 && m >= 3 && m <= 5) {
        seasonalFactor *= 0.94;
      }

      // Steady annual compound growth trend (~6-9% / yr)
      const growthFactor = 1.0 + (0.0055 + (m % 3) * 0.0008);

      mc = Math.round(mc * growthFactor * seasonalFactor);
      bw = Math.round(bw * growthFactor * (seasonalFactor * 1.002));
      ae = Math.round(ae * growthFactor * seasonalFactor);
      tw = Math.round(tw * (growthFactor * 1.001) * seasonalFactor);
      nm = Math.round(nm * (growthFactor * 1.0015) * seasonalFactor);

      // Dampen rapid divergence back towards realistic bounds
      mc = Math.min(Math.max(mc, 23000), 33500);
      bw = Math.min(Math.max(bw, 25000), 37000);
      ae = Math.min(Math.max(ae, 14000), 20500);
      tw = Math.min(Math.max(tw, 8800), 14200);
      nm = Math.min(Math.max(nm, 7500), 12500);

      const avgPrice = Math.round((mc + bw + ae + tw + nm) / 5);
      const medianPrice = Math.round(ae * 1.02);

      // Transactions volume with seasonality & COVID shock
      let baseTx = 3200 + (year - 2020) * 180 + (m % 4) * 120;
      if (year === 2020 && m >= 3 && m <= 5) baseTx = Math.round(baseTx * 0.35); // severe COVID dip
      if (m === 9 || m === 10) baseTx = Math.round(baseTx * 1.35); // Diwali surge
      if (m === 6 || m === 7) baseTx = Math.round(baseTx * 0.85); // monsoon drop

      points.push({
        month: monthStr,
        timestamp: isoMonth,
        avgPrice,
        medianPrice,
        transactions: baseTx,
        mumbaiCentral: mc,
        bandraWest: bw,
        andheriEast: ae,
        thaneWest: tw,
        naviMumbai: nm,
      });
    }
  }

  return points;
}

export const priceTimeSeries: PriceDataPoint[] = generateHistoricalPrices();

// Key macro overview indicators
export const marketIndicators: MarketIndicator[] = [
  {
    label: 'Composite Market Avg',
    value: '₹22,650',
    change: 7.2,
    unit: '₹ / sq.ft',
    trend: 'up',
    sparklineData: [20800, 21100, 21050, 21400, 21800, 22200, 22650],
    description: 'Volume-weighted average residential capital rate across surveyed synthetic sectors.',
  },
  {
    label: 'Monthly Registered Volume',
    value: '3,845',
    change: 4.8,
    unit: 'Units / mo',
    trend: 'up',
    sparklineData: [3200, 3100, 3650, 3420, 3550, 3710, 3845],
    description: 'Estimated synthetic monthly property sale deeds registered.',
  },
  {
    label: 'Price Growth (5Y CAGR)',
    value: '+8.4%',
    change: 1.2,
    unit: 'Annualized',
    trend: 'up',
    sparklineData: [6.8, 7.1, 7.5, 7.9, 8.1, 8.3, 8.4],
    description: '5-year compound annual growth rate across synthetic regional indices.',
  },
  {
    label: 'Affordability Index',
    value: '51.2',
    change: -1.6,
    unit: 'Score / 100',
    trend: 'down',
    sparklineData: [56.4, 55.1, 54.2, 53.0, 52.4, 51.8, 51.2],
    description: 'Calculated as median household income vs. 30-year debt service requirement.',
  },
];

// 12-Month SARIMA-inspired synthetic forecast data (Jan 2025 – Dec 2025)
export const forecastData: ForecastDataPoint[] = [
  {
    month: 'Jan 2025',
    predictedPrice: 22890,
    lowerBound: 22200,
    upperBound: 23580,
  },
  {
    month: 'Feb 2025',
    predictedPrice: 23110,
    lowerBound: 22350,
    upperBound: 23870,
  },
  {
    month: 'Mar 2025',
    predictedPrice: 23420,
    lowerBound: 22600,
    upperBound: 24240,
    isAnomaly: true,
    anomalyReason: 'Simulated infrastructure metro corridor inauguration trigger',
  },
  {
    month: 'Apr 2025',
    predictedPrice: 23500,
    lowerBound: 22550,
    upperBound: 24450,
  },
  {
    month: 'May 2025',
    predictedPrice: 23620,
    lowerBound: 22600,
    upperBound: 24640,
  },
  {
    month: 'Jun 2025',
    predictedPrice: 23580,
    lowerBound: 22480,
    upperBound: 24680,
  },
  {
    month: 'Jul 2025',
    predictedPrice: 23350,
    lowerBound: 22150,
    upperBound: 24550,
  },
  {
    month: 'Aug 2025',
    predictedPrice: 23480,
    lowerBound: 22200,
    upperBound: 24760,
  },
  {
    month: 'Sep 2025',
    predictedPrice: 23820,
    lowerBound: 22500,
    upperBound: 25140,
  },
  {
    month: 'Oct 2025',
    predictedPrice: 24350,
    lowerBound: 22980,
    upperBound: 25720,
  },
  {
    month: 'Nov 2025',
    predictedPrice: 24600,
    lowerBound: 23150,
    upperBound: 26050,
    isAnomaly: true,
    anomalyReason: 'High festive demand coupled with synthetic inventory shortage shock',
  },
  {
    month: 'Dec 2025',
    predictedPrice: 24720,
    lowerBound: 23200,
    upperBound: 26240,
  },
];

// Household Income vs Property Affordability Brackets
export const affordabilityBrackets: AffordabilityBracket[] = [
  {
    category: 'Affordable Housing (EWS/LIG)',
    incomeMin: 300000,
    incomeMax: 800000,
    affordablePrice: 3500000,
    populationPct: 44,
  },
  {
    category: 'Mid-Market (MIG-I)',
    incomeMin: 800000,
    incomeMax: 1800000,
    affordablePrice: 8500000,
    populationPct: 32,
  },
  {
    category: 'Upper Mid-Market (MIG-II)',
    incomeMin: 1800000,
    incomeMax: 3500000,
    affordablePrice: 17500000,
    populationPct: 16,
  },
  {
    category: 'Premium & Luxury (HIG)',
    incomeMin: 3500000,
    incomeMax: 12000000,
    affordablePrice: 45000000,
    populationPct: 8,
  },
];

// Rental yield benchmark stats
export const rentalYieldData: RentalYieldData[] = [
  {
    neighborhoodId: 'mumbai-central',
    neighborhoodName: 'Mumbai Central',
    avgRentalYield: 2.7,
    monthlyRentAvg: 82000,
    priceToRentRatio: 37.0,
  },
  {
    neighborhoodId: 'bandra-west',
    neighborhoodName: 'Bandra West',
    avgRentalYield: 2.4,
    monthlyRentAvg: 110000,
    priceToRentRatio: 41.6,
  },
  {
    neighborhoodId: 'andheri-east',
    neighborhoodName: 'Andheri East',
    avgRentalYield: 3.4,
    monthlyRentAvg: 56000,
    priceToRentRatio: 29.4,
  },
  {
    neighborhoodId: 'thane-west',
    neighborhoodName: 'Thane West',
    avgRentalYield: 3.6,
    monthlyRentAvg: 34000,
    priceToRentRatio: 27.7,
  },
  {
    neighborhoodId: 'navi-mumbai',
    neighborhoodName: 'Navi Mumbai',
    avgRentalYield: 3.9,
    monthlyRentAvg: 27500,
    priceToRentRatio: 25.6,
  },
];
