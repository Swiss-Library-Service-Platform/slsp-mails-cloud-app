import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { MailLog } from '../../model/maillog.model';
import { Entity } from '@exlibris/exl-cloudapp-angular-lib';
import { EntitiesService } from '../../services/entities.service';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-user-log-list',
  templateUrl: './user-log-list.component.html',
  styleUrls: ['./user-log-list.component.scss']
})
export class LogOverviewComponent implements OnInit {

  private subscriptionEntities: Subscription;
  private subscriptionSelectedEntity: Subscription;
  private subscriptionMailLogs: Subscription;

  public currentMailLogs: Array<MailLog> = [];
  public currentSelectedEntity: Entity;

  constructor(
    private _slspmailsService: SlspMailsAPIService,
    private router: Router,
    private entitiesService: EntitiesService,
  ) { }

  ngOnInit(): void {
    this.backButtonClicked = this.backButtonClicked.bind(this);
    this.onLogClicked = this.onLogClicked.bind(this);

    // Subscribe to the mail logs
    this.subscriptionMailLogs = this._slspmailsService.getMailLogsObject()
      .pipe(
        tap(mailLogs => this.currentMailLogs = mailLogs)
      )
      .subscribe(
        () => { },
        err => {
          this.currentMailLogs = [];
        }
      );

    // Subscribe to the selected entity
    this.subscriptionSelectedEntity = this.entitiesService.getObservableSelectedEntityObject()
      .pipe(
        tap(selectedEntity => {
          this.currentSelectedEntity = selectedEntity;
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.subscriptionMailLogs.unsubscribe();
  }

  backButtonClicked(): void {
    this.entitiesService.resetSelectedEntity();
    this.router.navigate(['main']);
  }

  onLogClicked(log: MailLog): void {
    this._slspmailsService.setSelectedMailLog(log);
    this.router.navigate(['log-detail'], { queryParams: { origin: 'user-log-list' } });
  }
}
