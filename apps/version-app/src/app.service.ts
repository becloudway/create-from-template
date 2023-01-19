import { Injectable } from '@nestjs/common';
import versions from './versions.json';

@Injectable()
export class AppService {
  getVersions(): { services: { [index: string]: string } } {
    return versions;
  }
}
