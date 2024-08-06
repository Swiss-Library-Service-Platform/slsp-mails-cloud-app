import { Observable, of, Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Entity, CloudAppRestService, AlertService, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib';
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

  subscriptionEntities: Subscription;
  subscriptionSelectedEntity: Subscription;
  currentEntities: Entity[] = [];
  currentSelectedEntity: Entity;

  constructor(
    private log: LogService,
    private slspmailsService: SlspMailsAPIService,
    private loaderService: LoaderService,
    private statusService: StatusService,
    private entitiesService: EntitiesService,
    private translateService: TranslateService,
    private alert: AlertService,
    private router: Router,
    private restService: CloudAppRestService,
    private route: ActivatedRoute
  ) { }



  async ngOnInit() {
    const statusText = await this.translateService.get('Main.Status.Initializing').toPromise();
    this.loaderService.show();
    this.statusService.set(statusText);

    await this.slspmailsService.init();

    this.isUserAllowed = await this.slspmailsService.authenticateAndCheckIfUserAllowed();
    this.isUserCheckDone = true;

    this.loaderService.hide();

    if (!this.isUserAllowed) {
      return;
    }

    // Subscribe to the entitiesService to get the entities that are available
    this.subscriptionEntities = this.entitiesService.getObservableEntitiesObject().subscribe(
      async (res) => {
        this.currentEntities = res;
        this.alert.clear();
      }
    );

    // Subscribe to the entitiesService to get the selected entity
    this.subscriptionSelectedEntity = this.entitiesService.getObservableSelectedEntityObject().subscribe(
      async (selectedEntitiy) => {
        this.currentSelectedEntity = selectedEntitiy;
        if (!selectedEntitiy) {
          return;
        }

        // Get the emails of the user
        const statusText = await this.translateService.get('Main.Status.LoadLogs').toPromise();
        this.loaderService.show();
        this.statusService.set(statusText);
        this.getUsersEmails(selectedEntitiy).subscribe(emails => {
          this.loaderService.hide();
          if (emails) {
            // Get the logs of the user
            this.loaderService.show();
            this.slspmailsService.getUserLogs(emails).then(foundLog => {
              if (foundLog) {
                this.router.navigate(['log-overview']);
              } else {
                this.alert.error(this.translateService.instant('Main.Errors.NoLogs'), { autoClose: this.currentEntities.length > 1, delay: 3000 });
              }
              this.loaderService.hide();
            });
          }
        });
      }
    );
  }

  /**
  * Get the entities object
  * 
  * @param entity 
  * @returns 
 */
  private getUsersEmails(entity: Entity): Observable<string[]> {
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
          return of(emails);
        }),
        catchError(error => {
          return of(null);
        }),
      );
  }


  ngOnDestroy(): void {
    this.subscriptionEntities.unsubscribe();
    this.subscriptionSelectedEntity.unsubscribe();
  }
}