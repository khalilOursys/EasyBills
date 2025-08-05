import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CustomRequest } from 'src/types/expressRequest.interface';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @UseGuards(JwtAuthGuard) // Ensure the user is authenticated
  @Get('findAllByUserId')
  findAllByUserId(@Req() req: CustomRequest) {
    const userId = req.user.id; // Extract user ID from request
    return this.notificationService.findAllByUserId(userId);
  }
}
