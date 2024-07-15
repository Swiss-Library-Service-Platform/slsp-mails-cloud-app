import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { MailLog } from '../../model/maillog.model';

@Component({
  selector: 'app-log-overview',
  templateUrl: './log-overview.component.html',
  styleUrls: ['./log-overview.component.scss']
})
export class LogOverviewComponent implements OnInit {

  constructor(
    private _slspmailsService: SlspMailsAPIService,
    private router: Router,
  ) { }
  currentEmails: Array<string> = [];
  currentMailLogs: Array<MailLog> = [];
  subscriptionEmails: Subscription;
  subscriptionMailLogs: Subscription;

  ngOnInit(): void {
    this.subscriptionEmails = this._slspmailsService.getEmailAddressesObject().subscribe(
      res => {
        this.currentEmails = res;
      },
      err => {
        console.error(`An error occurred: ${err.message}`);
      }
    );
    this.subscriptionMailLogs = this._slspmailsService.getMailLogsObject().subscribe(
      res => {
        this.currentMailLogs = res;
      },
      err => {
        console.error(`An error occurred: ${err.message}`);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscriptionEmails.unsubscribe();
    this.subscriptionMailLogs.unsubscribe();
  }
  
  backButtonClicked(): void {
    this.router.navigate(['main', 'false']);
  }

  onLogClicked(log: MailLog): void {
    this._slspmailsService.setSelectedMailLog(log);
    this.router.navigate(['log-detail']);
  }
}
