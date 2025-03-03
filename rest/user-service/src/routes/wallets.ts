import express from 'express';
import walletService from '../services/WalletService';
import { Prisma } from '@prisma/client';
import { body, param } from 'express-validator';
import { validate } from "../middleware/validate";

const router = express.Router();

// Get wallet by user ID
router.get('/user/:userId',
  [
    param('userId')
      .isUUID()
      .withMessage('User ID must be a valid UUID')
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const wallet = await walletService.getWalletByUserId(req.params.userId);
      if (!wallet) {
        res.status(404).json({ error: 'Wallet not found for this user' });
        return;
      }
      res.json(wallet);
    } catch (_) {
      res.status(500).json({ error: 'Failed to fetch wallet' });
    }
  }
);

// Create new wallet
router.post('/',
  [
    body('address')
      .isString()
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid Ethereum wallet address'),
    body('userId')
      .isUUID()
      .withMessage('User ID must be a valid UUID')
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const walletData: Prisma.WalletCreateInput = {
        address: req.body.address,
        user: {
          connect: { id: req.body.userId }
        }
      };
      const newWallet = await walletService.createWallet(walletData);
      res.status(201).json(newWallet);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Wallet address already registered' || 
            error.message === 'User already has a wallet') {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      res.status(500).json({ error: 'Failed to create wallet' });
    }
  }
);

// Get wallet by ID
router.get('/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Wallet ID must be a valid UUID')
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const wallet = await walletService.getWalletById(req.params.id);
      if (!wallet) {
        res.status(404).json({ error: 'Wallet not found' });
        return;
      }
      res.json(wallet);
    } catch (_) {
      res.status(500).json({ error: 'Failed to fetch wallet' });
    }
  }
);

// Update wallet
router.put('/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Wallet ID must be a valid UUID'),
    body('address')
      .optional()
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid Ethereum wallet address')
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      const walletData: Prisma.WalletUpdateInput = {
        address: req.body.address
      };
      const updatedWallet = await walletService.updateWallet(id, walletData);
      res.json(updatedWallet);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Wallet not found') {
          res.status(404).json({ error: error.message });
          return;
        }
        if (error.message === 'Wallet address already registered') {
          res.status(400).json({ error: error.message });
          return;
        }
      }
      res.status(500).json({ error: 'Failed to update wallet' });
    }
  }
);

// Delete wallet
router.delete('/:id',
  [
    param('id')
      .isUUID()
      .withMessage('Wallet ID must be a valid UUID')
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const { id } = req.params;
      await walletService.deleteWallet(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Wallet not found') {
        res.status(404).json({ error: 'Wallet not found' });
        return;
      }
      res.status(500).json({ error: 'Failed to delete wallet' });
    }
  }
);

// Get wallet by address
router.get('/address/:address',
  [
    param('address')
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Invalid Ethereum wallet address')
  ],
  validate,
  async (req: express.Request, res: express.Response) => {
    try {
      const wallet = await walletService.getWalletByAddress(req.params.address);
      if (!wallet) {
        res.status(404).json({ error: 'Wallet not found' });
        return;
      }
      res.json(wallet);
    } catch (_) {
      res.status(500).json({ error: 'Failed to fetch wallet' });
    }
  }
);

export default router; 