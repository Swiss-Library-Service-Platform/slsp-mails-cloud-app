/**
 * Mailbox Object
 *
 * Read-only representation of an Infomaniak forwarding mailbox managed by SLSPmails.
 */
export class Mailbox {
    id: number;
    mailbox_name: string;
    email: string;
    forwarding_email: string;
    status: 'active' | 'pending_deletion';
    scheduled_deletion_date: string | null;
    last_synced_at: string;

    constructor(data: any = {}) {
        this.id = data.id;
        this.mailbox_name = data.mailbox_name;
        this.email = data.email;
        this.forwarding_email = data.forwarding_email;
        this.status = data.status;
        this.scheduled_deletion_date = data.scheduled_deletion_date ?? null;
        this.last_synced_at = data.last_synced_at;
    }

    isActive(): boolean {
        return this.status === 'active';
    }

    isPendingDeletion(): boolean {
        return this.status === 'pending_deletion';
    }
}
