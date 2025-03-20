import { Controller, Get, Post, Delete, Body, Param, BadRequestException, HttpCode } from '@nestjs/common';
import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { UpdateShowtimeDto } from './dto/update-showtime.dto';

@Controller('showtimes')
export class ShowtimesController {
    constructor(private readonly showtimesService: ShowtimesService) {}
    @Get()
    async getAllShowtimes(){
        return await this.showtimesService.getAllShowtimes()
    }

    @Get('/:showtimeId')
    @HttpCode(200)
    async getShowtimeById(
        @Param('showtimeId') showtimeId: number
    ){
        return await this.showtimesService.getShowtimeById(showtimeId)
    }

    @Post()
    @HttpCode(200)
    async addShowtime(@Body() createShowtimeDto: CreateShowtimeDto) {
        // cool logic
        return await this.showtimesService.addShowtime(createShowtimeDto)
    }

    @Post('/update/:showtimeId')
    @HttpCode(200)
    async updateShowtime(
        @Param('showtimeId') showtimeId: number,
        @Body() updateShowtimeDto: UpdateShowtimeDto
    ){
        await this.showtimesService.updateShowTime(showtimeId, updateShowtimeDto)
    }
    
    @Delete('/:showtimeId')
    @HttpCode(200)
    async deleteShowtime(@Param('showtimeId') showtimeId: number){
        await this.showtimesService.deleteShowtime(showtimeId)
    }
}
