import { Showtime } from 'src/modules/showtimes/entities/showtime.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, Unique } from 'typeorm';

@Entity()
@Unique(['showtimeId', 'seatNumber'])
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    bookingId: number;

    @Column()
    showtimeId: number;

    @ManyToOne(() => Showtime, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'showtimeId' })
    showtime: Showtime;

    @Column()
    seatNumber: number

    @Column({ type: 'uuid' })
    userId: string
}
