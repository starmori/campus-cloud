import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CPDeleteModalComponent } from './cp-delete-modal.component';
import { getElementByCPTargetValue } from '@campus-cloud/shared/utils/tests';
import { configureTestSuite, CPTestModule } from '@campus-cloud/shared/tests';
import { CPButtonComponent, CPCheckboxComponent } from '@campus-cloud/shared/components';

describe('CPDeleteModalComponent', () => {
  configureTestSuite();

  beforeAll((done) =>
    (async () => {
      TestBed.configureTestingModule({
        imports: [CPTestModule]
      });

      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail)
  );

  let de: DebugElement;
  let component: CPDeleteModalComponent;
  let fixture: ComponentFixture<CPDeleteModalComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CPDeleteModalComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;

    fixture.detectChanges();
  });

  it('should call resetModal on x button click', () => {
    const cancelEmit = spyOn(component.cancelClick, 'emit');
    const closeButton: HTMLElement = de.query(By.css('.cpmodal__header__close')).nativeElement;
    closeButton.click();

    expect(cancelEmit).toHaveBeenCalled();
  });

  it('should call resetModal on cancel button click', () => {
    const resetModalSpy = spyOn(component, 'resetModal');
    const closeButton = getElementByCPTargetValue(de, 'cancel').nativeElement;

    closeButton.click();

    expect(resetModalSpy).toHaveBeenCalled();
  });

  it('should emit cancelEvent', () => {
    const cancelEmit = spyOn(component.cancelClick, 'emit');
    component.resetModal();

    expect(cancelEmit).toHaveBeenCalled();
  });

  it('should emit deleteClick', () => {
    const deleteEmit = spyOn(component.deleteClick, 'emit');
    component.onDeleteClick();

    expect(deleteEmit).toHaveBeenCalled();
  });

  it('should call onDeleteClick on delete button click', () => {
    const deleteEmit = spyOn(component.deleteClick, 'emit');
    const closeButton = de.query(By.directive(CPButtonComponent)).componentInstance;

    closeButton.buttonClick.emit();

    expect(deleteEmit).toHaveBeenCalled();
  });

  it('should render modalBody in modal body', () => {
    const modalBody = 'content';
    component.modalBody = modalBody;

    fixture.detectChanges();

    const bodyPTag: HTMLParagraphElement = de.query(By.css('.js_body')).nativeElement;

    expect(bodyPTag.innerHTML).toContain(modalBody);
  });

  it('should render modalTitle in modal title', () => {
    const modalTitle = 'content';
    component.modalTitle = modalTitle;

    fixture.detectChanges();

    const bodyPTag: HTMLElement = de.query(By.css('.js_title')).nativeElement;

    expect(bodyPTag.innerHTML).toContain(modalTitle);
  });

  it('should set disableSubmit to false if no warning inputs are passed', () => {
    expect(component.buttonData.disabled).toBe(false);
  });

  describe('with warning input', () => {
    beforeEach(() => {
      component.warnings = ['some', 'random', 'input'];
      component.ngOnInit();
      fixture.detectChanges();
    });

    it('should set disableSubmit to true if warning inputs are passed', () => {
      expect(component.buttonData.disabled).toBe(true);
    });

    it('should render warnings on the template', () => {
      const warningItems = fixture.debugElement.queryAll(By.css('.cpmodal__body__warning__item'));
      expect(warningItems.length).toBe(component._warnings.length);
    });

    it('should set disableStatus when all warnings are checked', () => {
      const warningItems: DebugElement[] = fixture.debugElement.queryAll(
        By.css('.cpmodal__body__warning__item')
      );

      expect(component.buttonData.disabled).toBe(true);

      warningItems.forEach((i) => {
        const checkbox: CPCheckboxComponent = i.query(By.directive(CPCheckboxComponent))
          .componentInstance;
        checkbox.toggle.emit(true);
        fixture.detectChanges();
      });

      expect(component.buttonData.disabled).toBe(false);
    });
  });
});
