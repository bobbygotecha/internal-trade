import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  alpha,
} from '@mui/material/styles';
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
  FileText,
  Gauge,
  History,
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
  Wallet,
} from 'lucide-react';
import stockService from './services/stockService';
import {
  FuturesTransaction,
  FuturesWebhookRequest,
  UserTransaction,
  WebhookRequest,
} from './config/api';

const drawerWidth = 292;

type PageId =
  | 'home'
  | 'all-orders'
  | 'settings'
  | 'futures'
  | 'all-futures-orders'
  | 'futures-settings';

const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1f7a63',
      light: '#38a884',
      dark: '#145343',
    },
    secondary: {
      main: '#3158d4',
    },
    success: {
      main: '#11884f',
    },
    error: {
      main: '#c43c35',
    },
    warning: {
      main: '#b87813',
    },
    background: {
      default: '#f4f6f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#16211d',
      secondary: '#68736f',
    },
    divider: '#dfe6e1',
  },
  typography: {
    fontFamily:
      '"Inter", "SF Pro Display", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h4: {
      fontWeight: 800,
      letterSpacing: 0,
    },
    h5: {
      fontWeight: 750,
      letterSpacing: 0,
    },
    h6: {
      fontWeight: 750,
      letterSpacing: 0,
    },
    button: {
      fontWeight: 750,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
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
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiFormControl: {
      defaultProps: {
        size: 'small',
      },
    },
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

const getOptionsPnl = (transaction: UserTransaction) =>
  (transaction.currentPrice - transaction.buyingPrice) * transaction.qty;

const getFuturesPnl = (transaction: FuturesTransaction) =>
  transaction.trade_type === 'SELL'
    ? (transaction.buying_price - transaction.current_ltp) * transaction.qty
    : (transaction.current_ltp - transaction.buying_price) * transaction.qty;

const getPnlPercent = (pnl: number, entryPrice: number, qty: number) => {
  const denominator = entryPrice * qty;
  return denominator ? (pnl / denominator) * 100 : 0;
};

const isFuturesPage = (page: PageId) =>
  page === 'futures' || page === 'all-futures-orders' || page === 'futures-settings';

const getPageTitle = (page: PageId) => {
  switch (page) {
    case 'home':
      return 'Options Positions';
    case 'all-orders':
      return 'Options Order History';
    case 'settings':
      return 'Options Strategy Config';
    case 'futures':
      return 'Futures Positions';
    case 'all-futures-orders':
      return 'Futures Order History';
    case 'futures-settings':
      return 'Futures Strategy Config';
    default:
      return 'Trading Dashboard';
  }
};

const getPageSubtitle = (page: PageId) => {
  if (page === 'futures') return 'Live and paper futures positions, grouped for quick action.';
  if (page === 'home') return 'Open options trades with target, stop loss, and exit controls.';
  if (page === 'all-futures-orders' || page === 'all-orders') {
    return 'Complete transaction history with status, entry, LTP, and P&L.';
  }
  return 'Webhook inputs for controlled strategy triggers.';
};

const trendColor = (value: number) => (value >= 0 ? 'success.main' : 'error.main');

const MetricCard: React.FC<{
  label: string;
  value: React.ReactNode;
  helper?: string;
  icon: React.ReactNode;
  tone?: 'profit' | 'loss' | 'neutral' | 'blue' | 'amber';
}> = ({ label, value, helper, icon, tone = 'neutral' }) => {
  const toneMap = {
    profit: { fg: '#11884f', bg: '#e8f7ef' },
    loss: { fg: '#c43c35', bg: '#faecea' },
    neutral: { fg: '#30423b', bg: '#eef3ef' },
    blue: { fg: '#3158d4', bg: '#eef2ff' },
    amber: { fg: '#9f6812', bg: '#fff6df' },
  };
  const colors = toneMap[tone];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
              {label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.6, color: colors.fg }}>
              {value}
            </Typography>
            {helper && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {helper}
              </Typography>
            )}
          </Box>
          <Avatar
            variant="rounded"
            sx={{
              width: 42,
              height: 42,
              color: colors.fg,
              bgcolor: colors.bg,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
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
          Syncing trading data
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

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

const PositionCardShell: React.FC<{
  symbol: string;
  subtitle: string;
  avatar?: string;
  status?: string;
  side?: string;
  pnl: number;
  pnlPercent: number;
  children: React.ReactNode;
  footer: React.ReactNode;
  onExit?: () => void;
  isExiting?: boolean;
}> = ({
  symbol,
  subtitle,
  avatar,
  status,
  side,
  pnl,
  pnlPercent,
  children,
  footer,
  onExit,
  isExiting,
}) => (
  <Card
    sx={{
      mb: 2,
      overflow: 'hidden',
      transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        borderColor: alpha(pnl >= 0 ? appTheme.palette.success.main : appTheme.palette.error.main, 0.36),
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
            src={avatar}
            variant="rounded"
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              fontWeight: 900,
              flex: '0 0 auto',
            }}
          >
            {symbol.slice(0, 2)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ lineHeight: 1.15, wordBreak: 'break-word' }}>
                {symbol}
              </Typography>
              {side && (
                <Chip
                  label={side}
                  size="small"
                  color={side === 'SELL' || side === 'PE' ? 'warning' : 'primary'}
                  variant="outlined"
                />
              )}
              {status && <Chip label={status} size="small" color={status === 'OPEN' ? 'success' : 'default'} />}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.45 }}>
              {subtitle}
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
            {pnlPercent >= 0 ? '+' : ''}
            {pnlPercent.toFixed(2)}%
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
        {children}
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
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{footer}</Box>
        {onExit && (
          <Button
            color="error"
            variant="contained"
            startIcon={isExiting ? <CircularProgress size={16} color="inherit" /> : <LogOut size={16} />}
            disabled={isExiting}
            onClick={onExit}
            sx={{ minWidth: 112 }}
          >
            {isExiting ? 'Exiting' : 'Exit'}
          </Button>
        )}
      </Box>
    </CardContent>
  </Card>
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

