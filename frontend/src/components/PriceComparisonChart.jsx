import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  LabelList
} from 'recharts';

/**
 * Component voor het vergelijken van prijsstrategieën van concurrenten
 * @param {object} props - Component properties
 * @param {array} props.competitors - Array van concurrenten met prijsgegevens
 * @param {string} props.projectName - Naam van het eigen project
 * @returns {JSX.Element} PriceComparisonChart component
 */
const PriceComparisonChart = ({ competitors, projectName = 'Uw bedrijf' }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceData, setPriceData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [averagePrice, setAveragePrice] = useState(0);

  // Bereid gegevens voor bij wijzigingen in concurrenten of geselecteerde categorie
  useEffect(() => {
    if (!competitors || competitors.length === 0) return;
    
    // Extraheer alle unieke productcategorieën
    const allCategories = new Set();
    competitors.forEach(competitor => {
      if (competitor.pricing && competitor.pricing.products) {
        competitor.pricing.products.forEach(product => {
          if (product.category) {
            allCategories.add(product.category);
          }
        });
      }
    });
    
    setCategories(Array.from(allCategories));
    
    // Bereid prijsgegevens voor op basis van geselecteerde categorie
    prepareChartData();
  }, [competitors, selectedCategory]);

  // Bereid gegevens voor voor de grafiek
  const prepareChartData = () => {
    if (!competitors || competitors.length === 0) return;
    
    // Verzamel alle producten in de geselecteerde categorie
    let relevantProducts = [];
    
    competitors.forEach(competitor => {
      if (competitor.pricing && competitor.pricing.products) {
        const products = competitor.pricing.products.filter(product => 
          selectedCategory === 'all' || product.category === selectedCategory
        );
        
        products.forEach(product => {
          relevantProducts.push({
            competitor: competitor.name,
            ...product
          });
        });
      }
    });
    
    // Bereken gemiddelde prijs
    const totalPrice = relevantProducts.reduce((sum, product) => sum + product.price, 0);
    const newAveragePrice = relevantProducts.length > 0 ? totalPrice / relevantProducts.length : 0;
    setAveragePrice(newAveragePrice);
    
    // Groepeer producten per concurrent voor de grafiek
    const competitorPrices = {};
    
    // Initialiseer met alle concurrenten
    competitors.forEach(competitor => {
      competitorPrices[competitor.name] = {
        name: competitor.name,
        avgPrice: 0,
        totalProducts: 0,
        lowestPrice: Number.MAX_VALUE,
        highestPrice: 0
      };
    });
    
    // Voeg eigen bedrijf toe
    competitorPrices[projectName] = {
      name: projectName,
      avgPrice: 0,
      totalProducts: 0,
      lowestPrice: Number.MAX_VALUE,
      highestPrice: 0
    };
    
    // Vul prijsgegevens in
    relevantProducts.forEach(product => {
      const competitor = competitorPrices[product.competitor];
      
      if (competitor) {
        competitor.avgPrice += product.price;
        competitor.totalProducts += 1;
        competitor.lowestPrice = Math.min(competitor.lowestPrice, product.price);
        competitor.highestPrice = Math.max(competitor.highestPrice, product.price);
      }
    });
    
    // Bereken gemiddelden en verwijder ongeldige waarden
    Object.keys(competitorPrices).forEach(name => {
      const competitor = competitorPrices[name];
      
      if (competitor.totalProducts > 0) {
        competitor.avgPrice = competitor.avgPrice / competitor.totalProducts;
      } else {
        competitor.avgPrice = 0;
        competitor.lowestPrice = 0;
      }
      
      if (competitor.lowestPrice === Number.MAX_VALUE) {
        competitor.lowestPrice = 0;
      }
    });
    
    // Converteer naar array voor Recharts
    const chartData = Object.values(competitorPrices)
      .filter(competitor => competitor.totalProducts > 0 || competitor.name === projectName);
    
    // Voeg marktgemiddelde toe
    chartData.push({
      name: 'Marktgemiddelde',
      avgPrice: newAveragePrice,
      isAverage: true
    });
    
    setPriceData(chartData);
  };

  // Genereer gesimuleerde prijsgegevens voor demo doeleinden
  const generateDemoData = () => {
    if (!competitors || competitors.length === 0) return;
    
    // Voeg gesimuleerde prijsgegevens toe aan concurrenten
    const competitorsWithPricing = competitors.map(competitor => {
      if (!competitor.pricing) {
        // Genereer willekeurige prijsgegevens
        const products = [];
        const categories = ['Basis', 'Premium', 'Enterprise'];
        
        categories.forEach(category => {
          // Basis prijs tussen 10 en 100
          const basePrice = Math.floor(Math.random() * 90) + 10;
          
          products.push({
            name: `${category} Plan`,
            category,
            price: category === 'Basis' ? basePrice : 
                   category === 'Premium' ? basePrice * 2 : basePrice * 4,
            features: [`${category} functionaliteit`, '24/7 support']
          });
        });
        
        return {
          ...competitor,
          pricing: {
            strategy: ['value-based', 'competitive', 'premium'][Math.floor(Math.random() * 3)],
            products
          }
        };
      }
      
      return competitor;
    });
    
    return competitorsWithPricing;
  };

  // Als er geen prijsgegevens zijn, genereer demo data
  const competitorsWithPricing = competitors.some(c => c.pricing) ? 
    competitors : generateDemoData();

  // Handler voor categorie wijziging
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  if (!competitorsWithPricing || competitorsWithPricing.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Geen concurrenten beschikbaar voor prijsvergelijking
        </Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Prijsvergelijking
          <Tooltip title="Vergelijking van prijsstrategieën tussen concurrenten">
            <IconButton size="small">
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Typography>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Productcategorie</InputLabel>
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            label="Productcategorie"
          >
            <MenuItem value="all">Alle categorieën</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={70}
                  interval={0}
                />
                <YAxis 
                  label={{ 
                    value: 'Gemiddelde prijs (€)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }} 
                />
                <RechartsTooltip 
                  formatter={(value, name) => [`€${value.toFixed(2)}`, name]}
                  labelFormatter={(value) => `Concurrent: ${value}`}
                />
                <Legend />
                <Bar 
                  dataKey="avgPrice" 
                  name="Gemiddelde prijs" 
                  fill={(entry) => {
                    if (entry.name === projectName) return '#8884d8';
                    if (entry.isAverage) return '#ffc658';
                    return '#82ca9d';
                  }}
                >
                  <LabelList 
                    dataKey="avgPrice" 
                    position="top" 
                    formatter={(value) => `€${value.toFixed(2)}`}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Prijsanalyse
          </Typography>
          
          <Grid container spacing={2}>
            {priceData
              .filter(item => !item.isAverage)
              .map((competitor) => (
                <Grid item xs={12} sm={6} md={4} key={competitor.name}>
                  <Paper 
                    sx={{ 
                      p: 2, 
                      bgcolor: competitor.name === projectName ? 'primary.light' : 'background.paper',
                      color: competitor.name === projectName ? 'primary.contrastText' : 'text.primary'
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {competitor.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        Gem. prijs: €{competitor.avgPrice.toFixed(2)}
                      </Typography>
                      
                      {competitor.avgPrice > averagePrice ? (
                        <TrendingUpIcon color="error" fontSize="small" />
                      ) : (
                        <TrendingDownIcon color="success" fontSize="small" />
                      )}
                    </Box>
                    
                    {competitor.lowestPrice > 0 && (
                      <Typography variant="body2">
                        Prijsbereik: €{competitor.lowestPrice.toFixed(2)} - €{competitor.highestPrice.toFixed(2)}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" color="text.secondary">
                      {competitor.totalProducts} producten
                    </Typography>
                  </Paper>
                </Grid>
              ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PriceComparisonChart;
