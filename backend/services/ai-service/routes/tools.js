const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth.js');
const { generateMenuDescription, generateSocialPosts } = require('../services/toolsService');
const { researchMenu } = require('../services/researchService');

/**
 * Recherche approfondie sur un plat
 * POST /api/ai/tools/research-menu
 */
router.post('/research-menu', authMiddleware, async (req, res) => {
  const { name, category } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom du plat est requis' });

  try {
    const data = await researchMenu(name, category);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Générer une description de plat
 * POST /api/ai/tools/describe-item
 */
router.post('/describe-item', authMiddleware, async (req, res) => {
  const { name, category, image } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom du plat est requis' });

  try {
    const description = await generateMenuDescription(name, category, image);
    res.json(description);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Générer des posts réseaux sociaux
 * POST /api/ai/tools/social-posts
 */
router.post('/social-posts', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Le nom du plat est requis' });

  try {
    const posts = await generateSocialPosts(name);
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
