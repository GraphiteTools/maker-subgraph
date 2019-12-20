import { BigInt } from "@graphprotocol/graph-ts";

import { InitCall, FileCall, SlipCall, FrobCall, GrabCall, HealCall, SuckCall, FoldCall } from "../generated/Vat/Vat";
import { Maker, Collateral } from "../generated/schema";

export function handleInit(call: InitCall): void {
	let ilk = call.inputs.ilk;

	let collateral = Collateral.load(ilk.toString());
	if (!collateral) {
		collateral = new Collateral(ilk.toString());

		let maker = Maker.load('0');
		if (!maker) {
			maker = new Maker('0');
			maker.index = new BigInt(0);
			maker.rate = new BigInt(0);
			maker.supply = new BigInt(0);
			maker.chaiSupply = new BigInt(0);
			maker.collaterals = [];
			maker.debt = new BigInt(0);
		}
		maker.collaterals.push(ilk.toString());
		maker.save();
	}
	collateral.rate = new BigInt(0);
	collateral.minRatio = new BigInt(0);
	collateral.ceiling = new BigInt(0);
	collateral.supply = new BigInt(0);
	collateral.debt = new BigInt(0);
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

	let maker = Maker.load('0');
	let dtab = dart * collateral.rate;
	maker.debt += dtab;
	maker.save();
}

export function handleGrab(call: GrabCall): void {
	let i = call.inputs.i;
	let dink = call.inputs.dink;
	let dart = call.inputs.dart;

	let collateral = Collateral.load(i.toString());
	collateral.supply -= dink;
	collateral.debt += dart;
	collateral.save();
}

export function handleHeal(call: HealCall): void {
	let rad = call.inputs.rad;

	let maker = Maker.load('0');
	maker.debt -= rad;
	maker.save();
}

export function handleSuck(call: SuckCall): void {
	let rad = call.inputs.rad;

	let maker = Maker.load('0');
	maker.debt += rad;
	maker.save();
}

export function handleFold(call: FoldCall): void {
	let i = call.inputs.i;
	let rate = call.inputs.rate;

	let collateral = Collateral.load(i.toString());
	collateral.rate += rate;
	collateral.save();

	let rad = collateral.debt * rate;
	let maker = Maker.load('0');
	maker.debt += rad;
	maker.save();
}
