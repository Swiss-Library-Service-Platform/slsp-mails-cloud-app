import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MailLog } from '../model/maillog.model';

@Injectable({
  providedIn: 'root'
})
export class SelectedLogService {
  private selectedLogsSubject = new BehaviorSubject<MailLog[]>([]);
  selectedLogs$ = this.selectedLogsSubject.asObservable();

  selectLog(log: MailLog) {
    const currentLogs = this.selectedLogsSubject.value;
    this.selectedLogsSubject.next([...currentLogs, log]);
  }

  deselectLog(log: MailLog) {
    const currentLogs = this.selectedLogsSubject.value.filter(selectedLog => selectedLog.msg_id !== log.msg_id);
    this.selectedLogsSubject.next(currentLogs);
  }

  dismissLog(log: MailLog) {
    this.deselectLog(log);
  }

  clearSelectedLogs() {
    this.selectedLogsSubject.next([]);
  }
}