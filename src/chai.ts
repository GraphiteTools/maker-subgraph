import { BigInt, Address } from "@graphprotocol/graph-ts";

import { Transfer } from "../generated/Chai/Chai";
import { Chai, User, ChaiTransferEvent } from "../generated/schema";

let zeroAddress = Address.fromString('0x0000000000000000000000000000000000000000');

export function handleTransfer(event: Transfer): void {
	let blockNumber = event.block.number;
	let blockTime = event.block.timestamp;
	let transactionHash = event.transaction.hash;
	let eventIndex = event.logIndex;
	let from = event.params.src;
	let to = event.params.dst;
	let wad = event.params.wad;

	let chai = Chai.load('0');
	if (!chai) {
		chai = new Chai('0');
		chai.supply = new BigInt(0);
	}

	if (from == zeroAddress) {
		// Mint
		chai.supply += wad;
	}

	if (to == zeroAddress) {
		// Burn
		chai.supply -= wad;
	}
	chai.save();

	let eventId = transactionHash.toHexString() + '-' + eventIndex.toString();
	let event = new ChaiTransferEvent(eventId);
	event.blockNumber = blockNumber;
	event.blockTime = blockTime;
	event.from = from;
	event.to = to;
	event.amount = wad;
	event.save();

	if (from != zeroAddress) {
		let user = User.load(from.toHexString());
		if (!user) {
			user = new User(from.toHexString());
			user.balance = new BigInt(0);
			user.chaiBalance = new BigInt(0);
		}
		user.chaiBalance -= wad;
		user.save();
	}

	if (to != zeroAddress) {
		let user = User.load(to.toHexString());
		if (!user) {
			user = new User(to.toHexString());
			user.balance = new BigInt(0);
			user.chaiBalance = new BigInt(0);
		}
		user.chaiBalance += wad;
		user.save();
	}
}
