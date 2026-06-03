import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { alpha, createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  CssBaseline,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  Activity,
  BarChart3,
  ChevronRight,
  Clock3,
  Database,
  LogOut,
  Menu,
  Radio,
  RefreshCw,
  Send,
  Settings,
  Shield,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { FuturesTransaction, FuturesWebhookRequest } from './config/api';
import stockService from './services/stockService';

const drawerWidth = 292;

type Page = 'active' | 'strategy';

type GrowwFuturesDashboardProps = {
  accountName: string;
  baseUrl: string;
  userId: number;
  initialStrategy: string;
  strategyOptions: string[];
};

const growwTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f7a63', light: '#38a884', dark: '#145343' },
    secondary: { main: '#3158d4' },
    success: { main: '#11884f' },
    error: { main: '#c43c35' },
    warning: { main: '#b87813' },
    background: { default: '#f4f6f4', paper: '#ffffff' },
    text: { primary: '#16211d', secondary: '#68736f' },
    divider: '#dfe6e1',
  },
  typography: {
    fontFamily:
      '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: { fontWeight: 800, letterSpacing: 0 },
    h5: { fontWeight: 750, letterSpacing: 0 },
    h6: { fontWeight: 750, letterSpacing: 0 },
    button: { fontWeight: 750, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid #dfe6e1',
          boxShadow: '0 18px 45px rgba(36, 48, 43, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 750,
        },
      },
    },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },
  },
});

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

const getFuturesPnl = (transaction: FuturesTransaction) =>
  transaction.trade_type === 'SELL'
    ? (transaction.buying_price - transaction.current_ltp) * transaction.qty
    : (transaction.current_ltp - transaction.buying_price) * transaction.qty;

const getPnlPercent = (pnl: number, entryPrice: number, qty: number) => {
  const denominator = entryPrice * qty;
  return denominator ? (pnl / denominator) * 100 : 0;
};

const trendColor = (value: number) => (value >= 0 ? 'success.main' : 'error.main');

const PriceCell: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box>
    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 750 }}>
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.35, wordBreak: 'break-word' }}>
      {value}
    </Typography>
  </Box>
);

const GuardChip: React.FC<{ icon: React.ReactNode; label: string; tone?: 'target' | 'stop' | 'time' }> = ({
  icon,
  label,
  tone = 'target',
}) => {
  const colors = {
    target: { color: '#8a5c12', bg: '#fff6df' },
    stop: { color: '#a53a34', bg: '#faecea' },
    time: { color: '#3158d4', bg: '#eef2ff' },
  };

  return (
    <Chip
      icon={<Box sx={{ color: colors[tone].color, display: 'flex' }}>{icon}</Box>}
      label={label}
      size="small"
      sx={{
        bgcolor: colors[tone].bg,
        color: colors[tone].color,
        border: 'none',
        '& .MuiChip-icon': { ml: 1 },
      }}
    />
  );
};

