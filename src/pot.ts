import { BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";

import { DripCall, LogNote } from "../generated/Pot/Pot";
import { Maker, User, Proxy, RateChangeEvent, PotDepositEvent, PotWithdrawEvent } from "../generated/schema";

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

	let event = new RateChangeEvent(transactionHash.toHexString());
	event.blockNumber = blockNumber;
	event.blockTime = blockTime;
	event.rate = govData;
	event.save();
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

	let proxy = Proxy.load(from.toHexString());
	if (proxy) {
		proxy.balance += wad;
		proxy.save();
		return;
	}

	// Proxy does not exist: direct deposit
	let user = User.load(from.toHexString());
	if (!user) {
		user = new User(from.toHexString());
		user.balance = new BigInt(0);
		user.chaiBalance = new BigInt(0);
	}
	user.balance += wad;
	user.save();

	let event = new PotDepositEvent(transactionHash.toHexString());
	event.blockNumber = blockNumber;
	event.blockTime = blockTime;
	event.owner = from;
	event.amount = wad;
	event.save();
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

	let proxy = Proxy.load(from.toHexString());
	if (proxy) {
		proxy.balance -= wad;
		proxy.save();
		return;
	}

	// Proxy does not exist: direct withdrawal
	let user = User.load(from.toHexString());
	if (!user) {
		user = new User(from.toHexString());
		user.balance = new BigInt(0);
		user.chaiBalance = new BigInt(0);
	}
	user.balance -= wad;
	user.save();

	let event = new PotWithdrawEvent(transactionHash.toHexString());
	event.blockNumber = blockNumber;
	event.blockTime = blockTime;
	event.owner = from;
	event.amount = wad;
	event.save();
}
