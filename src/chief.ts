import { BigInt } from "@graphprotocol/graph-ts";

import { Etch, LogNote, Chief as ChiefContract } from "../generated/Chief/Chief";
import { Spell as SpellContract } from "../generated/Chief/Spell";
import { Spell, SpellAction } from "../generated/schema";

let zero = BigInt.fromI32(0);

export function handleEtch(event: Etch): void {
	let address = event.address;
	let slate = event.params.slate;

	let chief = ChiefContract.bind(address);
	let spellAddress = chief.slates(slate, zero);
	let spellContract = SpellContract.bind(spellAddress);

	let spellActionCall = spellContract.try_action();
	if (spellActionCall.reverted) {
		return;
	}
	let spellActionAddress = spellActionCall.value;
	let spellAction = new SpellAction(spellActionAddress.toHexString());
	spellAction.spell = spellAddress.toHexString();
	spellAction.save();

	let spell = new Spell(spellAddress.toHexString());
	let spellDescriptionCall = spellContract.try_description();
	if (!spellDescriptionCall.reverted) {
		spell.description = spellDescriptionCall.value;
	}
	spell.save();
}

export function handleLift(event: LogNote): void {
}
