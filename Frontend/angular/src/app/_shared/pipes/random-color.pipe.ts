import { Pipe, PipeTransform } from "@angular/core"

@Pipe({
  name: 'color'
})
export class ColorPipe implements PipeTransform {

  transform(index: number): any {
    switch( index) {
      case 0 : return "rgba(193, 234, 208, 0.5)"
      case 1 : return "rgba(240, 236, 203, 0.5)"
      case 2 : return "rgba(203, 240, 233, 0.5)"
      case 3 : return "rgba(161, 224, 255, 0.5)"
      case 4 : return "rgba(208, 190, 227, 0.5)"
      case 5 : return "rgba(224, 240, 203, 0.5)"
      case 6 : return "rgba(203, 240, 233, 0.5)"
      default: return "rgba(193, 234, 208, 0.5)"
    }
  }

}


@Pipe({
  name: 'image'
})
export class ImagePipe implements PipeTransform {

  transform(index: number): any {
    switch( index) {
      case 0 : return "/assets/img/ca.svg"
      case 1 : return "/assets/img/cb.svg"
      case 2 : return "/assets/img/cc.svg"
      case 3 : return "/assets/img/cd.svg"
      case 4 : return "/assets/img/ce.svg"
      case 5 : return "/assets/img/cf.svg"
      case 6 : return "/assets/img/cc.svg"
      default: return "/assets/img/ca.svg)"
    }
  }

}
