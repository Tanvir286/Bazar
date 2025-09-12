import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import { ConfigModule } from '@nestjs/config';
import { CurrentUserMiddleware } from './utility/middleware/current-user.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      load:[appConfig]
    }),
    PrismaModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
