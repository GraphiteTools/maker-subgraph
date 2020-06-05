import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { LogNote } from "../../generated/templates/Flip/Flip";
import { Flip } from "../../generated/schema";

import { saveChange } from "../utils";

export function handleFile(event: LogNote): void {
	let address = event.address;
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

	let flip = Flip.load(address.toHexString());
	let collateral = flip.collateral;

	let param = 'Flip-' + collateral + '-' + what;
	saveChange(transactionHash, logIndex, timestamp, param, govData);
}
