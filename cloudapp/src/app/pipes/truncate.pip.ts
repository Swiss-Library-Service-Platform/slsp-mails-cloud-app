import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, chars: number = 50): string {
    return value.length > chars ? value.substr(0, chars) + '...' : value;
  }
}