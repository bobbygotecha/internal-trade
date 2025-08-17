import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Container,
  IconButton,
  Badge
} from '@mui/material';
import { 
  PieChart, 
  Eye, 
  Activity, 
  Bell, 
  User,
  TrendingUp
} from 'lucide-react';
import Portfolio from './components/Portfolio';
import Watchlist from './components/Watchlist';
import Positions from './components/Positions';

// Create a custom theme inspired by Zerodha
const theme = createTheme({
  palette: {
    primary: {
      main: '#387ed1',
      dark: '#2e6bb8',
    },
    secondary: {
      main: '#ff6d00',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <Portfolio />;
      case 1:
        return <Watchlist />;
      case 2:
        return <Positions />;
      default:
        return <Portfolio />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Top App Bar */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <TrendingUp size={28} color="white" />
              <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>
                TradeHub
              </Typography>
            </Box>
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <Bell size={24} />
              </Badge>
            </IconButton>
            <IconButton color="inherit" sx={{ ml: 1 }}>
              <User size={24} />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container 
          maxWidth="md" 
          sx={{ 
            flex: 1, 
            py: 0,
            px: { xs: 0, sm: 2 },
            bgcolor: 'background.default'
          }}
        >
          {renderContent()}
        </Container>

        {/* Bottom Navigation */}
        <Box sx={{ borderTop: '1px solid #e0e0e0', bgcolor: 'white' }}>
          <BottomNavigation
            value={activeTab}
            onChange={(event, newValue) => setActiveTab(newValue)}
            sx={{ height: 70 }}
          >
            <BottomNavigationAction
              label="Portfolio"
              icon={<PieChart size={24} />}
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
            <BottomNavigationAction
              label="Watchlist"
              icon={<Eye size={24} />}
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
            <BottomNavigationAction
              label="Positions"
              icon={<Activity size={24} />}
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main',
                },
              }}
            />
          </BottomNavigation>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
