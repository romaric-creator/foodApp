import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  IconButton, 
  Paper, 
  Typography, 
  TextField, 
  Avatar, 
  Stack, 
  Fab,
  Zoom,
  CircularProgress
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  Close as CloseIcon, 
  Send as SendIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';
import axios from 'axios';

const ChatWidget = ({ userId, idtable }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'Assistant', content: "Bonjour ! Je suis l'assistant de votre restaurant. Comment puis-je vous aider ?" }
  ]);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message;
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'User', content: userMsg }]);
    setLoading(true);

    try {
      // Appel vers le gateway qui redirige vers ai-service
      const response = await axios.post('/api/ai/chat/client', {
        message: userMsg,
        userId: userId,
        idtable: idtable
      });

      setChatHistory(prev => [...prev, { 
        role: 'Assistant', 
        content: response.data.message 
      }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        role: 'Assistant', 
        content: "Désolé, je rencontre une petite difficulté technique. Pouvez-vous reformuler ?" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <Box sx={{ position: 'fixed', bottom: 80, right: 20, zIndex: 2000 }}>
        <Zoom in={true}>
          <Fab 
            color="primary" 
            onClick={() => setIsOpen(!isOpen)}
            sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            {isOpen ? <CloseIcon /> : <ChatIcon />}
          </Fab>
        </Zoom>
      </Box>

      {/* Fenêtre de chat */}
      <Zoom in={isOpen}>
        <Paper
          elevation={12}
          sx={{
            position: 'fixed',
            bottom: 150,
            right: 20,
            width: { xs: 'calc(100% - 40px)', sm: 350 },
            height: 450,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 2000,
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <BotIcon />
            <Typography variant="subtitle1" fontWeight="bold">Assistant Gourmi</Typography>
          </Box>

          {/* Messages */}
          <Box 
            ref={scrollRef}
            sx={{ 
              flexGrow: 1, 
              p: 2, 
              overflowY: 'auto', 
              bgcolor: '#f8f9fa',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {chatHistory.map((item, idx) => (
              <Box 
                key={idx} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: item.role === 'Assistant' ? 'row' : 'row-reverse',
                  gap: 1,
                  alignItems: 'flex-end'
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 28, 
                    height: 28, 
                    bgcolor: item.role === 'Assistant' ? 'primary.light' : 'grey.400',
                    fontSize: '0.8rem'
                  }}
                >
                  {item.role === 'Assistant' ? <BotIcon sx={{ fontSize: 16 }} /> : 'U'}
                </Avatar>
                <Paper
                  sx={{ 
                    p: 1.5, 
                    maxWidth: '80%', 
                    borderRadius: item.role === 'Assistant' ? '15px 15px 15px 0' : '15px 15px 0 15px',
                    bgcolor: item.role === 'Assistant' ? 'white' : 'primary.main',
                    color: item.role === 'Assistant' ? 'text.primary' : 'white',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}
                >
                  {item.content}
                </Paper>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">Gourmi réfléchit...</Typography>
              </Box>
            )}
          </Box>

          {/* Input */}
          <Box sx={{ p: 1.5, bgcolor: 'white', borderTop: '1px solid #eee', display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Posez une question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              variant="outlined"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 10 } }}
            />
            <IconButton color="primary" onClick={handleSend} disabled={loading || !message.trim()}>
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Zoom>
    </>
  );
};

export default ChatWidget;
