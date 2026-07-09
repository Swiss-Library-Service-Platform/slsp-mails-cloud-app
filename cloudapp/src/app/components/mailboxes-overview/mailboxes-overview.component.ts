import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Mailbox } from '../../model/mailbox.model';
import { LoaderService } from '../../services/loader.service';
import { SlspMailsAPIService } from '../../services/mails.api.service';
import { RequestChangeDialogComponent } from '../request-change-dialog/request-change-dialog.component';
import { TestForwardingConfirmDialogComponent } from '../test-forwarding-confirm-dialog/test-forwarding-confirm-dialog.component';

@Component({
  selector: 'app-mailboxes-overview',
  templateUrl: './mailboxes-overview.component.html',
  styleUrls: ['./mailboxes-overview.component.scss']
})
export class MailboxesOverviewComponent implements OnInit, OnDestroy {

  public mailboxes: Array<Mailbox> = [];
  public isLoading: boolean = true;
  public loadError: boolean = false;
  public searchTerm: string = '';

  private subscription: Subscription;
  private destroyed: boolean = false;

  constructor(
    private slspmailsService: SlspMailsAPIService,
    public loaderService: LoaderService,
    private alert: AlertService,
    private translate: TranslateService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.subscription = this.slspmailsService.getMailboxesObject().subscribe(mailboxes => {
      this.mailboxes = mailboxes;
    });

    this.slspmailsService.getMailboxes().then(success => {
      if (this.destroyed) return;
      this.loadError = !success;
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.subscription?.unsubscribe();
  }

  get filteredMailboxes(): Mailbox[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.mailboxes;
    return this.mailboxes.filter(m =>
      m.email?.toLowerCase().includes(q) ||
      m.forwarding_email?.toLowerCase().includes(q) ||
      m.mailbox_name?.toLowerCase().includes(q),
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  /**
   * Open the request-change dialog. On submit, opens Jira with the prefilled URL.
   */
  onRequestChange(mailbox: Mailbox): void {
    const dialogRef = this.dialog.open(RequestChangeDialogComponent, {
      width: 'calc(100vw - 32px)',
      maxWidth: '480px',
      data: { mailbox },
    });

    dialogRef.afterClosed().subscribe((freeText: string | undefined) => {
      if (!freeText) {
        return;
      }
      const url = this.slspmailsService.buildJiraSupportUrl(mailbox, freeText);
      if (!url) {
        this.alert.error(
          this.translate.instant('Mailboxes.Errors.JiraConfigMissing'),
          { autoClose: true, delay: 5000 },
        );
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  /**
   * Ask for confirmation, then trigger a server-side test forwarding email.
   */
  onTestForwarding(mailbox: Mailbox): void {
    const dialogRef = this.dialog.open(TestForwardingConfirmDialogComponent, {
      width: 'calc(100vw - 32px)',
      maxWidth: '480px',
      data: { mailbox },
    });

    dialogRef.afterClosed().subscribe(async (confirmed: boolean | undefined) => {
      if (!confirmed) return;
      await this.sendTestForwarding(mailbox);
    });
  }

  private async sendTestForwarding(mailbox: Mailbox): Promise<void> {
    this.loaderService.show();
    try {
      const result = await this.slspmailsService.sendTestForwarding(mailbox.id);
      if (this.destroyed) return;

      if (result.success) {
        this.alert.success(
          this.translate.instant('Mailboxes.TestSent', { email: result.forwardingEmail ?? mailbox.forwarding_email }),
          { autoClose: true, delay: 5000 },
        );
        return;
      }

      if (result.rateLimited) {
        this.alert.warn(this.translate.instant('Mailboxes.RateLimited'), { autoClose: true, delay: 5000 });
        return;
      }

      this.alert.error(this.translate.instant('Mailboxes.TestFailed'), { autoClose: true, delay: 5000 });
    } finally {
      this.loaderService.hide();
    }
  }
}
