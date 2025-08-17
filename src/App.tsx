import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
  Card,
  Button,
  Avatar,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { 
  TrendingUp, 
  Bell, 
  User,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { demoUserAccount } from './data/demoData';
import stockService from './services/stockService';
import { Stock, ActiveTradeData } from './config/api';

// Clean white theme for professional trading dashboard
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#ff9800',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#1976d2',
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 20px',
        },
      },
    },
  },
});

interface TradeDialogProps {
  open: boolean;
  onClose: () => void;
  stock: Stock | null;
  tradeType: 'BUY' | 'SELL';
  formatCurrency: (amount: number) => string;
}

const TradeDialog: React.FC<TradeDialogProps> = ({ open, onClose, stock, tradeType, formatCurrency }) => {
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('MARKET');
  const [price, setPrice] = useState(0);
  const [currentLtp, setCurrentLtp] = useState<number | null>(null);
  const [ltpLoading, setLtpLoading] = useState(false);
  const [ltpError, setLtpError] = useState<string | null>(null);
  const [buyOrderLoading, setBuyOrderLoading] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch LTP when dialog opens
  useEffect(() => {
    if (open && stock) {
      const fetchLtp = async () => {
        try {
          setLtpLoading(true);
          setLtpError(null);
          // For the API, we need to use the full symbol format (e.g., "JSWSTEEL-EQ")
          // The stock.symbol from our API is the name, but we need the full symbol format
          const symbolForApi = `${stock.symbol}-EQ`;
          const ltp = await stockService.getLtp(symbolForApi);
          setCurrentLtp(ltp);
          setPrice(ltp); // Set price for limit orders
        } catch (error) {
          console.error('Failed to fetch LTP:', error);
          setLtpError(error instanceof Error ? error.message : 'Failed to fetch current price');
        } finally {
          setLtpLoading(false);
        }
      };

      fetchLtp();
    }
  }, [open, stock]);

  const handleTrade = async () => {
    if (stock && tradeType === 'BUY') {
      try {
        setBuyOrderLoading(true);
        // Use the full symbol format for the API (e.g., "JSWSTEEL-EQ")
        const symbolForApi = `${stock.symbol}-EQ`;
        const response = await stockService.placeBuyOrder(symbolForApi, quantity);
        
        if (response.statusCode >= 200 && response.statusCode < 300) {
          setToastMessage('Buy order placed');
          setToastOpen(true);
          onClose();
        } else {
          alert(`Order failed: ${response.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Buy order failed:', error);
        alert(`Order failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setBuyOrderLoading(false);
      }
    } else {
      // For SELL orders or fallback, keep the old behavior for now
      if (stock) {
        const totalAmount = quantity * (orderType === 'MARKET' ? stock.price : price);
        alert(`${tradeType} Order Placed!\n\nStock: ${stock.symbol}\nQuantity: ${quantity}\nOrder Type: ${orderType}\nTotal Amount: ₹${totalAmount.toFixed(2)}`);
        onClose();
      }
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>
          {tradeType} {stock?.symbol}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {stock?.name}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              inputProps={{ min: 1 }}
              sx={{ mb: 2 }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Order Type</InputLabel>
              <Select
                value={orderType}
                label="Order Type"
                onChange={(e) => setOrderType(e.target.value)}
              >
                <MenuItem value="MARKET">Market</MenuItem>
                <MenuItem value="LIMIT">Limit</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {/* Current Price Display */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 1, border: '1px solid #e0e0e0' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Current Price (LTP)
          </Typography>
          {ltpLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2">Fetching current price...</Typography>
            </Box>
          ) : ltpError ? (
            <Alert severity="error" sx={{ py: 0.5 }}>
              {ltpError}
            </Alert>
          ) : currentLtp !== null ? (
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              ₹{currentLtp.toFixed(2)}
            </Typography>
          ) : null}
        </Box>

        {/* Capital Usage Calculation */}
        {currentLtp !== null && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1, border: '1px solid #bbdefb' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Capital Required
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {formatCurrency(quantity * currentLtp)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {quantity} shares × {formatCurrency(currentLtp)} per share
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleTrade}
          variant="contained"
          color={tradeType === 'BUY' ? 'primary' : 'error'}
          sx={{ minWidth: 100 }}
          disabled={buyOrderLoading}
        >
          {buyOrderLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} color="inherit" />
              Placing...
            </Box>
          ) : (
            tradeType
          )}
        </Button>
      </DialogActions>
      
      {/* Toast Notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={2000}
        onClose={() => setToastOpen(false)}
        message={toastMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Dialog>
  );
};

function App() {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [currentPage, setCurrentPage] = useState<'stocks' | 'trades'>('stocks');
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stocksLoading, setStocksLoading] = useState(true);
  const [stocksError, setStocksError] = useState<string | null>(null);
  const [activeTrades, setActiveTrades] = useState<ActiveTradeData[]>([]);
  const [activeTradesLoading, setActiveTradesLoading] = useState(true);
  const [activeTradesError, setActiveTradesError] = useState<string | null>(null);
  
  // Sell order states
  const [sellQuantities, setSellQuantities] = useState<{[key: number]: number}>({});
  const [sellLoading, setSellLoading] = useState<{[key: number]: boolean}>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');

  const { balance } = demoUserAccount;

  // Fetch stocks from API on component mount
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setStocksLoading(true);
        setStocksError(null);
        const fetchedStocks = await stockService.getStocks();
        setStocks(fetchedStocks);
      } catch (error) {
        console.error('Failed to fetch stocks:', error);
        setStocksError(error instanceof Error ? error.message : 'Failed to fetch stocks');
      } finally {
        setStocksLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // Fetch active trades from API on component mount
  useEffect(() => {
    const fetchActiveTrades = async () => {
      try {
        setActiveTradesLoading(true);
        setActiveTradesError(null);
        const fetchedTrades = await stockService.getActiveTrades();
        setActiveTrades(fetchedTrades);
      } catch (error) {
        console.error('Failed to fetch active trades:', error);
        setActiveTradesError(error instanceof Error ? error.message : 'Failed to fetch active trades');
      } finally {
        setActiveTradesLoading(false);
      }
    };

    fetchActiveTrades();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };


  const handleTrade = (stock: Stock, type: 'BUY' | 'SELL') => {
    setSelectedStock(stock);
    setTradeType(type);
    setTradeDialogOpen(true);
  };

  // Function to fetch fresh active trades data
  const fetchActiveTrades = async () => {
    try {
      setActiveTradesLoading(true);
      setActiveTradesError(null);
      const fetchedTrades = await stockService.getActiveTrades();
      setActiveTrades(fetchedTrades);
    } catch (error) {
      console.error('Failed to fetch active trades:', error);
      setActiveTradesError(error instanceof Error ? error.message : 'Failed to fetch active trades');
    } finally {
      setActiveTradesLoading(false);
    }
  };

  // Handle page change with fresh data fetch for active trades
  const handlePageChange = (page: 'stocks' | 'trades') => {
    setCurrentPage(page);
    if (page === 'trades') {
      // Fetch fresh active trades data when switching to active trades tab
      fetchActiveTrades();
    }
  };

  // Handle sell order
  const handleSellOrder = async (trade: ActiveTradeData) => {
    const quantity = sellQuantities[trade.id] || trade.qty;
    
    if (quantity <= 0 || quantity > trade.qty) {
      setToastMessage('Invalid quantity');
      setToastOpen(true);
      return;
    }

    try {
      setSellLoading(prev => ({ ...prev, [trade.id]: true }));
      
      await stockService.placeSellOrder(trade.id, quantity);
      
      // Show success toast
      const pnl = (trade.currentLtp - trade.buyingPrice) * quantity;
      setToastMessage(`Sold ${trade.symbol.replace('-EQ', '')} successfully! P&L: ${formatCurrency(pnl)}`);
      setToastOpen(true);
      
      // Reset quantity input for this trade
      setSellQuantities(prev => ({ ...prev, [trade.id]: trade.qty }));
      
      // Refresh active trades data
      fetchActiveTrades();
      
    } catch (error) {
      console.error('Sell order failed:', error);
      setToastMessage(error instanceof Error ? error.message : 'Failed to place sell order');
      setToastOpen(true);
    } finally {
      setSellLoading(prev => ({ ...prev, [trade.id]: false }));
    }
  };

  // Handle quantity change for sell orders
  const handleSellQuantityChange = (tradeId: number, quantity: number) => {
    setSellQuantities(prev => ({ ...prev, [tradeId]: quantity }));
  };



  // Calculate P&L from real active trades
  const totalPositionsPnl = activeTrades.reduce((sum, trade) => {
    if (trade.qty > 0) {
      const pnl = (trade.currentLtp - trade.buyingPrice) * trade.qty;
      return sum + pnl;
    }
    return sum;
  }, 0);

  // Filter stocks based on search query
  const filteredStocks = stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        position: 'relative'
      }}>

        {/* Header */}
        <Box sx={{ 
          position: 'relative', 
          zIndex: 1,
          p: 3,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ 
                backgroundColor: '#1976d2',
                mr: 2,
                width: 48,
                height: 48
              }}>
                <TrendingUp size={24} color="white" />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  TradeHub
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Professional Trading Platform
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton sx={{ 
                backgroundColor: '#f5f5f5',
                '&:hover': { backgroundColor: '#e0e0e0' }
              }}>
                <Bell size={20} />
              </IconButton>
              <IconButton sx={{ 
                backgroundColor: '#f5f5f5',
                '&:hover': { backgroundColor: '#e0e0e0' }
              }}>
                <User size={20} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Dashboard Content */}
        <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 2, sm: 3 }, maxWidth: '1200px', mx: 'auto' }}>
          
          {/* Top Modules - Balance and P&L */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 3 }, 
            mb: 3 
          }}>
            {/* Current Balance Module */}
            <Card sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Wallet size={20} color="#1976d2" />
                <Typography variant="h6" sx={{ ml: 1, color: 'primary.main', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Current Balance
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                color: 'primary.main',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}>
                {formatCurrency(balance)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Available for trading
              </Typography>
            </Card>

            {/* Current Active P&L Module */}
            <Card sx={{ flex: 1, p: { xs: 2, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BarChart3 size={20} color={totalPositionsPnl >= 0 ? '#4caf50' : '#f44336'} />
                <Typography variant="h6" sx={{ 
                  ml: 1, 
                  color: totalPositionsPnl >= 0 ? 'success.main' : 'error.main',
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}>
                  Active P&L
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {totalPositionsPnl >= 0 ? (
                  <ArrowUpRight size={20} color="#4caf50" />
                ) : (
                  <ArrowDownRight size={20} color="#f44336" />
                )}
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: totalPositionsPnl >= 0 ? 'success.main' : 'error.main',
                    ml: 1,
                    fontSize: { xs: '1.5rem', sm: '2rem' }
                  }}
                >
                  {totalPositionsPnl >= 0 ? '+' : ''}{formatCurrency(totalPositionsPnl)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                From {activeTrades.filter(trade => trade.qty > 0).length} active trades
              </Typography>
            </Card>
          </Box>

          {/* Navigation Tabs */}
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 }, 
            mb: 3,
            width: '100%'
          }}>
            <Button
              variant={currentPage === 'stocks' ? 'contained' : 'outlined'}
              onClick={() => handlePageChange('stocks')}
              sx={{ 
                flex: 1,
                minWidth: { xs: 'auto', sm: 120 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                py: { xs: 1, sm: 1.5 }
              }}
            >
              Stocks
            </Button>
            <Button
              variant={currentPage === 'trades' ? 'contained' : 'outlined'}
              onClick={() => handlePageChange('trades')}
              sx={{ 
                flex: 1,
                minWidth: { xs: 'auto', sm: 120 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                py: { xs: 1, sm: 1.5 }
              }}
            >
              Active Trades
            </Button>
          </Box>

          {/* Page Content */}
          {currentPage === 'stocks' ? (
            // Stocks Page - Clean and modern design
            <Card sx={{ 
              p: { xs: 2, sm: 3 },
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              border: '1px solid #f0f0f0'
            }}>
              <Typography variant="h6" sx={{ 
                mb: { xs: 2, sm: 3 }, 
                fontWeight: '500',
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                color: '#2c3e50'
              }}>
                Available Stocks
              </Typography>
              
              {/* Search Input */}
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search stocks by symbol or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ 
                  mb: { xs: 2, sm: 3 },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#f8f9fa',
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ mr: 1, color: 'text.secondary' }}>
                      🔍
                    </Box>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {stocksLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : stocksError ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {stocksError}
                  </Alert>
                ) : filteredStocks.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No stocks available
                    </Typography>
                  </Box>
                ) : (
                  filteredStocks.map((stock: Stock, index: number) => (
                  <Box
                    key={stock.symbol}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: 2,
                      backgroundColor: '#ffffff',
                      border: '1px solid #f1f3f4',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: '#f8fffe',
                        border: '1px solid #e8f5e8',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.1)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 95%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `2px solid hsl(${(index * 137.5) % 360}, 70%, 85%)`
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: '600',
                            color: `hsl(${(index * 137.5) % 360}, 70%, 40%)`,
                            fontSize: '0.75rem'
                          }}
                        >
                          {stock.symbol.slice(0, 2)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ 
                          fontWeight: '500',
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          color: '#2c3e50'
                        }}>
                          {stock.symbol}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Button
                      variant="contained"
                      onClick={() => handleTrade(stock, 'BUY')}
                      sx={{ 
                        minWidth: { xs: 80, sm: 100 },
                        fontSize: { xs: '0.875rem', sm: '0.9rem' },
                        py: { xs: 1, sm: 1.2 },
                        px: { xs: 2, sm: 3 },
                        borderRadius: 2,
                        backgroundColor: '#4caf50',
                        color: 'white',
                        fontWeight: '500',
                        textTransform: 'none',
                        boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                        '&:hover': {
                          backgroundColor: '#45a049',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                          transform: 'translateY(-1px)',
                        }
                      }}
                    >
                      Buy
                    </Button>
                  </Box>
                ))
              )}
              </Box>
            </Card>
          ) : (
            // Active Trades Page - Live trades with SELL buttons and qty
            <Card sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ 
                mb: { xs: 2, sm: 3 }, 
                fontWeight: 'bold',
                fontSize: { xs: '1.125rem', sm: '1.25rem' },
                color: '#2c3e50'
              }}>
                Active Trades
              </Typography>
              {activeTradesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : activeTradesError ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {activeTradesError}
                </Alert>
              ) : activeTrades.filter(trade => trade.qty > 0).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No active trades
                  </Typography>
                </Box>
              ) : (
                activeTrades.filter(trade => trade.qty > 0).map((trade) => (
                  <Box
                    key={trade.id}
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'stretch', sm: 'center' },
                      p: { xs: 1.5, sm: 2 },
                      mb: 1,
                      borderRadius: 1,
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e0e0e0',
                      gap: { xs: 2, sm: 0 },
                      '&:hover': {
                        backgroundColor: '#ffebee',
                      }
                    }}
                  >
                    <Box sx={{ flex: { xs: 'none', sm: 1 } }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}>
                        {trade.symbol.replace('-EQ', '')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                      }}>
                        Qty: {trade.qty} | P&L: {((trade.currentLtp - trade.buyingPrice) * trade.qty) >= 0 ? '+' : ''}{formatCurrency((trade.currentLtp - trade.buyingPrice) * trade.qty)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: { xs: 1, sm: 2 },
                      flexDirection: { xs: 'row', sm: 'row' }
                    }}>
                      <TextField
                        size="small"
                        label="Qty to Exit"
                        type="number"
                        value={sellQuantities[trade.id] || trade.qty}
                        onChange={(e) => handleSellQuantityChange(trade.id, parseInt(e.target.value) || 0)}
                        inputProps={{ min: 1, max: trade.qty }}
                        sx={{ 
                          width: { xs: '100px', sm: '120px' },
                          flex: { xs: 1, sm: 'none' }
                        }}
                      />
                      <Button
                        variant="contained"
                        color="error"
                        disabled={sellLoading[trade.id] || false}
                        sx={{ 
                          minWidth: { xs: 80, sm: 100 },
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                          py: { xs: 0.75, sm: 1 }
                        }}
                        onClick={() => handleSellOrder(trade)}
                      >
                        {sellLoading[trade.id] ? <CircularProgress size={20} color="inherit" /> : 'SELL'}
                      </Button>
                    </Box>
                  </Box>
                ))
              )}
            </Card>
          )}
        </Box>

        <TradeDialog
          open={tradeDialogOpen}
          onClose={() => setTradeDialogOpen(false)}
          stock={selectedStock}
          tradeType={tradeType}
          formatCurrency={formatCurrency}
        />
        
        {/* Toast Notification */}
        <Snackbar
          open={toastOpen}
          autoHideDuration={2000}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setToastOpen(false)} severity="success" sx={{ width: '100%' }}>
            {toastMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
