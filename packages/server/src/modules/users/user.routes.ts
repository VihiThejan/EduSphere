import { Router } from 'express';

const router = Router();

// User routes will be implemented here
// For now, just a placeholder

router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint' });
});

export default router;
