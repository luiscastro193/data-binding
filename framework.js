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

const pendingListeners = new Map();
const callbacksKey = Symbol();

function processListener(listener, references, event) {
	let [element, callback] = references.map(reference => reference.deref());
	if (element && callback) {
		if (document.contains(element)) {
			pendingListeners.delete(listener);
			try {callback()} catch (e) {setTimeout(() => {throw e})};
		} else
			pendingListeners.set(listener, {references, event});
	} else {
		pendingListeners.delete(listener);
		event.removeEventListener('e', listener);
	}
}

export class AuxEvent {
	constructor() {
		this.event = new EventTarget();
		this.aux = new Event('e');
	}

	addListener(element, callback) {
		let event = this.event;
		if (element[callbacksKey]) element[callbacksKey].push(callback);
		else element[callbacksKey] = [callback];
		let references = [new WeakRef(element), new WeakRef(callback)];
		event.addEventListener('e', function listener() {processListener(listener, references, event)});
	}
	
	addGlobalListener(callback) {
		this.event.addEventListener('e', callback);
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
	
	addGlobalListener(callback) {
		this.event.addGlobalListener(callback);
	}
}

function checkPendingCallbacks() {
	for (const [listener, {references, event}] of pendingListeners)
		processListener(listener, references, event);
}

export function debounce(callback) {
	let pending = false;
	return () => {
		if (!pending) {
			pending = true;
			setTimeout(() => {
				pending = false;
				callback();
			});
		}
	}
}

new MutationObserver(debounce(checkPendingCallbacks)).observe(document, {subtree: true, childList: true});
