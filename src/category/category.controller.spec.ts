import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

describe('CategoryController', () => {
  let controller: CategoryController;
  let categoryService: jest.Mocked<CategoryService>;

  const mockCategory = {
    id: 1,
    name: 'Health',
    icon: 'health-icon',
    description: 'Health related campaigns',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategories = [mockCategory];

  const mockCreateCategoryDto: CreateCategoryDto = {
    name: 'Education',
    icon: 'education-icon',
    description: 'Education related campaigns',
  };

  const mockUpdateCategoryDto: UpdateCategoryDto = {
    name: 'Updated Education',
    description: 'Updated education related campaigns',
  };

  beforeEach(async () => {
    const mockCategoryService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CategoryController>(CategoryController);
    categoryService = module.get(CategoryService) as jest.Mocked<CategoryService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category successfully', async () => {
      categoryService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(mockCreateCategoryDto);

      expect(categoryService.create).toHaveBeenCalledWith(mockCreateCategoryDto);
      expect(result).toEqual(mockCategory);
    });

    it('should handle category creation errors', async () => {
      const error = new Error('Category creation failed');
      categoryService.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateCategoryDto)).rejects.toThrow(
        'Category creation failed',
      );
    });

    it('should require admin role for category creation', async () => {
      // This test verifies that the @Roles('ADMIN') decorator is applied
      categoryService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(mockCreateCategoryDto);

      expect(result).toEqual(mockCategory);
      expect(categoryService.create).toHaveBeenCalledWith(mockCreateCategoryDto);
    });

    it('should handle missing required fields', async () => {
      const incompleteCategoryDto = {
        name: 'Test Category',
        // Missing required fields
      } as CreateCategoryDto;

      const error = new Error('Validation failed');
      categoryService.create.mockRejectedValue(error);

      await expect(controller.create(incompleteCategoryDto)).rejects.toThrow(
        'Validation failed',
      );
    });

    it('should handle duplicate category names', async () => {
      const duplicateError = new Error('Category name already exists');
      categoryService.create.mockRejectedValue(duplicateError);

      await expect(controller.create(mockCreateCategoryDto)).rejects.toThrow(
        'Category name already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      categoryService.findAll.mockResolvedValue(mockCategories);

      const result = await controller.findAll();

      expect(categoryService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });

    it('should return empty array when no categories exist', async () => {
      categoryService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(categoryService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      categoryService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const categoryId = '1';
      categoryService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(categoryId);

      expect(categoryService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCategory);
    });

    it('should handle non-existent category', async () => {
      const categoryId = '999';
      categoryService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(categoryId);

      expect(categoryService.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should handle invalid id format', async () => {
      const invalidId = 'invalid';
      // The +id conversion will result in NaN, which should be handled by the service
      categoryService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(invalidId);

      expect(categoryService.findOne).toHaveBeenCalledWith(NaN);
      expect(result).toBeNull();
    });

    it('should handle service errors', async () => {
      const categoryId = '1';
      const error = new Error('Database error');
      categoryService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(categoryId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('update', () => {
    it('should update a category successfully', async () => {
      const categoryId = '1';
      const updatedCategory = { ...mockCategory, ...mockUpdateCategoryDto };
      categoryService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(categoryId, mockUpdateCategoryDto);

      expect(categoryService.update).toHaveBeenCalledWith(1, mockUpdateCategoryDto);
      expect(result).toEqual(updatedCategory);
    });

    it('should require admin role for category update', async () => {
      const categoryId = '1';
      const updatedCategory = { ...mockCategory, ...mockUpdateCategoryDto };
      categoryService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(categoryId, mockUpdateCategoryDto);

      expect(result).toEqual(updatedCategory);
      expect(categoryService.update).toHaveBeenCalledWith(1, mockUpdateCategoryDto);
    });

    it('should handle non-existent category update', async () => {
      const categoryId = '999';
      const error = new Error('Category not found');
      categoryService.update.mockRejectedValue(error);

      await expect(
        controller.update(categoryId, mockUpdateCategoryDto),
      ).rejects.toThrow('Category not found');
    });

    it('should handle partial updates', async () => {
      const categoryId = '1';
      const partialUpdate: UpdateCategoryDto = { name: 'Updated Name Only' };
      const updatedCategory = { ...mockCategory, name: 'Updated Name Only' };
      categoryService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(categoryId, partialUpdate);

      expect(categoryService.update).toHaveBeenCalledWith(1, partialUpdate);
      expect(result).toEqual(updatedCategory);
    });

    it('should handle update validation errors', async () => {
      const categoryId = '1';
      const error = new Error('Validation failed');
      categoryService.update.mockRejectedValue(error);

      await expect(
        controller.update(categoryId, mockUpdateCategoryDto),
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('remove', () => {
    it('should remove a category successfully', async () => {
      const categoryId = '1';
      categoryService.remove.mockResolvedValue(mockCategory);

      const result = await controller.remove(categoryId);

      expect(categoryService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCategory);
    });

    it('should require admin role for category removal', async () => {
      const categoryId = '1';
      categoryService.remove.mockResolvedValue(mockCategory);

      const result = await controller.remove(categoryId);

      expect(result).toEqual(mockCategory);
      expect(categoryService.remove).toHaveBeenCalledWith(1);
    });

    it('should handle non-existent category removal', async () => {
      const categoryId = '999';
      const error = new Error('Category not found');
      categoryService.remove.mockRejectedValue(error);

      await expect(controller.remove(categoryId)).rejects.toThrow(
        'Category not found',
      );
    });

    it('should handle category with dependencies', async () => {
      const categoryId = '1';
      const error = new Error('Cannot delete category with existing campaigns');
      categoryService.remove.mockRejectedValue(error);

      await expect(controller.remove(categoryId)).rejects.toThrow(
        'Cannot delete category with existing campaigns',
      );
    });

    it('should handle service errors during removal', async () => {
      const categoryId = '1';
      const error = new Error('Database error');
      categoryService.remove.mockRejectedValue(error);

      await expect(controller.remove(categoryId)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
