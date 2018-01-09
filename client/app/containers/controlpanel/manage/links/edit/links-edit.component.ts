import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Headers } from '@angular/http';

import { API } from '../../../../../config/api';
import { LinksService } from '../links.service';
import { appStorage } from '../../../../../shared/utils';
import { FileUploadService } from '../../../../../shared/services';
import { CPI18nService } from './../../../../../shared/services/i18n.service';

import { ILink } from '../link.interface';

declare var $: any;

@Component({
  selector: 'cp-links-edit',
  templateUrl: './links-edit.component.html',
  styleUrls: ['./links-edit.component.scss'],
})
export class LinksEditComponent implements OnInit, OnChanges {
  @Input() link: any;
  @Output() editLink: EventEmitter<ILink> = new EventEmitter();
  @Output() resetEditModal: EventEmitter<null> = new EventEmitter();

  imageError;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public cpI18n: CPI18nService,
    private service: LinksService,
    private fileUploadService: FileUploadService,
  ) {}

  buildForm() {
    this.form = this.fb.group({
      link_url: [this.link.link_url, Validators.required],
      name: [this.link.name, Validators.required],
      school_id: [this.link.school_id, Validators.required],
      description: [this.link.description, Validators.maxLength(512)],
      img_url: [this.link.img_url],
    });
  }

  onFileUpload(file) {
    this.imageError = null;
    const validate = this.fileUploadService.validImage(file);

    if (!validate.valid) {
      this.imageError = validate.errors[0];

      return;
    }

    const headers = new Headers();
    const url = this.service.getUploadImageUrl();
    const auth = `${API.AUTH_HEADER.SESSION} ${appStorage.get(
      appStorage.keys.SESSION,
    )}`;

    headers.append('Authorization', auth);

    this.fileUploadService.uploadFile(file, url, headers).subscribe(
      (res) => {
        this.form.controls['img_url'].setValue(res.image_url);
      },
      (err) => {
        throw new Error(err);
      },
    );
  }

  handleDeleteImage() {
    // empty string otherwise the BE wont know we want to delete it
    this.form.controls['img_url'].setValue('');
  }

  doSubmit() {
    this.service.updateLink(this.form.value, this.link.id).subscribe(
      (res) => {
        this.editLink.emit(res);
        $('#linksEdit').modal('hide');
        this.resetModal();
      },
      (err) => {
        throw new Error(err);
      },
    );
  }

  ngOnChanges() {
    if (this.link) {
      this.buildForm();
    }
  }

  resetModal() {
    this.resetEditModal.emit();
  }

  ngOnInit() {}
}
