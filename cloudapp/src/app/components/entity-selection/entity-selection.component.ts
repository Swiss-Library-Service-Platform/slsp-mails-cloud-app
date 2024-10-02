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
  selector: 'app-entity-selection',
  templateUrl: './entity-selection.component.html',
  styleUrls: ['./entity-selection.component.scss']
})
export class EntitySelectionComponent implements OnInit {

  subscriptionEntities: Subscription;
  subscriptionSelectedEntity: Subscription;
  currentEntities: Entity[] = [];
  currentSelectedEntity: Entity;

  constructor(
    private slspmailsService: SlspMailsAPIService,
    public loaderService: LoaderService,
    public statusService: StatusService,
    public entitiesService: EntitiesService,
    private translateService: TranslateService,
    private alert: AlertService,
    private router: Router,
    private restService: CloudAppRestService,
  ) { }

  ngOnInit(): void {
    // Subscribe to the entitiesService to get the entities that are available
    this.subscriptionEntities = this.entitiesService.getObservableEntitiesObject().subscribe(
      async (res) => {
        this.currentEntities = res;
        this.alert.clear();
      }
    );

    // Subscribe to the entitiesService to get the selected entity
    this.subscriptionSelectedEntity = this.entitiesService.getObservableSelectedEntityObject().subscribe(
      async (selectedEntity) => {
        this.currentSelectedEntity = selectedEntity;
        if (!selectedEntity) {
          return;
        }

        // Get the emails of the user
        const statusText = await this.translateService.get('Main.Status.LoadLogs').toPromise();
        this.loaderService.show();
        this.statusService.set(statusText);
        this.getUsersEmails(selectedEntity).subscribe(selectedEntityEmails => {
          this.loaderService.hide();
          if (selectedEntityEmails) {
            // Get the logs of the user
            this.loaderService.show();
            this.slspmailsService.getUserLogs(selectedEntityEmails).then(foundLog => {
              if (foundLog) {
                this.router.navigate(['log-overview']);
              } else {
                this.alert.error(this.translateService.instant('Main.Errors.NoLogs'), { autoClose: this.currentEntities.length > 1, delay: 3000 });
              }
              this.loaderService.hide();
            });
          } else {
            this.alert.error(this.translateService.instant('Main.Errors.NoMails'), { autoClose: this.currentEntities.length > 1, delay: 3000 });
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
