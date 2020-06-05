import { Address, BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { LogNote } from "../../generated/Vat/Vat";
import { Maker, Collateral, Vault } from "../../generated/schema";

import { saveChange } from "../utils";

let ten = BigInt.fromI32(10);
let ray = ten.pow(27);

export function handleInitEvent(event: LogNote): void {
	let data = event.params.data;

	let dataString = data.toHexString();
	let ilkString = dataString.substr(10, 64);

	let ilkBytes = ByteArray.fromHexString(ilkString);

	let ilk = ilkBytes.toString();

	let collateral = Collateral.load(ilk);
	if (!collateral) {
		collateral = new Collateral(ilk);

		let maker = Maker.load('0');
		if (!maker) {
			maker = new Maker('0');
			maker.index = BigInt.fromI32(0);
			maker.rate = BigInt.fromI32(0);
			maker.supply = BigInt.fromI32(0);
			maker.cdpCount = 0;
			maker.collaterals = [];
			maker.debt = BigInt.fromI32(0);
		}
		maker.collaterals.push(ilk);
		maker.save();
	}
	collateral.index = ray;
	collateral.rate = BigInt.fromI32(0);
	collateral.minRatio = BigInt.fromI32(0);
	collateral.ceiling = BigInt.fromI32(0);
	collateral.supply = BigInt.fromI32(0);
	collateral.debt = BigInt.fromI32(0);
	collateral.save();
}

export function handleFileEvent(event: LogNote): void {
	let timestamp = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let logIndex = event.logIndex;
	let data = event.params.data;

	let dataString = data.toHexString();
	let whatString = dataString.substr(10, 64);
	let govDataString = dataString.substr(74, 64);

	let whatBytes = ByteArray.fromHexString(whatString);
	let govDataBytes = ByteArray.fromHexString(govDataString).reverse();

	let what = whatBytes.toString();
	let govData = BigInt.fromSignedBytes(govDataBytes as Bytes);

	let param = 'Vat-' + what;
	saveChange(transactionHash, logIndex, timestamp, param, govData);
}

export function handleIlkFileEvent(event: LogNote): void {
	let timestamp = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let logIndex = event.logIndex;
	let data = event.params.data;

	let dataString = data.toHexString();
	let ilkString = dataString.substr(10, 64);
	let whatString = dataString.substr(74, 64);
	let govDataString = dataString.substr(138, 64);

	let ilkBytes = ByteArray.fromHexString(ilkString);
	let whatBytes = ByteArray.fromHexString(whatString);
	let govDataBytes = ByteArray.fromHexString(govDataString).reverse();

	let ilk = ilkBytes.toString();
	let what = whatBytes.toString();
	let govData = BigInt.fromSignedBytes(govDataBytes as Bytes);

	if (what == 'line') {
		let collateral = new Collateral(ilk);
		collateral.ceiling = govData;
		collateral.save();
	}

	if (what == 'spot') {
		// Don't save spots; they're changed by oracle not by governance
		return;
	}

	let param = 'Vat-' + ilk + '-' + what;
	saveChange(transactionHash, logIndex, timestamp, param, govData);
}

export function handleSlipEvent(event: LogNote): void {
	let data = event.params.data;

	let dataString = data.toHexString();
	let ilkString = dataString.substr(10, 64);
	let wadString = dataString.substr(138, 64);

	let ilkBytes = ByteArray.fromHexString(ilkString);
	let wadBytes = ByteArray.fromHexString(wadString).reverse();

	let ilk = ilkBytes.toString();
	let wad = BigInt.fromSignedBytes(wadBytes as Bytes);

	let collateral = Collateral.load(ilk);
	collateral.supply += wad;
	collateral.save();
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

	let maker = Maker.load('0');
	let collateral = Collateral.load(ilk);

	let dtab = dart * collateral.index;
	maker.debt += dtab;
	maker.save();

	collateral.supply += dink;
	collateral.debt += dart;
	collateral.save();

	let vault = Vault.load(user.toHexString());
	if (!vault) {
		// Init CDP-free vault
		vault = new Vault(user.toHexString());
		vault.collateral = ilk.toString();
		vault.supply = BigInt.fromI32(0);
		vault.debt = BigInt.fromI32(0);
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
	let dinkString = dataString.substr(202, 64);
	let dartString = dataString.substr(266, 64);

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
	dstVault.supply += dink;
	dstVault.debt += dart;
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

	let collateral = Collateral.load(ilk);
	collateral.supply += dink;
	collateral.debt += dart;
	collateral.save();

	let vault = Vault.load(user.toHexString());
	vault.supply += dink;
	vault.debt += dart;
	vault.save();
}

export function handleHealEvent(event: LogNote): void {
	let data = event.params.data;

	let dataString = data.toHexString();
	let radString = dataString.substr(10, 64);

	let radBytes = ByteArray.fromHexString(radString).reverse();

	let rad = BigInt.fromSignedBytes(radBytes as Bytes);

	let maker = Maker.load('0');
	maker.debt -= rad;
	maker.save();
}

export function handleSuckEvent(event: LogNote): void {
	let data = event.params.data;

	let dataString = data.toHexString();
	let radString = dataString.substr(138, 64);

	let radBytes = ByteArray.fromHexString(radString).reverse();

	let rad = BigInt.fromSignedBytes(radBytes as Bytes);

	let maker = Maker.load('0');
	maker.debt += rad;
	maker.save();
}

export function handleFoldEvent(event: LogNote): void {
	let data = event.params.data;

	let dataString = data.toHexString();
	let ilkString = dataString.substr(10, 64);
	let rateString = dataString.substr(138, 64);

	let ilkBytes = ByteArray.fromHexString(ilkString);
	let rateBytes = ByteArray.fromHexString(rateString).reverse();

	let ilk = ilkBytes.toString();
	let rate = BigInt.fromSignedBytes(rateBytes as Bytes);

	let collateral = Collateral.load(ilk);
	collateral.index += rate;
	collateral.save();

	let rad = collateral.debt * rate;
	let maker = Maker.load('0');
	maker.debt += rad;
	maker.save();
}
