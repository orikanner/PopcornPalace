import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
    constructor(
        @InjectRepository(Movie) // Injects a TypeORM repository for the Movie entity into the service.
        private moviesRepository: Repository<Movie>,
    ) { }

    /**
     * Get all movies from the database.
     * If something goes wrong, returns an InternalServerErrorException.
     */
    async findAll(): Promise<Movie[]> {
        try {
            return await this.moviesRepository.find();
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve movies');
        }
    }

    /**
     * Add a new movie.
     * Map dto to entity.
     * Save the movie to the db
     * If something fails in the DB, an InternalServerErrorException is thrown.
     */
    async addMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
        try {
            const newMovie = this.moviesRepository.create(createMovieDto);
            return await this.moviesRepository.save(newMovie);
        } catch (error) {
            throw new InternalServerErrorException('Could not save the movie.');
        }
    }

    /**
     * Update an existing movie by title.
     * If the movie is not found, throws NotFoundException.
     * If the update fails, throws InternalServerErrorException.
     */
    async updateMovie(movieTitle: string, updateData: UpdateMovieDto): Promise<void> {
        const movie = await this.moviesRepository.findOne({ where: { title: movieTitle } });
        if (!movie) throw new NotFoundException(`Movie with title "${movieTitle}" not found.`);

        try {
            Object.assign(movie, updateData);
            await this.moviesRepository.save(movie);
        } catch (error) {
            throw new InternalServerErrorException('Something went wrong while updating the movie.');
        }
    }

    /**
     * Delete a movie by title.
     * If the movie does not exist, throws NotFoundException.
     * If something fails while deleting, throws InternalServerErrorException.
     */
    async deleteMovie(movieTitle: string): Promise<void> {
        const movie = await this.moviesRepository.findOne({ where: { title: movieTitle } });
        if (!movie) throw new NotFoundException(`Movie with title "${movieTitle}" not found.`);

        try {
            await this.moviesRepository.delete({ title: movieTitle });
        } catch (error) {
            throw new InternalServerErrorException('Something went wrong while deleting the movie.');
        }
    }
}
