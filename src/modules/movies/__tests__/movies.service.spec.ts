import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from '../movies.service';
import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';

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
      // Arrange
      const mockMovies: Movie[] = [
        { id: 1, title: 'Star Wars', genre: 'Sci-Fi', duration: 120, rating: 9.5, releaseYear: 2000 },
        { id: 2, title: 'The Godfather', genre: 'Drama', duration: 175, rating: 9.2, releaseYear: 1972 }
      ];
      jest.spyOn(repository, 'find').mockResolvedValue(mockMovies);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockMovies);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should add a new movie successfully', async () => {
      // Arrange
      const createMovieDto: CreateMovieDto = {
        title: 'Inception',
        genre: 'Sci-Fi',
        duration: 148,
        rating: 8.8,
        releaseYear: 2010
      };
      const createdMovie = { id: 3, ...createMovieDto };
      
      jest.spyOn(repository, 'create').mockReturnValue(createdMovie);
      jest.spyOn(repository, 'save').mockResolvedValue(createdMovie);

      // Act
      const result = await service.addMovie(createMovieDto);

      // Assert
      expect(result).toEqual(createdMovie);
      expect(repository.create).toHaveBeenCalledWith(createMovieDto);
      expect(repository.save).toHaveBeenCalledWith(createdMovie);
    });

    it('should update an existing movie successfully', async () => {
      // Arrange
      const movieTitle = 'The Matrix';
      const existingMovie = { 
        id: 4, 
        title: movieTitle, 
        genre: 'Sci-Fi', 
        duration: 136, 
        rating: 8.7, 
        releaseYear: 1999 
      };
      const updateMovieDto: UpdateMovieDto = {
        genre: 'Action Sci-Fi',
        rating: 9.0
      };
      
      jest.spyOn(repository, 'findOne').mockResolvedValue(existingMovie);
      jest.spyOn(repository, 'save').mockResolvedValue({ ...existingMovie, ...updateMovieDto });

      // Act
      await service.updateMovie(movieTitle, updateMovieDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: movieTitle } });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        ...existingMovie,
        ...updateMovieDto
      }));
    });

    it('should delete a movie successfully', async () => {
      // Arrange
      const movieTitle = 'Titanic';
      const movieToDelete = { 
        id: 5, 
        title: movieTitle, 
        genre: 'Drama', 
        duration: 195, 
        rating: 7.9, 
        releaseYear: 1997 
      };
      
      jest.spyOn(repository, 'findOne').mockResolvedValue(movieToDelete);
      jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

      // Act
      await service.deleteMovie(movieTitle);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: movieTitle } });
      expect(repository.delete).toHaveBeenCalledWith({ title: movieTitle });
    });
  });



  // XXXXXX FAILURE TESTS XXXXXX

  describe('Failure cases', () => {
    it('should throw InternalServerErrorException when findAll fails', async () => {
      // Arrange
      jest.spyOn(repository, 'find').mockRejectedValue(new Error('Database connection error'));

      // Act & Assert
      await expect(service.findAll()).rejects.toThrow(InternalServerErrorException);
      expect(repository.find).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException when addMovie fails', async () => {
      // Arrange
      const createMovieDto: CreateMovieDto = {
        title: 'Failed Movie',
        genre: 'Horror',
        duration: 90,
        rating: 6.5,
        releaseYear: 2020
      };
      
      jest.spyOn(repository, 'create').mockReturnValue({ ...createMovieDto, id: 999 });
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Database save error'));

      // Act & Assert
      await expect(service.addMovie(createMovieDto)).rejects.toThrow(InternalServerErrorException);
      expect(repository.create).toHaveBeenCalledWith(createMovieDto);
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when updating a non-existent movie', async () => {
      // Arrange
      const nonExistentTitle = 'Non Existent Movie';
      const updateMovieDto: UpdateMovieDto = { rating: 10 };
      
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateMovie(nonExistentTitle, updateMovieDto)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: nonExistentTitle } });
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when movie update fails', async () => {
      // Arrange
      const movieTitle = 'Problematic Movie';
      const existingMovie = { 
        id: 6, 
        title: movieTitle, 
        genre: 'Drama', 
        duration: 110, 
        rating: 7.0, 
        releaseYear: 2015 
      };
      const updateMovieDto: UpdateMovieDto = { duration: 120 };
      
      jest.spyOn(repository, 'findOne').mockResolvedValue(existingMovie);
      jest.spyOn(repository, 'save').mockRejectedValue(new Error('Database update error'));

      // Act & Assert
      await expect(service.updateMovie(movieTitle, updateMovieDto)).rejects.toThrow(InternalServerErrorException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: movieTitle } });
      expect(repository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when deleting a non-existent movie', async () => {
      // Arrange
      const nonExistentTitle = 'Another Non Existent Movie';
      
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteMovie(nonExistentTitle)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: nonExistentTitle } });
      expect(repository.delete).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when movie deletion fails', async () => {
      // Arrange
      const movieTitle = 'DeleteError Movie';
      const existingMovie = { 
        id: 7, 
        title: movieTitle, 
        genre: 'Comedy', 
        duration: 95, 
        rating: 8.0, 
        releaseYear: 2018 
      };
      
      jest.spyOn(repository, 'findOne').mockResolvedValue(existingMovie);
      jest.spyOn(repository, 'delete').mockRejectedValue(new Error('Database delete error'));

      // Act & Assert
      await expect(service.deleteMovie(movieTitle)).rejects.toThrow(InternalServerErrorException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { title: movieTitle } });
      expect(repository.delete).toHaveBeenCalledWith({ title: movieTitle });
    });
  });
});