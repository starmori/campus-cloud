import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CPSession } from '@campus-cloud/session';
import { AudienceService } from '../audience.service';
import { EnvService } from '@campus-cloud/config/env';
import { Destroyable, Mixin } from '@campus-cloud/shared/mixins';
import { CustomValidators } from '@campus-cloud/shared/validators';
import { FileUploadService, CPI18nService } from '@campus-cloud/shared/services';
import { environment } from '@projects/campus-cloud/src/environments/environment';

@Mixin([Destroyable])
@Component({
  selector: 'cp-audience-import',
  templateUrl: './audience-import.component.html',
  styleUrls: ['./audience-import.component.scss']
})
export class AudienceImportComponent implements OnInit, OnDestroy {
  @Output() error: EventEmitter<null> = new EventEmitter();
  @Output() success: EventEmitter<number> = new EventEmitter();
  @Output() launchCreateModal: EventEmitter<any> = new EventEmitter();

  ready$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  reset$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  users;
  options;
  fileName;
  form: FormGroup;

  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor(
    public fb: FormBuilder,
    private env: EnvService,
    public session: CPSession,
    private cpI18n: CPI18nService,
    public service: AudienceService,
    private fileService: FileUploadService
  ) {}

  parser(file) {
    const url =
      this.env.name !== 'development'
        ? '/announcements/import'
        : 'http://localhost:8000/announcements/import';

    return this.fileService
      .uploadFile(file, url)
      .toPromise()
      .then((res) => {
        this.users = res;

        return Promise.resolve();
      })
      .catch((err) => {
        const serverError = err.error.error;

        return Promise.reject(
          serverError ? serverError : this.cpI18n.translate('something_went_wrong')
        );
      });
  }

  onParsedSuccess() {
    this.form.controls['user_emails'].setValue(this.users.map((user) => user.email));
    this.ready$.next(this.form.valid);
  }

  doReset() {
    this.reset$.next(true);
    this.ready$.next(false);
  }

  doSubmit() {
    const search = new HttpParams().append('school_id', this.session.g.get('school').id.toString());

    this.service.createAudience(this.form.value, search).subscribe(
      (res: any) => {
        this.form.reset();
        this.reset$.next(true);
        this.success.emit(res);
      },
      (err) => this.error.emit(err)
    );
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: [null, CustomValidators.requiredNonEmpty],
      user_emails: [[], Validators.required]
    });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.ready$.next(this.form.valid));

    this.fileName = 'mass_user_upload.csv';

    const templateUrl =
      this.env.name === 'development'
        ? `/assets/templates/${this.fileName}`
        : `${environment.root}assets/templates/${this.fileName}`;

    this.options = {
      templateUrl,
      validExtensions: ['csv'],
      parser: this.parser.bind(this)
    };
  }

  ngOnDestroy() {
    this.emitDestroy();
  }
}
