import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
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
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Settings,
  Menu,
  RefreshCw,
  Activity,
  BarChart3,
} from 'lucide-react';
import { API_CONFIG, FuturesTransaction, FuturesWebhookRequest } from './config/api';
import stockService from './services/stockService';

const drawerWidth = 240;
const anshulApi = { baseUrl: API_CONFIG.ANSHUL_BASE_URL };

const anshulTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20' },
    secondary: { main: '#ff9800' },
    success: { main: '#4caf50' },
    error: { main: '#f44336' },
    warning: { main: '#ff9800' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: '#212121', secondary: '#757575' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, color: '#2e7d32' },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
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

const FuturesPositionCard: React.FC<{
  transaction: FuturesTransaction;
  showDateTime?: boolean;
  onExit?: (id: string) => void;
  isExiting?: boolean;
  showStatus?: boolean;
}> = ({ transaction, showDateTime = true, onExit, isExiting = false, showStatus = true }) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const isSell = transaction.trade_type === 'SELL';
  const pnl = isSell
    ? (transaction.buying_price - transaction.current_ltp) * transaction.qty
    : (transaction.current_ltp - transaction.buying_price) * transaction.qty;
  const denom = transaction.buying_price * transaction.qty;
  const pnlPercentage = denom !== 0 ? (pnl / denom) * 100 : 0;

  return (
    <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
              {transaction.symbol.substring(0, 2)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {transaction.symbol}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {transaction.trade_type} • Qty: {transaction.qty}
              </Typography>
              {transaction.order_id && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Order: {transaction.order_id}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            {showStatus && (
              <Chip
                label={transaction.status}
                color={transaction.status === 'OPEN' ? 'success' : 'default'}
                size="small"
              />
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              Quantity
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {transaction.qty}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Buy / ref
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(transaction.buying_price)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Current
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {formatCurrency(transaction.current_ltp)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              P&amp;L
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {pnl >= 0 ? (
                <TrendingUp size={16} color="#4caf50" />
              ) : (
                <TrendingDown size={16} color="#f44336" />
              )}
              <Typography
                variant="body1"
                sx={{ fontWeight: 'bold', color: pnl >= 0 ? '#4caf50' : '#f44336' }}
              >
                {pnl >= 0 ? '+' : ''}
                {formatCurrency(pnl)}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{ color: pnl >= 0 ? '#4caf50' : '#f44336' }}
            >
              ({pnlPercentage >= 0 ? '+' : ''}
              {pnlPercentage.toFixed(2)}%)
            </Typography>
          </Box>
        </Box>

        <Box sx={{ pt: 1, borderTop: '1px solid #f0f0f0' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: showDateTime ? 'space-between' : 'flex-start',
              alignItems: 'center',
              mb: transaction.status === 'OPEN' && onExit ? 2 : 0,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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

          {transaction.status === 'OPEN' && onExit && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Button
                variant="contained"
                color="error"
                size="small"
                disabled={isExiting}
                onClick={() => onExit(transaction.id)}
                sx={{ minWidth: 80, fontSize: '0.875rem', py: 1, px: 3, borderRadius: 2 }}
              >
                {isExiting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} color="inherit" />
                    Closing…
                  </Box>
                ) : (
                  'Close position'
                )}
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

type Page = 'active' | 'strategy';

export default function AnshulGrowwDashboard() {
  const [page, setPage] = useState<Page>('active');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [positions, setPositions] = useState<FuturesTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [exiting, setExiting] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const [webhookForm, setWebhookForm] = useState<FuturesWebhookRequest>({
    script: 'LODHA',
    scriptType: 'index',
    instrumentType: 'NSE',
    timeframe: '15',
    trend: 'CE',
    strategy: 'TEST_ANSHUL',
  });
  const [webhookLoading, setWebhookLoading] = useState(false);

  const fetchPositions = async () => {
    setListError(null);
    setLoading(true);
    try {
      const rows = await stockService.getFuturesTransactions(1, 200, anshulApi);
      setPositions(rows.filter((row) => row.status === 'OPEN'));
    } catch (e) {
      setListError(e instanceof Error ? e.message : 'Failed to load futures positions');
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pnlOpen = positions.reduce((sum, transaction) => {
    const isSell = transaction.trade_type === 'SELL';
    const pnl = isSell
      ? (transaction.buying_price - transaction.current_ltp) * transaction.qty
      : (transaction.current_ltp - transaction.buying_price) * transaction.qty;
    return sum + pnl;
  }, 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchPositions();
    } finally {
      setRefreshing(false);
    }
  };

  const handleClosePosition = async (id: string) => {
    setExiting((prev) => new Set(prev).add(id));
    try {
      await stockService.closeFuturesOrder(id, anshulApi);
      setToastMessage('Futures position closed successfully');
      setToastSeverity('success');
      setToastOpen(true);
      await fetchPositions();
    } catch (e) {
      setToastMessage(e instanceof Error ? e.message : 'Failed to close position');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleWebhookSubmit = async () => {
    setWebhookLoading(true);
    try {
      await stockService.sendFuturesWebhook(webhookForm, anshulApi);
      setToastMessage('Futures webhook sent successfully');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (e) {
      setToastMessage(e instanceof Error ? e.message : 'Webhook failed');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setWebhookLoading(false);
    }
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          GROW · Anshul
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Groww futures (independent)
        </Typography>
      </Box>
      <List>
        <ListItem disablePadding>
          <ListItemButton selected={page === 'active'} onClick={() => { setPage('active'); setMobileOpen(false); }}>
            <ListItemIcon>
              <BarChart3 size={20} />
            </ListItemIcon>
            <ListItemText
              primary="Active positions"
              secondary={`${positions.length} open`}
              secondaryTypographyProps={{ variant: 'caption' }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={page === 'strategy'} onClick={() => { setPage('strategy'); setMobileOpen(false); }}>
            <ListItemIcon>
              <Settings size={20} />
            </ListItemIcon>
            <ListItemText primary="Strategy config" />
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography
          component={Link}
          to="/"
          variant="body2"
          sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          ← Main trading dashboard
        </Typography>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={anshulTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: '1px solid #e0e0e0',
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2, display: { md: 'none' } }}>
              <Menu size={22} />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              {page === 'active' ? 'Active positions' : 'Strategy config'}
            </Typography>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing || loading || page === 'strategy'}
              color="inherit"
              aria-label="refresh positions"
              title={page === 'strategy' ? 'Switch to Active positions to refresh the list' : 'Refresh positions'}
            >
              {refreshing ? <CircularProgress size={22} color="inherit" /> : <RefreshCw size={22} />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            width: { md: `calc(100% - ${drawerWidth}px)` },
            mt: '64px',
          }}
        >
          {page === 'active' && (
            <>
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Open positions P&amp;L (unrealized)
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 'bold', color: pnlOpen >= 0 ? 'success.main' : 'error.main' }}
                >
                  {pnlOpen >= 0 ? '+' : ''}
                  ₹{pnlOpen.toFixed(2)}
                </Typography>
              </Card>

              {listError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {listError}
                </Alert>
              )}

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress />
                </Box>
              ) : positions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Activity size={40} color="#bdbdbd" style={{ marginBottom: 8 }} />
                  <Typography variant="h6" color="text.secondary">
                    No open futures positions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Open Strategy config to send a signal.
                  </Typography>
                </Box>
              ) : (
                positions.map((transaction) => (
                  <FuturesPositionCard
                    key={transaction.id}
                    transaction={transaction}
                    showDateTime
                    showStatus
                    onExit={handleClosePosition}
                    isExiting={exiting.has(transaction.id)}
                  />
                ))
              )}
            </>
          )}

          {page === 'strategy' && (
            <Card sx={{ p: 3 }}>
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
                Strategy config
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Sends a futures webhook (same as the main dashboard): POST{' '}
                <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>/api/futures/webhook</Box> on{' '}
                <Box component="span" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>anshul.gotecha.shop</Box>.
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Script</InputLabel>
                  <Select
                    value={webhookForm.script}
                    label="Script"
                    onChange={(e) => setWebhookForm((f) => ({ ...f, script: e.target.value }))}
                  >
                    <MenuItem value="LODHA">LODHA</MenuItem>
                    <MenuItem value="POLYCAB">POLYCAB</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Timeframe</InputLabel>
                  <Select
                    value={webhookForm.timeframe}
                    label="Timeframe"
                    onChange={(e) => setWebhookForm((f) => ({ ...f, timeframe: e.target.value }))}
                  >
                    <MenuItem value="15">15</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Trend</InputLabel>
                  <Select
                    value={webhookForm.trend}
                    label="Trend"
                    onChange={(e) => setWebhookForm((f) => ({ ...f, trend: e.target.value }))}
                  >
                    <MenuItem value="CE">CE</MenuItem>
                    <MenuItem value="PE">PE</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Strategy</InputLabel>
                  <Select
                    value={webhookForm.strategy}
                    label="Strategy"
                    onChange={(e) => setWebhookForm((f) => ({ ...f, strategy: e.target.value }))}
                  >
                    <MenuItem value="TEST_ANSHUL">TEST_ANSHUL</MenuItem>
                    <MenuItem value="EMA_CROSS_9_50">EMA_CROSS_9_50</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 2, mb: 3 }}>
                <TextField label="Script type" value={webhookForm.scriptType} InputProps={{ readOnly: true }} fullWidth />
                <TextField label="Instrument type" value={webhookForm.instrumentType} InputProps={{ readOnly: true }} fullWidth />
              </Box>
              <Button variant="contained" size="large" onClick={handleWebhookSubmit} disabled={webhookLoading}>
                {webhookLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Sending…
                  </Box>
                ) : (
                  'Send futures webhook'
                )}
              </Button>
            </Card>
          )}
        </Box>

        <Snackbar open={toastOpen} autoHideDuration={4000} onClose={() => setToastOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: '100%' }}>
            {toastMessage}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
