import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { MailLog } from '../../model/maillog.model';

@Component({
  selector: 'app-log-detail',
  templateUrl: './log-detail.component.html',
  styleUrls: ['./log-detail.component.scss']
})
export class LogDetailComponent implements OnInit {

  constructor(
    private _slspmailsService: SlspMailsAPIService,
    private router: Router,
  ) { }

  currentMailLog: MailLog;
  subscriptionCurrentMailLog: Subscription;

  ngOnInit(): void {
    this.subscriptionCurrentMailLog = this._slspmailsService.getSelectedMailLogObject().subscribe(
      res => {
        this.currentMailLog = res;
      },
      err => {
        console.error(`An error occurred: ${err.message}`);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscriptionCurrentMailLog.unsubscribe();
  }

  backButtonClicked(): void {
    this.router.navigate(['log-overview']);
  }
}
