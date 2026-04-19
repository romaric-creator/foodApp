import express from 'express';
import { getRecommendations } from '../services/recommendationService.js';
import axios from 'axios';

const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    let userHistory = [];
    let menu = [];

    try {
      const ordersResponse = await axios.get(
        `http://localhost:5004/api/orders/user/${userId}`,
        { timeout: 5000 }
      );
      userHistory = ordersResponse.data;
    } catch (err) {
      console.log('Orders fetch failed:', err.message);
    }

    try {
      const menuResponse = await axios.get(
        'http://localhost:5003/api/menus/all',
        { timeout: 5000 }
      );
      menu = menuResponse.data;
    } catch (err) {
      console.log('Menu fetch failed:', err.message);
    }

    const recommendations = await getRecommendations(
      userId,
      userHistory,
      menu,
      global.redisClient
    );

    res.json({
      success: true,
      recommendations,
      generated_at: new Date()
    });
  } catch (error) {
    console.error('Recommendation error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;