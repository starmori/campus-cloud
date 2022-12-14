import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { By } from '@angular/platform-browser';

import { ZendeskService } from '@campus-cloud/shared/services';
import { CPHelpDeskComponent } from '@campus-cloud/shared/components';
import { configureTestSuite, CPTestModule } from '@campus-cloud/shared/tests';

describe('CPHelpDeskComponent', () => {
  configureTestSuite();

  beforeAll((done) => {
    (async () => {
      TestBed.configureTestingModule({
        providers: [ZendeskService],
        imports: [CPTestModule, HttpClientModule, RouterTestingModule],
        schemas: [NO_ERRORS_SCHEMA]
      });
      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail);
  });

  let spy;
  let de: DebugElement;
  let fixture: ComponentFixture<CPHelpDeskComponent>;
  let component: CPHelpDeskComponent;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CPHelpDeskComponent);
    component = fixture.componentInstance;

    spy = spyOn(component, 'trackHelpDeskAction');

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should click whats new link', () => {
    const whatsNewLink = de.query(By.css('.whats_new')).nativeElement;

    whatsNewLink.click();

    expect(spy).toHaveBeenCalled();
    // tslint:disable-next-line
    expect(spy).toHaveBeenCalledWith("What's New");
  });

  it('should click help desk link', () => {
    const spyHelpWidget = spyOn(component, 'loadHelpDeskWidget');
    const helpDeskLink = de.query(By.css('.help')).nativeElement;

    helpDeskLink.click();

    expect(spy).toHaveBeenCalled();
    expect(spyHelpWidget).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('Help');
  });

  it('should click guides & faq link', () => {
    const faq = de.query(By.css('.faq')).nativeElement;

    faq.click();

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('Guides & FAQ');
  });
});
