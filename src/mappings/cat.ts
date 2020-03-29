import { Address, BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { Flip as FlipContract } from '../../generated/templates'
import { LogNote } from "../../generated/Vow/Vow";
import { Collateral, Flip } from "../../generated/schema";

import { saveChange } from "../utils";

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

	let param = 'Cat-' + ilk + '-' + what;
	saveChange(transactionHash, logIndex, timestamp, param, govData);
}

export function handleFlipFile(event: LogNote): void {
	let timestamp = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let logIndex = event.logIndex;
	let data = event.params.data;

	let dataString = data.toHexString();
	let ilkString = dataString.substr(10, 64);
	let whatString = dataString.substr(74, 64);
	let addressString = dataString.substr(138 + 24, 40);

	let ilkBytes = ByteArray.fromHexString(ilkString);
	let whatBytes = ByteArray.fromHexString(whatString);
	let address = Address.fromHexString(addressString) as Address;

	let ilk = ilkBytes.toString();
	let what = whatBytes.toString();

	let collateral = Collateral.load(ilk);
	let flip = new Flip(address.toHexString());
	flip.collateral = ilk;
	flip.save();

	FlipContract.create(address);
}
