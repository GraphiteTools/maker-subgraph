import { BigInt } from "@graphprotocol/graph-ts";

import { Created } from "../../generated/ProxyFactory/ProxyFactory";
import { User } from "../../generated/schema";

export function handleCreated(event: Created): void {
	let owner = event.params.owner;
	let proxyAddress = event.params.proxy;

	let user = User.load(owner.toHexString());
	if (!user) {
		user = new User(owner.toHexString());
		user.balance = new BigInt(0);
	}
	user.proxy = proxyAddress.toHexString();
	user.save();

	let proxyUser = new User(proxyAddress.toHexString());
	proxyUser.owner = owner.toHexString();
	proxyUser.balance = new BigInt(0);
	proxyUser.save();
}
