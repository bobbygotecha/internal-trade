import { API_CONFIG, StockApiResponse, Stock, LtpApiResponse, BuyOrderRequest, BuyOrderResponse, SellOrderRequest, SellOrderResponse, ActiveTradeData, ActiveTradesResponse, UserTransaction, UserTransactionsResponse, CloseOrderRequest, CloseOrderResponse } from '../config/api';

class StockService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  // Update base URL if needed
  setBaseUrl(newBaseUrl: string) {
    this.baseUrl = newBaseUrl;
  }

  // Fetch all available stocks
  async getStocks(): Promise<Stock[]> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.STOCKS}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StockApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch stocks');
      }

      // Transform API data to our Stock interface
      // For now, we'll use a default price since the API doesn't provide it
      return data.data.map(stock => ({
        symbol: stock.name, // Using name as symbol for display
        name: stock.name,
        token: stock.token,
        price: this.generateMockPrice(), // Temporary mock price until we get real price API
        change: this.generateMockChange() // Temporary mock change until we get real price API
      }));

    } catch (error) {
      console.error('Error fetching stocks:', error);
      throw error;
    }
  }

  // Temporary method to generate mock prices
  // This will be replaced when we integrate the real price API
  private generateMockPrice(): number {
    return Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
  }

  // Fetch real-time LTP (Last Traded Price) for a specific stock
  async getLtp(symbol: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.LTP}/${symbol}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: LtpApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch LTP');
      }

      return data.data.ltp;

    } catch (error) {
      console.error(`Error fetching LTP for ${symbol}:`, error);
      throw error;
    }
  }

  // Place a buy order
  async placeBuyOrder(symbol: string, quantity: number): Promise<BuyOrderResponse> {
    try {
      const orderData: BuyOrderRequest = {
        symbol: symbol,
        quantity: quantity
      };

      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.BUY_ORDER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      const data: BuyOrderResponse = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return data;

    } catch (error) {
      console.error(`Error placing buy order for ${symbol}:`, error);
      throw error;
    }
  }

  // Fetch active trades
  async getActiveTrades(): Promise<ActiveTradeData[]> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ACTIVE_TRADES}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ActiveTradesResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch active trades');
      }

      return data.data;
    } catch (error) {
      console.error('Error fetching active trades:', error);
      throw error;
    }
  }

  // Place sell order
  async placeSellOrder(transactionId: number, quantity: number): Promise<SellOrderResponse> {
    try {
      const sellOrderData: SellOrderRequest = {
        transactionId,
        quantity
      };

      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SELL_ORDER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sellOrderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SellOrderResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to place sell order');
      }

      return data;
    } catch (error) {
      console.error(`Error placing sell order for transaction ${transactionId}:`, error);
      throw error;
    }
  }

  // Fetch user transactions
  async getUserTransactions(): Promise<UserTransaction[]> {
    try {
      const response = await fetch(`${API_CONFIG.NEW_BASE_URL}${API_CONFIG.ENDPOINTS.USER_TRANSACTIONS}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UserTransactionsResponse = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
  }

  // Close order
  async closeOrder(transactionId: string): Promise<CloseOrderResponse> {
    try {
      const closeOrderData: CloseOrderRequest = {
        transaction_id: parseInt(transactionId)
      };

      const response = await fetch(`${API_CONFIG.NEW_BASE_URL}${API_CONFIG.ENDPOINTS.CLOSE_ORDER}`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(closeOrderData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CloseOrderResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to close order');
      }

      return data;
    } catch (error) {
      console.error(`Error closing order for transaction ${transactionId}:`, error);
      throw error;
    }
  }

  // Temporary method to generate mock price changes
  // This will be replaced when we integrate the real price API
  private generateMockChange(): number {
    return (Math.random() - 0.5) * 200; // Random change between -100 and +100
  }
}

// Export singleton instance
export const stockService = new StockService();
export default stockService;
