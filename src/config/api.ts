// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://trade.durgaimpexmfu.in',
  ENDPOINTS: {
    STOCKS: '/api/equity/stocks',
    LTP: '/api/equity/ltp', // LTP endpoint base
    BUY_ORDER: '/api/equity/buy', // Buy order endpoint
    SELL_ORDER: '/api/equity/sell', // Sell order endpoint
    ACTIVE_TRADES: '/api/equity/active-trades', // Active trades endpoint
  }
};

// API Response Types
export interface StockApiResponse {
  success: boolean;
  message: string;
  data: StockData[];
  statusCode: number;
}

export interface StockData {
  name: string;
  token: string;
  symbol: string;
}

// LTP API Response Types
export interface LtpApiResponse {
  success: boolean;
  message: string;
  data: LtpData;
  statusCode: number;
}

export interface LtpData {
  symbol: string;
  ltp: number;
  timestamp: string;
}

// Buy Order API Types
export interface BuyOrderRequest {
  symbol: string;
  quantity: number;
}

export interface BuyOrderResponse {
  success: boolean;
  message: string;
  data?: any;
  statusCode: number;
}

// Sell Order API Types
export interface SellOrderRequest {
  transactionId: number;
  quantity: number;
}

export interface SellOrderResponse {
  success: boolean;
  message: string;
  data?: any;
  statusCode: number;
}

// Active Trades API Types
export interface ActiveTradeData {
  id: number;
  createdAt: string;
  updatedAt: string;
  orderId: string;
  optionId: string | null;
  symbol: string;
  segment: string;
  symbolToken: string;
  stockId: string | null;
  buyingPrice: number;
  sellingPrice: number | null;
  target: number | null;
  stopLoss: number | null;
  type: string;
  currentLtp: number;
  orderType: string;
  status: string;
  userId: number;
  providerOrderId: string;
  qty: number;
  liveOrder: boolean;
  orderVariety: string;
  tradeType: string;
  configId: string | null;
}

export interface ActiveTradesResponse {
  success: boolean;
  message: string;
  data: ActiveTradeData[];
  statusCode: number;
}

// Transformed Stock Type for UI
export interface Stock {
  symbol: string;
  name: string;
  token: string;
  price: number; // We'll need to get this from another API later
  change?: number; // Price change (optional, for display purposes)
}
