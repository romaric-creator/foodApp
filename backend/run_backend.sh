#!/bin/bash
echo "🛑 Arrêt des services existants..."
fuser -k 5000/tcp 5001/tcp 5002/tcp 5003/tcp 5004/tcp 5005/tcp 5006/tcp 5007/tcp 5008/tcp || true
sleep 2
echo "🚀 Démarrage de Gourmi IQ (Full Stack)..."
npm start
