import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudAppEventsService, Entity, AlertService, CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { MailLog } from '../model/maillog.model';
import { LogService } from './log.service';

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

  private emailAddresses: Array<string> = [];
  private readonly _emailAddressesObject = new BehaviorSubject<Array<string>>(new Array<string>());

  private mailLogs: Array<MailLog> = [];
  private readonly _mailLogsObject = new BehaviorSubject<Array<MailLog>>(new Array<MailLog>());

  private selectedMailLog: MailLog;
  private readonly _selectedMailLogObject = new BehaviorSubject<MailLog>(new MailLog({}));

  private initData: Object
  private baseUrl: string = 'https://slspmails.swisscovery.network/api/v1/cloudapp';
  httpOptions: {};

  constructor(
    private http: HttpClient,
    private eventsService: CloudAppEventsService,
    private log: LogService,
    private alert: AlertService,
    private translate: TranslateService,
    private restService: CloudAppRestService,
  ) { }

  /**
   * Initializes service
   * Gets the Alma Auth Token and defined HTTPOptions
   *
   * @return {*}  {Promise<void>}
   * @memberof LibraryManagementService
   */
  async init(initData: Object): Promise<void> {
    this.initData = initData;
    let authToken = await this.eventsService.getAuthToken().toPromise();
    this.httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    };
  }

  /**
   * Get the address object as observable
   */
  getEmailAddressesObject(): Observable<Array<string>> {
    return this._emailAddressesObject.asObservable();
  }

  /**
   * Set the address object observable
   */
  private _setObservableEmailAddressesObject(emailAddresses: Array<string>): void {
    this._emailAddressesObject.next(emailAddresses);
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
   * Authenticate the user and check if the user is allowed to use the cloud app
   * 
   * @return {*}  {Promise<boolean>}, true if user is allowed, false if not
  */
  async authenticateAndCheckIfUserAllowed(): Promise<boolean> {
    return new Promise(resolve => {
      this.http.get(this.baseUrl + '/authenticate', this.httpOptions).subscribe(
        (data: any) => {
          resolve(true);
        },
        error => {
          console.log(error);
          resolve(false);
        },
      );
    });
  }
  
  /**
   * Get the logs for the given email addresses
   * 
   * @param {Array<string>} emails
   * @return {*}  {Promise<boolean>}
  */
  async getUserLogs(emails: Array<string>): Promise<boolean> {
    // Get emails from SLSPmails API 
    this.emailAddresses = emails;
    this._setObservableEmailAddressesObject(this.emailAddresses);

    // Get logs from SLSPmails API
    const payload = {
      emails: emails
    };
    return new Promise(resolve => {
      this.http.post(this.baseUrl + '/logs', payload, this.httpOptions).subscribe(
        (data: any) => {
          this.log.info('gotUserLogs', data);
          if (data.length === 0) {
            this.alert.error(this.translate.instant('no_logs_found'));
            resolve(false);
          }
          this.mailLogs = data.map((log: any) => new MailLog(log));
          this._setObservableMailLogsObject(this.mailLogs);
          resolve(true);
        },
        error => {
          this.log.error('gotUserLogs', error);
          this.alert.error(this.translate.instant('error_getting_logs'));
          resolve(false);
        },
      );
    });
  }
}
