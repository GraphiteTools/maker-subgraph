import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { LogNote } from "../../generated/Pause/Pause";
import { Change } from "../../generated/schema";

export function handleSetDelay(event: LogNote): void {
	let address = event.address;
	let timestamp = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let logIndex = event.logIndex;
	let foo = event.params.foo;

	let delayString = foo.toHexString();
	let delayBytes = ByteArray.fromHexString(delayString).reverse();
	let delay = BigInt.fromSignedBytes(delayBytes as Bytes);

	let changeId = transactionHash.toHexString() + '-' + logIndex.toHexString();
	let change = new Change(changeId);
	let param = 'Pause-delay';
	change.param = param;
	change.value = delay;
	change.timestamp = timestamp.toI32();
	change.txHash = transactionHash;
	change.save();
}
