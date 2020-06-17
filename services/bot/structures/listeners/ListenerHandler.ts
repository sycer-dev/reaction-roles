import Handler from '../core/Handler';
import Listener from './Listener';

export default class ListenerHandler extends Handler<Listener> {
	public handleEvent(event: string, data: any): void {
		// filter in case there are multiple
		const modules = this.modules.filter(m => m.event === event);
		for (const module of modules.values()) {
			try {
				module.run(data);
			} catch {}
		}
	}

	public async loadAll(): Promise<Map<string, Listener>> {
		const files = await this.walk();

		for (const file of files) {
			const _raw = await import(file);
			const imported = 'default' in _raw ? _raw.default : _raw;
			const listener: Listener = new imported();
			listener.client = this.client;

			this.modules.set(listener.id, listener);
		}

		return this.modules;
	}
}
