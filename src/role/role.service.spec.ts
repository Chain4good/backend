import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { RoleRepository } from './role.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

describe('RoleService', () => {
  let service: RoleService;
  let repository: RoleRepository;

  const mockRole = {
    id: 1,
    name: 'USER',
    description: 'Regular user role',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRoleRepo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: RoleRepository,
          useValue: mockRoleRepo,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    repository = module.get<RoleRepository>(RoleRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'ADMIN',
        description: 'Administrator role',
      };

      jest.spyOn(repository, 'create').mockResolvedValue(mockRole);

      const result = await service.create(createRoleDto);

      expect(repository.create).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(mockRole);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const mockRoles = [mockRole];
      jest.spyOn(repository, 'findAll').mockResolvedValue(mockRoles);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockRoles);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const roleId = 1;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockRole);

      const result = await service.findOne(roleId);

      expect(repository.findOne).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(mockRole);
    });
  });

  describe('findOneBy', () => {
    it('should return a role by criteria', async () => {
      const criteria = { name: 'USER' };
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(mockRole);

      const result = await service.findOneBy(criteria);

      expect(repository.findOneBy).toHaveBeenCalledWith(criteria);
      expect(result).toEqual(mockRole);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const roleId = 1;
      const updateRoleDto: UpdateRoleDto = {
        description: 'Updated description',
      };
      const updatedRole = { ...mockRole, ...updateRoleDto };

      jest.spyOn(repository, 'update').mockResolvedValue(updatedRole);

      const result = await service.update(roleId, updateRoleDto);

      expect(repository.update).toHaveBeenCalledWith(roleId, updateRoleDto);
      expect(result).toEqual(updatedRole);
    });
  });

  describe('remove', () => {
    it('should remove a role', async () => {
      const roleId = 1;
      jest.spyOn(repository, 'delete').mockResolvedValue(mockRole);

      const result = await service.remove(roleId);

      expect(repository.delete).toHaveBeenCalledWith(roleId);
      expect(result).toEqual(mockRole);
    });
  });
});
