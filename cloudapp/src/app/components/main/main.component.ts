import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppEventsService, Entity, PageInfo, EntityType, CloudAppRestService, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib';
import { MatRadioChange } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';
import { LogService } from '../../services/log.service';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { LoaderService } from '../../services/loader.service';
import { StatusService } from '../../services/status.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

  selectedEntity: Entity;
  isAutoSelect: string;
  isUserAllowed: boolean = false;
  isUserCheckDone: boolean = false;

  entities$: Observable<Entity[]> = this.eventsService.entities$
    .pipe(
     tap(() => this.clear()),
      map(entities => {
        return entities.filter(e => e.type == EntityType.USER);
      }),
    )

  constructor(
    private log: LogService,
    private eventsService: CloudAppEventsService,
    private slspmailsService: SlspMailsAPIService,
    private restService: CloudAppRestService,
    private loaderService: LoaderService,
    private statusService: StatusService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) { }

  ngOnDestroy(): void {
  }

  onPageLoad = (pageInfo: PageInfo) => {
  }

  async ngOnInit() {

    const statusText = await this.translate.get('Main.Status.Initializing').toPromise();
    this.setLoadingWithStatus(statusText);

    let initData = await this.eventsService.getInitData().toPromise();
    await this.slspmailsService.init(initData);

    this.isUserAllowed = await this.slspmailsService.authenticateAndCheckIfUserAllowed();
    this.isUserCheckDone = true;

    this.loaderService.hide();

    if (!this.isUserAllowed) {
      return;
    }

    // Auto select if only one entity is available
    if (this.route.snapshot.params.isAutoSelect == 'true') {
      this.entities$.subscribe(async (availableEntities) => {
        if (availableEntities.length == 1) {
          await this.setUser(availableEntities[0]);
        }
      });
    }
  }

  async entitySelected(event: MatRadioChange) {
    const value = event.value as Entity;
    await this.setUser(value);
  }

  async setUser(entity: Entity) {
    this.log.info('setUser', entity);
    const statusText = await this.translate.get('Main.Status.LoadLogs').toPromise();
    this.setLoadingWithStatus(statusText);

    // Get all emails from user
    return this.getUserEmails(entity)
      .subscribe(async emails => {
        if (emails) {
          const foundLog = await this.slspmailsService.getUserLogs(emails);
          this.loaderService.hide();
          if (foundLog) {
            this.router.navigate(['log-overview']);
          } else {
            this.clear()
          }
        }
      });
  }

  private getUserEmails(entity: Entity): Observable<string[]> {
    this.log.info('getUserEmails', entity);
    // Get all emails from user
    return this.restService.call({
      method: HttpMethod.GET,
      url: entity.link,
      queryParams: { view: 'brief' }
    })
      .pipe(
        switchMap(response => {
          // Get emails
          const emails = response.contact_info.email.map(e => e.email_address);
          if (emails.length == 0) {
            throw new Error('No emails found in linked record');
          }
          this.log.info('gotUserMails', emails);
          return of(emails);
        }),
        catchError(error => {
          this.log.error('Failed to retrieve emails: ' + error.message);
          return of(null);
        }),
      );
  }
  
  clear() {
    this.selectedEntity = null;
  }

  setLoadingWithStatus(status: string) {
    this.loaderService.show();
    this.statusService.set(status);
  }

}