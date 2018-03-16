import { FileUploadService } from './../../../../../shared/services/file-upload.service';
import { ClubsDetailsModule } from './../details/details.module';
import { ClubsInfoComponent } from './clubs-info.component';
import { CP_PRIVILEGES_MAP } from './../../../../../shared/constants/privileges';
import { Observable } from 'rxjs/Observable';
import { CPSession } from './../../../../../session/index';
import { ClubsService } from './../clubs.service';
import { ClubsUtilsService } from './../clubs.utils.service';
import { CPI18nService } from './../../../../../shared/services/i18n.service';
import { StoreModule } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { isClubAthletic } from '../clubs.athletics.labels';
import { ActivatedRoute } from '@angular/router';

const mockClub = {
  name: 'mock name',
  logo_url: 'mock logo_url',
  status: 'mock status',
  has_membership: true,
  location: 'mock location',
  address: 'mock address',
  phone: 'mock phone',
  email: 'mock email',
  advisor_firstname: 'mock advisor_firstname',
  advisor_lastname: 'mock advisor_lastname',
  advisor_email: 'mock advisor_email'
};

const mockUser = {
  account_level_privileges: {
    1: {
      [CP_PRIVILEGES_MAP.clubs]: {
        r: true,
        w: true
      }
    }
  }
};

const mockSchool = {
  id: 157
};

class MockFileUploadService {
  validFile(_) {
    return true;
  }

  uploadFile() {
    return Observable.of('mock_image');
  }
}

class MockClubsService {
  getClubById() {
    return Observable.of(mockClub);
  }

  updateClub(clubData, clubId) {
    return Observable.of({ clubData, clubId });
  }
}

describe('ClubsInfoComponent', () => {
  let el;
  let comp: ClubsInfoComponent;
  let fixture: ComponentFixture<ClubsInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClubsDetailsModule, RouterTestingModule.withRoutes([]), StoreModule.forRoot({})],
      providers: [
        CPI18nService,
        ClubsUtilsService,
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                params: {
                  clubId: 1
                }
              }
            }
          }
        },
        { provide: FileUploadService, useValue: new MockFileUploadService() },
        { provide: ClubsService, useValue: new MockClubsService() },
        { provide: CPSession, useValue: new CPSession() }
      ]
    });

    fixture = TestBed.createComponent(ClubsInfoComponent);
    comp = fixture.componentInstance;
    el = fixture.debugElement.nativeElement;

    comp.clubId = 1;
    comp.isAthletic = isClubAthletic.club;
    comp.session.g.set('user', mockUser);
    comp.session.g.set('school', mockSchool);
  });

  it(
    'async',
    fakeAsync(() => {
      comp.limitedAdmin = false;

      expect(comp.club).toBeUndefined();
      expect(comp.loading).toBeUndefined();

      comp.fetch();

      tick();

      // fixture.detectChanges();
      expect(comp.loading).not.toBeUndefined();

      tick();

      expect(comp.club).toBe(mockClub);
      expect(comp.hasMetaData).toBeTruthy();
    })
  );
});