const TransactionCard: React.FC<{
  transaction: UserTransaction;
  showDateTime?: boolean;
  onExit?: (transactionId: string) => void;
  isExiting?: boolean;
  showStatus?: boolean;
}> = ({ transaction, showDateTime = true, onExit, isExiting = false, showStatus = true }) => {
  const pnl = getOptionsPnl(transaction);
  const pnlPercentage = getPnlPercent(pnl, transaction.buyingPrice, transaction.qty);

  return (
    <PositionCardShell
      symbol={transaction.script}
      subtitle={`${transaction.scriptDetails.name} / Lot ${transaction.scriptDetails.lotSize}`}
      avatar={transaction.scriptDetails.logo}
      status={showStatus ? transaction.status : undefined}
      pnl={pnl}
      pnlPercent={pnlPercentage}
      onExit={transaction.status === 'OPEN' && onExit ? () => onExit(transaction.id) : undefined}
      isExiting={isExiting}
      footer={
        <>
          <GuardChip icon={<Target size={14} />} label={`Target ${formatCurrency(transaction.target)}`} />
          <GuardChip icon={<Shield size={14} />} label={`SL ${formatCurrency(transaction.stopLoss)}`} tone="stop" />
          {showDateTime && (
            <GuardChip icon={<Clock3 size={14} />} label={formatDate(transaction.createdAt)} tone="time" />
          )}
        </>
      }
    >
      <PriceCell label="Quantity" value={transaction.qty} />
      <PriceCell label="Entry" value={formatCurrency(transaction.buyingPrice)} />
      <PriceCell label="Current" value={formatCurrency(transaction.currentPrice)} />
      <PriceCell
        label="Exposure"
        value={formatCurrency(transaction.buyingPrice * transaction.qty)}
      />
    </PositionCardShell>
  );
};

