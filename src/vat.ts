import { BigInt } from "@graphprotocol/graph-ts";

import { InitCall, FileCall } from "../generated/Jug/Jug";
import { Jug, Collateral } from "../generated/schema";

export function handleInit(call: FileCall): void {
	let ilk = call.inputs.ilk;

	let collateral = Collateral.load(ilk.toString());
	if (!collateral) {
		collateral = new Collateral(ilk.toString());

		let jug = Jug.load('0');
		jug.collaterals.push(ilk.toString());
		jug.save();
	}
	collateral.save();
}

export function handleFile(call: FileCall): void {
	let ilk = call.inputs.ilk;
	let what = call.inputs.what;
	let data = call.inputs.data;
	if (what.toString() != 'line') {
		return;
	}

	let collateral = new Collateral(ilk.toString());
	collateral.ceiling = data;
}
