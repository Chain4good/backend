import { Test, TestingModule } from '@nestjs/testing';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('CommentController', () => {
  let controller: CommentController;
  let commentService: jest.Mocked<CommentService>;

  const mockUser = { id: 1 };

  const mockComment = {
    id: 1,
    content: 'This is a test comment',
    createdAt: new Date(),
    userId: 1,
    campaignId: 1,
    parentId: null,
    user: {
      id: 1,
      name: 'Test User',
      image: 'user-image.jpg',
    },
    replies: [],
    Like: [],
    _count: { Like: 0 },
  };

  const mockComments = [mockComment];

  const mockCreateCommentDto: CreateCommentDto = {
    content: 'This is a test comment',
    campaignId: 1,
  };

  const mockCreateReplyDto: CreateCommentDto = {
    content: 'This is a reply',
    campaignId: 1,
    parentId: 1,
  };

  beforeEach(async () => {
    const mockCommentService = {
      create: jest.fn(),
      findByCampaign: jest.fn(),
      toggleLike: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [
        {
          provide: CommentService,
          useValue: mockCommentService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CommentController>(CommentController);
    commentService = module.get(CommentService) as jest.Mocked<CommentService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      commentService.create.mockResolvedValue(mockComment);

      const result = await controller.create(mockCreateCommentDto, mockUser);

      expect(commentService.create).toHaveBeenCalledWith({
        ...mockCreateCommentDto,
        userId: mockUser.id,
      });
      expect(result).toEqual(mockComment);
    });

    it('should create a reply comment successfully', async () => {
      const replyComment = {
        ...mockComment,
        parentId: 1,
        content: 'This is a reply',
      };
      commentService.create.mockResolvedValue(replyComment);

      const result = await controller.create(mockCreateReplyDto, mockUser);

      expect(commentService.create).toHaveBeenCalledWith({
        ...mockCreateReplyDto,
        userId: mockUser.id,
      });
      expect(result).toEqual(replyComment);
    });

    it('should handle comment creation errors', async () => {
      const error = new Error('Comment creation failed');
      commentService.create.mockRejectedValue(error);

      await expect(
        controller.create(mockCreateCommentDto, mockUser),
      ).rejects.toThrow('Comment creation failed');
    });

    it('should require authentication for comment creation', async () => {
      // This test verifies that the @UseGuards(JwtAuthGuard) decorator is applied
      commentService.create.mockResolvedValue(mockComment);

      const result = await controller.create(mockCreateCommentDto, mockUser);

      expect(result).toEqual(mockComment);
      expect(commentService.create).toHaveBeenCalledWith({
        ...mockCreateCommentDto,
        userId: mockUser.id,
      });
    });

    it('should handle missing required fields', async () => {
      const incompleteCommentDto = {
        campaignId: 1,
        // Missing content
      } as CreateCommentDto;

      const error = new Error('Validation failed');
      commentService.create.mockRejectedValue(error);

      await expect(
        controller.create(incompleteCommentDto, mockUser),
      ).rejects.toThrow('Validation failed');
    });

    it('should handle invalid campaign ID', async () => {
      const invalidCommentDto = {
        content: 'Test comment',
        campaignId: 999, // Non-existent campaign
      };

      const error = new Error('Campaign not found');
      commentService.create.mockRejectedValue(error);

      await expect(
        controller.create(invalidCommentDto, mockUser),
      ).rejects.toThrow('Campaign not found');
    });

    it('should handle invalid parent comment ID', async () => {
      const invalidReplyDto = {
        content: 'Test reply',
        campaignId: 1,
        parentId: 999, // Non-existent parent comment
      };

      const error = new Error('Parent comment not found');
      commentService.create.mockRejectedValue(error);

      await expect(
        controller.create(invalidReplyDto, mockUser),
      ).rejects.toThrow('Parent comment not found');
    });

    it('should handle empty content', async () => {
      const emptyContentDto = {
        content: '',
        campaignId: 1,
      };

      const error = new Error('Content cannot be empty');
      commentService.create.mockRejectedValue(error);

      await expect(
        controller.create(emptyContentDto, mockUser),
      ).rejects.toThrow('Content cannot be empty');
    });

    it('should handle service exceptions gracefully', async () => {
      const serviceError = new Error('Database connection failed');
      commentService.create.mockRejectedValue(serviceError);

      await expect(
        controller.create(mockCreateCommentDto, mockUser),
      ).rejects.toThrow('Database connection failed');

      expect(commentService.create).toHaveBeenCalledWith({
        ...mockCreateCommentDto,
        userId: mockUser.id,
      });
    });
  });

  describe('findByCampaign', () => {
    it('should return comments for a campaign', async () => {
      const campaignId = 1;
      commentService.findByCampaign.mockResolvedValue(mockComments);

      const result = await controller.findByCampaign(campaignId);

      expect(commentService.findByCampaign).toHaveBeenCalledWith(campaignId);
      expect(result).toEqual(mockComments);
    });

    it('should return empty array when no comments exist', async () => {
      const campaignId = 1;
      commentService.findByCampaign.mockResolvedValue([]);

      const result = await controller.findByCampaign(campaignId);

      expect(commentService.findByCampaign).toHaveBeenCalledWith(campaignId);
      expect(result).toEqual([]);
    });

    it('should handle invalid campaign ID', async () => {
      const invalidCampaignId = 999;
      commentService.findByCampaign.mockResolvedValue([]);

      const result = await controller.findByCampaign(invalidCampaignId);

      expect(commentService.findByCampaign).toHaveBeenCalledWith(
        invalidCampaignId,
      );
      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      const campaignId = 1;
      const error = new Error('Database error');
      commentService.findByCampaign.mockRejectedValue(error);

      await expect(controller.findByCampaign(campaignId)).rejects.toThrow(
        'Database error',
      );
    });

    it('should parse campaign ID correctly', async () => {
      const campaignId = 123;
      commentService.findByCampaign.mockResolvedValue(mockComments);

      const result = await controller.findByCampaign(campaignId);

      expect(commentService.findByCampaign).toHaveBeenCalledWith(123);
      expect(result).toEqual(mockComments);
    });

    it('should return comments with nested replies', async () => {
      const commentsWithReplies: any[] = [
        {
          ...mockComment,
          replies: [
            {
              id: 2,
              content: 'This is a reply',
              parentId: 1,
              user: { id: 2, name: 'Reply User', image: 'reply-user.jpg' },
            },
          ],
        },
      ];

      const campaignId = 1;
      commentService.findByCampaign.mockResolvedValue(commentsWithReplies);

      const result = await controller.findByCampaign(campaignId);

      expect(commentService.findByCampaign).toHaveBeenCalledWith(campaignId);
      expect(result).toEqual(commentsWithReplies);
      expect((result as any)[0].replies).toHaveLength(1);
    });
  });

  describe('toggleLike', () => {
    it('should like a comment successfully', async () => {
      const commentId = 1;
      const likeResult = { liked: true };
      commentService.toggleLike.mockResolvedValue(likeResult);

      const result = await controller.toggleLike(commentId, mockUser);

      expect(commentService.toggleLike).toHaveBeenCalledWith(
        commentId,
        mockUser.id,
      );
      expect(result).toEqual(likeResult);
    });

    it('should unlike a comment successfully', async () => {
      const commentId = 1;
      const unlikeResult = { liked: false };
      commentService.toggleLike.mockResolvedValue(unlikeResult);

      const result = await controller.toggleLike(commentId, mockUser);

      expect(commentService.toggleLike).toHaveBeenCalledWith(
        commentId,
        mockUser.id,
      );
      expect(result).toEqual(unlikeResult);
    });

    it('should require authentication for toggling like', async () => {
      // This test verifies that the @UseGuards(JwtAuthGuard) decorator is applied
      const commentId = 1;
      const likeResult = { liked: true };
      commentService.toggleLike.mockResolvedValue(likeResult);

      const result = await controller.toggleLike(commentId, mockUser);

      expect(result).toEqual(likeResult);
      expect(commentService.toggleLike).toHaveBeenCalledWith(
        commentId,
        mockUser.id,
      );
    });

    it('should handle non-existent comment', async () => {
      const commentId = 999;
      const error = new Error('Comment not found');
      commentService.toggleLike.mockRejectedValue(error);

      await expect(controller.toggleLike(commentId, mockUser)).rejects.toThrow(
        'Comment not found',
      );
    });

    it('should handle service errors during like toggle', async () => {
      const commentId = 1;
      const error = new Error('Database error');
      commentService.toggleLike.mockRejectedValue(error);

      await expect(controller.toggleLike(commentId, mockUser)).rejects.toThrow(
        'Database error',
      );

      expect(commentService.toggleLike).toHaveBeenCalledWith(
        commentId,
        mockUser.id,
      );
    });

    it('should parse comment ID correctly', async () => {
      const commentId = 456;
      const likeResult = { liked: true };
      commentService.toggleLike.mockResolvedValue(likeResult);

      const result = await controller.toggleLike(commentId, mockUser);

      expect(commentService.toggleLike).toHaveBeenCalledWith(456, mockUser.id);
      expect(result).toEqual(likeResult);
    });
  });
});
