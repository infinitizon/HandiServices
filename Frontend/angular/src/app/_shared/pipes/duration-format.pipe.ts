import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat'
})
export class DurationFormatPipe implements PipeTransform {

  transform(value: any, arg1: any, arg2: any): unknown {

    let seconds: any;
    let minutes: any;
    let hours: any;

    if (arg1 === 'ms' && (arg2 === 'hhmmss' || arg2 === 'hhmmssLong')) {
      seconds = Math.floor((value / 1000) % 60);
      minutes = Math.floor(((value / (1000 * 60)) % 60));
      hours = Math.floor((value / (1000 * 60 * 60)));
      return this.format(arg2, seconds, minutes, hours);

    } else if (arg1 === 's' && (arg2 === 'hhmmss' || arg2 === 'hhmmssLong')) {
      seconds = Math.floor((value % 60));
      minutes = Math.floor(((value / 60) % 60));
      hours = Math.floor(((value / 60) / 60));
      return this.format(arg2, seconds, minutes, hours);

    } else {
      return value;
    }
  }

  private format(arg2: any, seconds: any, minutes: any, hours: any): any {
    (hours < 10) ? hours = '0' + hours : hours;
    (minutes < 10) ? minutes = '0' + minutes : minutes;
    (seconds < 10) ? seconds = '0' + seconds : seconds;

    switch (arg2) {
      case 'hhmmss':
        hours = hours + ':';
        minutes = minutes + ':';
        return `${hours}${minutes}${seconds}`;

      case 'hhmmssLong':
        let duration = '';
        if (hours > 0) {
          duration += `${hours} hour${hours > 1? 's' : ''} `;
        }

        if (minutes > 0 || hours > 0) {
          duration += `${minutes} min${minutes > 1? 's' : ''} `;
        }

        if (seconds) {
          duration += `${seconds} sec${seconds > 1? 's' : ''}`;
        }
        return duration;
        // return `${hours} hours, ${minutes} minutes, ${seconds} seconds`;

    }

  }

}
