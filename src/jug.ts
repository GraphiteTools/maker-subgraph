import { BigInt } from "@graphprotocol/graph-ts";

import { FileCall, File1Call } from "../generated/Jug/Jug";
import { Jug, Collateral } from "../generated/schema";

export function handleDutyFile(call: FileCall): void {
	let ilk = call.inputs.ilk;
	let what = call.inputs.what;
	let data = call.inputs.data;
	if (what.toString() != 'duty') {
		return;
	}

	let collateral = Collateral.load(ilk.toString());
	if (!collateral) {
		collateral = new Collateral(ilk.toString());

		let jug = Jug.load('0');
		jug.collaterals.push(ilk.toString());
		jug.save();
	}
	collateral.rate = data;
	collateral.save();
}

export function handleBaseFile(call: File1Call): void {
	let what = call.inputs.what;
	let data = call.inputs.data;
	if (what.toString() != 'base') {
		return;
	}

	let jug = new Jug('0');
	if (!jug) {
		jug.baseRate = new BigInt(0);
		jug.collaterals = [];
	}
	jug.baseRate = data;
	jug.save();
}
