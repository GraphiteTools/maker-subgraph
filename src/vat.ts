import { Address, BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { InitCall, FileCall, SlipCall, FrobCall, GrabCall, HealCall, SuckCall, FoldCall, LogNote } from "../generated/Vat/Vat";
import { Maker, Collateral, Vault } from "../generated/schema";

let ten = new BigInt(10);
let ray = ten.pow(27);

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
	collateral.index = ray;
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
	let dtab = dart * collateral.index;
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
	collateral.index += rate;
	collateral.save();

	let rad = collateral.debt * rate;
	let maker = Maker.load('0');
	maker.debt += rad;
	maker.save();
}

export function handleFrobEvent(event: LogNote): void {
	let txHash = event.transaction.hash;
	let data = event.params.data;

	let dataString = data.toHexString();
	let ilkString = dataString.substr(10, 64);
	let userString = dataString.substr(98, 40);
	let dinkString = dataString.substr(266, 64);
	let dartString = dataString.substr(330, 64);

	let ilkBytes = ByteArray.fromHexString(ilkString);
	let dinkBytes = ByteArray.fromHexString(dinkString).reverse();
	let dartBytes = ByteArray.fromHexString(dartString).reverse();

	let ilk = ilkBytes.toString();
	let user = Address.fromString(userString);
	let dink = BigInt.fromSignedBytes(dinkBytes as Bytes);
	let dart = BigInt.fromSignedBytes(dartBytes as Bytes);

	let vault = Vault.load(user.toHexString());
	if (!vault) {
		vault = new Vault(user.toHexString());
		vault.cdp = '0';
		vault.collateral = ilk.toString();
		vault.supply = new BigInt(0);
		vault.debt = new BigInt(0);
	}
	vault.supply += dink;
	vault.debt += dart;
	vault.save();
}

export function handleForkEvent(event: LogNote): void {
	let data = event.params.data;

	let dataString = data.toHexString();
	let ilkString = dataString.substr(10, 64);
	let srcString = dataString.substr(98, 40);
	let dstString = dataString.substr(162, 40);
	let dinkString = dataString.substr(226, 64);
	let dartString = dataString.substr(290, 64);

	let ilkBytes = ByteArray.fromHexString(ilkString);
	let dinkBytes = ByteArray.fromHexString(dinkString).reverse();
	let dartBytes = ByteArray.fromHexString(dartString).reverse();

	let ilk = ilkBytes.toString();
	let src = Address.fromString(srcString);
	let dst = Address.fromString(dstString);
	let dink = BigInt.fromSignedBytes(dinkBytes as Bytes);
	let dart = BigInt.fromSignedBytes(dartBytes as Bytes);

	let srcVault = Vault.load(src.toHexString());
	srcVault.supply -= dink;
	srcVault.debt -= dart;
	srcVault.save();

	let dstVault = Vault.load(dst.toHexString());
	dstVault.supply -= dink;
	dstVault.debt -= dart;
	dstVault.save();
}

export function handleGrabEvent(event: LogNote): void {
	let data = event.params.data;

	let dataString = data.toHexString();
	let ilkString = dataString.substr(10, 64);
	let userString = dataString.substr(98, 40);
	let dinkString = dataString.substr(266, 64);
	let dartString = dataString.substr(330, 64);

	let ilkBytes = ByteArray.fromHexString(ilkString);
	let dinkBytes = ByteArray.fromHexString(dinkString).reverse();
	let dartBytes = ByteArray.fromHexString(dartString).reverse();

	let ilk = ilkBytes.toString();
	let user = Address.fromString(userString);
	let dink = BigInt.fromSignedBytes(dinkBytes as Bytes);
	let dart = BigInt.fromSignedBytes(dartBytes as Bytes);

	let vault = Vault.load(user.toHexString());
	vault.supply += dink;
	vault.debt += dart;
	vault.save();
}
