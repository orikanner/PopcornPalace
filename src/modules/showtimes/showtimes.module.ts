import { Module } from '@nestjs/common';
import { ShowtimesController } from './showtimes.controller';
import { ShowtimesService } from './showtimes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showtime } from './entities/showtime.entity';
import { Movie } from '../movies/entities/movie.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Showtime,
      Movie
    ])
  ],
  controllers: [ShowtimesController],
  providers: [ShowtimesService]
})
export class ShowtimesModule {}
