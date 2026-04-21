const { formatTableMarkdown, formatChartData, detectIntent } = require('../../services/ai-service/utils/aiFormatters');

describe('AI Formatters & Logic - Unit Tests', () => {
  
  describe('detectIntent', () => {
    it('doit détecter une intention de création', () => {
      expect(detectIntent('Ajoute le plat Ndolé au menu')).toBe('creation');
    });

    it('doit détecter une intention analytique', () => {
      expect(detectIntent('Fais-moi un rapport de ventes')).toBe('analytical');
    });

    it('doit détecter une intention conversationnelle par défaut', () => {
      expect(detectIntent('Bonjour, comment vas-tu ?')).toBe('conversational');
    });
  });

  describe('formatTableMarkdown', () => {
    it('doit générer un tableau markdown valide à partir d\'objets', () => {
      const data = [{ plat: 'Ndolé', prix: 5000 }, { plat: 'Koki', prix: 3000 }];
      const table = formatTableMarkdown(data, 'Prix');
      expect(table).toContain('| Ndolé | 5000 |');
      expect(table).toContain('### Prix');
    });

    it('doit gérer les données vides', () => {
      const table = formatTableMarkdown([]);
      expect(table).toContain('Aucun résultat trouvé');
    });
  });

  describe('formatChartData', () => {
    it('doit structurer les données pour Chart.js', () => {
      const data = [{ label: 'Jan', val: 10 }, { label: 'Feb', val: 20 }];
      const chart = formatChartData(data, 'line');
      expect(chart.type).toBe('line');
      expect(chart.data.labels).toEqual(['Jan', 'Feb']);
      expect(chart.data.datasets[0].data).toEqual([10, 20]);
    });
  });
});
