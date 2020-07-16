---
id: "bitcoinhtlc"
title: "BitcoinHTLC"
sidebar_label: "BitcoinHTLC"
---

[swapchain documentation](../globals.md) › [BitcoinHTLC](bitcoinhtlc.md)

## Hierarchy

* **BitcoinHTLC**

## Index

### Constructors

* [constructor](bitcoinhtlc.md#constructor)

### Properties

* [amountAfterFees](bitcoinhtlc.md#private-amountafterfees)
* [bitcoinAPI](bitcoinhtlc.md#bitcoinapi)
* [fundingTxBlockHeight](bitcoinhtlc.md#private-fundingtxblockheight)
* [network](bitcoinhtlc.md#private-network)
* [preimage](bitcoinhtlc.md#private-preimage)
* [priority](bitcoinhtlc.md#private-priority)
* [receiver](bitcoinhtlc.md#private-receiver)
* [sender](bitcoinhtlc.md#private-sender)

### Methods

* [calculateFee](bitcoinhtlc.md#calculatefee)
* [create](bitcoinhtlc.md#create)
* [getFinalScriptsRedeem](bitcoinhtlc.md#private-getfinalscriptsredeem)
* [getFinalScriptsRefund](bitcoinhtlc.md#private-getfinalscriptsrefund)
* [getFundingTxBlockHeight](bitcoinhtlc.md#getfundingtxblockheight)
* [getP2WSH](bitcoinhtlc.md#getp2wsh)
* [getRedeemHex](bitcoinhtlc.md#private-getredeemhex)
* [getRefundHex](bitcoinhtlc.md#private-getrefundhex)
* [getWitnessPublicKeyHash](bitcoinhtlc.md#private-getwitnesspublickeyhash)
* [redeem](bitcoinhtlc.md#redeem)
* [redeemScript](bitcoinhtlc.md#private-redeemscript)
* [sendToP2WSHAddress](bitcoinhtlc.md#private-sendtop2wshaddress)

## Constructors

###  constructor

\+ **new BitcoinHTLC**(`network`: string, `sender`: ECPairInterface, `receiver`: ECPairInterface, `priority`: number, `BitcoinAPIConstructor`: [BitcoinAPIConstructor](../interfaces/bitcoinapiconstructor.md)): *[BitcoinHTLC](bitcoinhtlc.md)*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:54](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L54)*

Creates an instance of BitcoinHTLC.

**`memberof`** BitcoinHTLC

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`network` | string | "testnet" | mainnet, testnet, or regtest. |
`sender` | ECPairInterface | - | Sender keypair. |
`receiver` | ECPairInterface | - | Receiver keypair. |
`priority` | number | - | The transaction priority (0 = high, 1 = medium, 2 = low) |
`BitcoinAPIConstructor` | [BitcoinAPIConstructor](../interfaces/bitcoinapiconstructor.md) | - | Bitcoin API to use for communication with the blockchain.  |

**Returns:** *[BitcoinHTLC](bitcoinhtlc.md)*

## Properties

### `Private` amountAfterFees

• **amountAfterFees**: *number*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:53](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L53)*

___

###  bitcoinAPI

• **bitcoinAPI**: *[BitcoinAPI](../interfaces/bitcoinapi.md)*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:54](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L54)*

___

### `Private` fundingTxBlockHeight

• **fundingTxBlockHeight**: *number | undefined*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:51](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L51)*

___

### `Private` network

• **network**: *Network*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:47](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L47)*

___

### `Private` preimage

• **preimage**: *string*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:52](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L52)*

___

### `Private` priority

• **priority**: *number*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:50](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L50)*

___

### `Private` receiver

• **receiver**: *ECPairInterface*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:49](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L49)*

___

### `Private` sender

• **sender**: *ECPairInterface*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:48](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L48)*

## Methods

###  calculateFee

▸ **calculateFee**(): *Promise‹object›*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:301](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L301)*

Get wanted and max fee.

**`memberof`** BitcoinHTLC

**Returns:** *Promise‹object›*

A fee object with a max fee, which is the maximum fee the redeemer of the HTLC should accept and a want fee, which is the desired fee according to the selected priority.

___

###  create

▸ **create**(`config`: [HTLCConfigBTC](../interfaces/htlcconfigbtc.md)): *Promise‹string›*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:354](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L354)*

Creates an HTLC.

**`memberof`** BitcoinHTLC

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`config` | [HTLCConfigBTC](../interfaces/htlcconfigbtc.md) | Configuration object for the HTLC. |

**Returns:** *Promise‹string›*

The hex for the refund transaction.

___

### `Private` getFinalScriptsRedeem

▸ **getFinalScriptsRedeem**(`inputIndex`: number, `input`: PsbtInput, `script`: Buffer, `isSegwit`: boolean, `isP2SH`: boolean, `isP2WSH`: boolean): *object*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:173](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L173)*

Finalize an HTLC redeem transaction using PSBT.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`inputIndex` | number | The index in the input array. |
`input` | PsbtInput | The array of transaction inputs. |
`script` | Buffer | P2WSH redeemscript. |
`isSegwit` | boolean | Included only for bitcoinjs-lib compatible reasons. |
`isP2SH` | boolean | Included only for bitcoinjs-lib compatible reasons. |
`isP2WSH` | boolean | Included only for bitcoinjs-lib compatible reasons. |

**Returns:** *object*

A function to finalize and serialize the scripts.

* **finalScriptSig**: *Buffer | undefined*

* **finalScriptWitness**: *Buffer | undefined*

___

### `Private` getFinalScriptsRefund

▸ **getFinalScriptsRefund**(`inputIndex`: number, `input`: PsbtInput, `script`: Buffer, `isSegwit`: boolean, `isP2SH`: boolean, `isP2WSH`: boolean): *object*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:131](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L131)*

Finalize an HTLC refund transaction using PSBT.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`inputIndex` | number | The index in the input array. |
`input` | PsbtInput | The array of transaction inputs. |
`script` | Buffer | P2WSH redeemscript. |
`isSegwit` | boolean | Included only for bitcoinjs-lib compatible reasons. |
`isP2SH` | boolean | Included only for bitcoinjs-lib compatible reasons. |
`isP2WSH` | boolean | Included only for bitcoinjs-lib compatible reasons. |

**Returns:** *object*

A function to finalize and serialize the scripts.

* **finalScriptSig**: *Buffer | undefined*

* **finalScriptWitness**: *Buffer | undefined*

___

###  getFundingTxBlockHeight

▸ **getFundingTxBlockHeight**(): *number | undefined*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:88](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L88)*

Get block height of funding transaction

**`memberof`** BitcoinHTLC

**Returns:** *number | undefined*

Blockheight of funding transaction or undefined if block is not mined/broadcasted yet.

___

###  getP2WSH

▸ **getP2WSH**(`hash`: Buffer, `sequence`: number): *Payment*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:230](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L230)*

Calculate the p2wsh to send our money to before creating the timelock refund operation.

**`memberof`** BitcoinHTLC

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`hash` | Buffer | SHA256 hash of the secret. |
`sequence` | number | How many blocks need to be mined before refund is possible. |

**Returns:** *Payment*

The pay-to-scripthash object.

___

### `Private` getRedeemHex

▸ **getRedeemHex**(`transactionID`: string, `p2wsh`: Payment): *Promise‹string›*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:443](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L443)*

Redeems the HTLC.

**`memberof`** BitcoinHTLC

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`transactionID` | string | The transaction id from the funding transaction. |
`p2wsh` | Payment | Pay-to-witness-script-hash object. |

**Returns:** *Promise‹string›*

A redeem hex.

___

### `Private` getRefundHex

▸ **getRefundHex**(`transactionID`: string, `sequence`: number, `p2wsh`: Payment): *Promise‹string›*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:406](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L406)*

Refunds the HTLC to sender.

**`memberof`** BitcoinHTLC

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`transactionID` | string | The transaction id from the funding transaction. |
`sequence` | number | The timelock as number of blocks. |
`p2wsh` | Payment | Pay-to-witness-script-hash object. |

**Returns:** *Promise‹string›*

A refund hex.

___

### `Private` getWitnessPublicKeyHash

▸ **getWitnessPublicKeyHash**(`keyPair`: ECPairInterface): *Payment*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:216](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L216)*

Helperfunction to get the public key from an ECPair

**`memberof`** BitcoinHTLC

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`keyPair` | ECPairInterface | A keyPair initialized as ECPair. |

**Returns:** *Payment*

A p2wpkh object.

___

###  redeem

▸ **redeem**(`p2wsh`: Payment, `amount`: number, `secret`: [Secret](../interfaces/secret.md)): *Promise‹void›*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:325](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L325)*

Redeems an HTLC.

**`memberof`** BitcoinHTLC

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`p2wsh` | Payment | The Pay-to-witness-script-hash object to redeem. |
`amount` | number | The amount of satoshi to exchange. |
`secret` | [Secret](../interfaces/secret.md) | The secret object with the correct preimage inside. |

**Returns:** *Promise‹void›*

___

### `Private` redeemScript

▸ **redeemScript**(`hash`: Buffer, `sequence`: number): *Buffer*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:101](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L101)*

Create the redeem script in bitcoin's scripting language.

**`memberof`** BitcoinHTLC

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`hash` | Buffer | SHA256 hash of the secret. |
`sequence` | number | How many blocks need to be mined before refund is possible. |

**Returns:** *Buffer*

A bitcoin script.

___

### `Private` sendToP2WSHAddress

▸ **sendToP2WSHAddress**(`p2wsh`: Payment, `transactionID`: string, `amount`: number): *Promise‹string›*

*Defined in [pkg/bitcoin/htlc/btcHTLC.ts:249](https://github.com/chronark/swapchain/blob/6beff0a/src/pkg/bitcoin/htlc/btcHTLC.ts#L249)*

Send funds to a pay2witnessScripthash address to be used in the timelock refund operation.

**`memberof`** BitcoinHTLC

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`p2wsh` | Payment | Pay-to-witness-script-hash object. |
`transactionID` | string | A Transaction id with unspent funds. |
`amount` | number | The amount of satoshi to exchange. |

**Returns:** *Promise‹string›*

The hex-coded transaction. This needs to be pushed to the chain using `this.pushTX`