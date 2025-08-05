import { Injectable } from '@nestjs/common';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from 'src/user/entities/user.entity/user.entity';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}
  create(msg: string, location: string, user: User) {
    const newPet = this.notificationRepository.create({
      msg,
      location,
      owner: user,
    });
    return this.notificationRepository.save(newPet);
  }

  async findAllByUserId(userId: number): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { owner: { id: userId } }, // Filter by owner (user)
      relations: ['owner'], // Load the related owner (user) if needed
    });
  }
}
