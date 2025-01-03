import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudAppEventsService, Entity, AlertService, CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { MailLog } from '../model/maillog.model';
import { LogService } from './log.service';
import { Router } from '@angular/router';

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

  private mailLogs: Array<MailLog> = [];
  private readonly _mailLogsObject = new BehaviorSubject<Array<MailLog>>(new Array<MailLog>());

  private selectedMailLog: MailLog;
  private readonly _selectedMailLogObject = new BehaviorSubject<MailLog>(new MailLog({}));

  private readonly _undeliverableMailsObject = new BehaviorSubject<Array<MailLog>>(new Array<MailLog>());

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
