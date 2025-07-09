import { Test, TestingModule } from '@nestjs/testing';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

describe('CountryController', () => {
  let controller: CountryController;
  let countryService: jest.Mocked<CountryService>;

  const mockCountry = {
    id: 1,
    name: 'Vietnam',
    code: 'VN',
    phoneCode: '+84',
  };

  const mockCountries = [mockCountry];

  const mockCreateCountryDto: CreateCountryDto = {
    name: 'United States',
    code: 'US',
    phoneCode: '+1',
  };

  const mockUpdateCountryDto: UpdateCountryDto = {
    name: 'United States of America',
    phoneCode: '+1',
  };

  beforeEach(async () => {
    const mockCountryService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountryController],
      providers: [
        {
          provide: CountryService,
          useValue: mockCountryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CountryController>(CountryController);
    countryService = module.get(CountryService) as jest.Mocked<CountryService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a country successfully', async () => {
      countryService.create.mockResolvedValue(mockCountry);

      const result = await controller.create(mockCreateCountryDto);

      expect(countryService.create).toHaveBeenCalledWith(mockCreateCountryDto);
      expect(result).toEqual(mockCountry);
    });

    it('should handle country creation errors', async () => {
      const error = new Error('Country creation failed');
      countryService.create.mockRejectedValue(error);

      await expect(controller.create(mockCreateCountryDto)).rejects.toThrow(
        'Country creation failed',
      );
    });

    it('should require admin role for country creation', async () => {
      countryService.create.mockResolvedValue(mockCountry);

      const result = await controller.create(mockCreateCountryDto);

      expect(result).toEqual(mockCountry);
      expect(countryService.create).toHaveBeenCalledWith(mockCreateCountryDto);
    });

    it('should handle duplicate country codes', async () => {
      const duplicateError = new Error('Country code already exists');
      countryService.create.mockRejectedValue(duplicateError);

      await expect(controller.create(mockCreateCountryDto)).rejects.toThrow(
        'Country code already exists',
      );
    });

    it('should validate country code format', async () => {
      const invalidCountryDto = {
        ...mockCreateCountryDto,
        code: 'INVALID_CODE',
      };

      const error = new Error('Invalid country code format');
      countryService.create.mockRejectedValue(error);

      await expect(controller.create(invalidCountryDto)).rejects.toThrow(
        'Invalid country code format',
      );
    });
  });

  describe('findAll', () => {
    it('should return all countries', async () => {
      countryService.findAll.mockResolvedValue(mockCountries);

      const result = await controller.findAll();

      expect(countryService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCountries);
    });

    it('should return empty array when no countries exist', async () => {
      countryService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(countryService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      countryService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findOne', () => {
    it('should return a country by id', async () => {
      const countryId = '1';
      countryService.findOne.mockResolvedValue(mockCountry);

      const result = await controller.findOne(countryId);

      expect(countryService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCountry);
    });

    it('should handle non-existent country', async () => {
      const countryId = '999';
      countryService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(countryId);

      expect(countryService.findOne).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });

    it('should handle invalid id format', async () => {
      const invalidId = 'invalid';
      countryService.findOne.mockResolvedValue(null);

      const result = await controller.findOne(invalidId);

      expect(countryService.findOne).toHaveBeenCalledWith(NaN);
      expect(result).toBeNull();
    });

    it('should handle service errors', async () => {
      const countryId = '1';
      const error = new Error('Database error');
      countryService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(countryId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('update', () => {
    it('should update a country successfully', async () => {
      const countryId = '1';
      const updatedCountry = { ...mockCountry, ...mockUpdateCountryDto };
      countryService.update.mockResolvedValue(updatedCountry);

      const result = await controller.update(countryId, mockUpdateCountryDto);

      expect(countryService.update).toHaveBeenCalledWith(
        1,
        mockUpdateCountryDto,
      );
      expect(result).toEqual(updatedCountry);
    });

    it('should require admin role for country update', async () => {
      const countryId = '1';
      const updatedCountry = { ...mockCountry, ...mockUpdateCountryDto };
      countryService.update.mockResolvedValue(updatedCountry);

      const result = await controller.update(countryId, mockUpdateCountryDto);

      expect(result).toEqual(updatedCountry);
      expect(countryService.update).toHaveBeenCalledWith(
        1,
        mockUpdateCountryDto,
      );
    });

    it('should handle non-existent country update', async () => {
      const countryId = '999';
      const error = new Error('Country not found');
      countryService.update.mockRejectedValue(error);

      await expect(
        controller.update(countryId, mockUpdateCountryDto),
      ).rejects.toThrow('Country not found');
    });

    it('should handle partial updates', async () => {
      const countryId = '1';
      const partialUpdate: UpdateCountryDto = { name: 'Updated Name Only' };
      const updatedCountry = { ...mockCountry, name: 'Updated Name Only' };
      countryService.update.mockResolvedValue(updatedCountry);

      const result = await controller.update(countryId, partialUpdate);

      expect(countryService.update).toHaveBeenCalledWith(1, partialUpdate);
      expect(result).toEqual(updatedCountry);
    });

    it('should handle update validation errors', async () => {
      const countryId = '1';
      const error = new Error('Validation failed');
      countryService.update.mockRejectedValue(error);

      await expect(
        controller.update(countryId, mockUpdateCountryDto),
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('remove', () => {
    it('should remove a country successfully', async () => {
      const countryId = '1';
      countryService.remove.mockResolvedValue(mockCountry);

      const result = await controller.remove(countryId);

      expect(countryService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCountry);
    });

    it('should require admin role for country removal', async () => {
      const countryId = '1';
      countryService.remove.mockResolvedValue(mockCountry);

      const result = await controller.remove(countryId);

      expect(result).toEqual(mockCountry);
      expect(countryService.remove).toHaveBeenCalledWith(1);
    });

    it('should handle non-existent country removal', async () => {
      const countryId = '999';
      const error = new Error('Country not found');
      countryService.remove.mockRejectedValue(error);

      await expect(controller.remove(countryId)).rejects.toThrow(
        'Country not found',
      );
    });

    it('should handle country with dependencies', async () => {
      const countryId = '1';
      const error = new Error('Cannot delete country with existing campaigns');
      countryService.remove.mockRejectedValue(error);

      await expect(controller.remove(countryId)).rejects.toThrow(
        'Cannot delete country with existing campaigns',
      );
    });

    it('should handle service errors during removal', async () => {
      const countryId = '1';
      const error = new Error('Database error');
      countryService.remove.mockRejectedValue(error);

      await expect(controller.remove(countryId)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
