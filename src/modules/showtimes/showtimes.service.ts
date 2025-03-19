import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto } from './dto/create-showtime.dto';

@Injectable()
export class ShowtimesService {
    constructor(
        @InjectRepository(Showtime)
        private showtimeRepository: Repository<Showtime>
    ) { }

    /**
     * Get showtime by id from the database.
     * If the showtime is not found, throws NotFoundException.
     */
    async getShowtimeById(showtimeId: number): Promise<Showtime> {
        try {
            const showtime = await this.showtimeRepository.findOne({ where: { id: showtimeId } })
            if (!showtime) throw new NotFoundException(`Showtime with id: "${showtime} not found."`)

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
     * 
     *  //https://typeorm.io/select-query-builder
     */
    async addShowtime(createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
        try {
            let { theater, startTime, endTime } = createShowtimeDto
            // clean theater from sql injection .where("user.name = :name", { name: "Timber" })
            const queryRunner = this.showtimeRepository.createQueryRunner()
            const count = await this.showtimeRepository // data source
                .createQueryBuilder('showtime')
                .where('showtime.theater == :theater', { theater })
                .andWhere(new Brackets((qb) => { 
                    // Cool syntax unnecessary though.. added () around "related Time where-s"
                    // could have been usefull for extra configuration like adding if statement
                    // for example, if a show ends in 9, and another starts at 9 are can allow this type of minor overlap(getting this param)
                    qb.where('showtime.startTime <= :endTime', {
                        endTime
                    }).andWhere('showtime.endTime >= :startTime', { startTime })

                }))
                .getCount()

            if (count > 0) throw new BadRequestException('There is already a showtime scheduled in this theater at this time');
            const newShowtime = this.showtimeRepository.create(createShowtimeDto) // Create does not generate the id
            return await this.showtimeRepository.save(newShowtime) // This does

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            }
            throw new InternalServerErrorException('Failed to create showtime');
        }
    }


    /**
     * Update an existingshowtime
     * If the showtime is not found, throws NotFoundException.
     * If the update fails, throws InternalServerErrorException.
     * 
     * 
     */


    /**
     * Delete a showtime
     * gets showtimeId 
     * * If the showtime does not exist, throws NotFoundException.
     * If something fails while deleting, throws InternalServerErrorException.
     */


}
