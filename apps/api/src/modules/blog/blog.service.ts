import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  async findAll(branchId: number) {
    return this.prisma.blogPost.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async create(branchId: number, dto: CreateBlogDto) {
    return this.prisma.blogPost.create({
      data: {
        branchId,
        title: dto.title,
        content: dto.content,
        isPublished: dto.isPublished ?? false,
      },
    });
  }

  async update(id: number, dto: Partial<CreateBlogDto>) {
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
  }

  async delete(id: number) {
    return this.prisma.blogPost.delete({ where: { id } });
  }
}
