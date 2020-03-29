import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { LogNote } from "../../generated/Pause/Pause";

import { saveChange } from "../utils";

export function handleSetDelay(event: LogNote): void {
	let address = event.address;
	let timestamp = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let logIndex = event.logIndex;
	let foo = event.params.foo;

	let delayString = foo.toHexString();
	let delayBytes = ByteArray.fromHexString(delayString).reverse();
	let delay = BigInt.fromSignedBytes(delayBytes as Bytes);

	let param = 'Pause-delay';
	saveChange(transactionHash, logIndex, timestamp, param, delay);
}
