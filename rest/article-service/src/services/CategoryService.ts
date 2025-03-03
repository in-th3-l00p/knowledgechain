import prisma from '../utils/prisma';
import { Category, Prisma } from '@prisma/client';
import { getProducer } from '../utils/kafka';
import logger from '../utils/logger';
import slugify from 'slugify';

class CategoryService {
  private async publishCategoryEvent(topic: string, payload: any) {
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
      logger.error('Failed to publish category event:', error);
    }
  }

  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      trim: true
    });
  }

  async createCategory(data: Prisma.CategoryCreateInput): Promise<Category> {
    const slug = this.generateSlug(data.name);
    
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug }
        ]
      }
    });

    if (existingCategory) {
      logger.info(`Category already exists with name: ${data.name}`);
      throw new Error('Category already exists');
    }

    const category = await prisma.category.create({
      data: {
        ...data,
        slug
      },
      include: {
        parent: true,
        children: true,
        articles: true
      }
    });

    logger.info(`Created new category: ${category.name}`);
    await this.publishCategoryEvent('category.created', { category });
    return category;
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        articles: true
      }
    });

    if (category) {
      logger.info(`Fetched category with ID: ${id}`);
      await this.publishCategoryEvent('category.retrieved', { id, category });
    }
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: true,
        children: true,
        articles: true
      }
    });

    if (category) {
      logger.info(`Fetched category with slug: ${slug}`);
      await this.publishCategoryEvent('category.retrieved', { slug, category });
    }
    return category;
  }

  async getAllCategories(
    skip?: number,
    take?: number,
    orderBy?: Prisma.CategoryOrderByWithRelationInput
  ): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      skip,
      take,
      orderBy: orderBy || { name: 'asc' },
      include: {
        parent: true,
        children: true,
        articles: true
      }
    });

    logger.info(`Fetched ${categories.length} categories`);
    await this.publishCategoryEvent('category.retrieved.all', { count: categories.length });
    return categories;
  }

  async getRootCategories(): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: true,
        articles: true
      }
    });

    logger.info(`Fetched ${categories.length} root categories`);
    await this.publishCategoryEvent('category.retrieved.roots', { count: categories.length });
    return categories;
  }

  async getChildCategories(parentId: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { parentId },
      include: {
        children: true,
        articles: true
      }
    });

    logger.info(`Fetched ${categories.length} child categories for parent: ${parentId}`);
    await this.publishCategoryEvent('category.retrieved.children', { parentId, count: categories.length });
    return categories;
  }

  async updateCategory(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    const existingCategory = await this.getCategoryById(id);
    if (!existingCategory) {
      logger.info(`Update failed: Category not found with ID: ${id}`);
      throw new Error('Category not found');
    }

    if (data.name) {
      const slug = this.generateSlug(data.name as string);
      data.slug = slug;

      const duplicateCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { name: data.name as string },
            { slug }
          ],
          NOT: { id }
        }
      });

      if (duplicateCategory) {
        logger.info(`Update failed: Category already exists with name: ${data.name}`);
        throw new Error('Category already exists');
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data,
      include: {
        parent: true,
        children: true,
        articles: true
      }
    });

    logger.info(`Updated category with ID: ${id}`);
    await this.publishCategoryEvent('category.updated', { id, updates: data, category });
    return category;
  }

  async deleteCategory(id: string): Promise<Category> {
    const existingCategory = await this.getCategoryById(id);
    if (!existingCategory) {
      logger.info(`Delete failed: Category not found with ID: ${id}`);
      throw new Error('Category not found');
    }

    const category = await prisma.category.delete({
      where: { id },
      include: {
        parent: true,
        children: true,
        articles: true
      }
    });

    logger.info(`Deleted category with ID: ${id}`);
    await this.publishCategoryEvent('category.deleted', { id, category });
    return category;
  }

  async countCategories(): Promise<number> {
    const count = await prisma.category.count();
    logger.info(`Counted total categories: ${count}`);
    await this.publishCategoryEvent('category.counted', { count });
    return count;
  }
}

const categoryService = new CategoryService();
export default categoryService; 