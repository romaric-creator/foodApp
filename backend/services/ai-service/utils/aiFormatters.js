/**
 * 🛠️ Utilitaires de formatage pour l'IA
 */

function formatTableMarkdown(rows, title = 'Résultats') {
  if (!rows || rows.length === 0) return `*Aucun résultat trouvé*`;
  
  const headers = Object.keys(rows[0]);
  const colWidths = headers.map(h => Math.max(h.length, ...rows.map(r => String(r[h] || '').length)));
  
  const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ');
  const separator = colWidths.map(w => '-'.repeat(w)).join(' | ');
  
  const dataRows = rows.slice(0, 20).map(row => 
    headers.map((h, i) => String(row[h] ?? '').padEnd(colWidths[i])).join(' | ')
  ).join('\n');
  
  return `### ${title}\n| ${headerRow} |\n| ${separator} |\n| ${dataRows} |\n\n*${rows.length} résultat(s)*`;
}

function formatChartData(rows, type = 'bar') {
  if (!rows || rows.length === 0) return null;
  
  const keys = Object.keys(rows[0]);
  const labels = rows.map(r => Object.values(r)[0]);
  const values = rows.map(r => Object.values(r)[1]);
  
  return { 
    type, 
    data: { 
      labels, 
      datasets: [{ 
        label: keys[1], 
        data: values, 
        backgroundColor: type === 'pie' 
          ? ['#FB923C', '#FDBA74', '#FFEDD5', '#0EA5E9', '#38BDF8'] // Palette progressive Corail + Azur
          : '#FB923C',
        borderColor: '#1E293B',
        borderWidth: 1
      }] 
    } 
  };
}

function detectIntent(message) {
  const msg = message.toLowerCase().trim();
  
  // 1. Priorité absolue aux suggestions et conseils
  const suggestionKeywords = ['propose', 'idée', 'quel plat', 'quel menu', 'suggestion', 'conseille', 'qu\'est-ce que', 'que manger'];
  if (suggestionKeywords.some(kw => msg.includes(kw))) return 'conversational';

  // 2. Intentions d'actions de création
  const creationKeywords = ['ajoute', 'créer', 'nouveau plat', 'nouveau menu', 'mettre au menu'];
  if (creationKeywords.some(kw => msg.includes(kw))) return 'creation';
  
  // 3. Intentions analytiques
  const analyticalKeywords = [
    'analyse', 'rapport', 'vente', 'chiffre', 'stat', 'graphe', 'graphique', 
    'chart', 'évolution', 'compar', 'historique', 'top', 'meilleur', 'pire', 
    'perte', 'profit', 'revenu', 'croissance', 'bilan', 'tableau', 'audit'
  ];
  if (analyticalKeywords.some(kw => msg.includes(kw))) return 'analytical';
  
  return 'conversational';
}

module.exports = {
  formatTableMarkdown,
  formatChartData,
  detectIntent
};
