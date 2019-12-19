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
	if (!collateral) {
		collateral = new Collateral(ilk.toString());

		let maker = Maker.load('0');
		maker.collaterals.push(ilk.toString());
		maker.save();
	}
	collateral.rate = data;
	collateral.save();
}
