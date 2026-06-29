import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudAppEventsService, Entity, AlertService, CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { MailLog } from '../model/maillog.model';
import { Mailbox } from '../model/mailbox.model';
import { LogService } from './log.service';
import { Router } from '@angular/router';

interface JiraConfig {
  supportUrlBase: string;
  // Keys are full Jira field names (e.g. customfield_10553); values are stringified.
  // The frontend appends every entry as-is to the support URL.
  prefillParams: { [key: string]: string };
}

/**
 * Service which is responsible for API calls to the SLSPmails API
 *
 * @export
 * @class SlspMailsAPIService
 */
@Injectable({
  providedIn: 'root'
})
export class SlspMailsAPIService {

  public isInitialized: boolean = false;

  // Session info populated by authenticateAndCheckIfUserAllowed
  public isAdmin: boolean = false;
  public iz: string = '';
  public userName: string = '';
  public jira: JiraConfig | null = null;

  // True when the app runs in the Alma sandbox (Premium Sandbox / PSB).
  // Detected from the Alma URL in the cloud-app init data.
  public isSandbox: boolean = false;

  private mailLogs: Array<MailLog> = [];
  private readonly _mailLogsObject = new BehaviorSubject<Array<MailLog>>(new Array<MailLog>());

  private selectedMailLog: MailLog;
  private readonly _selectedMailLogObject = new BehaviorSubject<MailLog>(new MailLog({}));

  private readonly _undeliverableMailsObject = new BehaviorSubject<Array<MailLog>>(new Array<MailLog>());
  private readonly _mailboxesObject = new BehaviorSubject<Array<Mailbox>>(new Array<Mailbox>());

  private baseUrl: string = 'https://api.slspmails.swisscovery.network/api/v1/cloudapp';
  httpOptions: {};

  constructor(
    private http: HttpClient,
    private eventsService: CloudAppEventsService,
    private log: LogService,
    private alert: AlertService,
    private translate: TranslateService,
    private restService: CloudAppRestService,
    private router: Router,
  ) { }

  /**
   * Initializes service
   * Gets the Alma Auth Token and defined HTTPOptions
   *
   * @return {*}  {Promise<void>}
   * @memberof LibraryManagementService
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    let authToken = await this.eventsService.getAuthToken().toPromise();
    this.httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    };

    // Source the user's display name from the Alma cloud-app SDK so it
    // never crosses our backend (privacy: backend stores only a SHA256 hash).
    try {
      const initData: any = await this.eventsService.getInitData().toPromise();
      const first = initData?.user?.firstName ?? '';
      const last = initData?.user?.lastName ?? '';
      this.userName = `${first} ${last}`.trim();
      // The Alma sandbox (PSB) is the only environment whose Alma URL contains "psb".
      this.isSandbox = /psb/.test(initData?.urls?.alma ?? '');
    } catch (e) {
      this.userName = '';
      this.isSandbox = false;
    }

    this.isInitialized = true;
  }

  /**
   * Get the mail log object as observable
   */
  getMailLogsObject(): Observable<Array<MailLog>> {
    return this._mailLogsObject.asObservable();
  }

  /**
   * Set the mail log object observable
   */
  private _setObservableMailLogsObject(mailLogs: Array<MailLog>): void {
    this._mailLogsObject.next(mailLogs);
  }

  /**
   * Get the selected mail log object as observable
   */
  getSelectedMailLogObject(): Observable<MailLog> {
    return this._selectedMailLogObject.asObservable();
  }

  /**
   * Set the selected mail log object observable
   */
  private _setObservableSelectedMailLogObject(selectedMailLog: MailLog): void {
    this._selectedMailLogObject.next(selectedMailLog);
  }

  /**
   * Set selected mail log from component
   */
  setSelectedMailLog(selectedMailLog: MailLog): void {
    this.selectedMailLog = selectedMailLog;
    this._setObservableSelectedMailLogObject(this.selectedMailLog);
  }

