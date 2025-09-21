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
} from 'lucide-react';
import stockService from './services/stockService';
import { UserTransaction, WebhookRequest } from './config/api';

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

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [currentPage, setCurrentPage] = useState<'home' | 'all-orders' | 'settings'>('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handlePageChange = (page: 'home' | 'all-orders' | 'settings') => {
    setCurrentPage(page);
    if (isMobile) {
      setMobileOpen(false); // Close drawer on mobile after selection
    }
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

  // Filter transactions based on tab
  const openTransactions = transactions.filter(t => t.status === 'OPEN');
  const allTransactions = transactions;

  // Calculate total P&L
  const totalPnl = transactions.reduce((sum, transaction) => {
    const pnl = (transaction.currentPrice - transaction.buyingPrice) * transaction.qty;
    return sum + pnl;
  }, 0);

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
                  selected={currentPage === 'settings'}
                  onClick={() => handlePageChange('settings')}
                >
                  <ListItemIcon>
                    <Settings size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
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
                  selected={currentPage === 'settings'}
                  onClick={() => handlePageChange('settings')}
                >
                  <ListItemIcon>
                    <Settings size={20} />
                  </ListItemIcon>
                  <ListItemText primary="Settings" />
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
