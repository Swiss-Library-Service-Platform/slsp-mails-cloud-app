import { Component, OnInit } from '@angular/core';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { LoaderService } from '../../services/loader.service';
import { StatusService } from '../../services/status.service';
import { MailLog } from '../../model/maillog.model';
import { tap } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { SelectedLogService } from '../../services/selected-logs.service';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-undeliverable-overview',
  templateUrl: './undeliverable-overview.component.html',
  styleUrls: ['./undeliverable-overview.component.scss']
})
export class UndeliverableOverviewComponent implements OnInit {

  private subscriptionUndeliveredLogs: any;
  private currentUndeliveredLogs: Array<MailLog>;
  public currentUndeliveredLogsLoading: boolean = true;
  public filteredUndeliveredLogs: Array<MailLog>;

  public selectedLogs: Array<MailLog> = [];

  private lastScrollPositionY: number
  public lastClickedLogMsgId: string;
  public showResolvedLogs: boolean = false;

  constructor(
    private slspmailsService: SlspMailsAPIService,
    public loaderService: LoaderService,
    public statusService: StatusService,
    private router: Router,
    private selectedLogsService: SelectedLogService,
    private alert: AlertService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.onLogClicked = this.onLogClicked.bind(this);

    // Subscribe to the undelivered logs
    this.subscriptionUndeliveredLogs = this.slspmailsService.getUndeliverableMailsObject()
      .pipe(
        tap(res => {
          this.currentUndeliveredLogs = res;
          this.filterLogs();
        })
      ).subscribe();

    // Trigger to load the undelivered logs
    this.slspmailsService.getUndeliverableLogs().then(() => {
      this.currentUndeliveredLogsLoading = false;
    });

    // Scroll to the last clicked log when it was navigated back to this component
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const container = document.querySelector('.log-overview-container');
        if (container && this.lastClickedLogMsgId) {
          container.scrollTo(0, this.lastScrollPositionY);
        }
      }
    });

    // Subscribe to the selected logs
    this.selectedLogsService.selectedLogs$.subscribe(logs => {
      this.selectedLogs = logs;
    });
  }

  ngOnDestroy() {
    this.subscriptionUndeliveredLogs.unsubscribe();
  }

  onLogClicked(log: MailLog) {
    this.slspmailsService.setSelectedMailLog(log);
    const container = document.querySelector('.log-overview-container');
    this.lastScrollPositionY = container.scrollTop;
    this.lastClickedLogMsgId = log.msg_id;
    this.router.navigate(['log-detail']);
  }

  onFilterChange() {
    this.showResolvedLogs = !this.showResolvedLogs;
    this.filterLogs();
  }

  filterLogs() {
    if (this.showResolvedLogs) {
      this.filteredUndeliveredLogs = this.currentUndeliveredLogs.filter(log => log.dismissed);
    } else {
      this.filteredUndeliveredLogs = this.currentUndeliveredLogs.filter(log => !log.dismissed);
    }
  }

  onClickSelectAllLogs(): void {
    if (this.filteredUndeliveredLogs.length === this.selectedLogs.length) {
      this.selectedLogsService.clearSelectedLogs();
    } else {
      this.filteredUndeliveredLogs.forEach(log => {
        this.selectedLogsService.selectLog(log);
      });
    }
  }

  onRowSelectionChange([msgId, isSelected]: [string, boolean]) {
    const log = this.filteredUndeliveredLogs.find(log => log.msg_id === msgId);
    if (isSelected) {
      this.selectedLogsService.selectLog(log);
    } else {
      this.selectedLogsService.deselectLog(log);
    }
  }

  onDismissSelectedLogs() {
    this.loaderService.show();
    this.slspmailsService.dismissLogs(this.selectedLogs).then(() => {
      this.alert.success(this.translate.instant('Main.Success.DimissedMulti', { n: this.selectedLogs.length }), { autoClose: true, delay: 3000 });
      this.selectedLogsService.clearSelectedLogs();
    }).catch(() => {
      this.alert.error(this.translate.instant('Main.Error.DismissedMulti'), { autoClose: true, delay: 3000 });
    }).finally(() => {
      this.loaderService.hide();
    });
  }

  isLogSelected(log: MailLog): boolean {
    return this.selectedLogs.some(selectedLog => selectedLog.msg_id === log.msg_id);
  }
}
