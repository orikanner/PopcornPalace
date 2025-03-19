import { Module } from '@nestjs/common';
import { ShowtimesController } from './showtimes.controller';
import { ShowtimesService } from './showtimes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showtime } from './entities/showtime.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Showtime])],
  controllers: [ShowtimesController],
  providers: [ShowtimesService]
})
export class ShowtimesModule {}
