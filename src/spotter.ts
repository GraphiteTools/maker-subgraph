import { BigInt } from "@graphprotocol/graph-ts";

import { FileCall } from "../generated/Spotter/Spotter";
import { Jug, Collateral } from "../generated/schema";

export function handleFile(call: FileCall): void {
	let ilk = call.inputs.ilk;
	let what = call.inputs.what;
	let data = call.inputs.data;
	if (what.toString() != 'mat') {
		return;
	}

	let collateral = Collateral.load(ilk.toString());
	if (!collateral) {
		collateral = new Collateral(ilk.toString());

		let jug = Jug.load('0');
		jug.collaterals.push(ilk.toString());
		jug.save();
	}
	collateral.minRatio = data;
	collateral.save();
}
