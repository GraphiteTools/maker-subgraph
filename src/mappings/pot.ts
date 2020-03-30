import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { DripCall, LogNote } from "../../generated/Pot/Pot";
import { Maker, User } from "../../generated/schema";

import { saveChange, addAuthority, removeAuthority } from "../utils";

export function handleDrip(call: DripCall): void {
	let chi = call.outputs.tmp;

	let maker = Maker.load('0');
	maker.index = chi;
	maker.save();
}

export function handleRelyEvent(event: LogNote): void {
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

export function handleDenyEvent(event: LogNote): void {
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

	if (what == 'dsr') {
		let maker = Maker.load('0');
		maker.rate = govData;
		maker.save();
	}

	let param = 'Pot-' + what;
	saveChange(transactionHash, logIndex, timestamp, param, govData);
}

export function handleJoinEvent(event: LogNote): void {
	let blockNumber = event.block.number;
	let blockTime = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let from = event.params.usr;
	let data = event.params.data;

	let dataString = data.toHexString();
	let wadString = dataString.substr(10, 64);

	let wadBytes = ByteArray.fromHexString(wadString).reverse();

	let wad = BigInt.fromSignedBytes(wadBytes as Bytes);

	let maker = Maker.load('0');
	maker.supply += wad;
	maker.save();

	let user = User.load(from.toHexString());
	if (!user) {
		user = new User(from.toHexString());
		user.balance = new BigInt(0);
		user.chaiBalance = new BigInt(0);
	}
	user.balance += wad;
	user.save();
}

export function handleExitEvent(event: LogNote): void {
	let blockNumber = event.block.number;
	let blockTime = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let from = event.params.usr;
	let data = event.params.data;

	let dataString = data.toHexString();
	let wadString = dataString.substr(10, 64);

	let wadBytes = ByteArray.fromHexString(wadString).reverse();

	let wad = BigInt.fromSignedBytes(wadBytes as Bytes);

	let maker = Maker.load('0');
	maker.supply -= wad;
	maker.save();

	let user = User.load(from.toHexString());
	if (!user) {
		user = new User(from.toHexString());
		user.balance = new BigInt(0);
		user.chaiBalance = new BigInt(0);
	}
	user.balance -= wad;
	user.save();
}
