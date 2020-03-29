import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { LogNote } from "../generated/Jug/Jug";
import { Maker, Collateral, Change } from "../generated/schema";

export function handleFile(event: LogNote): void {
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

	let changeId = transactionHash.toHexString() + '-' + logIndex.toHexString();
	let change = new Change(changeId);
	let param = 'Jug-' + what;
	change.param = param;
	change.value = govData;
	change.timestamp = timestamp.toI32();
	change.txHash = transactionHash;
	change.save();
}

export function handleIlkFile(event: LogNote): void {
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

	if (what.toString() == 'duty') {
		let collateral = Collateral.load(ilk.toString());
		collateral.rate = govData;
		collateral.save();
	}

	let changeId = transactionHash.toHexString() + '-' + logIndex.toHexString();
	let change = new Change(changeId);
	let param = 'Jug-' + ilk + '-' + what;
	change.param = param;
	change.value = govData;
	change.timestamp = timestamp.toI32();
	change.txHash = transactionHash;
	change.save();
}
