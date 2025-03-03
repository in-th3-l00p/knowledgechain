import prisma from '../utils/prisma';
import { Wallet, Prisma } from '@prisma/client';
import { getProducer } from '../utils/kafka';
import logger from '../utils/logger';

class WalletService {
  private async publishWalletEvent(topic: string, payload: any) {
    try {
      const producer = getProducer();
      await producer.send({
        topic,
        messages: [
          { 
            value: JSON.stringify({
              timestamp: new Date().toISOString(),
              ...payload
            })
          },
        ],
      });
    } catch (error) {
      logger.error('Failed to publish wallet event:', error);
    }
  }

  async createWallet(data: Prisma.WalletCreateInput): Promise<Wallet> {
    // Check if wallet address is already registered
    const existingWallet = await this.getWalletByAddress(data.address);
    if (existingWallet) {
      logger.info(`Wallet address already registered: ${data.address}`);
      throw new Error('Wallet address already registered');
    }

    // Check if user already has a wallet
    const existingUserWallet = await this.getWalletByUserId(data.user.connect?.id as string);
    if (existingUserWallet) {
      logger.info(`User already has a wallet: ${data.user.connect?.id}`);
      throw new Error('User already has a wallet');
    }

    const wallet = await prisma.wallet.create({ data });
    logger.info(`Created new wallet for user: ${wallet.userId}, address: ${wallet.address}`);
    await this.publishWalletEvent('wallet.created', { wallet });
    return wallet;
  }

  async getWalletById(id: string): Promise<Wallet | null> {
    const wallet = await prisma.wallet.findUnique({
      where: { id },
      include: { user: true }
    });
    if (wallet) {
      logger.info(`Fetched wallet with ID: ${id}`);
      await this.publishWalletEvent('wallet.retrieved', { id, wallet });
    } else {
      logger.info(`Wallet not found with ID: ${id}`);
    }
    return wallet;
  }

  async getWalletByAddress(address: string): Promise<Wallet | null> {
    const wallet = await prisma.wallet.findUnique({
      where: { address },
      include: { user: true }
    });
    if (wallet) {
      logger.info(`Fetched wallet with address: ${address}`);
      await this.publishWalletEvent('wallet.retrieved', { address, wallet });
    }
    return wallet;
  }

  async getWalletByUserId(userId: string): Promise<Wallet | null> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { user: true }
    });
    if (wallet) {
      logger.info(`Fetched wallet for user: ${userId}`);
      await this.publishWalletEvent('wallet.retrieved', { userId, wallet });
    }
    return wallet;
  }

  async updateWallet(id: string, data: Prisma.WalletUpdateInput): Promise<Wallet> {
    const existingWallet = await this.getWalletById(id);
    if (!existingWallet) {
      logger.info(`Update failed: Wallet not found with ID: ${id}`);
      throw new Error('Wallet not found');
    }

    if (data.address && data.address !== existingWallet.address) {
      const existingAddress = await this.getWalletByAddress(data.address as string);
      if (existingAddress) {
        logger.info(`Update failed: Wallet address already registered: ${data.address}`);
        throw new Error('Wallet address already registered');
      }
    }

    const wallet = await prisma.wallet.update({
      where: { id },
      data,
      include: { user: true }
    });
    logger.info(`Updated wallet with ID: ${id}, address: ${wallet.address}`);
    await this.publishWalletEvent('wallet.updated', { id, updates: data, wallet });
    return wallet;
  }

  async deleteWallet(id: string): Promise<Wallet> {
    const existingWallet = await this.getWalletById(id);
    if (!existingWallet) {
      logger.info(`Delete failed: Wallet not found with ID: ${id}`);
      throw new Error('Wallet not found');
    }

    const wallet = await prisma.wallet.delete({
      where: { id },
      include: { user: true }
    });
    logger.info(`Deleted wallet with ID: ${id}`);
    await this.publishWalletEvent('wallet.deleted', { id, wallet });
    return wallet;
  }

  async countWallets(): Promise<number> {
    const count = await prisma.wallet.count();
    logger.info(`Counted total wallets: ${count}`);
    await this.publishWalletEvent('wallet.counted', { count });
    return count;
  }
}

const walletService = new WalletService();
export default walletService; 