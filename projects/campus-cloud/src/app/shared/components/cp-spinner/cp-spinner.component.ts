import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'cp-spinner',
  templateUrl: './cp-spinner.component.html',
  styleUrls: ['./cp-spinner.component.scss']
})
export class CPSpinnerComponent implements OnInit {
  @Input() theme = '';

  constructor() {}

  ngOnInit() {}
}
