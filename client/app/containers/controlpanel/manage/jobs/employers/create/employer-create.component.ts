import { HttpParams } from '@angular/common/http';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CPSession } from '../../../../../../session';
import { CPI18nService } from '../../../../../../shared/services/i18n.service';
import { IEmployer } from '../employer.interface';
import { EmployerService } from '../employer.service';

@Component({
  selector: 'cp-employer-create',
  templateUrl: './employer-create.component.html',
  styleUrls: ['./employer-create.component.scss']
})
export class EmployerCreateComponent implements OnInit {
  @ViewChild('createForm') createForm;

  @Output() created: EventEmitter<IEmployer> = new EventEmitter();
  @Output() resetCreateModal: EventEmitter<null> = new EventEmitter();

  buttonData;
  employerForm: FormGroup;

  constructor(
    public el: ElementRef,
    public fb: FormBuilder,
    public session: CPSession,
    public cpI18n: CPI18nService,
    public service: EmployerService
  ) {}

  @HostListener('document:click', ['$event'])
  onClick(event) {
    // out of modal reset form
    if (event.target.contains(this.el.nativeElement)) {
      this.resetModal();
    }
  }

  resetModal() {
    this.resetCreateModal.emit();
    this.createForm.employerForm.reset();
    $('#createModal').modal('hide');
  }

  onSubmit() {
    const search = new HttpParams().append('school_id', this.session.g.get('school').id);

    this.service.createEmployer(this.employerForm.value, search).subscribe((employer: any) => {
      this.created.emit(employer);
      this.resetModal();
    });
  }

  ngOnInit() {
    this.employerForm = this.fb.group({
      name: [null, [Validators.required, Validators.maxLength(120)]],
      description: [null],
      logo_url: [null, Validators.required],
      email: [null]
    });

    this.buttonData = Object.assign({}, this.buttonData, {
      class: 'primary',
      disabled: true,
      text: this.cpI18n.translate('save')
    });

    this.employerForm.valueChanges.subscribe(() => {
      this.buttonData = { ...this.buttonData, disabled: !this.employerForm.valid };
    });
  }
}