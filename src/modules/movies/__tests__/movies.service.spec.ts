import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../movies.service';
import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { createMovieMock } from './mocks/movie.mock';
import { createMovieDtoMock, updateMovieDtoMock } from './mocks/movie-dto.mock';

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: Repository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // VVVVVV SUCCESS TESTS VVVVVVV

  describe('Success cases', () => {
    it('should retrieve all movies successfully', async () => {
      const mockMovies: Movie[] = [
        createMovieMock({ id: 1, title: 'Star Wars', genre: 'Sci-Fi' }),
        createMovieMock({ id: 2, title: 'The Godfather', genre: 'Drama' })
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockMovies);

      const result = await service.findAll();

      expect(result).toEqual(mockMovies);
    });

    it('should add a new movie successfully', async () => {
      const createMovieDto: CreateMovieDto = createMovieDtoMock({
        title: 'Fast & Furious 205',
        duration: 144,
        rating: 8.8,
        releaseYear: 2050,
      });

      // const movieWithoutId = { ...createMovieDto} potentially casue create doesnt get an id
      // jest.spyOn(repository, 'create').mockReturnValue(movieWithoutId);

      const createdMovie = createMovieMock({ id: 3, ...createMovieDto });
      jest.spyOn(repository, 'create').mockReturnValue(createdMovie);
      jest.spyOn(repository, 'save').mockResolvedValue(createdMovie);

      const result = await service.addMovie(createMovieDto);

      expect(repository.create).toHaveBeenCalledWith(createMovieDto);
      expect(repository.save).toHaveBeenCalledWith(createdMovie);
      expect(result).toEqual(createdMovie);
    });

    it('should update an existing movie successfully', async () => {
      // Arrange
      const movieTitle = 'The Matrix';
      const existingMovie = createMovieMock({
        id: 4,
        title: movieTitle,
      });

      const updateMovieDto: UpdateMovieDto = updateMovieDtoMock({
        title: 'KAIRO',
        rating: 9.0
      });

      const updatedMovie: Movie = { ...existingMovie, ...updateMovieDto }
      jest.spyOn(repository, 'findOne').mockResolvedValue(existingMovie);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...existingMovie, ...updateMovieDto });

      await service.updateMovie(movieTitle, updateMovieDto);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: movieTitle } });
      expect(repository.save).toHaveBeenCalledWith(updatedMovie)
      // this endpoint doesnt return anything based on the readme file 
      // expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
      //   ...existingMovie,
      //   ...updateMovieDto
      // }));
    });

    it('should delete a movie successfully', async () => {
      const movieTitle = 'Titanic';
      const movieToDelete = createMovieMock({
        id: 125,
        title: movieTitle,
        genre: 'Drama',
        duration: 195,
        rating: 7.9,
        releaseYear: 1997
      });

      jest.spyOn(repository, 'findOne').mockResolvedValue(movieToDelete);
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

      await service.deleteMovie(movieTitle);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: movieTitle } });
      expect(repository.delete).toHaveBeenCalledWith({ title: movieTitle });
    });
  });



  // XXXXXX FAILURE TESTS XXXXXX

  describe('Failure cases', () => {
    it('should throw InternalServerErrorException when findAll fails', async () => {
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Database connection error'));
      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when updating a non-existent movie', async () => {
      const nonExistentTitle = 'Non Existent Movie';
      const updateMovieDto: UpdateMovieDto = updateMovieDtoMock({ rating: 10 });

      jest.spyOn(repository, 'findOne').mockResolvedValue(null); // could not find a movie with this title

      await expect(service.updateMovie(nonExistentTitle, updateMovieDto)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: nonExistentTitle } });
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting a non-existent movie', async () => {
      const nonExistentTitle = 'Another Non Existent Movie';

      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.deleteMovie(nonExistentTitle)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: nonExistentTitle } });
      expect(repository.delete).not.toHaveBeenCalled();
    });

  });
});