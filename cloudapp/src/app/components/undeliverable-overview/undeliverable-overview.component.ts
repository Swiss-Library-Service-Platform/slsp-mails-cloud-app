import { Component, OnInit } from '@angular/core';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { LoaderService } from '../../services/loader.service';
import { StatusService } from '../../services/status.service';
import { MailLog } from '../../model/maillog.model';
import { tap } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-undeliverable-overview',
  templateUrl: './undeliverable-overview.component.html',
  styleUrls: ['./undeliverable-overview.component.scss']
})
export class UndeliverableOverviewComponent implements OnInit {

  subscriptionUndeliveredLogs: any;
  currentUndeliveredLogs: Array<MailLog>;
  filteredUndeliveredLogs: Array<MailLog>;
  showResolvedLogs: boolean = false;
  selectedLogs: Array<MailLog> = [];
  lastScrollPositionY: number
  lastClickedLogMsgId: string;

  constructor(
    private slspmailsService: SlspMailsAPIService,
    public loaderService: LoaderService,
    public statusService: StatusService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.onLogClicked = this.onLogClicked.bind(this);

    this.subscriptionUndeliveredLogs = this.slspmailsService.getUndeliverableMailsObject()
      .pipe(
        tap(res => {
          this.currentUndeliveredLogs = res;
          this.filterLogs();
        })
      ).subscribe();

    this.slspmailsService.getUndeliverableLogs();

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const container = document.querySelector('.log-overview-container');
        container.scrollTo(0, this.lastScrollPositionY);
      }
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
      this.selectedLogs = [];
      this.filteredUndeliveredLogs.forEach(log => log.selected = false);
    } else {
      this.selectedLogs = this.filteredUndeliveredLogs;
      this.filteredUndeliveredLogs.forEach(log => log.selected = true);
    }
  }

  onRowSelectionChange([msgId, isSelected]: [string, boolean]) {
    const log = this.filteredUndeliveredLogs.find(log => log.msg_id === msgId);
    this.selectedLogs = isSelected ? [...this.selectedLogs, log] : this.selectedLogs.filter(selectedLog => selectedLog.msg_id !== msgId);
  }

  onDismissSelectedLogs() {
    this.loaderService.show();
    this.slspmailsService.dismissLogs(this.selectedLogs).then(() => {
      this.selectedLogs = [];
    }).finally(() => {
      this.loaderService.hide();
    });
  }
}
