import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { LogNote } from "../../generated/Vow/Vow";

import { saveChange, addAuthority, removeAuthority } from "../utils";

export function handleRely(event: LogNote): void {
	let address = event.address;
	let timestamp = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let logIndex = event.logIndex;
	let data = event.params.data;

	let dataString = data.toHexString();
	let guyString = dataString.substr(10 + 24, 40);

	let guyBytes = ByteArray.fromHexString(guyString) as Bytes;
	addAuthority(address, guyBytes);
}

export function handleDeny(event: LogNote): void {
	let address = event.address;
	let timestamp = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let logIndex = event.logIndex;
	let data = event.params.data;

	let dataString = data.toHexString();
	let guyString = dataString.substr(10 + 24, 40);

	let guyBytes = ByteArray.fromHexString(guyString) as Bytes;
	removeAuthority(address, guyBytes);
}

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

	let param = 'Vow-' + what;
	saveChange(transactionHash, logIndex, timestamp, param, govData);
}
