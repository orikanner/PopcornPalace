import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from '../bookings.controller';
import { BookingsService } from '../bookings.service';
import { createTicketBookingDtoMock } from './mocks/booking-dto.mock';
import { createBookingMock } from './mocks/booking.mock';

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: BookingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: {
            bookTicket: jest.fn(),
          }
        }
      ]
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Success cases', () => {
    it('should book a ticket', async () => {
      const bookTicketDto = createTicketBookingDtoMock();
      const booking = createBookingMock({ ...bookTicketDto });
      
      jest.spyOn(service, 'bookTicket').mockResolvedValue(booking.bookingId);
      const result = await controller.bookTicket(bookTicketDto);
      
      expect(service.bookTicket).toHaveBeenCalledWith(bookTicketDto);
      expect(result).toBe(booking.bookingId);
    });
  });
});
