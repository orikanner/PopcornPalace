import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core'; // lAZY LOADING IN NESTJS FUTURE IMPLEMENTATION
import { MoviesModule } from './modules/movies/movies.module';
import { ShowtimesModule } from './modules/showtimes/showtimes.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { Movie } from './modules/movies/entities/movie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',  // If running locally
      port: 5432,
      username: 'popcorn-palace',
      password: 'popcorn-palace',
      database: 'popcorn-palace',
      autoLoadEntities: true,
      entities: [Movie],
      synchronize: true,
    }),
    MoviesModule, ShowtimesModule, BookingsModule
  ],
})
export class AppModule { }
