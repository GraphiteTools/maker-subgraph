import { BigInt } from "@graphprotocol/graph-ts";

import { InitCall, FileCall, SlipCall, FrobCall, GrabCall } from "../generated/Vat/Vat";
import { Jug, Collateral } from "../generated/schema";

export function handleInit(call: InitCall): void {
	let ilk = call.inputs.ilk;

	let collateral = Collateral.load(ilk.toString());
	if (!collateral) {
		collateral = new Collateral(ilk.toString());

		let jug = Jug.load('0');
		if (!jug) {
			jug = new Jug('0');
			jug.collaterals = [];
		}
		jug.collaterals.push(ilk.toString());
		jug.save();
	}
	collateral.rate = new BigInt(0);
	collateral.minRatio = new BigInt(0);
	collateral.ceiling = new BigInt(0);
	collateral.supply = new BigInt(0);
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
	collateral.save();
}

export function handleSlip(call: SlipCall): void {
	let ilk = call.inputs.ilk;
	let wad = call.inputs.wad;

	let collateral = Collateral.load(ilk.toString());
	collateral.supply += wad;
	collateral.save();
}

export function handleFrob(call: FrobCall): void {
	let i = call.inputs.i;
	let dink = call.inputs.dink;
	let dart = call.inputs.dart;

	let collateral = Collateral.load(i.toString());
	collateral.supply -= dink;
	collateral.debt += dart;
	collateral.save();

	let jug = Jug.load('0');
	jug.debt += dart;
	jug.save();
}

export function handleGrab(call: GrabCall): void {
	let i = call.inputs.i;
	let dink = call.inputs.dink;
	let dart = call.inputs.dart;

	let collateral = Collateral.load(i.toString());
	collateral.supply -= dink;
	collateral.debt += dart;
	collateral.save();

	let jug = Jug.load('0');
	jug.debt += dart;
	jug.save();
}

