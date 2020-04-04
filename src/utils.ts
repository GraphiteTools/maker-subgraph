import { BigInt, Bytes } from "@graphprotocol/graph-ts";

import { Change, Authority } from "../generated/schema";

export function saveChange(txHash: Bytes, logIndex: BigInt, timestamp: BigInt, param: String, value: BigInt): void {
	let changeId = txHash.toHexString() + '-' + logIndex.toHexString();
	let change = new Change(changeId);
	change.param = param;
	change.value = value;
	change.txHash = txHash;
	change.timestamp = timestamp.toI32();
	change.save();
}

export function addAuthority(contract: Bytes, owner: Bytes): void {
	let authority = Authority.load(contract.toHexString());
	if (!authority) {
		authority = initAuthority(contract);
	}
	let owners = authority.owners;
	owners.push(owner);
	authority.owners = owners;
	authority.save();
}

export function removeAuthority(contract: Bytes, owner: Bytes): void {
	let authority = Authority.load(contract.toHexString());
	let owners = authority.owners;
	let ownerIndex = owners.indexOf(owner);
	owners.splice(ownerIndex, 1);
	authority.owners = owners;
	authority.save();
}

function initAuthority(contract: Bytes): Authority {
	let deployer = getDeployer(contract);
	let authority = new Authority(contract.toHexString());
	let owners: Array<Bytes> = [
		deployer,
	];
	authority.owners = owners;
	authority.save();
	return authority;
}

function getDeployer(contract: Bytes): Bytes {
	if (contract.toHexString() == '0x197e90f9fad81970ba7976f33cbd77088e5d7cf7') {
		return Bytes.fromHexString('0x1a5ee7c64cf874c735968e3a42fa13f1c03427f9') as Bytes;
	}
	if (contract.toHexString() == '0x19c0976f590d67707e62397c87829d896dc0f1f1') {
		return Bytes.fromHexString('0x45f0a929889ec8cc2d5b8cd79ab55e3279945cde') as Bytes;
	}
	if (contract.toHexString() == '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b') {
		return Bytes.fromHexString('0x403689148fa98a5a6fdcc0b984914ae968d788e5') as Bytes;
	}
	if (contract.toHexString() == '0x65c79fcb50ca1594b025960e539ed7a9a6d434a3') {
		return Bytes.fromHexString('0xdedd12bcb045c02b2fe11031c2b269bcde457410') as Bytes;
	}
	if (contract.toHexString() == '0xa950524441892a31ebddf91d3ceefa04bf454466') {
		return Bytes.fromHexString('0x68322ca1a9aeb8c1d610b5fc8a8920aa0fba423b') as Bytes;
	}
	if (contract.toHexString() == '0x78f2c2af65126834c51822f56be0d7469d7a523e') {
		return Bytes.fromHexString('0xa9ee75d81d78c36c4163004e6cc7a988eec9433e') as Bytes;
	}
	if (contract.toHexString() == '0xdfe0fb1be2a52cdbf8fb962d5701d7fd0902db9f') {
		return Bytes.fromHexString('0xd27a5f3416d8791fc238c148c93630d9e3c882e5') as Bytes;
	}
	if (contract.toHexString() == '0x4d95a049d5b0b7d32058cd3f2163015747522e99') {
		return Bytes.fromHexString('0xddb108893104de4e1c6d0e47c42237db4e617acc') as Bytes;
	}
	if (contract.toHexString() == '0xd8a04f5412223f513dc55f839574430f5ec15531') {
		return Bytes.fromHexString('0xbab4fbea257abbfe84f4588d4eedc43656e46fc5') as Bytes;
	}
	if (contract.toHexString() == '0xaa745404d55f88c108a28c86abe7b5a1e7817c07') {
		return Bytes.fromHexString('0xbab4fbea257abbfe84f4588d4eedc43656e46fc5') as Bytes;
	}
	if (contract.toHexString() == '0xe6ed1d09a19bd335f051d78d5d22df3bff2c28b1') {
		return Bytes.fromHexString('0xbab4fbea257abbfe84f4588d4eedc43656e46fc5') as Bytes;
	}
	if (contract.toHexString() == '0x5432b2f3c0dff95aa191c45e5cbd539e2820ae72') {
		return Bytes.fromHexString('0xbab4fbea257abbfe84f4588d4eedc43656e46fc5') as Bytes;
	}
	return Bytes.fromHexString('0x0000000000000000000000000000000000000000') as Bytes;
}
