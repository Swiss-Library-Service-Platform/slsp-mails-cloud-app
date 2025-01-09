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
    private selectedLogsService: SelectedLogService,
    private router: Router
  ) { }

  private currentMailLog: MailLog;
  private subscriptionCurrentMailLog: Subscription;
  private isLoading: boolean = false;

  ngOnInit(): void {
    this.backButtonClicked = this.backButtonClicked.bind(this);

    this.subscriptionCurrentMailLog = this._slspmailsService.getSelectedMailLogObject().pipe(
      tap(res => this.currentMailLog = res)
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.subscriptionCurrentMailLog.unsubscribe();
  }

  backButtonClicked(): void {
    this.router.navigate(['main']);
  }

  onDismissLog(): void {
    this.isLoading = true;
    this._slspmailsService.dismissLogs([this.currentMailLog]).then(() => {
      this.currentMailLog.dismissed = true;
      this.selectedLogsService.dismissLog(this.currentMailLog);
      this.isLoading = false;
    });
  }
}
