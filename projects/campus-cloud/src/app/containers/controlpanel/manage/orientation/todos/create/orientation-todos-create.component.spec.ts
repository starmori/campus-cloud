import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { of as observableOf } from 'rxjs';

import { TodosModule } from '../todos.module';
import { TodosService } from '../todos.service';
import { CPTestModule } from '@campus-cloud/shared/tests';
import { mockSchool } from '@campus-cloud/session/mock/school';
import { OrientationTodosCreateComponent } from './orientation-todos-create.component';

class MockTodosService {
  dummy;

  createTodo(body: any, search: any) {
    this.dummy = [search];

    return observableOf(body);
  }
}

describe('OrientationTodosCreateComponent', () => {
  let spy;
  let component: OrientationTodosCreateComponent;
  let fixture: ComponentFixture<OrientationTodosCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TodosModule, RouterTestingModule, CPTestModule],
      providers: [
        FormBuilder,
        { provide: TodosService, useClass: MockTodosService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              parent: {
                parent: {
                  params: observableOf({ orientationId: 1 })
                }
              }
            }
          }
        }
      ]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(OrientationTodosCreateComponent);
        component = fixture.componentInstance;
        component.session.g.set('school', mockSchool);
        component.ngOnInit();
      });
  }));

  it('form validation - should fail', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('form validation - should pass', () => {
    component.form.controls['title'].setValue('Hello World!');
    component.form.controls['end'].setValue(1515625016);
    expect(component.form.valid).toBeTruthy();
  });

  it('form validation - max length 225 - should fail', () => {
    const charCount226 = 'a'.repeat(226);

    component.form.controls['title'].setValue(charCount226);
    component.form.controls['end'].setValue(1515625016);
    expect(component.form.valid).toBeFalsy();
  });

  it('cp button should have disabled state TRUE', () => {
    expect(component.buttonData.disabled).toBeTruthy();
  });

  it('cp button should have disabled state FALSE', () => {
    component.form.controls['title'].setValue('Hello World!');
    component.form.controls['end'].setValue(1515625016);
    expect(component.buttonData.disabled).toBeFalsy();
  });

  it('should insert todo', () => {
    component.orientationId = 4525;
    spyOn(component, 'resetModal');
    spy = spyOn(component.service, 'createTodo').and.returnValue(observableOf([]));

    component.form = component.fb.group({
      title: ['Hello World!'],
      description: ['This is description'],
      end: [1515625016]
    });

    component.onSubmit();
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.count()).toBe(1);
  });
});
