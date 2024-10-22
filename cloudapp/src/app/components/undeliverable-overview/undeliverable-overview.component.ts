import { Component, OnInit } from '@angular/core';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { LoaderService } from '../../services/loader.service';
import { StatusService } from '../../services/status.service';
import { MailLog } from '../../model/maillog.model';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-undeliverable-overview',
  templateUrl: './undeliverable-overview.component.html',
  styleUrls: ['./undeliverable-overview.component.scss']
})
export class UndeliverableOverviewComponent implements OnInit {

  currentUndeliveredLogs: Array<MailLog>;
  subscriptionUndeliveredLogs: any;

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
        tap(res => this.currentUndeliveredLogs = res)
      )
      .subscribe();
    this.loaderService.show();
    this.slspmailsService.getUndeliverableLogs().then(() => {
      this.loaderService.hide();
    });
  }

  ngOnDestroy() {
    this.subscriptionUndeliveredLogs.unsubscribe();
  }

  onLogClicked(log: MailLog) {
    this.slspmailsService.setSelectedMailLog(log);
    this.router.navigate(['log-detail']);
  }

}
