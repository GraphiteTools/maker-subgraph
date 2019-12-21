import { BigInt } from "@graphprotocol/graph-ts";

import { FileCall } from "../generated/Jug/Jug";
import { Maker, Collateral } from "../generated/schema";

export function handleDutyFile(call: FileCall): void {
	let ilk = call.inputs.ilk;
	let what = call.inputs.what;
	let data = call.inputs.data;
	if (what.toString() != 'duty') {
		return;
	}

	let collateral = Collateral.load(ilk.toString());
	collateral.rate = data;
	collateral.save();
}
