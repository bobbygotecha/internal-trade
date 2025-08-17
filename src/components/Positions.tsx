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
  Chip
} from '@mui/material';
import { TrendingUp, TrendingDown, Activity, X } from 'lucide-react';
import { demoPositions, Position } from '../data/demoData';

interface ExitPositionDialogProps {
  open: boolean;
  onClose: () => void;
  position: Position | null;
}

const ExitPositionDialog: React.FC<ExitPositionDialogProps> = ({ open, onClose, position }) => {
  const [exitQuantity, setExitQuantity] = useState<number>(position?.quantity || 0);

  const handleExit = () => {
    if (position) {
      const exitValue = exitQuantity * position.currentPrice;
      const pnlOnExit = (position.currentPrice - position.avgPrice) * exitQuantity;
      alert(`Position Exited!\n${position.symbol}: ${exitQuantity} qty at ₹${position.currentPrice}\nP&L: ₹${pnlOnExit.toFixed(2)}\nTotal Value: ₹${exitValue.toFixed(2)}`);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            Exit Position - {position?.symbol}
          </Typography>
          <Chip
            label={`₹${position?.currentPrice.toFixed(2)}`}
            color={position && position.pnl >= 0 ? 'success' : 'error'}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {position?.name}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Available Quantity
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {position?.quantity}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Avg Price
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                ₹{position?.avgPrice.toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Exit Quantity"
            type="number"
            value={exitQuantity}
            onChange={(e) => setExitQuantity(Number(e.target.value))}
            inputProps={{ min: 1, max: position?.quantity || 0 }}
          />
        </Box>
        
        <Box sx={{ mt: 2 }}>
          <Box sx={{ bgcolor: position && position.pnl >= 0 ? '#e8f5e8' : '#ffeaea', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Expected P&L on Exit
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: position && (position.currentPrice - position.avgPrice) * exitQuantity >= 0 ? '#4caf50' : '#f44336'
              }}
            >
              ₹{position ? ((position.currentPrice - position.avgPrice) * exitQuantity).toFixed(2) : '0.00'}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleExit}
          variant="contained"
          color="error"
          sx={{ minWidth: 100 }}
        >
          Exit Position
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Positions: React.FC = () => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleExitPosition = (position: Position) => {
    setSelectedPosition(position);
    setExitDialogOpen(true);
  };

  const totalPnl = demoPositions.reduce((sum, pos) => sum + pos.pnl, 0);

  return (
    <Box sx={{ p: 2 }}>
      {/* Positions Summary */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Activity size={24} color="#1976d2" />
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
              Positions ({demoPositions.length})
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total P&L
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 'bold',
                    color: totalPnl >= 0 ? '#4caf50' : '#f44336'
                  }}
                >
                  {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Active Positions
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {demoPositions.length}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Positions List */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Active Positions
          </Typography>
          
          {demoPositions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No active positions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your intraday positions will appear here
              </Typography>
            </Box>
          ) : (
            demoPositions.map((position) => (
              <Box
                key={position.symbol}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2,
                  borderBottom: '1px solid #e0e0e0',
                  '&:last-child': { borderBottom: 'none' }
                }}
              >
                {/* Position Info */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {position.symbol}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {position.quantity} qty • Avg: ₹{position.avgPrice.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    LTP: ₹{position.currentPrice.toFixed(2)}
                  </Typography>
                </Box>

                {/* P&L Info */}
                <Box sx={{ textAlign: 'center', mx: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                    {position.pnl >= 0 ? (
                      <TrendingUp size={16} color="#4caf50" />
                    ) : (
                      <TrendingDown size={16} color="#f44336" />
                    )}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: position.pnl >= 0 ? '#4caf50' : '#f44336',
                        ml: 0.5,
                        fontWeight: 'bold'
                      }}
                    >
                      {position.pnl >= 0 ? '+' : ''}{formatCurrency(position.pnl)}
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: position.pnl >= 0 ? '#4caf50' : '#f44336',
                      fontWeight: 'bold'
                    }}
                  >
                    ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                  </Typography>
                </Box>

                {/* Exit Button */}
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleExitPosition(position)}
                  startIcon={<X size={14} />}
                  sx={{ minWidth: 80 }}
                >
                  Exit
                </Button>
              </Box>
            ))
          )}
        </CardContent>
      </Card>

      <ExitPositionDialog
        open={exitDialogOpen}
        onClose={() => setExitDialogOpen(false)}
        position={selectedPosition}
      />
    </Box>
  );
};

export default Positions;