  /**
   * Get the undeliverable mails object as observable
   */
  getUndeliverableMailsObject(): Observable<Array<MailLog>> {
    return this._undeliverableMailsObject.asObservable();
  }

  /**
   * Set the undeliverable mails object observable
   */
  private _setObservableUndeliverableMailsObject(undeliverableMails: Array<MailLog>): void {
    this._undeliverableMailsObject.next(undeliverableMails);
  }

  /**
   * Authenticate the user and check if the user is allowed to use the cloud app.
   * Populates session info (isAdmin, iz, jira config) from the response.
   * Note: userName is sourced from the cloud-app SDK in init(), not from this response.
   *
   * @return {*}  {Promise<boolean>}, true if user is allowed, false if not
  */
  async authenticateAndCheckIfUserAllowed(): Promise<boolean> {
    return new Promise(resolve => {
      this.http.get(this.baseUrl + '/authenticate', this.httpOptions).subscribe(
        (data: any) => {
          this.isAdmin = data?.isAdmin === true;
          this.iz = data?.iz ?? '';
          this.jira = data?.jira ?? null;
          resolve(data?.allowed === true);
        },
        _error => {
          this.isAdmin = false;
          this.iz = '';
          this.jira = null;
          resolve(false);
        },
      );
    });
  }

  /**
   * Get the mailboxes object as observable (read-only, scoped to user's IZ)
   */
  getMailboxesObject(): Observable<Array<Mailbox>> {
    return this._mailboxesObject.asObservable();
  }

  /**
   * Fetch mailboxes for the user's IZ. Requires admin role on the backend.
   *
   * @return {*} {Promise<boolean>} true on success, false on error
   */
  async getMailboxes(): Promise<boolean> {
    return new Promise(resolve => {
      this.http.get(this.baseUrl + '/mailboxes', this.httpOptions).subscribe(
        (data: any) => {
          const mailboxes = (data ?? []).map((m: any) => new Mailbox(m));
          this._mailboxesObject.next(mailboxes);
          resolve(true);
        },
        error => {
          this.log.error('getMailboxes', error);
          this.alert.error(this.translate.instant('Mailboxes.Errors.FetchFailed'), { autoClose: true, delay: 3000 });
          resolve(false);
        },
      );
    });
  }

  /**
   * Trigger a test forwarding email for the given mailbox. Rate-limited server-side.
   *
   * @param {number} mailboxId
   * @return {*} {Promise<{ success: boolean; forwardingEmail?: string; rateLimited?: boolean }>}
   */
  async sendTestForwarding(mailboxId: number): Promise<{ success: boolean; forwardingEmail?: string; rateLimited?: boolean }> {
    return new Promise(resolve => {
      this.http.post(this.baseUrl + `/mailboxes/${mailboxId}/test-forwarding`, {}, this.httpOptions).subscribe(
        (data: any) => {
          resolve({ success: true, forwardingEmail: data?.forwarding_email });
        },
        error => {
          this.log.error('sendTestForwarding', error);
          if (error?.status === 429) {
            resolve({ success: false, rateLimited: true });
          } else {
            resolve({ success: false });
          }
        },
      );
    });
  }

  /**
   * Build the SLSP Service Desk URL with the form prefilled for a mailbox-change request.
   * Uses confirmed customfield option IDs (customfield_10553 = Institution Zone,
   * customfield_10305 = Functional Area).
   */
  buildJiraSupportUrl(mailbox: Mailbox, freeText: string): string {
    if (!this.jira) {
      return '';
    }

    const params = new URLSearchParams({
      summary: `SLSPmails: Mailbox adaptation (${mailbox.email})`,
      description: this.buildJiraDescription(mailbox, freeText),
    });
    // Backend tells us which customfield params to prefill (and what to set them to).
    const prefill = this.jira.prefillParams || {};
    Object.keys(prefill).forEach(key => params.set(key, prefill[key]));
    return `${this.jira.supportUrlBase}?${params.toString()}`;
  }

