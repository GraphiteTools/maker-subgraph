import { BigInt } from "@graphprotocol/graph-ts";

import { Created } from "../generated/ProxyFactory/ProxyFactory";
import { User, Proxy } from "../generated/schema";

export function handleCreated(event: Created): void {
	let owner = event.params.owner;
	let proxyAddress = event.params.proxy;

	let user = User.load(owner.toHexString());
	if (!user) {
		user = new User(owner.toHexString());
		user.balance = new BigInt(0);
		user.chaiBalance = new BigInt(0);
	}
	user.proxy = proxyAddress.toHexString();
	user.save();

	let proxy = Proxy.load(proxyAddress.toHexString());
	if (!proxy) {
		proxy = new Proxy(proxyAddress.toHexString());
		proxy.balance = new BigInt(0);
	}
	proxy.user = owner.toHexString();
	proxy.save();
}
