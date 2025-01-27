import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { MailLog } from '../../model/maillog.model';
import { tap } from 'rxjs/operators';
import { LoaderService } from '../../services/loader.service';
import { SelectedLogService } from '../../services/selected-logs.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-log-detail',
  templateUrl: './log-detail.component.html',
  styleUrls: ['./log-detail.component.scss']
})
export class LogDetailComponent implements OnInit {

  constructor(
    private _slspmailsService: SlspMailsAPIService,
    private selectedLogsService: SelectedLogService,
    private router: Router,
    private alert: AlertService,
    private translate: TranslateService,
    private route : ActivatedRoute
  ) { }

  public currentMailLog: MailLog;
  private subscriptionCurrentMailLog: Subscription;
  public isLoading: boolean = false;
  public previousComponent: string;

  ngOnInit(): void {
    this.backButtonClicked = this.backButtonClicked.bind(this);

    this.subscriptionCurrentMailLog = this._slspmailsService.getSelectedMailLogObject().pipe(
      tap(res => this.currentMailLog = res)
    ).subscribe();

    this.previousComponent = this.route.snapshot.queryParams.origin || 'main';
  }

  ngOnDestroy(): void {
    this.subscriptionCurrentMailLog.unsubscribe();
  }

  backButtonClicked(): void {
    this.router.navigate([this.previousComponent]);
  }

  onDismissLog(): void {
    this.isLoading = true;
    this._slspmailsService.dismissLogs([this.currentMailLog]).then(() => {
      this.currentMailLog.dismissed = true;
      this.selectedLogsService.dismissLog(this.currentMailLog);
      this.isLoading = false;
      this.alert.success(this.translate.instant('Main.Success.Dismissed'), { autoClose: true, delay: 3000 });
    }).catch(() => {
      this.isLoading = false;
      this.alert.error(this.translate.instant('Main.Error.Dismissed'), { autoClose: true, delay: 3000 });
    });
  }
}