  /**
   * Render the support-ticket description body. Used by buildJiraSupportUrl
   * to compose the final URL parameter.
   */
  buildJiraDescription(mailbox: Mailbox, freeText: string): string {
    const { pre, post } = this.buildJiraWrapper(mailbox);
    return `${pre}\n${freeText}\n${post}`;
  }

  /**
   * The static halves of the support-ticket description, around the user's
   * free-text adaptation. Exposed so the request-change dialog can render the
   * ticket layout once and place an inline textarea at the adaptation slot.
   */
  buildJiraWrapper(mailbox: Mailbox): { pre: string; post: string } {
    const pre = [
      `Dear SLSP Team,`,
      ``,
      `Our IZ uses the SLSPmails service. We would like to adapt the following mailbox:`,
      ``,
      `Institution Zone: ${this.iz}`,
      `Mailbox: ${mailbox.email}`,
      `Current forwarding: ${mailbox.forwarding_email}`,
      ``,
      `Requested adaptation:`,
    ].join('\n');
    const post = [
      ``,
      `Kind regards,`,
      this.userName,
      ``,
      `---`,
      `This ticket was generated via the SLSPmails cloud app.`,
    ].join('\n');
    return { pre, post };
  }

  /**
   * Get the logs for the given email addresses
   * 
   * @param {Array<string>} emails
   * @return {*}  {Promise<boolean>}
  */
  async getUserLogs(emails: Array<string>): Promise<boolean> {
    // Get logs from SLSPmails API
    const payload = {
      emails: emails
    };
    return new Promise(resolve => {
      this.http.post(this.baseUrl + '/logs', payload, this.httpOptions).subscribe(
        (data: any) => {
          if (data.length == 0) {
            resolve(false);
          }
          this.mailLogs = data.map((log: any) => new MailLog(log));
          this._setObservableMailLogsObject(this.mailLogs);
          resolve(true);
        },
        error => {
          this.log.error('gotUserLogs', error);
          this.alert.error(this.translate.instant('Main.Errors.LogFetchError'), { autoClose: true, delay: 3000 });
          resolve(false);
        },
      );
    });
  }

  /**
   * Get all undeliverable logs from the SLSPmails API
   * 
   * @return {*}  {Promise<boolean>}
  */
  async getUndeliverableLogs(): Promise<boolean> {
    return new Promise(resolve => {
      this.http.get(this.baseUrl + '/undelivered', this.httpOptions).subscribe(
        (data: any) => {
          if (data.length == 0) {
            resolve(false);
          }
          this.mailLogs = data.map((log: any) => new MailLog(log));
          this._setObservableUndeliverableMailsObject(this.mailLogs);
          resolve(true);
        },
        error => {
          this.log.error('getUndeliverableLogs', error);
          this.alert.error(this.translate.instant('Main.Errors.LogFetchError'), { autoClose: true, delay: 3000 });
          resolve(false);
        },
      );
    });
  }

  /**
   * Dismiss selected logs
   * 
   * @param {Array<MailLog>} logs
   * @return {*}  {Promise<boolean>}
  */
  async dismissLogs(logs: Array<MailLog>): Promise<boolean> {
    const payload = {
      msg_ids: logs.map(log => log.msg_id)
    };
    return new Promise(resolve => {
      this.http.post(this.baseUrl + '/dismiss', payload, this.httpOptions).subscribe(
        (data: any) => {
          if (data.length == 0) {
            resolve(false);
          }
          this.mailLogs = data.map((log: any) => new MailLog(log));
          this._setObservableUndeliverableMailsObject(this.mailLogs);
          resolve(true);
        },
        error => {
          this.log.error('dismissSelectedLogs', error);
          this.alert.error(this.translate.instant('Main.Errors.LogDismissError'), { autoClose: true, delay: 3000 });
          resolve(false);
        },
      );
    });
  }


}
