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

const pendingListeners = new Set();
const callbacksKey = Symbol();

function processListener(listener, references, listeners) {
	let [element, callback] = references.map(reference => reference.deref());
	if (element && callback) {
		if (document.contains(element)) {
			pendingListeners.delete(listener);
			try {callback()} catch (e) {setTimeout(() => {throw e})};
		} else
			pendingListeners.add(listener);
	} else {
		pendingListeners.delete(listener);
		listeners.delete(listener);
	}
}

export class AuxEvent {
	constructor() {
		this.listeners = new Set();
	}

	addListener(element, callback) {
		const listeners = this.listeners;
		if (element[callbacksKey]) element[callbacksKey].push(callback);
		else element[callbacksKey] = [callback];
		let references = [new WeakRef(element), new WeakRef(callback)];
		let listener = () => processListener(listener, references, listeners);
		listeners.add(listener);
	}

	addGlobalListener(callback) {
		this.listeners.add(() => {
			try {callback()} catch (e) {setTimeout(() => {throw e})};
		});
	}

	dispatch() {
		for (const listener of [...this.listeners]) listener();
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
	for (const listener of [...pendingListeners]) listener();
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
