import { BigInt, Bytes } from "@graphprotocol/graph-ts";

import { Maker, Change } from "../generated/schema";

export function saveChange(txHash: Bytes, logIndex: BigInt, parameter: String, value: BigInt): void {
	let maker = Maker.load('0');
	let spell = maker.activeSpell;

	let changeId = txHash.toHexString() + '-' + logIndex.toHexString();
	let change = new Change(changeId);
	change.spell = spell;
	change.parameter = parameter;
	change.value = value;
	change.save();
}
