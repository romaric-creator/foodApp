import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Drawer,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  alpha,
  useTheme,
  Tooltip,
  Button,
  Divider,
  Stack,
  Chip,
  Grid
} from '@mui/material';
import {
  AutoAwesome as AgentIcon,
  Send as SendIcon,
  Close as CloseIcon,
  DeleteOutline as ClearIcon,
  QueryStats as StatsIcon,
  Lightbulb as IdeaIcon,
  BusinessCenter as BusinessIcon,
  SupportAgent as SupportIcon
} from '@mui/icons-material';
import { sendAdminChatMessage } from '../../../services/aiService';
import api from '../../../config/api';

const AdminAIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();

  // Thème Premium Ocre / Noir Profond
  const primaryOchre = '#FF8F00';
  const darkOchre = '#BF360C';

  useEffect(() => {
    if (open) fetchHistory();
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const fetchHistory = async () => {
    setFetchingHistory(true);
    try {
      const response = await api.get('/ai/chat/history');
      if (response.data && response.data.length > 0) {
        setChatHistory(response.data);
      } else {
        setChatHistory([
          { role: 'Assistant', content: "Bonjour. Je suis votre GOURMI AGENT PREMIUM. Je suis prêt à analyser vos opérations, optimiser vos revenus ou vous assister dans la gestion de l'application. Que souhaiteriez-vous accomplir aujourd'hui ?" }
        ]);
      }
    } catch (error) {
      console.error('History fetch failed:', error);
    } finally {
      setFetchingHistory(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (forcedMessage = null) => {
    const textToSend = forcedMessage || message;
    if (!textToSend.trim() || loading) return;

    if (!forcedMessage) setMessage('');
    setChatHistory(prev => [...prev, { role: 'User', content: textToSend }]);
    setLoading(true);

    try {
      const response = await sendAdminChatMessage(textToSend, chatHistory);
      setChatHistory(prev => [...prev, { role: 'Assistant', content: response.message }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'Assistant', content: "Une erreur de communication est survenue avec mon noyau de traitement." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (window.confirm("Réinitialiser l'intelligence de l'agent pour cette session ?")) {
      try {
        await api.delete('/ai/chat/history');
        setChatHistory([{ role: 'Assistant', content: "Mémoire réinitialisée. En attente d'instructions stratégiques." }]);
      } catch (error) {
        console.error('Clear failed:', error);
      }
    }
  };

  const agentSkills = [
    { label: 'Audit Ventes', icon: <StatsIcon />, cmd: 'Réalise un audit complet de mes ventes et identifie les points faibles.' },
    { label: 'Conseil Menu', icon: <IdeaIcon />, cmd: 'Quels changements suggères-tu sur mon menu pour augmenter les profits ?' },
    { label: 'Aide App', icon: <SupportIcon />, cmd: 'Explique-moi comment configurer un nouveau thème ou gérer les tables.' },
    { label: 'Stratégie', icon: <BusinessIcon />, cmd: 'Génère un plan d action pour booster la fidélisation client.' },
  ];

  return (
    <>
      <Fab
        onClick={() => setOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 2000,
          width: 70,
          height: 70,
          background: `linear-gradient(135deg, ${primaryOchre} 0%, ${darkOchre} 100%)`,
          boxShadow: `0 12px 40px ${alpha(primaryOchre, 0.5)}`,
          color: 'white',
          border: '2px solid rgba(255,255,255,0.2)',
          '&:hover': {
            transform: 'scale(1.1) rotate(-5deg)',
            boxShadow: `0 15px 50px ${alpha(primaryOchre, 0.7)}`,
          }
        }}
      >
        <AgentIcon sx={{ fontSize: 38 }} />
      </Fab>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        variant="temporary"
        PaperProps={{
          sx: {
            width: { xs: '100vw', sm: 520 },
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#0A0A0A',
            color: '#FFFFFF',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
            borderLeft: `2px solid ${primaryOchre}`,
          }
        }}
      >
        {/* Header */}
        <Box sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(180deg, ${alpha(darkOchre, 0.4)} 0%, rgba(0,0,0,0.4) 100%)`,
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Box sx={{ position: 'relative' }}>
              <Avatar sx={{ 
                width: 55, height: 55, 
                background: `linear-gradient(45deg, ${primaryOchre}, ${darkOchre})`,
                boxShadow: `0 0 20px ${alpha(primaryOchre, 0.4)}`,
              }}>
                <AgentIcon fontSize="large" />
              </Avatar>
              <Box sx={{ 
                position: 'absolute', bottom: 2, right: 2, 
                width: 14, height: 14, bgcolor: '#00E676', 
                borderRadius: '50%', border: '2px solid #0A0A0A',
                boxShadow: '0 0 10px #00E676'
              }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                Gourmi Agent <Box component="span" sx={{ color: primaryOchre }}>Premium</Box>
              </Typography>
              <Chip 
                label="MOTEUR COHERE R-08" 
                size="small" 
                sx={{ 
                  height: 18, fontSize: '0.6rem', fontWeight: 900, 
                  bgcolor: alpha(primaryOchre, 0.1), color: primaryOchre,
                  border: `1px solid ${alpha(primaryOchre, 0.3)}`
                }} 
              />
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={clearHistory} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: primaryOchre, bgcolor: 'rgba(255,255,255,0.05)' } }}>
              <ClearIcon />
            </IconButton>
            <IconButton onClick={() => setOpen(false)} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#FF5252', bgcolor: 'rgba(255,255,255,0.05)' } }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Skills Selector */}
        <Box sx={{ p: 2.5, bgcolor: '#111', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Grid container spacing={1.5}>
            {agentSkills.map((s, i) => (
              <Grid item xs={6} key={i}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={s.icon}
                  onClick={() => handleSend(s.cmd)}
                  sx={{
                    justifyContent: 'flex-start',
                    bgcolor: alpha(primaryOchre, i === 0 ? 0.2 : 0.05),
                    color: i === 0 ? primaryOchre : 'rgba(255,255,255,0.7)',
                    border: `1px solid ${i === 0 ? primaryOchre : 'rgba(255,255,255,0.1)'}`,
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    fontWeight: i === 0 ? 800 : 500,
                    '&:hover': { bgcolor: primaryOchre, color: 'white' }
                  }}
                >
                  {s.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Chat Body */}
        <Box sx={{
          flexGrow: 1,
          p: 3,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          bgcolor: '#080808',
          '&::-webkit-scrollbar': { width: 5 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,143,0,0.2)', borderRadius: 10 },
        }}>
          {fetchingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress color="warning" size={30} /></Box>
          ) : (
            chatHistory.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  alignSelf: msg.role === 'User' ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                  display: 'flex',
                  gap: 2,
                  flexDirection: msg.role === 'User' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar sx={{ 
                  width: 38, height: 38, 
                  bgcolor: msg.role === 'User' ? '#333' : primaryOchre,
                  boxShadow: msg.role === 'Assistant' ? `0 0 15px ${alpha(primaryOchre, 0.3)}` : 'none'
                }}>
                  {msg.role === 'User' ? 'AD' : <AgentIcon sx={{ fontSize: 20 }} />}
                </Avatar>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'User' ? 'flex-end' : 'flex-start' }}>
                  <Paper
                    sx={{
                      p: 2.5,
                      borderRadius: msg.role === 'User' ? '24px 4px 24px 24px' : '4px 24px 24px 24px',
                      bgcolor: msg.role === 'User' ? '#222' : '#F5F5F5',
                      color: msg.role === 'User' ? '#FFFFFF' : '#000000',
                      boxShadow: msg.role === 'Assistant' ? `0 10px 30px rgba(0,0,0,0.5)` : 'none',
                      border: msg.role === 'User' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        lineHeight: 1.7, 
                        fontSize: '0.95rem', 
                        fontWeight: msg.role === 'Assistant' ? 500 : 400,
                        fontFamily: msg.content.includes('SELECT') ? 'Consolas, monospace' : 'inherit',
                      }}
                    >
                      {msg.content}
                    </Typography>
                  </Paper>
                  <Typography variant="caption" sx={{ mt: 1, opacity: 0.5, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 700 }}>
                    {msg.role === 'Assistant' ? 'Intelligence' : 'Admin'}
                  </Typography>
                </Box>
              </Box>
            ))
          )}
          {loading && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar sx={{ width: 38, height: 38, bgcolor: primaryOchre }}><AgentIcon sx={{ fontSize: 20 }} /></Avatar>
              <Box sx={{ p: 2, bgcolor: '#F5F5F5', borderRadius: '4px 24px 24px 24px', display: 'flex', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, bgcolor: primaryOchre, borderRadius: '50%', animation: 'dotPulse 1.5s infinite pulse' }} />
                <Box sx={{ width: 8, height: 8, bgcolor: primaryOchre, borderRadius: '50%', animation: 'dotPulse 1.5s infinite pulse', animationDelay: '0.2s' }} />
                <Box sx={{ width: 8, height: 8, bgcolor: primaryOchre, borderRadius: '50%', animation: 'dotPulse 1.5s infinite pulse', animationDelay: '0.4s' }} />
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Footer */}
        <Box sx={{ p: 3, bgcolor: '#111', borderTop: '2px solid rgba(255,255,255,0.05)' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              multiline
              maxRows={6}
              placeholder="Envoyer une commande..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: '#1A1A1A',
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                  '&:hover fieldset': { borderColor: primaryOchre },
                  '&.Mui-focused fieldset': { borderColor: primaryOchre },
                }
              }}
            />
            <IconButton
              disabled={!message.trim() || loading}
              onClick={() => handleSend()}
              sx={{
                width: 55, height: 55,
                bgcolor: primaryOchre,
                color: 'white',
                '&:hover': { bgcolor: darkOchre },
                '&:disabled': { bgcolor: '#222', color: '#444' }
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>

        <style>{`
          @keyframes dotPulse {
            0%, 100% { transform: scale(0.6); opacity: 0.3; }
            50% { transform: scale(1.1); opacity: 1; }
          }
        `}</style>
      </Drawer>
    </>
  );
};

export default AdminAIAssistant;
