import { Component, Input, OnInit } from '@angular/core';
import { MailLog } from '../../model/maillog.model';

@Component({
  selector: 'app-log-row',
  templateUrl: './log-row.component.html',
  styleUrls: ['./log-row.component.scss']
})
export class LogRowComponent  {

  @Input() log: MailLog
  @Input() logClicked: Function
  @Input() showRecipient: boolean = false

}
