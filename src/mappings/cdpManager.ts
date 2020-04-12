import { BigInt } from "@graphprotocol/graph-ts";

import { NewCdp, CdpManager } from "../../generated/CdpManager/CdpManager";
import { Maker, CDP, Vault, Collateral } from "../../generated/schema";

export function handleNewCdp(event: NewCdp): void {
	let address = event.address;
	let owner = event.params.own;
	let number = event.params.cdp;

	let manager = CdpManager.bind(address);
	let handler = manager.urns(number);
	let ilkBytes = manager.ilks(number);

	let maker = Maker.load('0');
	maker.vaultCount = number.toI32();
	maker.save()

	let ilk = ilkBytes.toString();
	let collateral = Collateral.load(ilk);
	if (!collateral) {
		// Invalid collateral
		return;
	}

	let cdp = new CDP(number.toString());
	cdp.vault = handler.toHexString();
	cdp.owner = owner.toHexString();
	cdp.save();

	let vault = new Vault(handler.toHexString());
	vault.cdp = number.toString();
	vault.collateral = ilk;
	vault.supply = new BigInt(0);
	vault.debt = new BigInt(0);
	vault.save();
}