const FuturesTransactionCard: React.FC<{
  transaction: FuturesTransaction;
  showDateTime?: boolean;
  onExit?: (transactionId: string) => void;
  isExiting?: boolean;
  showStatus?: boolean;
}> = ({ transaction, showDateTime = true, onExit, isExiting = false, showStatus = true }) => {
  const pnl = getFuturesPnl(transaction);
  const pnlPercentage = getPnlPercent(pnl, transaction.buying_price, transaction.qty);

  return (
    <PositionCardShell
      symbol={transaction.symbol}
      subtitle={`Qty ${transaction.qty}`}
      status={showStatus ? transaction.status : undefined}
      side={transaction.trade_type}
      pnl={pnl}
      pnlPercent={pnlPercentage}
      onExit={transaction.status === 'OPEN' && onExit ? () => onExit(transaction.id) : undefined}
      isExiting={isExiting}
      footer={
        <>
          <GuardChip icon={<Target size={14} />} label={`Target ${formatCurrency(transaction.target)}`} />
          <GuardChip icon={<Shield size={14} />} label={`SL ${formatCurrency(transaction.stop_loss)}`} tone="stop" />
          {showDateTime && (
            <GuardChip icon={<Clock3 size={14} />} label={formatDate(transaction.created_at)} tone="time" />
          )}
        </>
      }
    >
      <PriceCell label="Quantity" value={transaction.qty} />
      <PriceCell label="Entry" value={formatCurrency(transaction.buying_price)} />
      <PriceCell label="LTP" value={formatCurrency(transaction.current_ltp)} />
    </PositionCardShell>
  );
};

const SettingsCard: React.FC<{
  title: string;
  subtitle: string;
  form: WebhookRequest | FuturesWebhookRequest;
  loading: boolean;
  submitLabel: string;
  onSubmit: () => void;
  onChange: (field: keyof WebhookRequest, value: string) => void;
  strategyOptions: string[];
}> = ({ title, subtitle, form, loading, submitLabel, onSubmit, onChange, strategyOptions }) => (
  <Card>
    <CardContent sx={{ p: { xs: 2, md: 3 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.4fr) minmax(320px, 0.6fr)' },
          gap: 3,
        }}
      >
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5">{title}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 2,
            }}
          >
            <FormControl fullWidth>
              <InputLabel>Script</InputLabel>
              <Select
                value={form.script}
                label="Script"
                onChange={(event) => onChange('script', event.target.value)}
              >
                <MenuItem value="LODHA">LODHA</MenuItem>
                <MenuItem value="POLYCAB">POLYCAB</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={form.timeframe}
                label="Timeframe"
                onChange={(event) => onChange('timeframe', event.target.value)}
              >
                <MenuItem value="15">15</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Trend</InputLabel>
              <Select
                value={form.trend}
                label="Trend"
                onChange={(event) => onChange('trend', event.target.value)}
              >
                <MenuItem value="CE">CE</MenuItem>
                <MenuItem value="PE">PE</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Strategy</InputLabel>
              <Select
                value={form.strategy}
                label="Strategy"
                onChange={(event) => onChange('strategy', event.target.value)}
              >
                {strategyOptions.map((strategy) => (
                  <MenuItem key={strategy} value={strategy}>
                    {strategy}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField fullWidth label="Script Type" value={form.scriptType} InputProps={{ readOnly: true }} />
            <TextField
              fullWidth
              label="Instrument Type"
              value={form.instrumentType}
              InputProps={{ readOnly: true }}
            />
          </Box>

          <Button
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send size={18} />}
            onClick={onSubmit}
            disabled={loading}
            sx={{ mt: 3, minWidth: 190, py: 1.25 }}
          >
            {loading ? 'Sending' : submitLabel}
          </Button>
        </Box>

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: '#f8faf8',
            borderRadius: 2,
            p: 2,
            alignSelf: 'start',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar variant="rounded" sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}>
              <Gauge size={18} />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 850 }}>
                Current Payload
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Preview before trigger
              </Typography>
            </Box>
          </Box>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              overflowX: 'auto',
              borderRadius: 1,
              bgcolor: '#17211d',
              color: '#e8f2ec',
              fontSize: 13,
              lineHeight: 1.65,
            }}
          >
            {JSON.stringify(form, null, 2)}
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

