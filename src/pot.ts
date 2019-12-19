import { BigInt } from "@graphprotocol/graph-ts";

import { FileCall, DripCall, JoinCall, ExitCall } from "../generated/Pot/Pot";
import { Maker, User, Proxy, RateChangeEvent, PotDepositEvent, PotWithdrawEvent } from "../generated/schema";

export function handleFile(call: FileCall): void {
	let blockNumber = call.block.number;
	let blockTime = call.block.timestamp;
	let transactionHash = call.transaction.hash;
	let what = call.inputs.what;
	let data = call.inputs.data;

	if (what.toString() != 'dsr') {
		return;
	}

	let maker = Maker.load('0');
	maker.rate = data;
	maker.save();

	let event = new RateChangeEvent(transactionHash.toHexString());
	event.blockNumber = blockNumber;
	event.blockTime = blockTime;
	event.rate = data;
	event.save();
}

export function handleDrip(call: DripCall): void {
	let chi = call.outputs.tmp;

	let maker = Maker.load('0');
	maker.index = chi;
	maker.save();
}

export function handleJoin(call: JoinCall): void {
	let blockNumber = call.block.number;
	let blockTime = call.block.timestamp;
	let transactionHash = call.transaction.hash;
	let from = call.from;
	let wad = call.inputs.wad;

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

export function handleExit(call: ExitCall): void {
	let blockNumber = call.block.number;
	let blockTime = call.block.timestamp;
	let transactionHash = call.transaction.hash;
	let from = call.from;
	let wad = call.inputs.wad;

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
