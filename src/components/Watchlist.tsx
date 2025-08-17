import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton
} from '@mui/material';
import { TrendingUp, TrendingDown, Eye, ShoppingCart, DollarSign, Plus } from 'lucide-react';
import { demoStocks, Stock } from '../data/demoData';

interface TradeDialogProps {
  open: boolean;
  onClose: () => void;
  stock: Stock | null;
  tradeType: 'BUY' | 'SELL';
}

const TradeDialog: React.FC<TradeDialogProps> = ({ open, onClose, stock, tradeType }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [orderType, setOrderType] = useState<string>('MARKET');
  const [price, setPrice] = useState<number>(stock?.price || 0);

  const handleTrade = () => {
    if (stock) {
      const totalAmount = quantity * (orderType === 'MARKET' ? stock.price : price);
      alert(`${tradeType} Order Placed!\n${stock.symbol}: ${quantity} qty at ₹${orderType === 'MARKET' ? stock.price : price}\nTotal: ₹${totalAmount.toFixed(2)}`);
      onClose();
      setQuantity(1);
      setOrderType('MARKET');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {tradeType} {stock?.symbol}
          </Typography>
          <Chip
            label={`₹${stock?.price.toFixed(2)}`}
            color={stock && stock.change >= 0 ? 'success' : 'error'}
            size="small"
          />
        </Box>
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
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <FormControl fullWidth>
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
        
        {orderType === 'LIMIT' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              inputProps={{ step: 0.01 }}
            />
          </Box>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              ₹{(quantity * (orderType === 'MARKET' ? (stock?.price || 0) : price)).toFixed(2)}
            </Typography>
          </Box>
        </Box>
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
        >
          {tradeType}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Watchlist: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  const formatNumber = (num: number) => {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(1) + 'Cr';
    } else if (num >= 100000) {
      return (num / 100000).toFixed(1) + 'L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleTrade = (stock: Stock, type: 'BUY' | 'SELL') => {
    setSelectedStock(stock);
    setTradeType(type);
    setTradeDialogOpen(true);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Eye size={24} color="#1976d2" />
              <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                Watchlist
              </Typography>
            </Box>
            <IconButton color="primary">
              <Plus size={20} />
            </IconButton>
          </Box>

          {demoStocks.map((stock) => (
            <Box
              key={stock.symbol}
              sx={{
                display: 'flex',
                alignItems: 'center',
                py: 2,
                borderBottom: '1px solid #e0e0e0',
                '&:last-child': { borderBottom: 'none' }
              }}
            >
              {/* Stock Info */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {stock.symbol}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                  {stock.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Chip
                    label={stock.sector}
                    size="small"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    Vol: {formatNumber(stock.volume)}
                  </Typography>
                </Box>
              </Box>

              {/* Price Info */}
              <Box sx={{ textAlign: 'center', mx: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  ₹{stock.price.toFixed(2)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {stock.change >= 0 ? (
                    <TrendingUp size={14} color="#4caf50" />
                  ) : (
                    <TrendingDown size={14} color="#f44336" />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: stock.change >= 0 ? '#4caf50' : '#f44336',
                      ml: 0.5,
                      fontWeight: 'bold',
                      fontSize: '0.75rem'
                    }}
                  >
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: stock.change >= 0 ? '#4caf50' : '#f44336',
                    fontWeight: 'bold'
                  }}
                >
                  ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleTrade(stock, 'BUY')}
                  sx={{ minWidth: 60, fontSize: '0.75rem', py: 0.5 }}
                  startIcon={<ShoppingCart size={14} />}
                >
                  BUY
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleTrade(stock, 'SELL')}
                  sx={{ minWidth: 60, fontSize: '0.75rem', py: 0.5 }}
                  startIcon={<DollarSign size={14} />}
                >
                  SELL
                </Button>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>

      <TradeDialog
        open={tradeDialogOpen}
        onClose={() => setTradeDialogOpen(false)}
        stock={selectedStock}
        tradeType={tradeType}
      />
    </Box>
  );
};

export default Watchlist;