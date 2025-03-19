import { Body, Controller, Post } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';
import { Get, Param } from '@nestjs/common';


@Controller('showtimes')
export class ShowtimesController {
    constructor(private readonly showtimesService: ShowtimesService) { }

    @Get('/:showtimeId')
    async getShowtimeById(
        @Param('showtimeId') showtimeId: number
    ){
        return await this.showtimesService.getShowtimeById(showtimeId)
    }

    @Post()
    async addShowtime(@Body() createShowtimeDto: CreateShowtimeDto) {
        // cool logic
        return await this.showtimesService.addShowtime(createShowtimeDto)
    }

    @Post('/update/:showtimeid')
    async updateShowtime(
        @Param('showtimeId') showtimeId: number,
        @Body() updateShowtimeDto: UpdateShowtimeDto
    ){
        await this.showtimesService.updateShowTime(showtimeId, updateShowtimeDto)
    }
    
    @Delete('/:showtimeId')
    async deleteShowtime(@Param('showtimeId') showtimeId: number){
        await this.showtimesService.deleteShowtime(showtimeId)
    }
}
