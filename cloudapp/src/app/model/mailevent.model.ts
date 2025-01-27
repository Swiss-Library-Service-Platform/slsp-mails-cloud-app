
/**
 * MailEvent Object
 *
 * @export
 * @class MailEvent
 */
export class MailEvent {


    id: number;
    msg_id: number;
    time: Date;
    event_name: string;
    reason: string;
    bounce_type: string;

    constructor(data: any = {}) {
        if (data) {
            this.id = data.id;
            this.msg_id = data.msg_id;
            this.time = data.time;
            this.event_name = data.event_name;
            this.reason = data.reason;
            this.bounce_type = data.bounce_type;
        }
    }

    isBounceTemporary(): boolean {
        return this.event_name === 'bounce' && this.bounce_type === 'blocked';
    }

    isBouncePermanent(): boolean {
        return this.event_name === 'bounce' && this.bounce_type === 'bounce';
    }

}
