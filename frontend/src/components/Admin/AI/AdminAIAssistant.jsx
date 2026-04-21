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
  SupportAgent as SupportIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title as ChartTitle, Tooltip as ChartTooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import { sendAdminChatMessage } from '../../../services/aiService';
import api from '../../../config/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTitle, ChartTooltip, Legend, ArcElement);

const ChatChart = ({ type, data, options }) => {
  const containerStyle = { width: '100%', maxWidth: '400px', margin: '12px 0' };
  const muiOptions = { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#666', font: { size: 10 } } } }, ...options };
  return <Box sx={containerStyle}>{type === 'bar' ? <Bar data={data} options={muiOptions} /> : type === 'line' ? <Line data={data} options={muiOptions} /> : <Pie data={data} options={muiOptions} />}</Box>;
};

const extractAttribute = (attrs, name) => {
  const match = attrs.match(new RegExp(`${name}=['"]?([^'">\\s]+)['"]?`));
  return match ? match[1] : null;
};

const renderMessageContent = (content) => {
  const elements = [];
  const tagRegex = /<(CHART|EXPORT)([\s\S]*?)\/>/g;
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      elements.push(<ReactMarkdown key={`md-${lastIndex}`} remarkPlugins={[remarkGfm]}>{content.slice(lastIndex, match.index)}</ReactMarkdown>);
    }
    const tagName = match[1];
    const tagAttributes = match[2];

    if (tagName === 'CHART') {
      try {
        const chartType = extractAttribute(tagAttributes, 'type');
        const dataStr = extractAttribute(tagAttributes, 'data');
        if (chartType && dataStr) {
          let chartData;
          try { chartData = JSON.parse(dataStr.replace(/'/g, '"')); } catch { chartData = null; }
          elements.push(
            <Box key={`chart-${match.index}`} sx={{ my: 2, p: 2, bgcolor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,143,0,0.2)', borderRadius: 2 }}>
              <Typography variant="caption" sx={{ color: primaryOchre, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                Visualisation · {chartType}
              </Typography>
              {chartData ? <ChatChart type={chartType} data={chartData} /> : <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>Données graphiques non valides.</Typography>}
            </Box>
          );
        }
      } catch(e) { console.warn('CHART parse error:', e); }
    } else if (tagName === 'EXPORT') {
      const typeAttr = extractAttribute(tagAttributes, 'type');
      if (typeAttr) {
        const reportType = typeAttr.replace(/_/g, ' ');
        elements.push(
          <Box key={`export-${match.index}`} sx={{ my: 2, p: 2, background: 'linear-gradient(135deg, rgba(255,143,0,0.12) 0%, rgba(191,54,12,0.08) 100%)', border: '1px solid rgba(255,143,0,0.25)', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <PdfIcon sx={{ fontSize: '1.5rem', color: primaryOchre }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 700 }}>Rapport : {reportType}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Cliquez pour télécharger</Typography>
            </Box>
            <Button variant="contained" size="small" onClick={() => { const doc = new jsPDF(); doc.text(content.replace(/<[^>]+>/g, ''), 10, 20); doc.save(`${reportType}_${Date.now()}.pdf`); }} sx={{ bgcolor: primaryOchre, '&:hover': { bgcolor: darkOchre } }}>PDF</Button>
          </Box>
        );
      }
    }
    lastIndex = tagRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    elements.push(<ReactMarkdown key={`md-${lastIndex}`} remarkPlugins={[remarkGfm]}>{content.slice(lastIndex)}</ReactMarkdown>);
  }

  return elements.length > 0 ? elements : <ReactMarkdown>{content}</ReactMarkdown>;
};

const AdminAIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const theme = useTheme();

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
                    <Box sx={{ 
                        lineHeight: 1.7, 
                        fontSize: '0.95rem', 
                        fontWeight: msg.role === 'Assistant' ? 500 : 400,
                        fontFamily: msg.content.includes('<SQL>') ? 'Consolas, monospace' : 'inherit',
                      }}>
                      {renderMessageContent(msg.content)}
                    </Box>
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
          .markdown-content table { width: 100%; border-collapse: collapse; margin: 12px 0; }
          .markdown-content th, .markdown-content td { border: 1px solid rgba(255,143,0,0.2); padding: 8px 12px; text-align: left; }
          .markdown-content th { background: rgba(255,143,0,0.1); color: #FF8F00; }
          .markdown-content h1 { color: #FF8F00; font-size: 1.2rem; font-weight: 900; margin: 16px 0 8px; border-bottom: 1px solid rgba(255,143,0,0.2); }
          .markdown-content h2 { color: #FFB74D; font-size: 1rem; fontWeight: 700; margin: 14px 0 6px; }
          .markdown-content h3 { color: #FFCC80; font-size: 0.9rem; fontWeight: 600; margin: 12px 0 4px; }
          .markdown-content p { marginBottom: 8px; line-height: 1.6; color: inherit; }
          .markdown-content ul, .markdown-content ol { padding-left: 20px; marginBottom: 8px; }
          .markdown-content li { marginBottom: 4px; }
          .markdown-content code { background: rgba(0,0,0,0.3); padding: 2px 6px; borderRadius: 4px; font-family: Consolas, monospace; }
          .markdown-content pre { background: rgba(0,0,0,0.3); padding: 12px; borderRadius: 8px; overflow-x: auto; }
          .markdown-content pre code { background: none; padding: 0; }
          .markdown-content strong { color: #FF8F00; fontWeight: 700; }
          .markdown-content blockquote { border-left: 3px solid #FF8F00; padding-left: 12px; margin: 12px 0; color: rgba(255,255,255,0.7); font-style: italic; }
        `}</style>
      </Drawer>
    </>
  );
};

export default AdminAIAssistant;
