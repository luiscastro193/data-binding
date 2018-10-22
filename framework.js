"use strict";
function htmlToElement(html) {
	let template = document.createElement('template');
	template.innerHTML = html.trim();
	return template.content.firstChild;
}

function replaceElement(oldElement, newElement) {
	oldElement.parentNode.replaceChild(newElement, oldElement);
}

function newEvent() {
	let event = document.createElement('e');
	let aux = new Event('e');
	
	event.addListener = function(element, callback) {
		event.addEventListener('e', function listener() {
			if (document.contains(element))
				callback();
			else
				event.removeEventListener('e', listener);
		});
	}
	
	event.dispatch = function() {
		event.dispatchEvent(aux);
	}
	
	return event;
}

function newObservable(initialValue) {
	let observable = {
		variable: initialValue,
		event: newEvent(),
		get value() {
			return this.variable;
		},
		set value(newValue) {
			this.variable = newValue;
			this.event.dispatch();
		},
		subscribe: function(element, callback) {
			this.event.addListener(element, callback);
		}
	};
	
	return observable;
}