const EmptyState: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <Card sx={{ borderStyle: 'dashed', boxShadow: 'none' }}>
    <CardContent
      sx={{
        minHeight: 260,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Box>
        <Avatar
          variant="rounded"
          sx={{
            width: 54,
            height: 54,
            mx: 'auto',
            mb: 2,
            color: 'primary.main',
            bgcolor: 'rgba(31, 122, 99, 0.1)',
          }}
        >
          <Database size={24} />
        </Avatar>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const LoadingState = () => (
  <Card sx={{ boxShadow: 'none' }}>
    <CardContent
      sx={{
        minHeight: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={34} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Syncing live trades
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const FuturesPositionCard: React.FC<{
  transaction: FuturesTransaction;
  onExit: (id: string) => void;
  isExiting: boolean;
}> = ({ transaction, onExit, isExiting }) => {
  const pnl = getFuturesPnl(transaction);
  const pnlPercentage = getPnlPercent(pnl, transaction.buying_price, transaction.qty);

  return (
    <Card
      sx={{
        mb: 2,
        overflow: 'hidden',
        transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: alpha(pnl >= 0 ? growwTheme.palette.success.main : growwTheme.palette.error.main, 0.36),
          boxShadow: '0 22px 50px rgba(36, 48, 43, 0.12)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(240px, 1.2fr) minmax(220px, 0.8fr)' },
            gap: 2,
            alignItems: 'start',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, minWidth: 0 }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'primary.main',
                fontWeight: 900,
                flex: '0 0 auto',
              }}
            >
              {transaction.symbol.slice(0, 2)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ lineHeight: 1.15, wordBreak: 'break-word' }}>
                  {transaction.symbol}
                </Typography>
                <Chip
                  label={transaction.trade_type}
                  size="small"
                  color={transaction.trade_type === 'SELL' ? 'warning' : 'primary'}
                  variant="outlined"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.45 }}>
                Qty {transaction.qty}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
              Unrealized P&L
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                alignItems: 'center',
                gap: 0.75,
                mt: 0.35,
                color: trendColor(pnl),
              }}
            >
              {pnl >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              <Typography variant="h5" sx={{ color: 'inherit' }}>
                {pnl >= 0 ? '+' : ''}
                {formatCurrency(pnl)}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: trendColor(pnl), fontWeight: 800 }}>
              {pnlPercentage >= 0 ? '+' : ''}
              {pnlPercentage.toFixed(2)}%
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 2.5,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(136px, 1fr))',
            gap: 1.5,
          }}
        >
          <PriceCell label="Quantity" value={transaction.qty} />
          <PriceCell label="Entry" value={formatCurrency(transaction.buying_price)} />
          <PriceCell label="LTP" value={formatCurrency(transaction.current_ltp)} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1.5,
            alignItems: { xs: 'stretch', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <GuardChip icon={<Target size={14} />} label={`Target ${formatCurrency(transaction.target)}`} />
            <GuardChip icon={<Shield size={14} />} label={`SL ${formatCurrency(transaction.stop_loss)}`} tone="stop" />
            <GuardChip icon={<Clock3 size={14} />} label={formatDate(transaction.created_at)} tone="time" />
          </Box>
          <Button
            color="error"
            variant="contained"
            startIcon={isExiting ? <CircularProgress size={16} color="inherit" /> : <LogOut size={16} />}
            disabled={isExiting}
            onClick={() => onExit(transaction.id)}
            sx={{ minWidth: 112 }}
          >
            {isExiting ? 'Exiting' : 'Exit'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

function GrowwFuturesDashboardContent({
  accountName,
  baseUrl,
  userId,
  initialStrategy,
  strategyOptions,
}: GrowwFuturesDashboardProps) {
  const isMobile = useMediaQuery(growwTheme.breakpoints.down('md'));
  const apiOptions = useMemo(() => ({ baseUrl }), [baseUrl]);
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
    strategy: initialStrategy,
  });
  const [webhookLoading, setWebhookLoading] = useState(false);

  const fetchPositions = async () => {
    setListError(null);
    setLoading(true);
    try {
      const rows = await stockService.getFuturesTransactions(userId, 200, apiOptions);
      setPositions(rows.filter((row) => row.status === 'OPEN'));
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Failed to load futures positions');
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPositions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, baseUrl]);

  const livePositions = positions.filter((position) => !position.order_id?.startsWith('PAPER_'));
  const paperPositions = positions.filter((position) => position.order_id?.startsWith('PAPER_'));

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
      await stockService.closeFuturesOrder(id, apiOptions);
      setToastMessage('Futures position closed successfully');
      setToastSeverity('success');
      setToastOpen(true);
      await fetchPositions();
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Failed to close position');
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
      await stockService.sendFuturesWebhook(webhookForm, apiOptions);
      setToastMessage('Futures webhook sent successfully');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (error) {
      setToastMessage(error instanceof Error ? error.message : 'Webhook failed');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setWebhookLoading(false);
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fbfcfb' }}>
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar variant="rounded" sx={{ bgcolor: '#17211d', width: 42, height: 42 }}>
            <Sparkles size={20} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
              GROW {accountName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 750 }}>
              Independent futures desk
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ px: 1.5, py: 2, flex: 1 }}>
        <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
          <ListItem disablePadding>
            <ListItemButton
              selected={page === 'active'}
              onClick={() => {
                setPage('active');
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                minHeight: 58,
                '&.Mui-selected': {
                  bgcolor: alpha(growwTheme.palette.primary.main, 0.1),
                  color: 'primary.dark',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                <BarChart3 size={19} />
              </ListItemIcon>
              <ListItemText
                primary="Live Trades"
                secondary={`${positions.length} open`}
                primaryTypographyProps={{ fontWeight: 800, fontSize: 14 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              {page === 'active' && <ChevronRight size={16} />}
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              selected={page === 'strategy'}
              onClick={() => {
                setPage('strategy');
                setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                minHeight: 58,
                '&.Mui-selected': {
                  bgcolor: alpha(growwTheme.palette.primary.main, 0.1),
                  color: 'primary.dark',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>
                <Settings size={19} />
              </ListItemIcon>
              <ListItemText
                primary="Strategy Config"
                secondary="Webhook controls"
                primaryTypographyProps={{ fontWeight: 800, fontSize: 14 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              {page === 'strategy' && <ChevronRight size={16} />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 1,
            bgcolor: '#ffffff',
          }}
        >
          <Button component={Link} to="/" size="small" endIcon={<ChevronRight size={15} />} fullWidth>
            Main dashboard
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderActive = () => {
    if (listError) {
      return <Alert severity="error">{listError}</Alert>;
    }

    if (loading) return <LoadingState />;

    if (positions.length === 0) {
      return (
        <EmptyState
          title="No open futures positions"
          subtitle="Live positions will appear here when a signal opens a trade."
        />
      );
    }

    return (
      <Box sx={{ display: 'grid', gap: 3 }}>
        {livePositions.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Radio size={18} color={growwTheme.palette.success.main} />
              <Typography variant="h6">Live Trades</Typography>
              <Chip label={`${livePositions.length} open`} size="small" />
            </Box>
            {livePositions.map((transaction) => (
              <FuturesPositionCard
                key={transaction.id}
                transaction={transaction}
                onExit={handleClosePosition}
                isExiting={exiting.has(transaction.id)}
              />
            ))}
          </Box>
        )}

        {paperPositions.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Activity size={18} color={growwTheme.palette.secondary.main} />
              <Typography variant="h6">Paper Trades</Typography>
              <Chip label={`${paperPositions.length} open`} size="small" />
            </Box>
            {paperPositions.map((transaction) => (
              <FuturesPositionCard
                key={transaction.id}
                transaction={transaction}
                onExit={handleClosePosition}
                isExiting={exiting.has(transaction.id)}
              />
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage:
          'linear-gradient(180deg, rgba(31, 122, 99, 0.08) 0px, rgba(244, 246, 244, 0) 360px)',
      }}
    >
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          boxSizing: 'border-box',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          px: { xs: 2, sm: 3, lg: 4 },
          py: { xs: 2, sm: 3 },
        }}
      >
        <Box sx={{ maxWidth: 1320, mx: 'auto' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              alignItems: { xs: 'flex-start', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              {isMobile && (
                <IconButton
                  onClick={() => setMobileOpen(true)}
                  sx={{
                    bgcolor: '#17211d',
                    color: 'white',
                    mt: 0.2,
                    '&:hover': { bgcolor: '#24362f' },
                  }}
                >
                  <Menu size={22} />
                </IconButton>
              )}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                  <Chip icon={<BarChart3 size={14} />} label={`${accountName} desk`} size="small" color="primary" />
                  <Chip label={loading ? 'Syncing' : 'Live view'} size="small" variant="outlined" />
                </Box>
                <Typography variant="h3" sx={{ fontSize: { xs: 30, sm: 38 }, lineHeight: 1.05 }}>
                  {page === 'active' ? 'Live Trades' : 'Strategy Config'}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
                  {page === 'active'
                    ? 'Focused view of current live futures trades.'
                    : 'Configure and send a futures strategy trigger.'}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={refreshing ? <CircularProgress size={18} color="inherit" /> : <RefreshCw size={18} />}
              disabled={refreshing || loading || page === 'strategy'}
              onClick={handleRefresh}
              sx={{ minWidth: 132, py: 1.15 }}
            >
              {refreshing ? 'Refreshing' : 'Refresh'}
            </Button>
          </Box>

          {page === 'active' && renderActive()}

          {page === 'strategy' && (
            <Card>
              <CardContent sx={{ p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5">Futures Webhook Settings</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    Trigger endpoint on {new URL(baseUrl).hostname}.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                    gap: 2,
                    mb: 3,
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel>Script</InputLabel>
                    <Select
                      value={webhookForm.script}
                      label="Script"
                      onChange={(event) => setWebhookForm((form) => ({ ...form, script: event.target.value }))}
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
                      onChange={(event) => setWebhookForm((form) => ({ ...form, timeframe: event.target.value }))}
                    >
                      <MenuItem value="15">15</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth>
                    <InputLabel>Trend</InputLabel>
                    <Select
                      value={webhookForm.trend}
                      label="Trend"
                      onChange={(event) => setWebhookForm((form) => ({ ...form, trend: event.target.value }))}
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
                      onChange={(event) => setWebhookForm((form) => ({ ...form, strategy: event.target.value }))}
                    >
                      {strategyOptions.map((strategy) => (
                        <MenuItem key={strategy} value={strategy}>
                          {strategy}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Script Type"
                    value={webhookForm.scriptType}
                    InputProps={{ readOnly: true }}
                  />
                  <TextField
                    fullWidth
                    label="Instrument Type"
                    value={webhookForm.instrumentType}
                    InputProps={{ readOnly: true }}
                  />
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={webhookLoading ? <CircularProgress size={18} color="inherit" /> : <Send size={18} />}
                  onClick={handleWebhookSubmit}
                  disabled={webhookLoading}
                  sx={{ minWidth: 190, py: 1.25 }}
                >
                  {webhookLoading ? 'Sending' : 'Send Futures Webhook'}
                </Button>
              </CardContent>
            </Card>
          )}
        </Box>

        <Snackbar
          open={toastOpen}
          autoHideDuration={4000}
          onClose={() => setToastOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: '100%' }}>
            {toastMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}

export default function GrowwFuturesDashboard(props: GrowwFuturesDashboardProps) {
  return (
    <ThemeProvider theme={growwTheme}>
      <CssBaseline />
      <GrowwFuturesDashboardContent {...props} />
    </ThemeProvider>
  );
}
