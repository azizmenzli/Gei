import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {GraphQLModule} from '@nestjs/graphql';
import { join } from 'path';
@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // Auto-generate schema file
      sortSchema: true, // Sort schema for better readability
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
