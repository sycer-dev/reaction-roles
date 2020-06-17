import Module from '../core/Module';

export type Event = string;

export interface ListenerOptions {
	event: Event;
}

export default class Listener extends Module {
	public readonly event: Event;

	public constructor(id: string, { event }: ListenerOptions) {
		super(id);

		this.event = event;
	}

	public run(..._: any[]): unknown | Promise<unknown> {
		throw Error(`Function "run" is not implemented on listener "${this.id}"`);
	}
}
