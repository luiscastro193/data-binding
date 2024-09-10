"use strict";
import {htmlToElement, Observable} from "./framework.js";

let mainInput = document.querySelector("input");
const nInputs = new Observable(mainInput.value);
const message = new Observable("Binded data");

function inputElement() {
	let element = htmlToElement(`<article>
		<input type="text" style="max-width: 17cm; width: 100%" >
		<br><br>
	</article>`);
	let input = element.querySelector('input');
	input.value = message.value;
	input.oninput = () => {message.value = input.value};
	input.onmouseenter = () => input.focus();
	message.subscribe(input, () => input.value = message.value);
	return element;
}

function inputsElement() {
	let element = htmlToElement(`<section id="inputs"></section>`);
	
	for (let i = 0; i < nInputs.value; i++)
		element.appendChild(inputElement());
	
	nInputs.subscribe(element, () => element.replaceWith(inputsElement()));
	return element;
}

mainInput.oninput = () => {nInputs.value = mainInput.value};
mainInput.onmouseenter = () => mainInput.select();
document.getElementById("inputs").replaceWith(inputsElement());
