import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { MailLog } from '../../model/maillog.model';
import { tap } from 'rxjs/operators';
import { LoaderService } from '../../services/loader.service';
import { SelectedLogService } from '../../services/selected-logs.service';

@Component({
  selector: 'app-log-detail',
  templateUrl: './log-detail.component.html',
  styleUrls: ['./log-detail.component.scss']
})
export class LogDetailComponent implements OnInit {

  constructor(
    private _slspmailsService: SlspMailsAPIService,
    private selectedLogsService: SelectedLogService
  ) { }

  currentMailLog: MailLog;
  subscriptionCurrentMailLog: Subscription;

  ngOnInit(): void {
    this.subscriptionCurrentMailLog = this._slspmailsService.getSelectedMailLogObject().pipe(
      tap(res => this.currentMailLog = res)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.subscriptionCurrentMailLog.unsubscribe();
  }

  backButtonClicked(): void {
    window.history.back();
  }

  onDismissLog(): void {
    this._slspmailsService.dismissLogs([this.currentMailLog]).then(() => {
      this.currentMailLog.dismissed = true;
      this.selectedLogsService.dismissLog(this.currentMailLog);
    });
  }
}
