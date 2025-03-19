import { Controller, Get, Post, Delete, Body, Param, BadRequestException } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) { }

    @Get('/all')
    async findAll() {
        return await this.moviesService.findAll();
    }

    @Post()
    async addMovie(@Body() createMovieDto: CreateMovieDto) {
        return await this.moviesService.addMovie(createMovieDto);
    }

    @Post('/update/:movieTitle')
    async updateMovie(
        @Param('movieTitle') movieTitle: string,
        @Body() updateMovieDto: UpdateMovieDto
    ): Promise<void> {
        if (!movieTitle) { // this custom error doesnt work because nest expect a string
            // maybe i can do movieTitle: string | undefined this will force to enter the route handler
            // need to check this... 
            throw new BadRequestException('Movie title is required in the URL.');
        }
        await this.moviesService.updateMovie(movieTitle, updateMovieDto);
    }

    @Delete(':movieTitle')
    async deleteMovie(@Param('movieTitle') movieTitle: string): Promise<void> {
        if (!movieTitle) {
            throw new BadRequestException('Movie title is required in the URL.');
        }
        await this.moviesService.deleteMovie(movieTitle);
    }
}
