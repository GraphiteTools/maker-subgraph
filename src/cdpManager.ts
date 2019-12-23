import { BigInt } from "@graphprotocol/graph-ts";

import { NewCdp, CdpManager } from "../generated/CdpManager/CdpManager";
import { CDP, Vault } from "../generated/schema";

export function handleNewCdp(event: NewCdp): void {
	let address = event.address;
	let owner = event.params.own;
	let number = event.params.cdp;

	let manager = CdpManager.bind(address);
	let handler = manager.urns(number);
	let ilk = manager.ilks(number);

	let cdp = new CDP(number.toString());
	cdp.vault = handler.toHexString();
	cdp.owner = owner.toHexString();
	cdp.save();

	let vault = new Vault(handler.toHexString());
	vault.cdp = number.toString();
	vault.collateral = ilk.toString();
	vault.supply = new BigInt(0);
	vault.debt = new BigInt(0);
	vault.save();
}
