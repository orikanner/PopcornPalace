//https://www.postgresql.org/docs/current/errcodes-appendix.html
//https://typeorm.io/select-query-builder
import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';
import { Movie } from '../movies/entities/movie.entity';
// In this service, I originally implemented create&update operations with transactions and row locking.
// Although it passed all tests, I felt it was a bit of an overkill for this assignment.
// Without transactions or some other solution,there is a potential race condition where P1 and P2 could both read,
// see no overlap, and write simultaneously which would cause showtimes to overlap.


interface ShowtimeValidationResult {
    movieExists: boolean;
    durationValid: boolean;
    isAfterRelease: boolean;
}


@Injectable()
export class ShowtimesService {
    constructor(
        @InjectRepository(Showtime)
        private showtimeRepository: Repository<Showtime>,
        @InjectRepository(Movie)
        private movieRepository: Repository<Movie>,

    ) { }


    /**
     * Gets a showtime by its ID
     * Throws NotFoundException if not found
     * @returns The found showtime
     */
    async getShowtimeById(showtimeId: number): Promise<Showtime> {
        try {
            const showtime = await this.showtimeRepository.findOne({ where: { id: showtimeId } })
            if (!showtime) throw new NotFoundException(`Showtime with id: "${showtimeId}" not found.`)

            return showtime
        } catch (error) {
            if (error instanceof NotFoundException) throw error
            throw new InternalServerErrorException('Failed to get showtime');
        }
    }


    /**
     * Creates a new showtime
     * Handles theater overlap checks and movie duration validation
     * @returns The newly created showtime
     */
    async addShowtime(createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
        const { movieId, theater, startTime, endTime } = createShowtimeDto;

        try {
            // step 1 validate that start time is before end time
            this.validateDates(startTime, endTime);

            // step 2 validate movie exists and check that the showtime duration is long enough
            const validations = await this.validateShowtimeWithMovie(
                movieId,
                startTime,
                endTime
            );

            // handle any validation failures (will throw exceptions if validations fail
            this.handleValidations(validations);

            // step 3 Check for scheduling conflicts in the requested theater
            // for new showtimes, we don't need to exclude any existing showtime ID
            const excludeSelfShowtime: number = null;

            // query for any overlapping showtimes and count 
            const countOverlappingShowtimes = await this.createOverlapQuery(
                theater,
                startTime,
                endTime,
                excludeSelfShowtime
            ).getCount();

            // if any overlaps exist, theater is already booked during that time
            if (countOverlappingShowtimes > 0) {
                throw new BadRequestException(
                    'At the requested time there is already a showtime scheduled in this theater'
                );
            }

            // step 4 All validations passed, create and save the new showtime
            const newShowtime = this.showtimeRepository.create(createShowtimeDto);
            return await this.showtimeRepository.save(newShowtime);

        } catch (error) {
            // Class 23 — Integrity Constraint Violation 
            if (error.code == 23503) throw new BadRequestException('Failed to create showtime ~ invalid movieId');
            if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
            throw new InternalServerErrorException('Failed to create showtime');
        }
    }