function AppContent() {
  const isMobile = useMediaQuery(appTheme.breakpoints.down('md'));

  const [currentPage, setCurrentPage] = useState<PageId>('futures');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [futuresTransactions, setFuturesTransactions] = useState<FuturesTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [futuresLoading, setFuturesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exitingTransactions, setExitingTransactions] = useState<Set<string>>(new Set());
  const [exitingFuturesTransactions, setExitingFuturesTransactions] = useState<Set<string>>(new Set());
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');
  const [webhookForm, setWebhookForm] = useState<WebhookRequest>({
    script: 'LODHA',
    scriptType: 'index',
    instrumentType: 'NSE',
    timeframe: '15',
    trend: 'CE',
    strategy: 'EMA_CROSS_20_200',
  });
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [futuresWebhookForm, setFuturesWebhookForm] = useState<FuturesWebhookRequest>({
    script: 'LODHA',
    scriptType: 'index',
    instrumentType: 'NSE',
    timeframe: '15',
    trend: 'CE',
    strategy: 'EMA_CROSS_200',
  });
  const [futuresWebhookLoading, setFuturesWebhookLoading] = useState(false);
  const [optionsPnL, setOptionsPnL] = useState(0);
  const [futuresPnL, setFuturesPnL] = useState(0);
  const [pnlLoading, setPnlLoading] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const openTransactions = useMemo(() => transactions.filter((t) => t.status === 'OPEN'), [transactions]);
  const openFuturesTransactions = useMemo(
    () => futuresTransactions.filter((t) => t.status === 'OPEN'),
    [futuresTransactions]
  );
  const liveFutures = useMemo(
    () => openFuturesTransactions.filter((t) => !t.order_id?.startsWith('PAPER_')),
    [openFuturesTransactions]
  );
  const paperFutures = useMemo(
    () => openFuturesTransactions.filter((t) => t.order_id?.startsWith('PAPER_')),
    [openFuturesTransactions]
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setFuturesLoading(true);
      setPnlLoading(true);
      setError(null);

      const fetchedTransactions = await stockService.getUserTransactions();
      setTransactions(fetchedTransactions);
      setOptionsPnL(fetchedTransactions.reduce((sum, transaction) => sum + getOptionsPnl(transaction), 0));

      try {
        const fetchedFuturesTransactions = await stockService.getFuturesTransactions(1, 200);
        setFuturesTransactions(fetchedFuturesTransactions);
        setFuturesPnL(fetchedFuturesTransactions.reduce((sum, transaction) => sum + getFuturesPnl(transaction), 0));
      } catch (futuresError) {
        console.error('Failed to fetch futures transactions:', futuresError);
      }
    } catch (fetchError) {
      console.error('Failed to fetch data:', fetchError);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
      setFuturesLoading(false);
      setPnlLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen((open) => !open);
  };

  const handlePageChange = (page: PageId) => {
    setCurrentPage(page);
    if (isMobile) setMobileOpen(false);
  };

  const refetchTransactions = async () => {
    const fetchedTransactions = await stockService.getUserTransactions();
    setTransactions(fetchedTransactions);
    setOptionsPnL(fetchedTransactions.reduce((sum, transaction) => sum + getOptionsPnl(transaction), 0));
  };

  const refetchFuturesTransactions = async () => {
    try {
      setFuturesLoading(true);
      const fetchedFuturesTransactions = await stockService.getFuturesTransactions(1, 200);
      setFuturesTransactions(fetchedFuturesTransactions);
      setFuturesPnL(fetchedFuturesTransactions.reduce((sum, transaction) => sum + getFuturesPnl(transaction), 0));
    } finally {
      setFuturesLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshLoading(true);
      if (isFuturesPage(currentPage)) {
        await refetchFuturesTransactions();
      } else {
        await refetchTransactions();
      }
    } catch (refreshError) {
      console.error('Failed to refresh data:', refreshError);
      setToastMessage('Failed to refresh data');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setRefreshLoading(false);
    }
  };

  const handleExitOrder = async (transactionId: string) => {
    try {
      setExitingTransactions((prev) => new Set(prev).add(transactionId));
      await stockService.closeOrder(transactionId);
      setToastMessage('Order closed successfully');
      setToastSeverity('success');
      setToastOpen(true);
      await refetchTransactions();
    } catch (exitError) {
      console.error('Exit order failed:', exitError);
      setToastMessage(exitError instanceof Error ? exitError.message : 'Failed to close order');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setExitingTransactions((prev) => {
        const next = new Set(prev);
        next.delete(transactionId);
        return next;
      });
    }
  };

  const handleExitFuturesOrder = async (transactionId: string) => {
    try {
      setExitingFuturesTransactions((prev) => new Set(prev).add(transactionId));
      await stockService.closeFuturesOrder(transactionId);
      setToastMessage('Futures position closed successfully');
      setToastSeverity('success');
      setToastOpen(true);
      await refetchFuturesTransactions();
    } catch (exitError) {
      console.error('Exit futures order failed:', exitError);
      setToastMessage(exitError instanceof Error ? exitError.message : 'Failed to close futures position');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setExitingFuturesTransactions((prev) => {
        const next = new Set(prev);
        next.delete(transactionId);
        return next;
      });
    }
  };

  const handleWebhookSubmit = async () => {
    try {
      setWebhookLoading(true);
      await stockService.sendWebhook(webhookForm);
      setToastMessage('Webhook sent successfully');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (webhookError) {
      console.error('Webhook failed:', webhookError);
      setToastMessage(webhookError instanceof Error ? webhookError.message : 'Failed to send webhook');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setWebhookLoading(false);
    }
  };

  const handleFuturesWebhookSubmit = async () => {
    try {
      setFuturesWebhookLoading(true);
      await stockService.sendFuturesWebhook(futuresWebhookForm);
      setToastMessage('Futures webhook sent successfully');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (webhookError) {
      console.error('Futures webhook failed:', webhookError);
      setToastMessage(webhookError instanceof Error ? webhookError.message : 'Failed to send futures webhook');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setFuturesWebhookLoading(false);
    }
  };

  const handleWebhookFormChange = (field: keyof WebhookRequest, value: string) => {
    setWebhookForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFuturesWebhookFormChange = (field: keyof FuturesWebhookRequest, value: string) => {
    setFuturesWebhookForm((prev) => ({ ...prev, [field]: value }));
  };

  const currentPnL = isFuturesPage(currentPage) ? futuresPnL : optionsPnL;
  const activeCount = isFuturesPage(currentPage) ? openFuturesTransactions.length : openTransactions.length;
  const totalCount = isFuturesPage(currentPage) ? futuresTransactions.length : transactions.length;
  const isLoadingCurrent = isFuturesPage(currentPage) ? futuresLoading : loading;

  const navSections = [
    {
      label: 'Futures Trading',
      items: [
        {
          id: 'futures' as PageId,
          label: 'Active Positions',
          helper: `${openFuturesTransactions.length} open`,
          icon: <BarChart3 size={19} />,
        },
        {
          id: 'all-futures-orders' as PageId,
          label: 'Order History',
          helper: `${futuresTransactions.length} total`,
          icon: <FileText size={19} />,
        },
        {
          id: 'futures-settings' as PageId,
          label: 'Strategy Config',
          helper: 'Webhook controls',
          icon: <Settings size={19} />,
        },
      ],
    },
    {
      label: 'Options Trading',
      items: [
        {
          id: 'home' as PageId,
          label: 'Active Positions',
          helper: `${openTransactions.length} open`,
          icon: <Activity size={19} />,
        },
        {
          id: 'all-orders' as PageId,
          label: 'Order History',
          helper: `${transactions.length} total`,
          icon: <History size={19} />,
        },
        {
          id: 'settings' as PageId,
          label: 'Strategy Config',
          helper: 'Webhook controls',
          icon: <Settings size={19} />,
        },
      ],
    },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fbfcfb' }}>
      <Box sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Avatar variant="rounded" sx={{ bgcolor: '#17211d', width: 42, height: 42 }}>
            <Sparkles size={20} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
              Trade Console
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 750 }}>
              Professional dashboard
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ px: 1.5, py: 2, flex: 1, overflowY: 'auto' }}>
        {navSections.map((section) => (
          <Box key={section.label} sx={{ mb: 2.5 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1.25,
                mb: 0.75,
                display: 'block',
                color: 'text.secondary',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: 0,
              }}
            >
              {section.label}
            </Typography>
            <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
              {section.items.map((item) => (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    selected={currentPage === item.id}
                    onClick={() => handlePageChange(item.id)}
                    sx={{
                      borderRadius: 2,
                      minHeight: 58,
                      '&.Mui-selected': {
                        bgcolor: alpha(appTheme.palette.primary.main, 0.1),
                        color: 'primary.dark',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 38, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.helper}
                      primaryTypographyProps={{ fontWeight: 800, fontSize: 14 }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    {currentPage === item.id && <ChevronRight size={16} />}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 1.5 }}>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            p: 1,
            display: 'grid',
            gap: 0.25,
            bgcolor: '#ffffff',
          }}
        >
          <Button component={Link} to="/anshul" size="small" endIcon={<ChevronRight size={15} />}>
            GROW Anshul
          </Button>
          <Button component={Link} to="/himanshu" size="small" endIcon={<ChevronRight size={15} />}>
            GROW Himanshu
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderOptionsPositions = (showAll: boolean) => {
    const list = showAll ? transactions : openTransactions;

    if (loading) return <LoadingState />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (list.length === 0) {
      return (
        <EmptyState
          title={showAll ? 'No options transactions found' : 'No open options positions'}
          subtitle={showAll ? 'Your options history will appear here.' : 'Open options positions will appear here.'}
        />
      );
    }

    return (
      <Box>
        {list.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            showDateTime={showAll}
            showStatus={showAll}
            onExit={!showAll ? handleExitOrder : undefined}
            isExiting={exitingTransactions.has(transaction.id)}
          />
        ))}
      </Box>
    );
  };

  const renderFuturesPositions = (showAll: boolean) => {
    if (futuresLoading) return <LoadingState />;

    if (showAll) {
      if (futuresTransactions.length === 0) {
        return (
          <EmptyState
            title="No futures transactions found"
            subtitle="Your futures order history will appear here."
          />
        );
      }

      return (
        <Box>
          {futuresTransactions.map((transaction) => (
            <FuturesTransactionCard
              key={transaction.id}
              transaction={transaction}
              showDateTime
              showStatus
            />
          ))}
        </Box>
      );
    }

    if (openFuturesTransactions.length === 0) {
      return (
        <EmptyState
          title="No open futures positions"
          subtitle="Live and paper futures positions will appear here."
        />
      );
    }

    return (
      <Box sx={{ display: 'grid', gap: 3 }}>
        {liveFutures.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Radio size={18} color={appTheme.palette.success.main} />
              <Typography variant="h6">Live Trades</Typography>
              <Chip label={`${liveFutures.length} open`} size="small" />
            </Box>
            {liveFutures.map((transaction) => (
              <FuturesTransactionCard
                key={transaction.id}
                transaction={transaction}
                showDateTime={false}
                showStatus={false}
                onExit={handleExitFuturesOrder}
                isExiting={exitingFuturesTransactions.has(transaction.id)}
              />
            ))}
          </Box>
        )}

        {paperFutures.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <FileText size={18} color={appTheme.palette.secondary.main} />
              <Typography variant="h6">Paper Trades</Typography>
              <Chip label={`${paperFutures.length} open`} size="small" />
            </Box>
            {paperFutures.map((transaction) => (
              <FuturesTransactionCard
                key={transaction.id}
                transaction={transaction}
                showDateTime={false}
                showStatus={false}
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
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              height: '100vh',
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
                  onClick={handleDrawerToggle}
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
                  <Chip
                    icon={isFuturesPage(currentPage) ? <BarChart3 size={14} /> : <Activity size={14} />}
                    label={isFuturesPage(currentPage) ? 'Futures desk' : 'Options desk'}
                    size="small"
                    color={isFuturesPage(currentPage) ? 'primary' : 'secondary'}
                  />
                  <Chip label={isLoadingCurrent ? 'Syncing' : 'Live view'} size="small" variant="outlined" />
                </Box>
                <Typography variant="h3" sx={{ fontSize: { xs: 30, sm: 38 }, lineHeight: 1.05 }}>
                  {getPageTitle(currentPage)}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 680 }}>
                  {getPageSubtitle(currentPage)}
                </Typography>
              </Box>
            </Box>

            <Button
              variant="contained"
              startIcon={refreshLoading ? <CircularProgress size={18} color="inherit" /> : <RefreshCw size={18} />}
              disabled={refreshLoading}
              onClick={handleRefresh}
              sx={{ minWidth: 132, py: 1.15 }}
            >
              {refreshLoading ? 'Refreshing' : 'Refresh'}
            </Button>
          </Box>

          {currentPage !== 'futures' && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 2,
                mb: 3,
              }}
            >
              <MetricCard
                label={isFuturesPage(currentPage) ? 'Futures P&L' : 'Options P&L'}
                value={
                  pnlLoading ? (
                    <CircularProgress size={22} />
                  ) : (
                    `${currentPnL >= 0 ? '+' : ''}${formatCurrency(currentPnL)}`
                  )
                }
                helper="Calculated from current positions"
                icon={currentPnL >= 0 ? <TrendingUp size={21} /> : <TrendingDown size={21} />}
                tone={currentPnL >= 0 ? 'profit' : 'loss'}
              />
              <MetricCard
                label="Open Positions"
                value={activeCount}
                helper={`${totalCount} total records`}
                icon={<Wallet size={21} />}
                tone="blue"
              />
              <MetricCard
                label={isFuturesPage(currentPage) ? 'Live Trades' : 'Active Segment'}
                value={isFuturesPage(currentPage) ? liveFutures.length : 'Options'}
                helper={isFuturesPage(currentPage) ? `${paperFutures.length} paper trades` : 'NSE strategy flow'}
                icon={<Radio size={21} />}
                tone="neutral"
              />
              <MetricCard
                label="Risk Controls"
                value="Target / SL"
                helper="Visible on each order"
                icon={<Shield size={21} />}
                tone="amber"
              />
            </Box>
          )}

          {currentPage === 'home' && renderOptionsPositions(false)}
          {currentPage === 'all-orders' && renderOptionsPositions(true)}
          {currentPage === 'futures' && renderFuturesPositions(false)}
          {currentPage === 'all-futures-orders' && renderFuturesPositions(true)}
          {currentPage === 'settings' && (
            <SettingsCard
              title="Options Webhook Settings"
              subtitle="Configure and send an options strategy trigger."
              form={webhookForm}
              loading={webhookLoading}
              submitLabel="Send Webhook"
              onSubmit={handleWebhookSubmit}
              onChange={handleWebhookFormChange}
              strategyOptions={['TEST_BOBBY', 'EMA_CROSS_20_200']}
            />
          )}
          {currentPage === 'futures-settings' && (
            <SettingsCard
              title="Futures Webhook Settings"
              subtitle="Configure and send a futures strategy trigger."
              form={futuresWebhookForm}
              loading={futuresWebhookLoading}
              submitLabel="Send Futures Webhook"
              onSubmit={handleFuturesWebhookSubmit}
              onChange={handleFuturesWebhookFormChange}
              strategyOptions={[
                'TEST_BOBBY',
                'EMA_CROSS_200',
                'EMA_CROSS_20_200',
                'EMA_CROSS_9_100',
                'EMA_CROSS_9_50',
                'SUPERTREND',
                'VWAP',
              ]}
            />
          )}
        </Box>

        <Snackbar
          open={toastOpen}
          autoHideDuration={3000}
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

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
