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
  Tab,
  Tabs,
  CardContent,
  Button,
  Snackbar,
} from '@mui/material';
import { 
  TrendingUp, 
  Bell, 
  User,
  TrendingDown,
  Target,
  Shield,
} from 'lucide-react';
import stockService from './services/stockService';
import { UserTransaction } from './config/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

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

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exitingTransactions, setExitingTransactions] = useState<Set<string>>(new Set());
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  // Fetch user transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedTransactions = await stockService.getUserTransactions();
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Function to refetch transactions
  const refetchTransactions = async () => {
    try {
      const fetchedTransactions = await stockService.getUserTransactions();
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error('Failed to refetch transactions:', error);
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

  // Filter transactions based on tab
  const openTransactions = transactions.filter(t => t.status === 'OPEN');
  const allTransactions = transactions;

  // Calculate total P&L
  const totalPnl = transactions.reduce((sum, transaction) => {
    const pnl = (transaction.currentPrice - transaction.buyingPrice) * transaction.qty;
    return sum + pnl;
  }, 0);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        position: 'relative'
      }}>

        {/* Header - Keep TradeHub header same */}
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
          
          {/* P&L Summary Card */}
          <Card sx={{ mb: 3, p: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
              Total P&L
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {totalPnl >= 0 ? <TrendingUp size={24} color="#4caf50" /> : <TrendingDown size={24} color="#f44336" />}
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 'bold',
                  color: totalPnl >= 0 ? 'success.main' : 'error.main'
                }}
              >
                {totalPnl >= 0 ? '+' : ''}₹{totalPnl.toFixed(2)}
              </Typography>
            </Box>
          </Card>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="transaction tabs">
              <Tab label={`OPEN Orders (${openTransactions.length})`} {...a11yProps(0)} />
              <Tab label={`All Orders (${allTransactions.length})`} {...a11yProps(1)} />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <TabPanel value={tabValue} index={0}>
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
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
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
          </TabPanel>
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
