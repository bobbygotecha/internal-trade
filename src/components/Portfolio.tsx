import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';
import { demoUserAccount, demoHoldings, marketIndices } from '../data/demoData';

const Portfolio: React.FC = () => {
  const { balance, totalInvestment, currentValue, totalPnl, totalPnlPercent, availableMargin } = demoUserAccount;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Market Indices */}
      <Card sx={{ mb: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Market Overview
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {marketIndices.map((index) => (
              <Box sx={{ flex: 1 }} key={index.name}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {index.name}
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    {formatNumber(index.value)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {index.change > 0 ? (
                      <TrendingUp size={14} color="#4caf50" />
                    ) : (
                      <TrendingDown size={14} color="#f44336" />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        color: index.change > 0 ? '#4caf50' : '#f44336',
                        ml: 0.5,
                        fontWeight: 'bold'
                      }}
                    >
                      {index.changePercent > 0 ? '+' : ''}{index.changePercent}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PieChart size={24} color="#1976d2" />
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
              Portfolio
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current Value
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {formatCurrency(currentValue)}
                </Typography>
              </Box>
            </Box>
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
                <Typography
                  variant="body2"
                  sx={{ color: totalPnl >= 0 ? '#4caf50' : '#f44336' }}
                >
                  ({totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(2)}%)
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Invested
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(totalInvestment)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Available
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(balance)}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Margin
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(availableMargin)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Holdings */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Wallet size={24} color="#1976d2" />
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
              Holdings ({demoHoldings.length})
            </Typography>
          </Box>
          
          {demoHoldings.map((holding) => (
            <Box
              key={holding.symbol}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2,
                borderBottom: '1px solid #e0e0e0',
                '&:last-child': { borderBottom: 'none' }
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {holding.symbol}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {holding.quantity} qty • Avg: ₹{holding.avgPrice.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(holding.value)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  {holding.pnl >= 0 ? (
                    <TrendingUp size={14} color="#4caf50" />
                  ) : (
                    <TrendingDown size={14} color="#f44336" />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: holding.pnl >= 0 ? '#4caf50' : '#f44336',
                      ml: 0.5,
                      fontWeight: 'bold'
                    }}
                  >
                    {holding.pnl >= 0 ? '+' : ''}{formatCurrency(holding.pnl)} ({holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%)
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Portfolio;