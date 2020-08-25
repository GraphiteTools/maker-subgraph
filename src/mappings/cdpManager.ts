import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";

import { LogNote, NewCdp, CdpManager } from "../../generated/CdpManager/CdpManager";
import { Maker, CDP, Vault, Collateral } from "../../generated/schema";

export function handleNewCdp(event: NewCdp): void {
	let address = event.address;
	let owner = event.params.own;
	let number = event.params.cdp;

	let manager = CdpManager.bind(address);
	let handler = manager.urns(number);
	let ilkBytes = manager.ilks(number);

	let maker = Maker.load('0');
	maker.cdpCount = number.toI32();
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
	vault.supply = BigInt.fromI32(0);
	vault.debt = BigInt.fromI32(0);
	vault.save();
}

export function handleGive(event: LogNote): void {
	let cdpNumberBytes = event.params.arg1;
	let rawOwnerBytes = event.params.arg2;

	let cdpNumber = BigInt.fromSignedBytes(cdpNumberBytes.reverse() as Bytes);
	let rawOwner = rawOwnerBytes.toHexString();
	let owner = '0x' + rawOwner.substr(26, 40);

	// let cdp = CDP.load(cdpNumber.toString());
	// cdp.owner = owner;
	// cdp.save();
}
