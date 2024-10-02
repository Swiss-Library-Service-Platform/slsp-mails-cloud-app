import { Observable, of, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Entity, CloudAppRestService, AlertService, HttpMethod, CloudAppEventsService, PageInfo, InitData, EntityType } from '@exlibris/exl-cloudapp-angular-lib';
import { ActivatedRoute, Router } from '@angular/router';
import { LogService } from '../../services/log.service';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { LoaderService } from '../../services/loader.service';
import { StatusService } from '../../services/status.service';
import { TranslateService } from '@ngx-translate/core';
import { EntitiesService } from '../../services/entities.service';
import { catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  isUserAllowed: boolean = false;
  isUserCheckDone: boolean = false;

  currentEntityTitle: String = '';

  constructor(
    private slspmailsService: SlspMailsAPIService,
    public loaderService: LoaderService,
    public statusService: StatusService,
    public entitiesService: EntitiesService,
    private translateService: TranslateService,
    private eventsService: CloudAppEventsService,
  ) { }

  async ngOnInit() {
    const statusText = await this.translateService.get('Main.Status.Initializing').toPromise();
    this.loaderService.show();
    this.statusService.set(statusText);
    this.currentEntityTitle = this.translateService.instant('Main.Title');
    this.entitiesService.getObservableCurrentEntityType().subscribe(
      async (res) => {
        if (res == EntityType.USER) {
          this.currentEntityTitle = await this.translateService.get('Main.Title_User').toPromise();
        } else if (res == EntityType.VENDOR) {
          this.currentEntityTitle = await this.translateService.get('Main.Title_Vendor').toPromise();
        }
      }
    );

    await this.slspmailsService.init();

    this.isUserAllowed = await this.slspmailsService.authenticateAndCheckIfUserAllowed();
    this.isUserCheckDone = true;

    this.loaderService.hide();

    if (!this.isUserAllowed) {
      return;
    }
  }

  ngOnDestroy() {
    console.log('MainComponent destroyed');
  }

}