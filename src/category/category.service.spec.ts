import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepo } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoryService', () => {
  let service: CategoryService;
  let repository: jest.Mocked<CategoryRepo>;

  const mockCategory = {
    id: 1,
    name: 'Health',
    icon: 'health-icon',
    description: 'Health related campaigns',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategories = [mockCategory];

  beforeEach(async () => {
    const mockCategoryRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: CategoryRepo,
          useValue: mockCategoryRepo,
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    repository = module.get(CategoryRepo) as jest.Mocked<CategoryRepo>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Education',
        icon: 'education-icon',
        description: 'Education related campaigns',
      };

      repository.create.mockResolvedValue(mockCategory);

      const result = await service.create(createCategoryDto);

      expect(repository.create).toHaveBeenCalledWith(createCategoryDto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      repository.findAll.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const categoryId = 1;
      repository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOne(categoryId);

      expect(repository.findOne).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const categoryId = 1;
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Health',
        description: 'Updated description',
      };
      const updatedCategory = { ...mockCategory, ...updateCategoryDto };

      repository.update.mockResolvedValue(updatedCategory);

      const result = await service.update(categoryId, updateCategoryDto);

      expect(repository.update).toHaveBeenCalledWith(
        categoryId,
        updateCategoryDto,
      );
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const categoryId = 1;
      repository.delete.mockResolvedValue(mockCategory);

      const result = await service.remove(categoryId);

      expect(repository.delete).toHaveBeenCalledWith(categoryId);
      expect(result).toEqual(mockCategory);
    });
  });
});