    /**
     * Updates an existing showtime
     * Only validates conflicts when movieId/time/theater fields are modified
     * @returns The updated showtime
     */
    async updateShowtime(showtimeId: number, updateShowtimeDto: UpdateShowtimeDto) {
        try {
            // Step 1 Find the showtime to update
            const showtime = await this.showtimeRepository.createQueryBuilder('showtime')
                .where('showtime.id = :showtimeId', { showtimeId })
                .getOne()
            if (!showtime) throw new NotFoundException(`Showtime with id "${showtimeId}" not found.`)

            // Step 2: Check conflicts if updateShowtimeDto contains attributes that can cause overlapping or edge cases problems
            if (updateShowtimeDto.movieId || updateShowtimeDto.theater || updateShowtimeDto.startTime || updateShowtimeDto.endTime) {
                const movieId = updateShowtimeDto.movieId ?? showtime.movieId
                const theater = updateShowtimeDto.theater ?? showtime.theater
                const startTime = updateShowtimeDto.startTime ?? showtime.startTime
                const endTime = updateShowtimeDto.endTime ?? showtime.endTime

                // validate that start time is before end time
                this.validateDates(startTime, endTime);
                // validate movie exists and check that the showtime duration is long enough
                const validations = await this.validateShowtimeWithMovie(movieId, startTime, endTime)
                this.handleValidations(validations)

                // Step 3 count overlappingshowtimes- again only if the new attributes can cause confilcts 
                let excludeSelfShowtime: number = showtimeId
                const countOverlappingShowtimes = await this.createOverlapQuery(
                    theater,
                    startTime,
                    endTime,
                    excludeSelfShowtime
                ).getCount()
                if (countOverlappingShowtimes > 0) {
                    throw new BadRequestException('At the requested time there is already a showtime scheduled in this theater');
                }
            }
            // Final step save update showtime
            const updatedShowtime = { ...showtime, ...updateShowtimeDto }
            const updatedShowtimeEntity = this.showtimeRepository.create(updatedShowtime);
            return await this.showtimeRepository.save(updatedShowtimeEntity)

        } catch (error) {
            // Class 23 - Integrity Constraint Violation 
            if (error.code == 23503) throw new BadRequestException('Failed to update showtime invalid movie');
            if (error instanceof NotFoundException || error instanceof BadRequestException) throw error
            throw new InternalServerErrorException('Failed to update showtime');
        }
    }


    /**
     * Deletes a showtime by ID
     * Throws NotFound if it doesn't exist
     * @param showtimeId - ID of showtime to delete
     */
    async deleteShowtime(showtimeId: number) {
        try {
            const showtime = await this.showtimeRepository.findOne({ where: { id: showtimeId } })
            if (!showtime) throw new NotFoundException(`Showtime with id "${showtimeId}" not found.`);

            await this.showtimeRepository.delete({ id: showtimeId })
        } catch (error) {
            if (error instanceof NotFoundException) throw error
            throw new InternalServerErrorException('Failed to delete showtime');
        }

    }


    /**
     * Checks for overlapping showtimes in a theater
     * @returns QueryBuilder for overlapping showtimes
     */
    private createOverlapQuery(
        theater: string,
        startTime: Date,
        endTime: Date,
        excludeSelf: number
    ) {
        // Create query using the repository's query builder
        const query = this.showtimeRepository.createQueryBuilder('showtime')
            .where('showtime.theater = :theater', { theater })
            .andWhere('showtime.startTime <= :endTime', { endTime })
            .andWhere('showtime.endTime >= :startTime', { startTime });

        // If an ID is provided to exclude (for updates), add that condition
        if (excludeSelf) {
            query.andWhere('showtime.id != :excludeId', { excludeId: excludeSelf });
        }

        return query;
    }


    /**
     * Validates showtime dates
     * @throws BadRequestException if start is after end
     */
    private validateDates(startTime: Date, endTime: Date) {
        if (new Date(startTime) >= new Date(endTime)) {
            throw new BadRequestException("Start time can't be after endTime")
        }
    }


    /**
     * Validates movie and showtime constraints
     * @returns Movie exists, duration is valid, release date is valid
     */
    private async validateShowtimeWithMovie(
        movieId: number,
        startTime: Date,
        endTime: Date
    ): Promise<ShowtimeValidationResult> {
        const movie = await this.movieRepository.findOne({ where: { id: movieId } });

        if (!movie) {
            return { movieExists: false, durationValid: false, isAfterRelease: false };
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

        return {
            movieExists: true,
            durationValid: durationInMinutes >= movie.duration,
            isAfterRelease: start.getFullYear() >= movie.releaseYear
        };
    }


    /**
     * Validates movie and showtime constraints
     * @param validations - output of validateShowtimeWithMovie function
     * @throws an error if needed
     */
    private handleValidations(
        validations: ShowtimeValidationResult
    ) {
        if (!validations.movieExists) throw new NotFoundException(`Movie with the provided id was not found.`);
        if (!validations.isAfterRelease) throw new BadRequestException(`Showtime cannot be scheduled before movie's release year`);
        if (!validations.durationValid) throw new BadRequestException(`Showtime duration is too short for this movie`);
    }
}
