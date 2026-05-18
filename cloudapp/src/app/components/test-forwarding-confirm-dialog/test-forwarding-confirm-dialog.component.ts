import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Mailbox } from '../../model/mailbox.model';

export interface TestForwardingConfirmDialogData {
  mailbox: Mailbox;
}

@Component({
  selector: 'app-test-forwarding-confirm-dialog',
  templateUrl: './test-forwarding-confirm-dialog.component.html',
  styleUrls: ['./test-forwarding-confirm-dialog.component.scss']
})
export class TestForwardingConfirmDialogComponent {

  public mailbox: Mailbox;

  constructor(
    private dialogRef: MatDialogRef<TestForwardingConfirmDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) data: TestForwardingConfirmDialogData,
  ) {
    this.mailbox = data.mailbox;
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
