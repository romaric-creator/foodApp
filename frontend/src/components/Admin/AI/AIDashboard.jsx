import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Chip,
  Grid,
  Divider,
  Button,
  useTheme,
  Stack,
  Tooltip,
  Container,
  Paper,
  Alert,
  Snackbar,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Drawer,
  useMediaQuery,
  GlobalStyles
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as AIIcon,
  Timeline as GrowthIcon,
  QueryStats as StatsIcon,
  TipsAndUpdates as StrategyIcon,
  AutoAwesome as SparkleIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as SuccessIcon,
  Storage as DbIcon,
  Analytics as AnalyticsIcon,
  ListAlt as ReportIcon,
  Bolt as ActionIcon,
  TrendingUp as PredictionIcon,
  Add as AddIcon,
  ChatBubbleOutline as ChatIcon,
  Menu as MenuToggleButton,
  DeleteOutline as DeleteIcon,
  Tune as ToolsIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import api from '../../../config/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ChartTitle, ChartTooltip, Legend, ArcElement);

const ChatChart = ({ type, data, options }) => {
  const containerStyle = { width: '100%', maxWidth: '500px', margin: '16px 0' };
  const muiOptions = { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#666', font: { size: 10 } } } }, ...options };
  return <Box sx={containerStyle}>{type === 'bar' ? <Bar data={data} options={muiOptions} /> : type === 'line' ? <Line data={data} options={muiOptions} /> : <Pie data={data} options={muiOptions} />}</Box>;
};

const AIDashboard = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'Assistant', content: "# Bienvenue dans l'Audit Premium Gourmi IQ\nJe suis GOURMI AGENT, votre copilote stratégique. Interrogez-moi pour transformer votre restaurant." }
  ]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [notif, setNotif] = useState({ open: false, msg: '', severity: 'success' });
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState('session_' + Date.now());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); // 0=idle 1=planning 2=executing 3=reporting
  const [lastPipelineMeta, setLastPipelineMeta] = useState(null);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory, loading]);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/ai/chat/sessions');
      setSessions(response.data);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { fetchSessions(); }, []);

  const fetchHistory = async (sid) => {
    setFetchingHistory(true);
    setCurrentSessionId(sid);
    try {
      const response = await api.get(`/ai/chat/history/${sid}`);
      if (response.data.length > 0) {
        setChatHistory(response.data.map(h => ({
          role: h.role === 'USER' ? 'User' : 'Assistant',
          content: h.content
        })));
      }
    } catch (error) { console.error(error); }
    finally { setFetchingHistory(false); setSidebarOpen(false); }
  };

  const createNewChat = () => {
    const newId = `session_${Date.now()}`;
    setCurrentSessionId(newId);
    setChatHistory([{ role: 'Assistant', content: "Nouvelle discussion démarrée. Prêt pour l'audit." }]);
    setSidebarOpen(false);
  };

  const deleteSession = async (sid, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/ai/chat/history/${sid}`);
      setSessions(prev => prev.filter(s => s.sessionId !== sid));
      if (currentSessionId === sid) createNewChat();
      setNotif({ open: true, msg: "Discussion supprimée", severity: "info" });
    } catch (e) { console.error(e); }
  };

  const [activeTools, setActiveTools] = useState({ sql: true, actions: true, predictions: true, charts: true, pdf: true });
  const [anchorEl, setAnchorEl] = useState(null);

  const exportToPDF = (content, fileName = "Rapport_Gourmi") => {
    if (!content) return;
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('fr-FR');
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("GOURMI IQ - AUDIT PREMIUM", 20, 25);
    doc.setFontSize(10);
    doc.text(`Rapport stratégique généré le ${date}`, 20, 33);
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    const cleanContent = content.replace(/###\s/g, '\n\n--- ').replace(/##\s/g, '\n\n### ').replace(/[*_`]/g, '');
    const splitText = doc.splitTextToSize(cleanContent, 170);
    let y = 50;
    splitText.forEach(line => {
      if (y > 275) { doc.addPage(); y = 20; }
      if (line.includes('|')) { doc.setFont("courier", "normal"); doc.setTextColor(100, 100, 100); }
      else if (line.startsWith('--- ')) { doc.setFont("helvetica", "bold"); doc.setTextColor(99, 102, 241); }
      else { doc.setFont("helvetica", "normal"); doc.setTextColor(40, 40, 40); }
      doc.text(line, 20, y);
      y += line.includes('|') ? 6 : 7;
    });
    doc.save(`${fileName}_${Date.now()}.pdf`);
  };

  const handleSend = async (forcedMessage = null) => {
    const textToSend = forcedMessage || message;
    if (!textToSend.trim() || loading) return;
    if (!forcedMessage) setMessage('');
    setChatHistory(prev => [...prev, { role: 'User', content: textToSend }]);
    setLoading(true);
    setLastPipelineMeta(null);

    // On anticipe si c'est analytique pour afficher les étapes
    const isLikelyAnalytical = textToSend.length > 20;
    if (isLikelyAnalytical) {
      setPipelineStep(1);
      const stepTimer1 = setTimeout(() => setPipelineStep(2), 2500);
      const stepTimer2 = setTimeout(() => setPipelineStep(3), 5000);

      try {
        const title = textToSend.substring(0, 30);
        const response = await api.post('/ai/chat/admin/chat', {
          message: textToSend, history: chatHistory, sessionId: currentSessionId, sessionTitle: title
        });
        clearTimeout(stepTimer1); clearTimeout(stepTimer2);
        if (response.data.pipeline) setLastPipelineMeta(response.data.pipeline);
        setChatHistory(prev => [...prev, { role: 'Assistant', content: response.data.message, pipeline: response.data.pipeline }]);
        fetchSessions();
      } catch (error) {
        setPipelineStep(0);
        setChatHistory(prev => [...prev, { role: 'Assistant', content: "Erreur technique. Vérifiez la connexion au service IA." }]);
      } finally {
        setLoading(false);
        setPipelineStep(0);
      }
    } else {
      // Court → pas d'animation pipeline
      try {
        const title = textToSend.substring(0, 30);
        const response = await api.post('/ai/chat/admin/chat', {
          message: textToSend, history: chatHistory, sessionId: currentSessionId, sessionTitle: title
        });
        if (response.data.pipeline) setLastPipelineMeta(response.data.pipeline);
        setChatHistory(prev => [...prev, { role: 'Assistant', content: response.data.message, pipeline: response.data.pipeline }]);
        fetchSessions();
      } catch (error) {
        setChatHistory(prev => [...prev, { role: 'Assistant', content: "Désolé, une erreur est survenue." }]);
      } finally {
        setLoading(false);
        setPipelineStep(0);
      }
    }
  };


  const parseContent = (content) => {
    if (!content) return null;

    // 1. Supprimer les balises <SQL>...</SQL> de l'affichage (usage interne uniquement)
    let displayContent = content.replace(/<SQL>[\s\S]*?<\/SQL>/g, '').trim();

    const elements = [];
    // Regex pour les balises auto-fermantes CHART, EXPORT, ACTION (avec tolérance guillemets simples/doubles)
    const tagRegex = /<(CHART|EXPORT|ACTION)[^>]*\/>/g;
    let match, currentPos = 0;

    while ((match = tagRegex.exec(displayContent)) !== null) {
      // Texte Markdown avant le tag
      if (match.index > currentPos) {
        const textChunk = displayContent.substring(currentPos, match.index).trim();
        if (textChunk) {
          elements.push(
            <ReactMarkdown key={`md-${match.index}`} remarkPlugins={[remarkGfm]}>
              {textChunk}
            </ReactMarkdown>
          );
        }
      }

      const tag = match[0];

      // ── CHART ──────────────────────────────────────────────────
      if (tag.startsWith('<CHART')) {
        try {
          const typeMatch = tag.match(/type=["'](.*?)["']/);
          const dataMatch = tag.match(/data=['"](\{[\s\S]*?\})["']/);
          if (typeMatch && dataMatch) {
            const chartType = typeMatch[1];
            // Parser JSON robuste (gère les guillemets simples)
            const dataStr = dataMatch[1]
              .replace(/'/g, '"')
              .replace(/(\w+):/g, '"$1":'); // tentative de fix clé sans guillemets

            let chartData;
            try { chartData = JSON.parse(dataStr); } catch { chartData = null; }

            elements.push(
              <Box key={`chart-${match.index}`} sx={{
                my: 3, p: 2.5,
                bgcolor: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 3,
                backdropFilter: 'blur(10px)',
                animation: 'fadeIn 0.4s ease'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Box sx={{ width: 3, height: 16, bgcolor: '#818cf8', borderRadius: 2 }} />
                  <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                    Visualisation · {chartType.toUpperCase()}
                  </Typography>
                </Box>
                {chartData
                  ? <ChatChart type={chartType} data={chartData} />
                  : <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>
                      Données graphique non parsées.
                    </Typography>
                }
              </Box>
            );
          }
        } catch(e) { console.warn('CHART parse error:', e); }

      // ── EXPORT (Téléchargement PDF) ─────────────────────────────
      } else if (tag.startsWith('<EXPORT')) {
        try {
          const typeMatch = tag.match(/type=["'](.*?)["']/);
          const dataMatch = tag.match(/data=['"](\{.*?\})["']/);
          if (typeMatch) {
            const reportType = typeMatch[1].replace(/_/g, ' ');
            let exportContent = '';
            if (dataMatch) {
              try { exportContent = JSON.parse(dataMatch[1].replace(/'/g, '"')).content || ''; } catch {}
            }
            elements.push(
              <Box key={`export-${match.index}`} sx={{
                my: 2.5, p: 2.5,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(192,132,252,0.08) 100%)',
                border: '1px solid rgba(99,102,241,0.25)',
                borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2,
                animation: 'fadeIn 0.3s ease'
              }}>
                <Box sx={{ fontSize: '2rem' }}>📄</Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: '#e2e8f0', fontWeight: 700 }}>
                    Rapport : {reportType}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    Cliquez pour télécharger l'audit complet en PDF
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PdfIcon />}
                  onClick={() => exportToPDF(exportContent || content, reportType)}
                  sx={{ borderRadius: 8, textTransform: 'none', fontWeight: 700, whitespace: 'nowrap',
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 15px rgba(99,102,241,0.3)'
                  }}
                >
                  PDF
                </Button>
              </Box>
            );
          }
        } catch(e) { console.warn('EXPORT parse error:', e); }

      // ── ACTION (Bouton SQL) ─────────────────────────────────────
      } else if (tag.startsWith('<ACTION')) {
        const sqlMatch = tag.match(/sql=["'](.*?)["']/);
        const labelMatch = tag.match(/label=["'](.*?)["']/);
        if (sqlMatch && labelMatch) {
          elements.push(
            <Box key={`action-${match.index}`} sx={{
              my: 2, p: 2,
              bgcolor: 'rgba(251,191,36,0.05)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2,
              animation: 'fadeIn 0.3s ease'
            }}>
              <Box sx={{ fontSize: '1.2rem' }}>⚡</Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: '#fbbf24', fontWeight: 700, display: 'block' }}>
                  Action recommandée
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                  {sqlMatch[1].substring(0, 60)}...
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleExecuteAction(sqlMatch[1])}
                sx={{ borderRadius: 8, textTransform: 'none', fontWeight: 700,
                  borderColor: 'rgba(251,191,36,0.4)', color: '#fbbf24',
                  '&:hover': { bgcolor: 'rgba(251,191,36,0.1)' }
                }}
              >
                {labelMatch[1]}
              </Button>
            </Box>
          );
        }
      }

      currentPos = match.index + tag.length;
    }

    // Texte restant après le dernier tag
    if (currentPos < displayContent.length) {
      const remaining = displayContent.substring(currentPos).trim();
      if (remaining) {
        elements.push(
          <ReactMarkdown key="md-end" remarkPlugins={[remarkGfm]}>
            {remaining}
          </ReactMarkdown>
        );
      }
    }

    // Si aucun tag trouvé, rendu Markdown pur
    if (elements.length === 0) {
      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {displayContent}
        </ReactMarkdown>
      );
    }

    return elements;
  };



  const handleExecuteAction = async (sql) => {
    setNotif({ open: true, msg: "Exécution de l'action...", severity: "info" });
    try {
      await api.post('/ai/chat/action/execute', { sql });
      setNotif({ open: true, msg: "Action appliquée avec succès", severity: "success" });
    } catch (e) {
      setNotif({ open: true, msg: "Erreur lors de l'exécution", severity: "error" });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', bgcolor: '#0a0a1a' }}>
      <GlobalStyles styles={{
        '@keyframes pulse': { '0%': { opacity: 0.6 }, '50%': { opacity: 1 }, '100%': { opacity: 0.6 } },
        '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        '*::-webkit-scrollbar': { width: '4px' },
        '*::-webkit-scrollbar-thumb': { background: 'rgba(99,102,241,0.3)', borderRadius: '10px' },

        // Tables — design premium dark
        '.markdown-content table': {
          width: '100%', borderCollapse: 'collapse',
          margin: '20px 0', borderRadius: '12px', overflow: 'hidden',
          border: '1px solid rgba(99,102,241,0.2)',
          animation: 'fadeIn 0.3s ease'
        },
        '.markdown-content th': {
          background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(99,102,241,0.1))',
          color: '#818cf8', fontWeight: '700', padding: '12px 16px',
          textAlign: 'left', fontSize: '0.78rem', letterSpacing: '0.05em',
          textTransform: 'uppercase', borderBottom: '1px solid rgba(99,102,241,0.3)'
        },
        '.markdown-content td': {
          padding: '10px 16px', color: '#e2e8f0', fontSize: '0.88rem',
          borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle'
        },
        '.markdown-content tr:last-child td': { borderBottom: 'none' },
        '.markdown-content tr:hover td': { background: 'rgba(99,102,241,0.06)' },
        '.markdown-content tbody tr:nth-child(even) td': { background: 'rgba(255,255,255,0.02)' },

        // Headings
        '.markdown-content h1': { color: '#c084fc', fontSize: '1.4rem', fontWeight: 900, margin: '24px 0 12px', borderBottom: '1px solid rgba(192,132,252,0.2)', paddingBottom: '8px' },
        '.markdown-content h2': { color: '#818cf8', fontSize: '1.15rem', fontWeight: 800, margin: '20px 0 10px' },
        '.markdown-content h3': { color: '#93c5fd', fontSize: '1rem', fontWeight: 700, margin: '16px 0 8px' },

        // Paragraphes & listes
        '.markdown-content p': { marginBottom: '12px', lineHeight: 1.75, color: '#cbd5e1' },
        '.markdown-content ul, .markdown-content ol': { paddingLeft: '20px', marginBottom: '12px' },
        '.markdown-content li': { marginBottom: '6px', color: '#cbd5e1', lineHeight: 1.6 },
        '.markdown-content li::marker': { color: '#818cf8' },

        // Code inline
        '.markdown-content code': {
          background: 'rgba(99,102,241,0.15)', color: '#c084fc',
          padding: '2px 7px', borderRadius: '5px', fontSize: '0.82rem', fontFamily: 'monospace'
        },
        // Code block
        '.markdown-content pre': {
          background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '10px', padding: '16px', overflow: 'auto', margin: '12px 0'
        },
        '.markdown-content pre code': { background: 'none', color: '#a5f3fc', padding: 0, fontSize: '0.8rem' },

        // Strong & em
        '.markdown-content strong': { color: '#818cf8', fontWeight: 700 },
        '.markdown-content em': { color: '#94a3b8', fontStyle: 'italic' },

        // Blockquote
        '.markdown-content blockquote': {
          borderLeft: '3px solid #818cf8', paddingLeft: '12px',
          margin: '12px 0', color: '#94a3b8', fontStyle: 'italic'
        },

        // HR
        '.markdown-content hr': { border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '20px 0' },
      }} />

      {/* Modern Header */}
      <Box sx={{ 
        p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(180deg, rgba(99,102,241,0.05) 0%, transparent 100%)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => setSidebarOpen(true)} sx={{ color: 'primary.main', bgcolor: 'rgba(99,102,241,0.1)' }}>
            <HistoryIcon />
          </IconButton>
          <Typography variant="h6" sx={{ 
            fontWeight: '900', 
            background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: -0.5
          }}>
            GOURMI IQ
          </Typography>
        </Box>
        <Chip 
          icon={<SparkleIcon style={{ color: '#818cf8', fontSize: 14 }} />} 
          label="Agent Premium" 
          sx={{ bgcolor: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: 'bold', fontSize: '0.7rem' }} 
        />
      </Box>

      {/* Sidebar for History */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{ sx: { width: 320, bgcolor: 'rgba(10,10,26,0.95)', backdropFilter: 'blur(10px)', p: 3, borderRight: '1px solid rgba(255,255,255,0.1)' } }}
      >
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', color: '#fff' }}>Discussion</Typography>
        <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={createNewChat} sx={{ mb: 4, borderRadius: 10, py: 1.5, textTransform: 'none' }}>Nouveau Chat</Button>
        <List sx={{ '& .Mui-selected': { bgcolor: 'rgba(99,102,241,0.2) !important' } }}>
          {sessions.map((s) => (
            <ListItem button key={s.sessionId} onClick={() => fetchHistory(s.sessionId)} selected={currentSessionId === s.sessionId} sx={{ borderRadius: 3, mb: 1, p: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}><ChatIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={<Typography variant="body2" sx={{ color: '#e0e0e0' }} noWrap>{s.sessionTitle}</Typography>} />
              <IconButton size="small" onClick={(e) => deleteSession(s.sessionId, e)} sx={{ color: 'rgba(255,255,255,0.3)' }}><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Messages Scroll Area */}
      <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <Container maxWidth="md">
          {chatHistory.length <= 1 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AIIcon sx={{ fontSize: 60, color: 'rgba(99,102,241,0.3)', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: '900', mb: 1, color: '#fff' }}>IA Stratégique</Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5 }}>Optimisez votre établissement grâce à l'intelligence prédictive.</Typography>
              <Grid container spacing={2}>
                {[{ icon: <GrowthIcon />, label: "Analyse Croissance", msg: "Analyse mes ventes du mois" }, { icon: <StatsIcon />, label: "Audit Plats", msg: "Quels sont mes meilleurs plats ?" }, { icon: <DbIcon />, label: "État Stocks", msg: "Audit complet de mes stocks" }, { icon: <StrategyIcon />, label: "Stratégie", msg: "Donne-moi 3 recommandations" }].map((c, i) => (
                  <Grid item xs={6} sm={3} key={i}>
                    <Paper 
                      elevation={0}
                      sx={{ p: 2.5, borderRadius: 4, cursor: 'pointer', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', '&:hover': { bgcolor: 'rgba(99,102,241,0.1)', borderColor: 'primary.main' }, transition: 'all 0.3s' }} 
                      onClick={() => handleSend(c.msg)}
                    >
                      <Box sx={{ color: 'primary.main', mb: 1.5 }}>{c.icon}</Box>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>{c.label}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Stack spacing={4}>
            {chatHistory.map((item, idx) => (
              <Box 
                key={idx} 
                className="message-row"
                sx={{ 
                  display: 'flex', gap: 2.5, 
                  flexDirection: item.role === 'Assistant' ? 'row' : 'row-reverse',
                  alignItems: 'flex-start'
                }}
              >
                <Avatar sx={{ bgcolor: item.role === 'Assistant' ? 'primary.main' : 'rgba(255,255,255,0.1)', width: 36, height: 36, boxShadow: 2 }}>
                  {item.role === 'Assistant' ? <SparkleIcon sx={{ fontSize: 18 }} /> : 'A'}
                </Avatar>
                <Box 
                  sx={{ 
                    maxWidth: '85%', 
                    p: 2.5,
                    borderRadius: item.role === 'Assistant' ? '0px 20px 20px 20px' : '20px 0px 20px 20px',
                    bgcolor: item.role === 'Assistant' ? 'rgba(255,255,255,0.03)' : 'rgba(99,102,241,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: item.role === 'Assistant' ? 'none' : '0 4px 15px rgba(0,0,0,0.2)',
                    color: '#e2e8f0',
                    lineHeight: 1.7,
                    '& h1, h2, h3': { color: 'primary.main', mb: 2, mt: 1 },
                    '& strong': { color: '#818cf8', fontWeight: '800' }
                  }}
                >
                  <div className="markdown-content">
                    {parseContent(item.content)}
                  </div>
                  {/* Badge métriques DeerFlow */}
                  {item.pipeline && item.pipeline.tasksPlanned && (
                    <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip size="small" label={`🧠 ${item.pipeline.tasksPlanned} tâches`}
                        sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }} />
                      <Chip size="small" label={`⚡ ${item.pipeline.totalRows || 0} lignes`}
                        sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }} />
                      {item.pipeline.elapsedSeconds && (
                        <Chip size="small" label={`⏱ ${item.pipeline.elapsedSeconds}s`}
                          sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }} />
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
            
            {loading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2,
                bgcolor: 'rgba(99,102,241,0.04)', borderRadius: 3,
                border: '1px solid rgba(99,102,241,0.15)' }}>
                {/* Pipeline Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, animation: 'pulse 2s infinite' }}>
                    <SparkleIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                  <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                    DeerFlow Pipeline · En cours
                  </Typography>
                </Box>

                {/* Steps */}
                {[
                  { step: 1, icon: '🧠', label: 'Planner', desc: 'Décomposition de la demande en tâches SQL...' },
                  { step: 2, icon: '⚡', label: 'Executor', desc: 'Exécution des requêtes en parallèle...' },
                  { step: 3, icon: '📊', label: 'Reporter', desc: 'Génération du rapport stratégique...' },
                ].map(({ step, icon, label, desc }) => {
                  const isDone = pipelineStep > step;
                  const isActive = pipelineStep === step;
                  const isPending = pipelineStep < step;
                  return (
                    <Box key={step} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, opacity: isPending ? 0.3 : 1, transition: 'opacity 0.4s' }}>
                      <Box sx={{
                        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
                        bgcolor: isDone ? 'rgba(34,197,94,0.15)' : isActive ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isDone ? '#22c55e' : isActive ? '#818cf8' : 'rgba(255,255,255,0.1)'}`,
                        animation: isActive ? 'pulse 1s infinite' : 'none',
                        flexShrink: 0
                      }}>
                        {isDone ? '✓' : icon}
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: isDone ? '#22c55e' : isActive ? '#818cf8' : 'rgba(255,255,255,0.4)', display: 'block', lineHeight: 1 }}>
                          {label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
                          {isDone ? 'Terminé' : isActive ? desc : 'En attente'}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
            <div style={{ height: 100 }} />
          </Stack>
        </Container>
      </Box>

      {/* Floating Input Area */}
      <Box sx={{ 
        position: 'absolute', bottom: 30, left: 0, right: 0, 
        zIndex: 10, bgcolor: 'transparent', px: 2 
      }}>
        <Container maxWidth="md">
          <Paper 
            elevation={24} 
            sx={{ 
              p: 1.5, pl: 3, borderRadius: 10, 
              display: 'flex', alignItems: 'center', 
              bgcolor: 'rgba(30,30,50,0.8)', 
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
            }}
          >
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'primary.main' }}>
              <ToolsIcon fontSize="small" />
            </IconButton>
            <TextField 
              fullWidth 
              placeholder="Question stratégique (ex: Prédis mes ventes ce weekend)..." 
              variant="standard" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && handleSend()} 
              InputProps={{ 
                disableUnderline: true,
                sx: { color: '#fff', fontSize: '0.95rem' }
              }} 
            />
            <IconButton 
              color="primary" 
              onClick={() => handleSend()} 
              disabled={loading || !message.trim()}
              sx={{ bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' }, ml: 1, p: 1.2 }}
            >
              <SendIcon fontSize="small" />
            </IconButton>
          </Paper>
        </Container>
      </Box>

      {/* Notif */}
      <Snackbar open={notif.open} autoHideDuration={4000} onClose={() => setNotif({ ...notif, open: false })}>
        <Alert severity={notif.severity} variant="filled" sx={{ width: '100%', borderRadius: 3 }}>{notif.msg}</Alert>
      </Snackbar>

      {/* Extensions Popover */}
      <Popover 
        open={Boolean(anchorEl)} 
        anchorEl={anchorEl} 
        onClose={() => setAnchorEl(null)} 
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }} 
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }} 
        PaperProps={{ sx: { borderRadius: 4, p: 2.5, width: 300, bgcolor: 'rgba(30,30,50,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', mt: -2 } }}
      >
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: '900', color: 'primary.main' }}>EXTENSIONS IQ</Typography>
        <List dense sx={{ py: 0 }}>
          {[{ id: 'sql', icon: <DbIcon />, label: "Analyse Base de Données Real-time" }, { id: 'pdf', icon: <ReportIcon />, label: "Génération PDF Strategique" }, { id: 'actions', icon: <ActionIcon />, label: "Automatisations & Actions" }].map(t => (
            <ListItem key={t.id} secondaryAction={<Switch checked={activeTools[t.id] || true} color="primary" size="small" />} sx={{ px: 0, py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'primary.main' }}>{t.icon}</ListItemIcon>
              <ListItemText 
                primary={<Typography variant="body2" sx={{ fontWeight: 'bold' }}>{t.label}</Typography>}
                secondary={<Typography variant="caption" sx={{ color: 'text.secondary' }}>Activé par défaut</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </Popover>
    </Box>
  );
};

export default AIDashboard;
