import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { DripCall, LogNote } from "../generated/Pot/Pot";
import { Maker, User } from "../generated/schema";

export function handleDrip(call: DripCall): void {
	let chi = call.outputs.tmp;

	let maker = Maker.load('0');
	maker.index = chi;
	maker.save();
}

export function handleFileEvent(event: LogNote): void {
	let blockNumber = event.block.number;
	let blockTime = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let data = event.params.data;

	let dataString = data.toHexString();
	let whatString = dataString.substr(10, 64);
	let govDataString = dataString.substr(74, 64);

	let whatBytes = ByteArray.fromHexString(whatString);
	let govDataBytes = ByteArray.fromHexString(govDataString).reverse();

	let what = whatBytes.toString();
	let govData = BigInt.fromSignedBytes(govDataBytes as Bytes);

	if (what != 'dsr') {
		return;
	}

	let maker = Maker.load('0');
	maker.rate = govData;
	maker.save();
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
