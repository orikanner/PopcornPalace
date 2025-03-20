import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { DataSource } from 'typeorm';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';

@Injectable()
export class ShowtimesService {
    constructor(
        @InjectRepository(Showtime)
        private showtimeRepository: Repository<Showtime>,
        private readonly dataSource: DataSource
    ) { }

    // for testing purposes
    async getAllShowtimes(): Promise<Showtime[]> {
        return await this.showtimeRepository.find()
    }

    /**
     * Get showtime by id from the database.
     * If the showtime is not found, throws NotFoundException.
     */
    async getShowtimeById(showtimeId: number): Promise<Showtime> {
        try {
            const showtime = await this.showtimeRepository.findOne({ where: { id: showtimeId } })
            if (!showtime) throw new NotFoundException(`Showtime with id: "${showtimeId}" not found.`)

            return showtime
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error
            }
            throw new InternalServerErrorException('Failed to get showtime');
        }
    }

    /**
     * Add a showtime
     * * Map dto to entity.
     * Save the showtime to the db
     * if something fails in the DB, an InternalServerErrorException is thrown.
     *  //https://typeorm.io/select-query-builder
     */
    async addShowtime(createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
        const { theater, startTime, endTime } = createShowtimeDto;

        this.validate_dates(startTime, endTime);

        try {
            return await this.dataSource.transaction("SERIALIZABLE", async (entityManager) => {
                // Check for overlapping showtimes
                const count = await entityManager.createQueryBuilder(Showtime, 'showtime')
                    .where('showtime.theater = :theater', { theater })
                    .andWhere(new Brackets((qb) => { // cool syntax unnecessary though.. added () around "related Time where-s"
                        qb.where('showtime.startTime <= :endTime', { endTime })
                            .andWhere('showtime.endTime >= :startTime', { startTime });
                    }))
                    .getCount();

                if (count > 0) {
                    throw new BadRequestException('At the requested time there is already a showtime scheduled in this theater');
                }
                const newShowtime = entityManager.create(Showtime, createShowtimeDto);
                return await entityManager.save(newShowtime);
            });

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error; // Forward expected validation error
            }
            throw new InternalServerErrorException('Failed to create showtime');
        }
    }


    /**
     * Update an existingshowtime
     * If the showtime is not found, throws NotFoundException.
     * If the update fails, throws InternalServerErrorException.
     */
    async updateShowTime(showtimeId: number, updateShowtimeDto: UpdateShowtimeDto) {
        try {
            return await this.dataSource.transaction("SERIALIZABLE", async (entityManager) => {
                // Find the showtime to update
                const showtime = await entityManager.createQueryBuilder(Showtime, 'showtime')
                    .setLock('pessimistic_write') // This is basicly FOR UPDATE I used it to lock the row so it wont be deleted while we are updating it || concurrency bothered me idk :)
                    .where('showtime.id = :showtimeId', { showtimeId })
                    .getOne()
                if (!showtime) throw new NotFoundException(`Showtime with id "${showtimeId}" not found.`)

                // Only check confilcts if updateShowtimeDto contains theater, startTime or endTime
                if (updateShowtimeDto.theater || updateShowtimeDto.startTime || updateShowtimeDto.endTime) {
                    const { theater, startTime, endTime } = updateShowtimeDto
                    this.validate_dates(startTime, endTime);

                    const count_overlapping = await entityManager.createQueryBuilder(Showtime, 'showtime')
                        .where('showtime.theater = :theater', { theater })
                        .andWhere('showtime.startTime <= :endTime', { endTime })
                        .andWhere('showtime.endTime >= :startTime', { startTime })
                        .andWhere('NOT(showtime.id = :showtimeId)', { showtimeId })
                        .getCount(); //remove self maybe need to check 
                    if (count_overlapping > 0) {
                        throw new BadRequestException('At the requested time there is already a showtime scheduled in this theater');
                    }
                }

                const updatedShowtime = { ...showtime, ...updateShowtimeDto }
                const updatedShowtimeEntity = entityManager.create(Showtime, updatedShowtime);
                return await entityManager.save(updatedShowtimeEntity)
            })

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error
            }
            throw new InternalServerErrorException('Failed to update showtime');
        }
    }

    /**
     * Delete a showtime
     * gets showtimeId 
     * * If the showtime does not exist, throws NotFoundException.
     * If something fails while deleting, throws InternalServerErrorException.
     */
    async deleteShowtime(showtimeId: number) {
        try {
            const showtime = await this.showtimeRepository.findOne({ where: { id: showtimeId } })
            if (!showtime) throw new NotFoundException(`Showtime with id "${showtimeId}" not found.`);

            await this.showtimeRepository.delete({ id: showtimeId })
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error
            }
            throw new InternalServerErrorException('Failed to delete showtime');
        }

    }
    private validate_dates(startTime: Date, endTime: Date) {
        if (new Date(startTime) >= new Date(endTime)) {
            throw new BadRequestException("Start time can't be after endTime")
        }
    }
    private error_handler(error: HttpException, def_msg: string) {
        if (error instanceof NotFoundException || error instanceof BadRequestException) {
            throw error
        }
        throw new InternalServerErrorException(def_msg)
    }
}
