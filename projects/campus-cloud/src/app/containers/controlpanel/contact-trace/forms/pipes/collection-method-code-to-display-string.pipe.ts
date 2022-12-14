import { Pipe, PipeTransform } from '@angular/core';
import { CollectionMethod } from '@controlpanel/contact-trace/forms/models';

@Pipe({
  name: 'collectionMethodCodeToDisplayString'
})
export class CollectionMethodCodeToDisplayStringPipe implements PipeTransform {
  private collectionMethodToDisplayStringMap: { [key: number]: string } = {
    [CollectionMethod.app]: 'contact_trace_forms_app',
    [CollectionMethod.web]: 'contact_trace_forms_web'
  };

  transform(code: CollectionMethod): string {
    return code && this.collectionMethodToDisplayStringMap[code]
      ? this.collectionMethodToDisplayStringMap[code]
      : '';
  }
}
