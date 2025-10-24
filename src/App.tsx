import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
  Card,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  CardContent,
  Button,
  Snackbar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { 
  TrendingUp, 
  User,
  TrendingDown,
  Target,
  Shield,
  Home,
  List as ListIcon,
  Settings,
  Menu,
  RefreshCw,
} from 'lucide-react';
import stockService from './services/stockService';
import { UserTransaction, WebhookRequest, FuturesWebhookRequest, PnLData, FuturesTransaction } from './config/api';

const drawerWidth = 240;


// Clean white theme for professional trading dashboard
const customTheme = createTheme({
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

// Transaction Card Component
const TransactionCard: React.FC<{ 
  transaction: UserTransaction; 
  showDateTime?: boolean; 
  onExit?: (transactionId: string) => void;
  isExiting?: boolean;
  showStatus?: boolean;
}> = ({ transaction, showDateTime = true, onExit, isExiting = false, showStatus = true }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pnl = (transaction.currentPrice - transaction.buyingPrice) * transaction.qty;
  const pnlPercentage = ((transaction.currentPrice - transaction.buyingPrice) / transaction.buyingPrice) * 100;

  return (
    <Card sx={{ 
      mb: 2, 
      border: '1px solid #e0e0e0',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={transaction.scriptDetails.logo} 
              sx={{ width: 40, height: 40 }}
            >
              {transaction.scriptDetails.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {transaction.script}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transaction.scriptDetails.name} • Lot: {transaction.scriptDetails.lotSize}
              </Typography>
            </Box>
          </Box>
          {showStatus && (
            <Chip 
              label={transaction.status} 
              color={transaction.status === 'OPEN' ? 'success' : 'default'}
              size="small"
            />
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Quantity</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{transaction.qty}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Buy Price</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formatCurrency(transaction.buyingPrice)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Current Price</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formatCurrency(transaction.currentPrice)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">P&L</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {pnl >= 0 ? <TrendingUp size={16} color="#4caf50" /> : <TrendingDown size={16} color="#f44336" />}
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 'bold',
                  color: pnl >= 0 ? '#4caf50' : '#f44336'
                }}
              >
                {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ color: pnl >= 0 ? '#4caf50' : '#f44336' }}
            >
              ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ pt: 1, borderTop: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', justifyContent: showDateTime ? 'space-between' : 'flex-start', alignItems: 'center', mb: transaction.status === 'OPEN' && onExit ? 2 : 0 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Target size={14} color="#ff9800" />
                <Typography variant="body2" color="text.secondary">
                  Target: {formatCurrency(transaction.target)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Shield size={14} color="#f44336" />
                <Typography variant="body2" color="text.secondary">
                  SL: {formatCurrency(transaction.stopLoss)}
                </Typography>
              </Box>
            </Box>
            {showDateTime && (
              <Typography variant="body2" color="text.secondary">
                {formatDate(transaction.createdAt)}
              </Typography>
            )}
          </Box>
          
          {/* EXIT Button - positioned below Target and SL */}
          {transaction.status === 'OPEN' && onExit && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Button
                variant="contained"
                color="error"
                size="small"
                disabled={isExiting}
                onClick={() => onExit(transaction.id)}
                sx={{ 
                  minWidth: 80,
                  fontSize: '0.875rem',
                  py: 1,
                  px: 3,
                  borderRadius: 2,
                }}
              >
                {isExiting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    Exiting...
                  </Box>
                ) : (
                  'EXIT'
                )}
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Futures Transaction Card Component
const FuturesTransactionCard: React.FC<{ 
  transaction: FuturesTransaction; 
  showDateTime?: boolean; 
  onExit?: (transactionId: string) => void;
  isExiting?: boolean;
  showStatus?: boolean;
}> = ({ transaction, showDateTime = true, onExit, isExiting = false, showStatus = true }) => {
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate P&L based on trade type
  let pnl = 0;
  if (transaction.trade_type === 'BUY') {
    pnl = (transaction.current_ltp - transaction.buying_price) * transaction.qty;
  } else { // SELL
    pnl = (transaction.buying_price - transaction.current_ltp) * transaction.qty;
  }
  
  const pnlPercentage = (pnl / (transaction.buying_price * transaction.qty)) * 100;

  return (
    <Card sx={{ mb: 2, borderLeft: `4px solid ${pnl >= 0 ? '#4caf50' : '#f44336'}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, backgroundColor: 'primary.main' }}>
              {transaction.symbol.substring(0, 2)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {transaction.symbol}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transaction.trade_type} • Qty: {transaction.qty}
              </Typography>
            </Box>
          </Box>
          {showStatus && (
            <Chip 
              label={transaction.status} 
              color={transaction.status === 'OPEN' ? 'success' : 'default'}
              size="small"
            />
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Buy Price</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formatCurrency(transaction.buying_price)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Current LTP</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{formatCurrency(transaction.current_ltp)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">P&L</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {pnl >= 0 ? <TrendingUp size={16} color="#4caf50" /> : <TrendingDown size={16} color="#f44336" />}
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 'bold',
                  color: pnl >= 0 ? '#4caf50' : '#f44336'
                }}
              >
                {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ color: pnl >= 0 ? '#4caf50' : '#f44336' }}
            >
              ({pnlPercentage >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ pt: 1, borderTop: '1px solid #f0f0f0' }}>
          <Box sx={{ display: 'flex', justifyContent: showDateTime ? 'space-between' : 'flex-start', alignItems: 'center', mb: transaction.status === 'OPEN' && onExit ? 2 : 0 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Target size={14} color="#ff9800" />
                <Typography variant="body2" color="text.secondary">
                  Target: {formatCurrency(transaction.target)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Shield size={14} color="#f44336" />
                <Typography variant="body2" color="text.secondary">
                  SL: {formatCurrency(transaction.stop_loss)}
                </Typography>
              </Box>
            </Box>
            {showDateTime && (
              <Typography variant="body2" color="text.secondary">
                {formatDate(transaction.created_at)}
              </Typography>
            )}
          </Box>
          
          {/* EXIT Button for OPEN positions */}
          {transaction.status === 'OPEN' && onExit && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Button
                variant="contained"
                color="error"
                size="small"
                disabled={isExiting}
                onClick={() => onExit(transaction.id)}
                sx={{ 
                  minWidth: 80,
                  fontSize: '0.875rem',
                  py: 1,
                  px: 3,
                  borderRadius: 2,
                }}
              >
                {isExiting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    Exiting...
                  </Box>
                ) : (
                  'EXIT'
                )}
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [currentPage, setCurrentPage] = useState<'home' | 'all-orders' | 'settings' | 'futures' | 'all-futures-orders' | 'futures-settings'>('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [futuresTransactions, setFuturesTransactions] = useState<FuturesTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [futuresLoading, setFuturesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exitingTransactions, setExitingTransactions] = useState<Set<string>>(new Set());
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');
  
  // Settings form state
  const [webhookForm, setWebhookForm] = useState<WebhookRequest>({
    script: 'NIFTY',
    scriptType: 'index',
    instrumentType: 'NSE',
    timeframe: '3',
    trend: 'CE',
    strategy: 'EMA_CROSS_20_200'
  });
  const [webhookLoading, setWebhookLoading] = useState(false);

  // Futures Settings form state
  const [futuresWebhookForm, setFuturesWebhookForm] = useState<FuturesWebhookRequest>({
    script: 'NIFTY',
    scriptType: 'index',
    instrumentType: 'NSE',
    timeframe: '15',
    trend: 'CE',
    strategy: 'EMA_CROSS_200'
  });
  const [futuresWebhookLoading, setFuturesWebhookLoading] = useState(false);

  // P&L states
  const [optionsPnL, setOptionsPnL] = useState<number>(0);
  const [futuresPnL, setFuturesPnL] = useState<number>(0);
  const [pnlLoading, setPnlLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  // Fetch user transactions and P&L data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFuturesLoading(true);
        setPnlLoading(true);
        setError(null);
        
        // Fetch options transactions
        const fetchedTransactions = await stockService.getUserTransactions();
        setTransactions(fetchedTransactions);
        
        // Calculate options P&L from transactions
        const calculatedOptionsPnL = fetchedTransactions.reduce((sum, transaction) => {
          const pnl = (transaction.currentPrice - transaction.buyingPrice) * transaction.qty;
          return sum + pnl;
        }, 0);
        setOptionsPnL(calculatedOptionsPnL);
        
        // Fetch futures transactions
        try {
          const fetchedFuturesTransactions = await stockService.getFuturesTransactions(1, 200);
          setFuturesTransactions(fetchedFuturesTransactions);
          
          // Calculate futures P&L from transactions
          const calculatedFuturesPnL = fetchedFuturesTransactions.reduce((sum, transaction) => {
            let pnl = 0;
            if (transaction.trade_type === 'BUY') {
              pnl = (transaction.current_ltp - transaction.buying_price) * transaction.qty;
            } else { // SELL
              pnl = (transaction.buying_price - transaction.current_ltp) * transaction.qty;
            }
            return sum + pnl;
          }, 0);
          setFuturesPnL(calculatedFuturesPnL);
          
        } catch (futuresError) {
          console.error('Failed to fetch futures transactions:', futuresError);
          // Don't set error for futures failure, just keep them empty
        }
        
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
        setFuturesLoading(false);
        setPnlLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handlePageChange = (page: 'home' | 'all-orders' | 'settings' | 'futures' | 'all-futures-orders' | 'futures-settings') => {
    setCurrentPage(page);
    if (isMobile) {
      setMobileOpen(false); // Close drawer on mobile after selection
    }
  };

  // Function to refetch transactions and update options P&L
  const refetchTransactions = async () => {
    try {
      const fetchedTransactions = await stockService.getUserTransactions();
      setTransactions(fetchedTransactions);
      
      // Recalculate options P&L
      const calculatedOptionsPnL = fetchedTransactions.reduce((sum, transaction) => {
        const pnl = (transaction.currentPrice - transaction.buyingPrice) * transaction.qty;
        return sum + pnl;
      }, 0);
      setOptionsPnL(calculatedOptionsPnL);
    } catch (error) {
      console.error('Failed to refetch transactions:', error);
    }
  };

  // Function to refetch futures transactions and update futures P&L
  const refetchFuturesTransactions = async () => {
    try {
      setFuturesLoading(true);
      const fetchedFuturesTransactions = await stockService.getFuturesTransactions(1, 200);
      setFuturesTransactions(fetchedFuturesTransactions);
      
      // Recalculate futures P&L
      const calculatedFuturesPnL = fetchedFuturesTransactions.reduce((sum, transaction) => {
        let pnl = 0;
        if (transaction.trade_type === 'BUY') {
          pnl = (transaction.current_ltp - transaction.buying_price) * transaction.qty;
        } else { // SELL
          pnl = (transaction.buying_price - transaction.current_ltp) * transaction.qty;
        }
        return sum + pnl;
      }, 0);
      setFuturesPnL(calculatedFuturesPnL);
    } catch (error) {
      console.error('Failed to refetch futures transactions:', error);
    } finally {
      setFuturesLoading(false);
    }
  };

  // Refresh function based on current page
  const handleRefresh = async () => {
    try {
      setRefreshLoading(true);
      
      if (currentPage === 'futures' || currentPage === 'all-futures-orders' || currentPage === 'futures-settings') {
        await refetchFuturesTransactions();
      } else {
        // For options pages (home, all-orders, settings)
        await refetchTransactions();
      }
      
      // No success toast - silent refresh on success
    } catch (error) {
      setToastMessage('Failed to refresh data');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setRefreshLoading(false);
    }
  };

  // Handle exit order
  const handleExitOrder = async (transactionId: string) => {
    try {
      // Add transaction to exiting set
      setExitingTransactions(prev => new Set(prev).add(transactionId));
      
      await stockService.closeOrder(transactionId);
      
      // Show success toast
      setToastMessage('Order closed successfully!');
      setToastSeverity('success');
      setToastOpen(true);
      
      // Refetch transactions to get updated data
      await refetchTransactions();
      
    } catch (error) {
      console.error('Exit order failed:', error);
      setToastMessage(error instanceof Error ? error.message : 'Failed to close order');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      // Remove transaction from exiting set
      setExitingTransactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  };

  // Handle webhook form submission
  const handleWebhookSubmit = async () => {
    try {
      setWebhookLoading(true);
      await stockService.sendWebhook(webhookForm);
      
      setToastMessage('Webhook sent successfully!');
      setToastSeverity('success');
      setToastOpen(true);
      
    } catch (error) {
      console.error('Webhook failed:', error);
      setToastMessage(error instanceof Error ? error.message : 'Failed to send webhook');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setWebhookLoading(false);
    }
  };

  // Handle webhook form field changes
  const handleWebhookFormChange = (field: keyof WebhookRequest, value: string) => {
    setWebhookForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle futures webhook form submission
  const handleFuturesWebhookSubmit = async () => {
    try {
      setFuturesWebhookLoading(true);
      await stockService.sendFuturesWebhook(futuresWebhookForm);
      
      setToastMessage('Futures webhook sent successfully!');
      setToastSeverity('success');
      setToastOpen(true);
      
    } catch (error) {
      console.error('Futures webhook failed:', error);
      setToastMessage(error instanceof Error ? error.message : 'Failed to send futures webhook');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setFuturesWebhookLoading(false);
    }
  };

  // Handle futures webhook form field changes
  const handleFuturesWebhookFormChange = (field: keyof FuturesWebhookRequest, value: string) => {
    setFuturesWebhookForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter transactions based on tab
  const openTransactions = transactions.filter(t => t.status === 'OPEN');
  const allTransactions = transactions;
  const openFuturesTransactions = futuresTransactions.filter(t => t.status === 'OPEN');

  // Determine which P&L to show based on current page
  const getCurrentPnL = () => {
    if (currentPage === 'futures' || currentPage === 'all-futures-orders' || currentPage === 'futures-settings') {
      return futuresPnL;
    }
    return optionsPnL; // Default to options P&L for home, all-orders, settings
  };

  const currentPnL = getCurrentPnL();

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}>

        {/* Drawer */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Navigation
              </Typography>
              <IconButton onClick={handleDrawerToggle} sx={{ display: { md: 'none' } }}>
                <User size={20} />
              </IconButton>
            </Box>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'home'}
                  onClick={() => handlePageChange('home')}
                >
                  <ListItemIcon>
                    <Home size={20} />
                  </ListItemIcon>
                  <ListItemText primary={`OPEN Orders (${openTransactions.length})`} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'all-orders'}
                  onClick={() => handlePageChange('all-orders')}
                >
                  <ListItemIcon>
                    <ListIcon size={20} />
                  </ListItemIcon>
                  <ListItemText primary={`All Orders (${allTransactions.length})`} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'futures'}
                  onClick={() => handlePageChange('futures')}
                >
                  <ListItemIcon>
                    <TrendingUp size={20} />
                  </ListItemIcon>
                  <ListItemText primary={`Futures Orders (${openFuturesTransactions.length})`} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'all-futures-orders'}
                  onClick={() => handlePageChange('all-futures-orders')}
                >
                  <ListItemIcon>
                    <ListIcon size={20} />
                  </ListItemIcon>
                  <ListItemText primary={`All Futures Orders (${futuresTransactions.length})`} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'futures-settings'}
                  onClick={() => handlePageChange('futures-settings')}
                >
                  <ListItemIcon>
                    <Settings size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Futures Settings" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'settings'}
                  onClick={() => handlePageChange('settings')}
                >
                  <ListItemIcon>
                    <Settings size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Options Settings" />
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>
          
          {/* Desktop Drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: drawerWidth,
                height: '100vh',
              },
            }}
            open
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Navigation
              </Typography>
            </Box>
            <List>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'home'}
                  onClick={() => handlePageChange('home')}
                >
                  <ListItemIcon>
                    <Home size={20} />
                  </ListItemIcon>
                  <ListItemText primary={`OPEN Orders (${openTransactions.length})`} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'all-orders'}
                  onClick={() => handlePageChange('all-orders')}
                >
                  <ListItemIcon>
                    <ListIcon size={20} />
                  </ListItemIcon>
                  <ListItemText primary={`All Orders (${allTransactions.length})`} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'futures'}
                  onClick={() => handlePageChange('futures')}
                >
                  <ListItemIcon>
                    <TrendingUp size={20} />
                  </ListItemIcon>
                  <ListItemText primary={`Futures Orders (${openFuturesTransactions.length})`} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'all-futures-orders'}
                  onClick={() => handlePageChange('all-futures-orders')}
                >
                  <ListItemIcon>
                    <ListIcon size={20} />
                  </ListItemIcon>
                  <ListItemText primary={`All Futures Orders (${futuresTransactions.length})`} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'futures-settings'}
                  onClick={() => handlePageChange('futures-settings')}
                >
                  <ListItemIcon>
                    <Settings size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Futures Settings" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  selected={currentPage === 'settings'}
                  onClick={() => handlePageChange('settings')}
                >
                  <ListItemIcon>
                    <Settings size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Options Settings" />
                </ListItemButton>
              </ListItem>
            </List>
          </Drawer>
        </Box>

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: { md: `calc(100% - ${drawerWidth}px)` },
            minHeight: '100vh',
            position: 'relative',
          }}
        >
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                position: 'fixed',
                top: 16,
                left: 16,
                zIndex: 1300,
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                boxShadow: 2,
              }}
            >
              <Menu size={24} />
            </IconButton>
          )}

          {/* Refresh Button */}
          <IconButton
            onClick={handleRefresh}
            disabled={refreshLoading}
            sx={{
              position: 'fixed',
              bottom: { xs: 24, md: 'auto' },
              top: { xs: 'auto', md: 16 },
              right: { xs: 24, md: 16 },
              zIndex: 1300,
              backgroundColor: 'success.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'success.dark',
              },
              '&:disabled': {
                backgroundColor: 'success.light',
                color: 'white',
              },
              boxShadow: 3,
            }}
          >
            {refreshLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <RefreshCw size={24} />
            )}
          </IconButton>

          {/* P&L Summary Card */}
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
              {currentPage === 'futures' || currentPage === 'all-futures-orders' || currentPage === 'futures-settings' ? 'Futures P&L' : 'Options P&L'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {pnlLoading ? (
                <CircularProgress size={24} />
              ) : (
                <>
                  {currentPnL >= 0 ? <TrendingUp size={24} color="#4caf50" /> : <TrendingDown size={24} color="#f44336" />}
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 'bold',
                      color: currentPnL >= 0 ? 'success.main' : 'error.main'
                    }}
                  >
                    {currentPnL >= 0 ? '+' : ''}₹{currentPnL.toFixed(2)}
                  </Typography>
                </>
              )}
            </Box>
          </Card>

          {/* Page Content */}
          {currentPage === 'home' && (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : openTransactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No open transactions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your open positions will appear here
                  </Typography>
                </Box>
              ) : (
                openTransactions.map((transaction) => (
                  <TransactionCard 
                    key={transaction.id} 
                    transaction={transaction} 
                    showDateTime={false}
                    onExit={handleExitOrder}
                    isExiting={exitingTransactions.has(transaction.id)}
                    showStatus={false}
                  />
                ))
              )}
            </>
          )}

          {currentPage === 'all-orders' && (
            <>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : allTransactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No transactions found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your trading history will appear here
                  </Typography>
                </Box>
              ) : (
                allTransactions.map((transaction) => (
                  <TransactionCard 
                    key={transaction.id} 
                    transaction={transaction} 
                    showDateTime={true}
                    showStatus={true}
                  />
                ))
              )}
            </>
          )}

          {currentPage === 'settings' && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Webhook Settings
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
                {/* Script Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>Script</InputLabel>
                  <Select
                    value={webhookForm.script}
                    label="Script"
                    onChange={(e) => handleWebhookFormChange('script', e.target.value)}
                  >
                    <MenuItem value="DMART">DMART</MenuItem>
                    <MenuItem value="NIFTY">NIFTY</MenuItem>
                  </Select>
                </FormControl>

                {/* Timeframe Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>Timeframe</InputLabel>
                  <Select
                    value={webhookForm.timeframe}
                    label="Timeframe"
                    onChange={(e) => handleWebhookFormChange('timeframe', e.target.value)}
                  >
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="5">5</MenuItem>
                  </Select>
                </FormControl>

                {/* Trend Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>Trend</InputLabel>
                  <Select
                    value={webhookForm.trend}
                    label="Trend"
                    onChange={(e) => handleWebhookFormChange('trend', e.target.value)}
                  >
                    <MenuItem value="CE">CE</MenuItem>
                    <MenuItem value="PE">PE</MenuItem>
                  </Select>
                </FormControl>

                {/* Strategy Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>Strategy</InputLabel>
                  <Select
                    value={webhookForm.strategy}
                    label="Strategy"
                    onChange={(e) => handleWebhookFormChange('strategy', e.target.value)}
                  >
                    <MenuItem value="EMA_CROSS_20_200">EMA_CROSS_20_200</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Read-only fields */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Script Type"
                  value={webhookForm.scriptType}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Instrument Type"
                  value={webhookForm.instrumentType}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Box>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleWebhookSubmit}
                  disabled={webhookLoading}
                  sx={{ 
                    minWidth: 200,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {webhookLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Sending...
                    </Box>
                  ) : (
                    'Send Webhook'
                  )}
                </Button>
              </Box>

              {/* Current Configuration Display */}
              <Box sx={{ mt: 4, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Current Configuration
                </Typography>
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(webhookForm, null, 2)}
                </Box>
              </Box>
            </Card>
          )}

          {currentPage === 'futures' && (
            <>
              {futuresLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : futuresTransactions.filter(t => t.status === 'OPEN').length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No open futures positions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your open futures positions will appear here
                  </Typography>
                </Box>
              ) : (
                futuresTransactions
                  .filter(t => t.status === 'OPEN')
                  .map((transaction) => (
                    <FuturesTransactionCard 
                      key={transaction.id} 
                      transaction={transaction} 
                      showDateTime={false}
                      showStatus={false}
                    />
                  ))
              )}
            </>
          )}

          {currentPage === 'all-futures-orders' && (
            <>
              {futuresLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : futuresTransactions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No futures transactions found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your futures trading history will appear here
                  </Typography>
                </Box>
              ) : (
                futuresTransactions.map((transaction) => (
                  <FuturesTransactionCard 
                    key={transaction.id} 
                    transaction={transaction} 
                    showDateTime={true}
                    showStatus={true}
                  />
                ))
              )}
            </>
          )}

          {currentPage === 'futures-settings' && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                Futures Webhook Settings
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
                {/* Script Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>Script</InputLabel>
                  <Select
                    value={futuresWebhookForm.script}
                    label="Script"
                    onChange={(e) => handleFuturesWebhookFormChange('script', e.target.value)}
                  >
                    <MenuItem value="DMART">DMART</MenuItem>
                    <MenuItem value="NIFTY">NIFTY</MenuItem>
                  </Select>
                </FormControl>

                {/* Timeframe Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>Timeframe</InputLabel>
                  <Select
                    value={futuresWebhookForm.timeframe}
                    label="Timeframe"
                    onChange={(e) => handleFuturesWebhookFormChange('timeframe', e.target.value)}
                  >
                    <MenuItem value="3">3</MenuItem>
                    <MenuItem value="5">5</MenuItem>
                    <MenuItem value="15">15</MenuItem>
                  </Select>
                </FormControl>

                {/* Trend Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>Trend</InputLabel>
                  <Select
                    value={futuresWebhookForm.trend}
                    label="Trend"
                    onChange={(e) => handleFuturesWebhookFormChange('trend', e.target.value)}
                  >
                    <MenuItem value="CE">CE</MenuItem>
                    <MenuItem value="PE">PE</MenuItem>
                  </Select>
                </FormControl>

                {/* Strategy Dropdown */}
                <FormControl fullWidth>
                  <InputLabel>Strategy</InputLabel>
                  <Select
                    value={futuresWebhookForm.strategy}
                    label="Strategy"
                    onChange={(e) => handleFuturesWebhookFormChange('strategy', e.target.value)}
                  >
                    <MenuItem value="EMA_CROSS_200">EMA_CROSS_200</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Read-only fields */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Script Type"
                  value={futuresWebhookForm.scriptType}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Instrument Type"
                  value={futuresWebhookForm.instrumentType}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Box>

              {/* Submit Button */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleFuturesWebhookSubmit}
                  disabled={futuresWebhookLoading}
                  sx={{ 
                    minWidth: 200,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  {futuresWebhookLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Sending...
                    </Box>
                  ) : (
                    'Send Futures Webhook'
                  )}
                </Button>
              </Box>

              {/* Current Configuration Display */}
              <Box sx={{ mt: 4, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Current Futures Configuration
                </Typography>
                <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(futuresWebhookForm, null, 2)}
                </Box>
              </Box>
            </Card>
          )}
        </Box>

        {/* Toast Notification */}
        <Snackbar
          open={toastOpen}
          autoHideDuration={3000}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setToastOpen(false)} 
            severity={toastSeverity} 
            sx={{ width: '100%' }}
          >
            {toastMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
