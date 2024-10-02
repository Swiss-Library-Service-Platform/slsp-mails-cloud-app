import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { MailLog } from '../../model/maillog.model';
import { Entity } from '@exlibris/exl-cloudapp-angular-lib';
import { EntitiesService } from '../../services/entities.service';

@Component({
  selector: 'app-log-overview',
  templateUrl: './log-overview.component.html',
  styleUrls: ['./log-overview.component.scss']
})
export class LogOverviewComponent implements OnInit {

  constructor(
    private _slspmailsService: SlspMailsAPIService,
    private router: Router,
    private entitiesService: EntitiesService,
  ) { }

  subscriptionEntities: Subscription;
  subscriptionSelectedEntity: Subscription;
  subscriptionMailLogs: Subscription;

  currentEntities: Entity[] = [];
  currentMailLogs: Array<MailLog> = [];
  currentSelectedEntity: Entity;

  ngOnInit(): void {
    this.backButtonClicked = this.backButtonClicked.bind(this);

    // Subscribe to the entities
    this.subscriptionEntities = this.entitiesService.getObservableEntitiesObject().subscribe(
      entities => {
        this.currentEntities = entities;
      }
    );
    
    // Subscribe to the mail logs
    this.subscriptionMailLogs = this._slspmailsService.getMailLogsObject().subscribe(
      mailLogs => {
        this.currentMailLogs = mailLogs;
      },
      err => {
        this.currentMailLogs = [];
      }
    );

    // Subscribe to the selected entity
    this.subscriptionSelectedEntity = this.entitiesService.getObservableSelectedEntityObject().subscribe(
      selectedEntity => {
        if (this.currentSelectedEntity) {
          // Navigate back if selectedEntity changed during the time the user was on the page
          this.router.navigate(['main']);
        }
        this.currentSelectedEntity = selectedEntity;
      }
    );
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
    this.router.navigate(['log-detail']);
  }
}
