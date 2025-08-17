export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  sector: string;
}

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  value: number;
}

export interface Position {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface UserAccount {
  balance: number;
  totalInvestment: number;
  currentValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  availableMargin: number;
}

// Demo Indian stocks data
export const demoStocks: Stock[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    price: 2456.75,
    change: 45.30,
    changePercent: 1.88,
    volume: 1234567,
    marketCap: "16.6L Cr",
    sector: "Oil & Gas"
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    price: 3678.90,
    change: -23.45,
    changePercent: -0.63,
    volume: 987654,
    marketCap: "13.4L Cr",
    sector: "IT Services"
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    price: 1567.25,
    change: 12.80,
    changePercent: 0.82,
    volume: 2345678,
    marketCap: "11.9L Cr",
    sector: "Banking"
  },
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    price: 1423.60,
    change: -8.75,
    changePercent: -0.61,
    volume: 1876543,
    marketCap: "5.9L Cr",
    sector: "IT Services"
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    price: 934.50,
    change: 18.90,
    changePercent: 2.06,
    volume: 3456789,
    marketCap: "6.5L Cr",
    sector: "Banking"
  },
  {
    symbol: "HINDUNILVR",
    name: "Hindustan Unilever Ltd",
    price: 2789.30,
    change: -15.60,
    changePercent: -0.56,
    volume: 654321,
    marketCap: "6.6L Cr",
    sector: "FMCG"
  },
  {
    symbol: "BHARTIARTL",
    name: "Bharti Airtel Ltd",
    price: 876.45,
    change: 21.35,
    changePercent: 2.50,
    volume: 2987654,
    marketCap: "4.7L Cr",
    sector: "Telecom"
  },
  {
    symbol: "ITC",
    name: "ITC Ltd",
    price: 456.80,
    change: 3.25,
    changePercent: 0.72,
    volume: 4567890,
    marketCap: "5.7L Cr",
    sector: "FMCG"
  }
];

// Demo holdings
export const demoHoldings: Holding[] = [
  {
    symbol: "RELIANCE",
    name: "Reliance Industries Ltd",
    quantity: 10,
    avgPrice: 2300.00,
    currentPrice: 2456.75,
    pnl: 1567.50,
    pnlPercent: 6.81,
    value: 24567.50
  },
  {
    symbol: "TCS",
    name: "Tata Consultancy Services",
    quantity: 5,
    avgPrice: 3800.00,
    currentPrice: 3678.90,
    pnl: -605.50,
    pnlPercent: -3.18,
    value: 18394.50
  },
  {
    symbol: "HDFCBANK",
    name: "HDFC Bank Ltd",
    quantity: 15,
    avgPrice: 1500.00,
    currentPrice: 1567.25,
    pnl: 1008.75,
    pnlPercent: 4.48,
    value: 23508.75
  }
];

// Demo positions (for intraday trading)
export const demoPositions: Position[] = [
  {
    symbol: "INFY",
    name: "Infosys Ltd",
    quantity: 20,
    avgPrice: 1430.00,
    currentPrice: 1423.60,
    pnl: -128.00,
    pnlPercent: -0.45
  },
  {
    symbol: "ICICIBANK",
    name: "ICICI Bank Ltd",
    quantity: 25,
    avgPrice: 920.00,
    currentPrice: 934.50,
    pnl: 362.50,
    pnlPercent: 1.58
  }
];

// Demo user account
export const demoUserAccount: UserAccount = {
  balance: 50000.00,
  totalInvestment: 89000.00,
  currentValue: 91470.75,
  totalPnl: 2470.75,
  totalPnlPercent: 2.78,
  availableMargin: 125000.00
};

// Market indices data
export const marketIndices = [
  {
    name: "NIFTY 50",
    value: 19674.25,
    change: 123.45,
    changePercent: 0.63
  },
  {
    name: "SENSEX",
    value: 65953.48,
    change: -89.32,
    changePercent: -0.14
  },
  {
    name: "BANK NIFTY",
    value: 44567.80,
    change: 234.67,
    changePercent: 0.53
  }
];
