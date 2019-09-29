"use strict";
window.htmlToElement = function(html) {
	let template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.firstChild;
}

window.AuxEvent = class {
	constructor() {
		this.event = document.createElement('e');
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

window.Observable = class {
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
