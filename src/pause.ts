import { Address, BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { LogNote } from "../generated/Pause/Pause";
import { Maker, Spell, SpellAction } from "../generated/schema";

import { saveChange } from "./utils";

export function handleSetDelay(event: LogNote): void {
	let address = event.address;
	let timestamp = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let logIndex = event.logIndex;
	let foo = event.params.foo;

	let delayString = foo.toHexString();
	let delayBytes = ByteArray.fromHexString(delayString).reverse();
	let delay = BigInt.fromSignedBytes(delayBytes as Bytes);

	saveChange(transactionHash, logIndex, 'Pause-delay', delay);
}

export function handlePlot(event: LogNote): void {
	let timestamp = event.block.timestamp;
	let foo = event.params.foo;

	let addressString = foo.toHexString();
	let address = Address.fromHexString(addressString);

	let spellAction = SpellAction.load(address.toHexString());
	let spellAddress = spellAction.spell;
	let spell = Spell.load(spellAddress);

	spell.timelocked = timestamp.toI32();
	spell.save();
}

export function handleExec(event: LogNote): void {
	let timestamp = event.block.timestamp;
	let foo = event.params.foo;

	let addressString = foo.toHexString();
	let address = Address.fromHexString(addressString);

	let spellAction = SpellAction.load(address.toHexString());
	let spellAddress = spellAction.spell;
	let spell = Spell.load(spellAddress);

	spell.executed = timestamp.toI32();
	spell.save();

	let maker = Maker.load('0');
	maker.activeSpell = spellAddress;
	maker.save();
}
