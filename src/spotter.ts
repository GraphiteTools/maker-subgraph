import { BigInt } from "@graphprotocol/graph-ts";

import { FileCall } from "../generated/Spotter/Spotter";
import { Maker, Collateral } from "../generated/schema";

export function handleFile(call: FileCall): void {
	let ilk = call.inputs.ilk;
	let what = call.inputs.what;
	let data = call.inputs.data;
	if (what.toString() != 'mat') {
		return;
	}

	let collateral = Collateral.load(ilk.toString());
	collateral.minRatio = data;
	collateral.save();
}
