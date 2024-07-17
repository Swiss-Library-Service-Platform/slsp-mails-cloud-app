import { Component, Input } from '@angular/core'
import { MailLog } from '../../model/maillog.model'

@Component({
	selector: 'mail-status-chip',
	templateUrl: './mail-status-chip.component.html',
	styleUrls: ['./mail-status-chip.component.scss']
})
export class MailStatusChipComponent {

	@Input() log: MailLog
    @Input() showText: boolean = false    

}
