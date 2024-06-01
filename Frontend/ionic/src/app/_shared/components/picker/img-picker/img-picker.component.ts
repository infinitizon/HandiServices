import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-img-picker',
  templateUrl: './img-picker.component.html',
  styleUrls: ['./img-picker.component.scss'],
})
export class ImgPickerComponent  implements OnInit {
  @ViewChild('filePicker')
  filePicker!: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<File>;
  selectedImg = '/assets/images/no-user.png';
  useFilePicker = false;

  constructor(private platform: Platform) { }

  ngOnInit() {
    console.log('Mobile:', this.platform.is('mobile'));
    console.log('Hybrid:', this.platform.is('hybrid'));
    console.log('iOS:', this.platform.is('ios'));
    console.log('Android:', this.platform.is('android'));
    console.log('Desktop:', this.platform.is('desktop'));
    if((this.platform.is('mobile') && !this.platform.is('hybrid')) || this.platform.is('desktop')) {
      this.useFilePicker = true;
    }
  }

  onPickImage() {
    console.log(`What's going on here`);

    if(!Capacitor.isPluginAvailable('Camera') || this.useFilePicker) {
      this.filePicker.nativeElement.click()

      return;
    }
    const image = Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      width: 200, height: 320,
      // allowEditing: true,
      resultType: CameraResultType.DataUrl
    }).then(image => {
      this.selectedImg = image.dataUrl || '';
      console.log(image.dataUrl);

      this.imagePick.emit(this.dataURLtoFile(image.dataUrl, 'image'))
    }).catch(error=>{
      console.log(error);
      return false;
    })

    // // image.webPath will contain a path that can be set as an image src.
    // // You can access the original file using image.path, which can be
    // // passed to the Filesystem API to read the raw data of the image,
    // // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
    // var imageUrl = image.webPath;

    // // Can be set to the src of an image now
    // // imageElement.src = imageUrl;
  }
  onFileChosen(event: Event) {
    const pickedFile = ((event!.target! as HTMLInputElement)?.files as FileList)[0];
    if(!pickedFile) return;

    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result?.toString();
      this.selectedImg = dataUrl || '';
      this.imagePick.emit(pickedFile)
    }
    fr.readAsDataURL(pickedFile)
  }
  dataURLtoFile(dataurl: any, filename: string): File {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }
}
