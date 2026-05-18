import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Mailbox } from '../../model/mailbox.model';
import { SlspMailsAPIService } from '../../services/mails.api.service';

export interface RequestChangeDialogData {
  mailbox: Mailbox;
}

@Component({
  selector: 'app-request-change-dialog',
  templateUrl: './request-change-dialog.component.html',
  styleUrls: ['./request-change-dialog.component.scss']
})
export class RequestChangeDialogComponent {

  public freeText: string = '';
  public mailbox: Mailbox;

  constructor(
    private dialogRef: MatDialogRef<RequestChangeDialogComponent, string | undefined>,
    private slspmailsService: SlspMailsAPIService,
    @Inject(MAT_DIALOG_DATA) data: RequestChangeDialogData,
  ) {
    this.mailbox = data.mailbox;
  }

  get wrapper(): { pre: string; post: string } {
    return this.slspmailsService.buildJiraWrapper(this.mailbox);
  }

  onSubmit(): void {
    const text = this.freeText.trim();
    if (!text) {
      return;
    }
    this.dialogRef.close(text);
  }

  onCancel(): void {
    this.dialogRef.close(undefined);
  }
}
