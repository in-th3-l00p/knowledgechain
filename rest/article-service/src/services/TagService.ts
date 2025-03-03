import prisma from '../utils/prisma';
import { Tag, Prisma } from '@prisma/client';
import { getProducer } from '../utils/kafka';
import logger from '../utils/logger';
import slugify from 'slugify';

class TagService {
  private async publishTagEvent(topic: string, payload: any) {
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
      logger.error('Failed to publish tag event:', error);
    }
  }

  private generateSlug(name: string): string {
    return slugify(name, {
      lower: true,
      strict: true,
      trim: true
    });
  }

  async createTag(data: Prisma.TagCreateInput): Promise<Tag> {
    // Generate slug from name
    const slug = this.generateSlug(data.name);
    
    // Check if tag with name or slug already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name: data.name },
          { slug }
        ]
      }
    });

    if (existingTag) {
      logger.info(`Tag already exists with name: ${data.name}`);
      throw new Error('Tag already exists');
    }

    const tag = await prisma.tag.create({
      data: {
        ...data,
        slug
      },
      include: {
        articles: true
      }
    });

    logger.info(`Created new tag: ${tag.name}`);
    await this.publishTagEvent('tag.created', { tag });
    return tag;
  }

  async getTagById(id: string): Promise<Tag | null> {
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        articles: true
      }
    });

    if (tag) {
      logger.info(`Fetched tag with ID: ${id}`);
      await this.publishTagEvent('tag.retrieved', { id, tag });
    }
    return tag;
  }

  async getTagBySlug(slug: string): Promise<Tag | null> {
    const tag = await prisma.tag.findUnique({
      where: { slug },
      include: {
        articles: true
      }
    });

    if (tag) {
      logger.info(`Fetched tag with slug: ${slug}`);
      await this.publishTagEvent('tag.retrieved', { slug, tag });
    }
    return tag;
  }

  async getAllTags(
    skip?: number,
    take?: number,
    orderBy?: Prisma.TagOrderByWithRelationInput
  ): Promise<Tag[]> {
    const tags = await prisma.tag.findMany({
      skip,
      take,
      orderBy: orderBy || { name: 'asc' },
      include: {
        articles: true
      }
    });

    logger.info(`Fetched ${tags.length} tags`);
    await this.publishTagEvent('tag.retrieved.all', { count: tags.length });
    return tags;
  }

  async updateTag(id: string, data: Prisma.TagUpdateInput): Promise<Tag> {
    const existingTag = await this.getTagById(id);
    if (!existingTag) {
      logger.info(`Update failed: Tag not found with ID: ${id}`);
      throw new Error('Tag not found');
    }

    // If name is being updated, generate new slug
    if (data.name) {
      const slug = this.generateSlug(data.name as string);
      data.slug = slug;

      // Check if new name/slug already exists
      const duplicateTag = await prisma.tag.findFirst({
        where: {
          OR: [
            { name: data.name as string },
            { slug }
          ],
          NOT: { id }
        }
      });

      if (duplicateTag) {
        logger.info(`Update failed: Tag already exists with name: ${data.name}`);
        throw new Error('Tag already exists');
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data,
      include: {
        articles: true
      }
    });

    logger.info(`Updated tag with ID: ${id}`);
    await this.publishTagEvent('tag.updated', { id, updates: data, tag });
    return tag;
  }

  async deleteTag(id: string): Promise<Tag> {
    const existingTag = await this.getTagById(id);
    if (!existingTag) {
      logger.info(`Delete failed: Tag not found with ID: ${id}`);
      throw new Error('Tag not found');
    }

    const tag = await prisma.tag.delete({
      where: { id },
      include: {
        articles: true
      }
    });

    logger.info(`Deleted tag with ID: ${id}`);
    await this.publishTagEvent('tag.deleted', { id, tag });
    return tag;
  }

  async countTags(): Promise<number> {
    const count = await prisma.tag.count();
    logger.info(`Counted total tags: ${count}`);
    await this.publishTagEvent('tag.counted', { count });
    return count;
  }
}

const tagService = new TagService();
export default tagService; 