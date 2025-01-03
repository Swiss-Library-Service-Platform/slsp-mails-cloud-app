import { MailEvent } from "./mailevent.model";

/**
 * MailLog Object
 *
 * @export
 * @class MailLog
 */
export class MailLog {


    id: number;
    msg_id: string;
    time: Date;
    from_email: string;
    to_email: string;
    subject: string;
    status: string;
    opens_count: number;
    clicks_count: number;
    dismissed: boolean = false;
    // array of activity events
    activity_events: MailEvent[] = [];
    // selected flag
    selected: boolean = false;

    constructor(data: any = {}) {
        if (data) {
            this.id = data.id;
            this.msg_id = data.msg_id;
            this.time = data.time;
            this.from_email = data.from_email;
            this.to_email = data.to_email;
            this.subject = data.subject;
            this.status = data.status;
            this.opens_count = data.opens_count;
            this.clicks_count = data.clicks_count;
            this.dismissed = data.dismissed;
            if (data.activity_events) {
                this.activity_events = data.activity_events.map((event: any) => new MailEvent(event));
            }
        }
    }

    isDelivered() {
        return this.status === 'delivered';
    }

    isNotDelivered() {
        return this.status === 'not_delivered';
    }

    isPending() {
        return this.status === 'pending';
    }
}
