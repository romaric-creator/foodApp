import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  GlobalStyles,
  CircularProgress,
  LinearProgress,
  ThemeProvider,
  createTheme
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
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
  Menu as MenuIcon,
  Settings as SettingsIcon,
  DeleteOutline as DeleteIcon,
  Tune as ToolsIcon,
  History as HistoryIcon,
  Dashboard as DashboardIcon,
  Lightbulb as IdeaIcon,
  MicNoneOutlined as MicIcon,
  PrintOutlined as PrintIcon,
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
  const containerStyle = { 
    width: '100%', 
    maxWidth: '650px', 
    margin: '32px 0',
    padding: '24px',
    background: 'rgba(248,250,252,0.02)',
    borderRadius: '16px',
    border: '1px solid rgba(248,250,252,0.1)',
  };
  
  const muiOptions = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'bottom', 
        labels: { 
          color: 'rgba(255,255,255,0.5)', 
          font: { size: 11, weight: '600' },
          padding: 20,
          usePointStyle: true
        } 
      },
      tooltip: {
        backgroundColor: '#0d0d1a',
        titleColor: '#FB923C',
        bodyColor: '#fff',
        borderColor: 'rgba(251,146,60,0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 15
      }
    },
    scales: type !== 'pie' ? {
      y: { 
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }
      },
      x: { 
        grid: { display: false },
        ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } }
      }
    } : {},
    ...options 
  };
  
  return (
    <Box sx={containerStyle}>
      <Box sx={{ height: 300 }}>
        {type === 'bar' ? <Bar data={data} options={muiOptions} /> : 
         type === 'line' ? <Line data={data} options={muiOptions} /> : 
         <Pie data={data} options={muiOptions} />}
      </Box>
    </Box>
  );
};

