import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
  name: 'momentFormat'
})
export class MomentFormatPipe implements PipeTransform {
  transform(value: Date | moment.Moment, format: string = 'll'): string {
    return moment(value).format(format);
  }
}