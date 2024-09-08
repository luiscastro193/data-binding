"use strict";
export async function request(resource, options) {
	let response = await fetch(resource, options);
	if (response.ok) return response; else throw response;
}

export function htmlToElement(html) {
	let template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.firstChild;
}

export class AuxEvent {
	constructor() {
		this.event = new EventTarget();
		this.aux = new Event('e');
	}
	
	addListener(element, callback) {
		let event = this.event;
		
		event.addEventListener('e', function listener() {
			if (document.contains(element))
				callback();
			else
				event.removeEventListener('e', listener);
		});
	}
	
	dispatch() {
		this.event.dispatchEvent(this.aux);
	}
}

export class Observable {
	constructor(initialValue) {
		this.variable = initialValue;
		this.event = new AuxEvent();
	}
	
	get value() {
		return this.variable;
	}
	
	set value(newValue) {
		this.variable = newValue;
		this.event.dispatch();
	}
	
	subscribe(element, callback) {
		this.event.addListener(element, callback);
	}
}
