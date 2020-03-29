import { BigInt, Bytes } from "@graphprotocol/graph-ts";

import { Change } from "../generated/schema";

export function saveChange(txHash: Bytes, logIndex: BigInt, timestamp: BigInt, param: String, value: BigInt): void {
	let changeId = txHash.toHexString() + '-' + logIndex.toHexString();
	let change = new Change(changeId);
	change.param = param;
	change.value = value;
	change.txHash = txHash;
	change.timestamp = timestamp.toI32();
	change.save();
}