const AIDashboard = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'Assistant', content: "# Bienvenue dans l'Audit Premium Gourmi IQ\nJe suis GOURMI AGENT, votre copilote stratégique. Interrogez-moi pour transformer votre restaurant." }
  ]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Animation FadeIn
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .markdown-content table {
        width: 100%; border-collapse: collapse; margin: 16px 0;
        background: rgba(255,255,255,0.02); border-radius: 8px; overflow: hidden;
      }
      .markdown-content th { background: rgba(251,146,60,0.1); color: #FB923C; padding: 12px; text-align: left; }
      .markdown-content td { padding: 12px; border-bottom: 1px solid rgba(248,250,252,0.05); }
    `;
    document.head.appendChild(style);
  }, []);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [notif, setNotif] = useState({ open: false, msg: '', severity: 'success' });
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ topDish: 'Ndolé', lowStock: 3 });

  const promptSuggestions = [
    { label: "Plat le plus rentable?", icon: "💰" },
    { label: "Alerte stock critique", icon: "⚠️" },
    { label: "Synthèse de la semaine", icon: "📊" }
  ];
  const [currentSessionId, setCurrentSessionId] = useState('session_' + Date.now());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0); // 0=idle 1=planning 2=executing 3=reporting

  const aiTheme = useMemo(() => createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#FB923C' }, // Corail consistent
      secondary: { main: '#0EA5E9' }, // Azur consistent
      background: { default: '#1A1C1E', paper: '#334155' },
      text: { primary: '#F8FAFC', secondary: '#94A3B8' }
    },
    shape: { borderRadius: 16 },
    typography: { 
      fontFamily: '"Inter", sans-serif',
      h5: { fontWeight: 900 },
      h6: { fontWeight: 800 }
    }
  }), []);
  const [lastPipelineMeta, setLastPipelineMeta] = useState(null);

  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatHistory, loading]);

   const fetchSessions = async () => {
    try {
      const response = await api.get('/ai/chat/sessions');
      setSessions(response.data);
    } catch (e) { console.error(e); }
  };
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (e) { console.error(e); }
  };
  useEffect(() => { 
    fetchSessions(); 
    fetchCategories();
  }, []);

  const fetchHistory = async (sid) => {
    setFetchingHistory(true);
    setCurrentSessionId(sid);
    try {
      const response = await api.get(`/ai/chat/history/${sid}`);
      if (response.data.length > 0) {
        setChatHistory(response.data.map(h => ({
          // On normalise le rôle : user, USER, User -> 'User'
          role: (h.role && h.role.toUpperCase() === 'USER') ? 'User' : 'Assistant',
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

  const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'dashboard'
  const [activeTools, setActiveTools] = useState({ sql: true, actions: true, predictions: true, charts: true, pdf: true });
  const [anchorEl, setAnchorEl] = useState(null);

  const getStrategicElements = () => {
    const elements = [];
    chatHistory.forEach(h => {
      const tagRegex = /<(CHART|STRATEGY_INSIGHT)([\s\S]*?)\/>/g;
      let match;
      while ((match = tagRegex.exec(h.content)) !== null) {
        elements.push({ type: match[1], attrs: match[2], timestamp: h.timestamp });
      }
    });
    return elements;
  };

  const exportToPDF = (content, fileName = "Rapport_Gourmi") => {
    if (!content) return;
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('fr-FR');
    doc.setFillColor(255, 112, 67);
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
      else if (line.startsWith('--- ')) { doc.setFont("helvetica", "bold"); doc.setTextColor(255, 112, 67); }
      else { doc.setFont("helvetica", "normal"); doc.setTextColor(40, 40, 40); }
      doc.text(line, 20, y);
      y += line.includes('|') ? 6 : 7;
    });
    doc.save(`${fileName}_${Date.now()}.pdf`);
  };

  const handleCreateMenu = async (menuData) => {
    setLoading(true);
    setNotif({ open: true, msg: "Création du plat en cours...", severity: "info" });
     try {
      // Nettoyage et validation des données (Évite l'erreur ER_TRUNCATED_WRONG_VALUE_FOR_FIELD)
      const cleanPrice = parseInt(menuData.price?.toString().replace(/\s/g, '')) || 0;
      const cleanStock = parseInt(menuData.stock) || 0;

      // Trouver l'ID de la catégorie suggérée (Matching Intelligent)
      let idCat = (categories && categories.length > 0) ? categories[0].idCat : null; // Par défaut, la première catégorie
      if (menuData.category) {
        const cat = categories.find(c => 
          c.name.toLowerCase().trim() === menuData.category.toLowerCase().trim() ||
          c.name.toLowerCase().includes(menuData.category.toLowerCase()) ||
          menuData.category.toLowerCase().includes(c.name.toLowerCase())
        );
        if (cat) idCat = cat.idCat;
      }

      // 1. Appel au service catalogue pour créer le produit
      const response = await api.post('/menus', {
        name: menuData.name,
        description: menuData.description,
        price: cleanPrice,
        stock_quantity: cleanStock,
        image_url: menuData.image,
        idCat: idCat,
        is_available: 1
      });

      if (response.data) {
        setNotif({ open: true, msg: `Plat "${menuData.name}" ajouté avec succès !`, severity: "success" });
        handleSend(`C'est fait ! Le plat ${menuData.name} est maintenant disponible avec un stock de ${menuData.stock} portions.`);
      }
    } catch (error) {
      console.error(error);
      setNotif({ open: true, msg: "Erreur lors de la création du plat", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (forcedMessage = null) => {
    const textToSend = forcedMessage || message;
    if (!textToSend.trim() || loading) return;
    if (!forcedMessage) setMessage('');
    setChatHistory(prev => [...prev, { role: 'User', content: textToSend, timestamp: new Date() }]);
    setLoading(true);
    setPipelineStep(1); // 1: Planning
    setLastPipelineMeta(null);

    // Simulation de progression pour l'UX
    const stepInterval = setInterval(() => {
      setPipelineStep(prev => prev < 3 ? prev + 1 : prev);
    }, 800);

    try {
      const title = textToSend.substring(0, 30);
      const historyToSend = chatHistory.slice(-10).map(h => ({
        role: h.role === 'User' ? 'User' : 'Assistant',
        content: h.content
      }));

      const response = await api.post('/ai/chat/admin/chat', {
        message: textToSend, 
        history: historyToSend, 
        sessionId: currentSessionId, 
        sessionTitle: title
      });

      clearInterval(stepInterval);
      setPipelineStep(4); // Complet

      if (response.data.pipeline) setLastPipelineMeta(response.data.pipeline);
      setChatHistory(prev => [...prev, { 
        role: 'Assistant', 
        content: response.data.message, 
        pipeline: response.data.pipeline,
        timestamp: new Date()
      }]);
      fetchSessions();
    } catch (error) {
      clearInterval(stepInterval);
      setPipelineStep(0);
      setChatHistory(prev => [...prev, { role: 'Assistant', content: "⚠️ Erreur de communication stratégique. Veuillez réactiver le service." }]);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setPipelineStep(0);
      }, 500);
    }
  };


  const parseContent = (content) => {
    if (!content) return null;

    // 1. Supprimer les balises <SQL> de l'affichage
    let displayContent = content.replace(/<SQL>[\s\S]*?<\/SQL>/g, '').trim();

    const elements = [];
    // Regex robuste pour les balises
    const tagRegex = /<(CHART|EXPORT|ACTION|IMAGE_GRID|MENU_FORM|STRATEGY_INSIGHT)([\s\S]*?)\/?>/g;
    let match, currentPos = 0;

    const extractAttribute = (attributes, name) => {
      const regex = new RegExp(`${name}\\s*=\\s*(['"])([\\s\\S]*?)\\1`);
      const m = attributes.match(regex);
      if (m) return m[2];
      
      const lookFor = `${name}=`;
      const startIdx = attributes.indexOf(lookFor);
      if (startIdx !== -1) {
        const quote = attributes[startIdx + lookFor.length];
        const contentStart = startIdx + lookFor.length + 1;
        const contentEnd = attributes.indexOf(quote, contentStart);
        if (contentEnd !== -1) return attributes.substring(contentStart, contentEnd);
      }
      return null;
    };

    while ((match = tagRegex.exec(displayContent)) !== null) {
      const startIdx = match.index;
      
      // Texte avant le tag
      if (startIdx > currentPos) {
        const textChunk = displayContent.substring(currentPos, startIdx).trim();
        if (textChunk) {
          elements.push(
            <Box key={`md-${startIdx}`} className="markdown-content" sx={{ mb: 2 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{textChunk}</ReactMarkdown>
            </Box>
          );
        }
      }

      const tagName = match[1];
      const tagAttributes = match[2];

      // Rendu selon le type
      if (tagName === 'STRATEGY_INSIGHT') {
        const title = extractAttribute(tagAttributes, 'title');
        const text = extractAttribute(tagAttributes, 'text');
        const impact = extractAttribute(tagAttributes, 'impact');
        elements.push(
          <Box key={`insight-${startIdx}`} sx={{ 
            my: 3, p: 3, borderRadius: 3, 
            bgcolor: 'rgba(251,146,60,0.05)',
            border: '1px solid rgba(251,146,60,0.2)',
          }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
              <IdeaIcon sx={{ color: 'primary.main', fontSize: 24 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white' }}>{title}</Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>{text}</Typography>
            <Chip label={impact} size="small" color="primary" sx={{ fontWeight: 800, fontSize: '0.7rem' }} />
          </Box>
        );
      } else if (tagName === 'CHART') {
        const chartType = extractAttribute(tagAttributes, 'type');
        const dataStr = extractAttribute(tagAttributes, 'data');
        if (chartType && dataStr) {
          try {
            const chartData = JSON.parse(dataStr.replace(/'/g, '"'));
            elements.push(<Box key={`chart-${startIdx}`} sx={{ my: 3 }}><ChatChart type={chartType} data={chartData} /></Box>);
          } catch(e) {}
        }
      } else if (tagName === 'IMAGE_GRID') {
        const imagesStr = extractAttribute(tagAttributes, 'images');
        if (imagesStr) {
          try {
            const images = JSON.parse(imagesStr.replace(/'/g, '"').replace(/&quot;/g, '"'));
            elements.push(
              <Box key={`images-${startIdx}`} sx={{ my: 3, p: 2.5, bgcolor: 'rgba(251,146,60,0.03)', borderRadius: 5, border: '1px dotted rgba(251,146,60,0.4)', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: '#FB923C' }} />
                <Typography variant="overline" sx={{ color: '#FB923C', fontWeight: 900, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                   <PhotoIcon sx={{ fontSize: 16 }} /> GALERIE DE SUGGESTIONS IA
                </Typography>
                <Grid container spacing={2}>
                  {images.slice(0, 5).map((img, i) => (
                    <Grid item xs={12} sm={6} md={2.4} key={i}>
                      <Paper elevation={0} onClick={() => handleSend(`Je choisis l'image ${i+1} : ${img}`)}
                        sx={{ 
                          height: 140, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center',
                          borderRadius: 4, cursor: 'pointer', border: '2px solid rgba(255,255,255,0.05)', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          '&:hover': { borderColor: '#FB923C', transform: 'scale(1.05)', boxShadow: '0 15px 30px rgba(0,0,0,0.5)' },
                          display: 'flex', alignItems: 'flex-end', p: 1
                        }}>
                        <Typography variant="caption" sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 1, borderRadius: 1, fontSize: '0.6rem', backdropFilter: 'blur(4px)' }}>Options {i+1}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          } catch(e) {}
        }
      } else if (tagName === 'MENU_FORM') {
        const name = extractAttribute(tagAttributes, 'name');
        const desc = extractAttribute(tagAttributes, 'description');
        const price = extractAttribute(tagAttributes, 'price');
        const img = extractAttribute(tagAttributes, 'image');
        const category = extractAttribute(tagAttributes, 'category');
        elements.push(
          <Box key={`form-${startIdx}`} sx={{ my: 3, p: 3, background: 'linear-gradient(135deg, rgba(251,146,60,0.08) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: 5 }}>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 800, mb: 3 }}>Publication au Catalogue</Typography>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'center' }}>
                 <Avatar variant="rounded" src={img} sx={{ width: 80, height: 80, borderRadius: 3, border: '2px solid rgba(251,146,60,0.3)' }} />
                 <Box sx={{ flex: 1 }}>
                   <Typography variant="h6" sx={{ color: '#FB923C', fontWeight: 800 }}>{name}</Typography>
                   <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mt: 1 }}>{desc}</Typography>
                 </Box>
              </Box>

              <FormControl fullWidth variant="filled" size="small">
                <InputLabel sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 900 }}>Catégorie de destination</InputLabel>
                <Select
                  id={`cat-select-${startIdx}`}
                  defaultValue={categories?.find(c => c.name.toLowerCase().includes(category?.toLowerCase()))?.name || categories[0]?.name || "Divers"}
                  disableUnderline
                  sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2, color: 'white', fontWeight: 700 }}
                >
                  {categories?.map(c => <MenuItem key={c.idCat} value={c.name}>{c.name}</MenuItem>)}
                  <MenuItem value="Divers">Divers (Par défaut)</MenuItem>
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={6}><TextField label="Prix (FCFA)" defaultValue={price} size="small" id={`price-${startIdx}`} fullWidth variant="filled" InputProps={{ disableUnderline: true }} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2, '& input': { color: 'white', fontWeight: 700 } }} /></Grid>
                <Grid item xs={6}><TextField label="Stock initial" defaultValue="50" size="small" id={`stock-${startIdx}`} fullWidth variant="filled" InputProps={{ disableUnderline: true }} sx={{ bgcolor: 'rgba(255,255,255,0.04)', borderRadius: 2, '& input': { color: 'white', fontWeight: 700 } }} /></Grid>
              </Grid>

              <Button variant="contained" fullWidth onClick={() => {
                const p = document.getElementById(`price-${startIdx}`).value;
                const s = document.getElementById(`stock-${startIdx}`).value;
                const c = document.getElementById(`cat-select-${startIdx}`).innerText; // Fallback pour Select simple
                handleCreateMenu({ name, description: desc, price: p, stock: s, image: img, category: c });
              }} sx={{ background: 'linear-gradient(90deg, #FB923C, #FB923C)', fontWeight: 900, py: 1.5, borderRadius: 3 }}>Confirmer la Publication</Button>
            </Stack>
          </Box>
        );
      } else if (tagName === 'EXPORT') {
        const typeAttr = extractAttribute(tagAttributes, 'type');
        const dataAttr = extractAttribute(tagAttributes, 'data');
        if (typeAttr) {
          elements.push(
            <Box key={`export-${startIdx}`} sx={{ my: 3, p: 2.5, bgcolor: 'rgba(251,146,60,0.1)', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <PdfIcon sx={{ color: '#FB923C', fontSize: 28 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 800 }}>Rapport : {typeAttr.replace(/_/g, ' ')}</Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>Prêt pour téléchargement</Typography>
              </Box>
              <IconButton onClick={() => exportToPDF(dataAttr || content, typeAttr)} sx={{ bgcolor: '#FB923C', color: 'white', '&:hover': { bgcolor: '#FB923C' } }}><PdfIcon /></IconButton>
            </Box>
          );
        }
      } else if (tagName === 'KPI') {
        const title = extractAttribute(tagAttributes, 'title');
        const value = extractAttribute(tagAttributes, 'value');
        const trend = extractAttribute(tagAttributes, 'trend');
        const isUp = trend?.startsWith('+');
        elements.push(
          <Box key={`kpi-${startIdx}`} sx={{ 
            p: 2, borderRadius: 3, bgcolor: 'rgba(248,250,252,0.03)', border: '1px solid rgba(248,250,252,0.05)',
            minWidth: 140, flex: 1, my: 1
          }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 900, textTransform: 'uppercase' }}>{title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'white' }}>{value}</Typography>
              {trend && <Typography variant="caption" sx={{ color: isUp ? '#10B981' : '#EF4444', fontWeight: 900 }}>{trend}</Typography>}
            </Box>
          </Box>
        );
      } else if (tagName === 'EXCEL') {
        const dataStr = extractAttribute(tagAttributes, 'data');
        const filename = extractAttribute(tagAttributes, 'filename') || 'export.csv';
        const handleExport = () => {
          try {
            const data = JSON.parse(dataStr);
            const headers = Object.keys(data[0]);
            const csv = [headers.join(','), ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
          } catch(e) {}
        };
        elements.push(
          <Button key={`excel-${startIdx}`} variant="outlined" onClick={handleExport} startIcon={<ArticleIcon />} sx={{ my: 1, borderRadius: 2, borderColor: 'primary.main', color: 'primary.main', fontWeight: 800 }}>
            Télécharger Excel
          </Button>
        );
      } else if (tagName === 'STRATEGY_INSIGHT') {
        const title = extractAttribute(tagAttributes, 'title');
        const text = extractAttribute(tagAttributes, 'text');
        elements.push(
          <Box key={`strat-${startIdx}`} sx={{ 
            my: 3, p: 3, 
            bgcolor: 'rgba(251,146,60,0.03)', 
            border: '1px solid rgba(251,146,60,0.1)',
            borderLeft: '6px solid #FB923C', 
            borderRadius: '0 16px 16px 0',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 900, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PsychologyIcon /> {title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontStyle: 'italic' }}>{text}</Typography>
          </Box>
        );
      } else if (tagName === 'DECISION_TOOL') {
        const question = extractAttribute(tagAttributes, 'question');
        const opt1 = extractAttribute(tagAttributes, 'opt1');
        const sql1 = extractAttribute(tagAttributes, 'sql1');
        const opt2 = extractAttribute(tagAttributes, 'opt2');
        const sql2 = extractAttribute(tagAttributes, 'sql2');
        elements.push(
          <Box key={`decision-${startIdx}`} sx={{ 
            my: 4, p: 4, borderRadius: 4, 
            background: 'linear-gradient(135deg, rgba(30,41,59,0.9), rgba(15,23,42,0.9))',
            border: '1px solid rgba(251,146,60,0.3)',
            textAlign: 'center'
          }}>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 900, mb: 3 }}>🤔 Aide à la Décision</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>{question}</Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button variant="contained" onClick={() => handleExecuteAction(sql1)} sx={{ bgcolor: 'primary.main', fontWeight: 800, px: 4 }}>{opt1}</Button>
              <Button variant="outlined" onClick={() => handleExecuteAction(sql2)} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)', fontWeight: 800, px: 4 }}>{opt2}</Button>
            </Stack>
          </Box>
        );
      } else if (tagName === 'SMART_ACTIONS') {
        const actionsStr = extractAttribute(tagAttributes, 'actions');
        try {
          const actions = JSON.parse(actionsStr.replace(/'/g, '"').replace(/&quot;/g, '"'));
          elements.push(
            <Box key={`smart-${startIdx}`} sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, my: 3 }}>
              {actions.map((act, i) => (
                <Button 
                  key={i} size="small" variant="outlined" 
                  onClick={() => handleSend(act.cmd)}
                  startIcon={<AutoFixHighIcon sx={{ fontSize: 14 }} />}
                  sx={{ 
                    borderRadius: 10, borderColor: 'rgba(251,146,60,0.3)', color: '#FB923C', 
                    fontSize: '0.75rem', textTransform: 'none', px: 2, bgcolor: 'rgba(251,146,60,0.02)',
                    '&:hover': { borderColor: '#FB923C', bgcolor: 'rgba(251,146,60,0.1)' }
                  }}>
                  {act.label}
                </Button>
              ))}
            </Box>
          );
        } catch(e) {}
      }

      currentPos = match.index + match[0].length;
    }

    // Reste du texte
    if (currentPos < displayContent.length) {
      const remaining = displayContent.substring(currentPos).trim();
      if (remaining) {
        elements.push(<Box key="md-end" className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{remaining}</ReactMarkdown></Box>);
      }
    }

    return elements.length > 0 ? elements : <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>;
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
    <ThemeProvider theme={aiTheme}>
    <Box sx={{ 
      display: 'flex', flexDirection: 'column', 
      height: '100%', width: '100%', 
      bgcolor: 'background.default', color: 'text.primary', 
      overflow: 'hidden', // Empêche le scroll global du composant
      position: 'relative'
    }}>
      <GlobalStyles styles={{
        '*::-webkit-scrollbar': { width: '4px' },
        '*::-webkit-scrollbar-thumb': { background: 'rgba(251,146,60,0.2)', borderRadius: '10px' },
        '.markdown-content': { color: '#F8FAFC', lineHeight: 1.8, fontSize: '1rem' },
        '.markdown-content h2': { color: 'white', mt: 5, mb: 2, fontWeight: 900, fontSize: '1.8rem', borderBottom: '2px solid #FB923C', pb: 1, display: 'inline-block' },
        '.markdown-content h3': { color: 'primary.main', mt: 4, mb: 2, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 },
        '.markdown-content strong': { color: '#FB923C', fontWeight: 800 },
        '.markdown-content table': {
          width: '100%', borderCollapse: 'separate', borderSpacing: 0, my: 3,
          borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(248,250,252,0.05)',
          bgcolor: 'rgba(15,23,42,0.3)'
        },
        '.markdown-content th': { bgcolor: 'rgba(248,250,252,0.05)', color: '#FB923C', p: 2, textAlign: 'left', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.75rem' },
        '.markdown-content td': { p: 2, borderBottom: '1px solid rgba(248,250,252,0.03)', color: 'rgba(248,250,252,0.8)' }
      }} />

      {/* ── BARRE D'OUTILS IA (FIXE & DESIGN GLASS) ────────────────────────────── */}
      <Box sx={{ 
        p: 2, px: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
        bgcolor: 'rgba(30, 41, 59, 0.8)', // Même Ardoise mais semi-transparente
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(248,250,252,0.05)',
        zIndex: 3000,
        position: 'relative'
      }}>
        {/* NAVIGATION DES MODES (CENTRE ABSOLU) */}
        <Box sx={{ 
          display: 'flex', gap: 1, bgcolor: 'rgba(248,250,252,0.03)', p: 0.5, borderRadius: 3,
          border: '1px solid rgba(248,250,252,0.05)'
        }}>
          {[
            { id: 'chat', label: 'Assistant', icon: <ChatIcon sx={{ fontSize: 18 }} /> },
            { id: 'dashboard', label: 'Audit', icon: <StrategyIcon sx={{ fontSize: 18 }} /> },
            { id: 'reports', label: 'Archives', icon: <ReportIcon sx={{ fontSize: 18 }} /> }
          ].map((mode) => (
            <Button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              startIcon={mode.icon}
              size="small"
              sx={{
                px: 3, py: 1, borderRadius: 2,
                color: viewMode === mode.id ? 'primary.main' : 'text.disabled',
                bgcolor: viewMode === mode.id ? 'rgba(251,146,60,0.08)' : 'transparent',
                fontWeight: 800, textTransform: 'none',
                transition: 'all 0.2s',
                '&:hover': { bgcolor: 'rgba(248,250,252,0.05)', color: 'white' }
              }}
            >
              {mode.label}
            </Button>
          ))}
        </Box>
        
        {/* ACTIONS SECONDAIRES (FLOAT DROITE) */}
        <Box sx={{ position: 'absolute', right: 32, display: 'flex', gap: 1 }}>
          <Tooltip title="Imprimer">
            <IconButton sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}>
              <PrintIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Historique">
            <IconButton onClick={() => setSidebarOpen(true)} sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}>
              <HistoryIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* BARRE DE CHARGEMENT SUBTILE (Design Minimaliste) */}
      {loading && (
        <Box sx={{ width: '100%', zIndex: 2500 }}>
          <LinearProgress 
            sx={{ 
              height: 2, bgcolor: 'transparent',
              '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' }
            }} 
          />
        </Box>
      )}

      {/* ── ZONE DE CONTENU VARIABLE ────────────────────────────── */}
      <Box ref={scrollRef} sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        position: 'relative', 
        display: 'flex', 
        flexDirection: 'column', 
        pb: 32, // ZONE DE SÉCURITÉ POUR LA BARRE FLOTTANTE
        scrollBehavior: 'smooth',
        // Scrollbar subtile
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '10px' },
        '&::-webkit-scrollbar-track': { bgcolor: 'transparent' }
      }}>
        
        {viewMode === 'chat' ? (
          <Box sx={{ 
            p: { xs: 3, md: 8 },
            background: 'radial-gradient(circle at 50% 30%, rgba(251,146,60,0.03) 0%, transparent 60%)',
          }}>
            <Container maxWidth="xl">
              {chatHistory.length <= 1 ? (
                <Box sx={{ py: 10, textAlign: 'center', animation: 'fadeIn 0.5s ease-out' }}>
                  <Typography variant="h1" sx={{ fontWeight: 1000, mb: 2, letterSpacing: -4, color: '#F8FAFC' }}>
                    Intelligence <span style={{ color: '#FB923C' }}>Gourmi</span>
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'text.secondary', mb: 8, fontWeight: 500 }}>
                    Que souhaitez-vous analyser ou créer aujourd'hui ?
                  </Typography>
                  
                  <Grid container spacing={4} justifyContent="center">
                    {[
                      { icon: <StatsIcon />, title: "Analyses & Rapports", desc: "Performance financière et tendances", mode: 'dashboard' },
                      { icon: <StrategyIcon />, title: "Audit des Stocks", desc: "Optimisation et alertes périssables", mode: 'audit' }
                    ].map((card, i) => (
                      <Grid item xs={12} md={5} key={i}>
                        <Paper 
                          onClick={() => setViewMode(card.mode)}
                          sx={{ 
                            p: 4, borderRadius: 4, bgcolor: 'rgba(248,250,252,0.02)', 
                            border: '1px solid rgba(248,250,252,0.05)', cursor: 'pointer',
                            transition: 'all 0.3s ease', textAlign: 'left',
                            display: 'flex', alignItems: 'center', gap: 3,
                            '&:hover': { bgcolor: 'rgba(251,146,60,0.04)', transform: 'translateY(-5px)', borderColor: 'primary.main' }
                          }}
                        >
                          <Avatar sx={{ bgcolor: 'rgba(251,146,60,0.1)', color: 'primary.main', width: 56, height: 56 }}>
                            {React.cloneElement(card.icon, { sx: { fontSize: 28 } })}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900, color: 'white' }}>{card.title}</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{card.desc}</Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : (
                <Box sx={{ animation: 'fadeIn 0.3s ease' }}>
                  <Stack spacing={8} sx={{ pb: 10 }}>
                    {chatHistory.map((item, idx) => (
                      <Box key={idx} sx={{ 
                        display: 'flex', 
                        gap: 2, 
                        flexDirection: item.role === 'User' ? 'row-reverse' : 'row',
                        mb: 4
                      }}>
                        <Avatar sx={{ 
                          bgcolor: item.role === 'Assistant' ? 'primary.main' : 'rgba(255,255,255,0.1)', 
                          width: 38, height: 38, 
                          fontSize: 14, fontWeight: 900,
                          boxShadow: item.role === 'Assistant' ? '0 0 15px rgba(251,146,60,0.2)' : 'none'
                        }}>
                          {item.role === 'Assistant' ? <PsychologyIcon sx={{ fontSize: 20 }} /> : 'AD'}
                        </Avatar>
                        <Box sx={{ 
                          maxWidth: '85%', 
                          p: item.role === 'Assistant' ? 0 : 2.5, 
                          borderRadius: item.role === 'Assistant' ? 0 : '20px 20px 5px 20px', 
                          bgcolor: item.role === 'Assistant' ? 'transparent' : 'rgba(248,250,252,0.03)',
                          border: item.role === 'Assistant' ? 'none' : '1px solid rgba(248,250,252,0.05)'
                        }}>
                          {parseContent(item.content)}
                        </Box>
                      </Box>
                    ))}
                    {/* Indicateur de chargement simplifié dans le flux */}
                  </Stack>
                </Box>
              )}
            </Container>
          </Box>
        ) : (viewMode === 'dashboard' || viewMode === 'audit') ? (
          <Container maxWidth="lg" sx={{ py: 6 }}>
             <Typography variant="h3" sx={{ fontWeight: 1000, mb: 1, letterSpacing: -2 }}>Centre <span style={{ color: '#FB923C' }}>d'Audit</span></Typography>
             <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 6, fontWeight: 700, letterSpacing: 1 }}>SYNTHÈSE STRATÉGIQUE GÉNÉRÉE PAR L'IA</Typography>
             <Grid container spacing={4}>
                {getStrategicElements().length > 0 ? getStrategicElements().map((el, i) => (
                  <Grid item xs={12} md={el.type === 'CHART' ? 12 : 6} key={i}>
                     <Box sx={{ p: 4, borderRadius: 6, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(251,146,60,0.1)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        {parseContent(el.type === 'CHART' ? `<CHART ${el.attrs} />` : `<STRATEGY_INSIGHT ${el.attrs} />`)}
                     </Box>
                  </Grid>
                )) : (
                  <Box sx={{ p: 10, textAlign: 'center', width: '100%', opacity: 0.2 }}>
                     <StrategyIcon sx={{ fontSize: 80, mb: 2 }} />
                     <Typography variant="h6">Aucune donnée stratégique capturée.</Typography>
                  </Box>
                )}
             </Grid>
          </Container>
        ) : (
          <Container maxWidth="lg" sx={{ py: 6 }}>
             <Typography variant="h3" sx={{ fontWeight: 1000, mb: 1, letterSpacing: -2 }}>Vos <span style={{ color: '#FB923C' }}>Rapports</span></Typography>
             <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mb: 6, fontWeight: 700, letterSpacing: 1 }}>HISTORIQUE ET EXPORTS PDF</Typography>
             <Stack spacing={2}>
               {sessions.map((s, idx) => (
                 <Paper key={idx} sx={{ p: 3, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(251,146,60,0.04)', borderColor: '#FB923C' } }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <ReportIcon sx={{ color: '#FB923C' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 800 }}>{s.sessionTitle || `Session ${idx + 1}`}</Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>ID: {s.sessionId.substring(0, 15)}...</Typography>
                      </Box>
                   </Box>
                   <Button variant="outlined" size="small" onClick={() => fetchHistory(s.sessionId)} sx={{ borderColor: 'rgba(251,146,60,0.3)', color: '#FB923C', borderRadius: 2 }}>Ouvrir</Button>
                 </Paper>
               ))}
             </Stack>
          </Container>
        )}
      </Box>

       {/* ── BARRE DE SAISIE FLOTTANTE (Style Gemini) ────────────────────────── */}
       <Box sx={{ 
        position: 'absolute', bottom: 30, left: 0, right: 0, 
        zIndex: 2000, px: { xs: 2, md: 4 },
        pointerEvents: 'none',
        // On s'assure qu'elle ne bouge jamais d'un poil
        transform: 'translateZ(0)'
      }}>
        <Container maxWidth="md" sx={{ pointerEvents: 'auto' }}>
          {/* Prompt Suggestions */}
          <Stack direction="row" spacing={1.5} sx={{ mb: 2, overflowX: 'auto', pb: 1, '&::-webkit-scrollbar': { display: 'none' } }}>
            {promptSuggestions.map((s, idx) => (
              <Chip 
                key={idx} 
                label={s.label} 
                icon={<span>{s.icon}</span>}
                onClick={() => handleSend(s.label)}
                sx={{ 
                  bgcolor: 'rgba(248,250,252,0.03)', 
                  color: 'rgba(251,146,60,0.8)', 
                  border: '1px solid rgba(248,250,252,0.05)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  '&:hover': { bgcolor: 'rgba(251,146,60,0.12)', borderColor: '#FB923C' }
                }} 
              />
            ))}
          </Stack>

          <Paper 
            elevation={0}
            sx={{ 
              p: 1.5, pl: 3, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2,
              bgcolor: 'rgba(30, 41, 59, 0.7)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(248,250,252,0.1)',
              boxShadow: '0 10px 50px rgba(0,0,0,0.3)',
              '&:focus-within': { borderColor: 'primary.main', border: '1px solid rgba(251,146,60,0.4)', bgcolor: 'rgba(30, 41, 59, 0.9)' },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <TextField 
              fullWidth 
              multiline
              maxRows={5}
              placeholder="Posez votre question à Gourmi IQ..."
              variant="standard" 
              value={message}
              onChange={(e) => setMessage(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              InputProps={{ 
                disableUnderline: true, 
                sx: { 
                  color: 'white', 
                  fontWeight: 500, 
                  fontSize: '0.95rem',
                  py: 1
                } 
              }} 
            />

               <IconButton 
                 onClick={() => handleSend()} 
                 disabled={loading || !message.trim()} 
                 sx={{ 
                   alignSelf: 'flex-end', // Aligné en bas si le texte grandit
                   mb: 0.5,
                   bgcolor: 'primary.main', color: 'white', 
                   borderRadius: 2,
                   '&:hover': { bgcolor: 'primary.dark' },
                   '&.Mui-disabled': { bgcolor: 'rgba(248,250,252,0.05)', color: 'rgba(248,250,252,0.1)' },
                   p: 1, transition: 'all 0.2s'
                 }}
               >
                 <SendIcon fontSize="small" />
               </IconButton>
          </Paper>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1.5, color: 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: 0.5 }}>
            GOURMI IQ AI · OPTIMISATION EN TEMPS RÉEL ACTURÉE
          </Typography>
        </Container>
      </Box>

      {/* ── DRAWER D'HISTORIQUE (Temporaire) ───────────────────────── */}
      <Drawer
        anchor="right"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{ 
          sx: { 
            width: 320, bgcolor: 'rgba(10,10,24,0.98)', backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(255,112,67,0.1)', p: 3
          } 
        }}
      >
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 900, color: 'white' }}>Historique</Typography>
        <List>
          {sessions.map((s, idx) => (
            <ListItem 
              key={idx} 
              button 
              onClick={() => { fetchHistory(s.sessionId); setSidebarOpen(false); }}
              sx={{ borderRadius: 3, mb: 1, '&:hover': { bgcolor: 'rgba(255,112,67,0.1)' } }}
            >
              <ListItemIcon sx={{ color: '#FB923C', minWidth: 40 }}><ChatIcon fontSize="small" /></ListItemIcon>
              <ListItemText 
                primary={<Typography variant="body2" sx={{ fontWeight: 700, color: 'white' }} noWrap>{s.sessionTitle}</Typography>} 
                secondary={<Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)' }}>{new Date(s.timestamp || Date.now()).toLocaleDateString()}</Typography>}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Snackbar open={notif.open} autoHideDuration={4000} onClose={() => setNotif({ ...notif, open: false })}>
        <Alert severity={notif.severity} variant="filled" sx={{ width: '100%', borderRadius: 4, fontWeight: 700 }}>{notif.msg}</Alert>
      </Snackbar>
    </Box>
    </ThemeProvider>
  );
};

export default AIDashboard;
