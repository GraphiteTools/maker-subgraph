import { BigInt } from "@graphprotocol/graph-ts";

import { FileCall, DripCall, JoinCall, ExitCall } from "../generated/Pot/Pot";
import { Pot, User, Proxy } from "../generated/schema";

export function handleFile(call: FileCall): void {
	let blockNumber = call.block.number;
	let blockTime = call.block.timestamp;
	let transactionHash = call.transaction.hash;
	let what = call.inputs.what;
	let data = call.inputs.data;

	if (what.toString() != 'dsr') {
		return;
	}

	let pot = Pot.load('0');
	if (!pot) {
		pot = new Pot('0');
		pot.index = new BigInt(0);
		pot.rate = new BigInt(0);
		pot.supply = new BigInt(0);
	}
	pot.rate = data;
	pot.save();

	let event = new RateChangeEvent(transactionHash.toHexString());
	event.blockNumber = blockNumber;
	event.blockTime = blockTime;
	event.rate = data;
	event.save();
}

export function handleDrip(call: DripCall): void {
	let chi = call.outputs.tmp;

	let pot = Pot.load('0');
	if (!pot) {
		pot = new Pot('0');
		pot.index = new BigInt(0);
		pot.rate = new BigInt(0);
		pot.supply = new BigInt(0);
	}
	pot.index = chi;
	pot.save();
}

export function handleJoin(call: JoinCall): void {
	let from = call.from;
	let wad = call.inputs.wad;

	let pot = Pot.load('0');
	pot.supply += wad;
	pot.save();

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
}

export function handleExit(call: ExitCall): void {
	let from = call.from;
	let wad = call.inputs.wad;

	let pot = Pot.load('0');
	pot.supply -= wad;
	pot.save();

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
}
