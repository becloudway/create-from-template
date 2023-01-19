import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { getCurrentDate } from '@cloudway-template/utils';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): { response: string } {
    return { response: this.appService.getHello() };
  }

  @Get('/hello/:name')
  getHelloName(@Param('name') name: string): { response: string } {
    return { response: this.appService.getHelloName(name) };
  }

  @Post('/hello')
  postHello(@Body() body: { foo: string }): { foo: string; date: string } {
    return { foo: body.foo, date: getCurrentDate() };
  }
}
