import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MailLog } from '../../model/maillog.model';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-log-row',
  templateUrl: './log-row.component.html',
  styleUrls: ['./log-row.component.scss']
})
export class LogRowComponent {

  @Input() log: MailLog
  @Input() logClicked: Function
  @Input() showRecipient: boolean = false
  @Input() dismissable: boolean = false
  @Input() isLastClicked: boolean = false
  @Input() isSelected: boolean = false

  @Output() selectionChange = new EventEmitter<[string, boolean]>();

  onSelectionChange(event: MatCheckboxChange): void {
    this.selectionChange.emit([this.log.msg_id, event.checked]);
  }

}
