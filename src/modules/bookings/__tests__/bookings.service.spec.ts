import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from '../bookings.service';
import { Booking } from '../entities/booking.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BookTicketDto } from '../dto/book-ticket.dto';
import { createTicketBookingDtoMock } from './mocks/booking-dto.mock';
import { createBookingMock } from './mocks/booking.mock';
import { ConflictException } from '@nestjs/common';

describe('BookingsService', () => {
  let service: BookingsService;
  let repository: Repository<Booking>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: {
            create: jest.fn(),
            save: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    repository = module.get<Repository<Booking>>(getRepositoryToken(Booking))
  });

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Success cases', () => {
    it('should book a ticket successfully', async () => {
      const bookTicketDto: BookTicketDto = createTicketBookingDtoMock();
      const bookedTicket = createBookingMock({ ...bookTicketDto });

      jest.spyOn(repository, 'create').mockReturnValue(bookedTicket);
      jest.spyOn(repository, 'save').mockResolvedValue(bookedTicket);

      const result = await service.bookTicket(bookTicketDto);
  

      expect(repository.create).toHaveBeenCalledWith(bookTicketDto);
      expect(repository.save).toHaveBeenCalledWith(bookedTicket);
      expect(result).toEqual(bookedTicket.bookingId);
    });
  });

  describe('Failure cases', () => {
    it('should throw ConflictException when seat is taken', async () => {
      const bookTicketDto: BookTicketDto = createTicketBookingDtoMock();
      const bookedTicket = createBookingMock({ ...bookTicketDto });

      jest.spyOn(repository, 'create').mockReturnValue(bookedTicket);
      
      // error mock based on postgresql-kairo
      const error = new Error('Seat already taken');
      (error as any).code = '23505'; 
      jest.spyOn(repository, 'save').mockRejectedValue(error);

      await expect(service.bookTicket(bookTicketDto)).rejects.toThrow(ConflictException);
      expect(repository.create).toHaveBeenCalledWith(bookTicketDto);
      expect(repository.save).toHaveBeenCalledTimes(1);
    });
  });
})
