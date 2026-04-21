import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  IconButton, 
  CircularProgress,
  Stack,
  Chip,
  alpha,
  useTheme
} from '@mui/material';
import { Add as AddIcon, AutoAwesome as SparkleIcon } from '@mui/icons-material';
import api from '../../../config/api';

const RecommendationSection = ({ userId, currentPanier, onAdd }) => {
  const theme = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const primaryColor = theme.palette.primary.main;

  useEffect(() => {
    const fetchRecs = async () => {
      if (!userId && !currentPanier.length) return;
      
      setLoading(true);
      try {
        const id = userId || 'anonymous';
        const response = await api.get(`/ai/recommendations/${id}`);
        
        if (response.data.success) {
          const filtered = response.data.recommendations.filter(
            rec => !currentPanier.some(item => item.idMenu === rec.id)
          );
          setRecommendations(filtered);
        }
      } catch (error) {
        console.error("Erreur recs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecs();
  }, [userId, currentPanier.length]);

  if (loading) {
    return (
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={24} sx={{ color: primaryColor }} />
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary', fontWeight: 600 }}>
          Gourmi IQ analyse vos goûts...
        </Typography>
      </Box>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <Box sx={{ mt: 6, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box sx={{ 
          display: 'flex', p: 0.5, borderRadius: '8px', 
          bgcolor: alpha(primaryColor, 0.1), color: primaryColor 
        }}>
          <SparkleIcon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1 }}>
          Vous aimerez aussi
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} sx={{ 
        overflowX: 'auto', 
        pb: 2, 
        px: 0.5,
        '::-webkit-scrollbar': { display: 'none' } 
      }}>
        {recommendations.map((rec) => (
          <Card 
            key={rec.id} 
            sx={{ 
              minWidth: 180, 
              maxWidth: 180, 
              borderRadius: '24px',
              border: '1px solid rgba(0,0,0,0.03)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              position: 'relative',
              overflow: 'visible',
              bgcolor: 'white'
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }} noWrap>
                {rec.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ 
                display: '-webkit-box', 
                WebkitLineClamp: 2, 
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.2,
                height: 28,
                mb: 1.5,
                opacity: 0.7
              }}>
                {rec.reason}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 900, color: primaryColor }}>
                  {rec.price.toLocaleString()} <span style={{ fontSize: '0.6rem' }}>FCFA</span>
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => onAdd({ idMenu: rec.id, name: rec.name, price: rec.price })}
                  sx={{ 
                    bgcolor: primaryColor, 
                    color: 'white',
                    width: 32,
                    height: 32,
                    boxShadow: `0 4px 10px ${alpha(primaryColor, 0.3)}`,
                    '&:hover': { bgcolor: theme.palette.primary.dark },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
            
            {rec.confidence > 90 && (
              <Chip 
                label="Indispensable" 
                size="small" 
                sx={{ 
                  position: 'absolute', 
                  top: -10, 
                  left: 15, 
                  height: 20, 
                  fontSize: '0.6rem', 
                  fontWeight: 900,
                  bgcolor: '#D4AF37', // Or pour le prestige IQ
                  color: 'white',
                  boxShadow: '0 4px 8px rgba(212,175,55,0.3)'
                }} 
              />
            )}
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default RecommendationSection;
