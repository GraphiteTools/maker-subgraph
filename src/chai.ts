import { BigInt, Address } from "@graphprotocol/graph-ts";

import { Transfer } from "../generated/Chai/Chai";
import { User } from "../generated/schema";

let zeroAddress = Address.fromString('0x0000000000000000000000000000000000000000');

export function handleTransfer(event: Transfer): void {

	let from = event.params.src;
	let to = event.params.dst;
	let wad = event.params.wad;

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
