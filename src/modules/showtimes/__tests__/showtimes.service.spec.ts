import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimesService } from '../showtimes.service';
import { Repository } from 'typeorm';
import { Showtime } from '../entities/showtime.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from 'src/modules/movies/entities/movie.entity';
import { createShowtimeDtoMock, updateShowtimeDtoMock } from './mocks/showtime-dto.mock';
import { createShowtimeMock } from './mocks/showtime.mock';
import { DataSource } from 'typeorm';

describe('ShowtimesService', () => {
  let service: ShowtimesService;
  let showtimeRepository: Repository<Showtime>;
  let movieRepository: Repository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimesService,
        {
          provide: getRepositoryToken(Showtime),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              setLock: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getOne: jest.fn(),
              getCount: jest.fn()
            }))
          }
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            findOne: jest.fn()
          }
        }
        // {
        //   provide: DataSource,
        //   useValue: {
        //     transaction: jest.fn((isolationLevel, callback) => callback({
        //       createQueryBuilder: jest.fn(() => ({
        //         where: jest.fn().mockReturnThis(),
        //         andWhere: jest.fn().mockReturnThis(),
        //         getCount: jest.fn().mockResolvedValue(0)
        //       })),
        //       create: jest.fn(),
        //       save: jest.fn()
        //     }))
        //   }
        // }
      ]
    }).compile();

    service = module.get<ShowtimesService>(ShowtimesService);
    showtimeRepository = module.get<Repository<Showtime>>(getRepositoryToken(Showtime));
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  describe('Success Cases', () => {
    it('getShowtimeById - should retrieve showtime by ID', async () => {
      const showtime = createShowtimeMock({ id: 1 });
      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(showtime);

      const result = await service.getShowtimeById(1);

      expect(result).toEqual(showtime);
      expect(showtimeRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  describe('Failure Cases', () => {
    it('getShowtimeById - should throw error when showtime ID not found', async () => {
      const showtime = createShowtimeMock({ id: 1 });
      jest.spyOn(showtimeRepository, 'findOne').mockResolvedValue(showtime);

      const result = await service.getShowtimeById(2);

      expect(result).toEqual(showtime);
      expect(showtimeRepository.findOne).toHaveBeenCalledWith({ where: { id: 2 } });
    });

    it('addShowtime - should reject when movie release date is in the future', async () => {
      const createShowtimeDto = createShowtimeDtoMock({
        startTime: new Date('2024-08-06T10:00:00'),
        endTime: new Date('2024-08-06T11:30:00')
      });
      const movie = {
        id: 1,
        duration: 90,
        releaseYear: 2025
      } as Movie;

      jest.spyOn(movieRepository, 'findOne').mockResolvedValue(movie);

      await expect(service.addShowtime(createShowtimeDto))
        .rejects
        .toThrow('Showtime cannot be scheduled before movie\'s release year');
    });
  });
});
