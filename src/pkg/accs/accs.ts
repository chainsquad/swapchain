/*eslint no-loop-func: "off"*/
import { Secret } from "../secret/secret"
import * as bitcoin from "bitcoinjs-lib"
import BitcoinHTLC from "../bitcoin/htlc/btcHTLC"
import BitsharesHTLC from "../bitshares/htlc/btsHTLC"
import { BlockStream } from "../bitcoin/api/blockstream"
import { Timer } from "./timer"
import { BitsharesAPI } from "../bitshares/api/api"

/**
 * Contains raw user input to run an ACCS. Needs to get parsed.
 *
 * @interface ACCSFields
 */
export interface ACCSFields {
  /**
   * The transaction mode. Either proposer or accepter.
   */
  mode: string

  /**
   * The network name. Either mainnet or testnet.
   */
  networkToTrade: string

  /**
   * The currency to give. Either BTC or BTS.
   */
  currencyToGive: string

  /**
   * The amount to send.
   */
  amountToSend: number

  /**
   * The exchange rate both parties agreed on.
   */
  rate: number

  /**
   * The amount to receive.
   */
  amountToReceive: number

  /**
   * The Bitcoin private key.
   */
  bitcoinPrivateKey: string

  /**
   * The Bitshares private key.
   */
  bitsharesPrivateKey: string

  /**
   * The Bitcoin public key of the counterparty.
   */
  counterpartyBitcoinPublicKey: string

  /**
   * The Bitshares account name of the counterparty.
   */
  counterpartyBitsharesAccountName: string

  /**
   * The Bitcoin transaction ID to spend.
   */
  bitcoinTxID: string

  /**
   * The priority of the transactions. Either 0 (high), 1 (medium) or 2 (low).
   */
  priority: number

  /**
   * A secret object with a random preimage and its corresponding SHA256 hash.
   */
  secret: Secret

  /**
   * A secret SHA256 hash.
   */
  secretHash?: string
}

/**
 * Contains all necessary information to run an ACCS after parsing.
 *
 * @interface ACCSConfig
 */
export interface ACCSConfig {
  /**
   * The transaction mode. Either proposer or accepter.
   */
  mode: string

  /**
   * The transaction type. Either BTC or BTS.
   */
  type: string

  /**
   * The Bitcoin transaction priority (0 = high, 1 = medium, 2 = low)
   */
  priority: number

  /**
   * The user's own Bitshares account ID.
   */
  bitsharesAccountID: string

  /**
   * The user's own Bitshares private key.
   */
  bitsharesPrivateKey: string

  /**
   * The counterparty's Bitshares account ID.
   */
  counterpartyBitsharesAccountID: string

  /**
   * The amount of Bitshares in 1/100000 BTS.
   */
  amountBTSMini: number

  /**
   * The amount of Bitcoin in Satoshi 1/100000000 BTC.
   */
  amountSatoshi: number

  /**
   * The user's own Bitcoin compressed keypair.
   */
  keyPairCompressedBTC: bitcoin.ECPairInterface

  /**
   * The counterparty's Bitcoin compressed keypair. Only contains a public key!
   */
  counterpartyKeyPairCompressedBTC: bitcoin.ECPairInterface

  /**
   * The timelock for the Bitcoin blockchain in blocks.
   */
  timelockBTC: number

  /**
   * The timelock for the Bitshares blockchain in seconds.
   */
  timelockBTS: number

  /**
   * A secret object with a random preimage and its corresponding SHA256 hash.
   */
  secret: Secret

  /**
   * The Bitcoin transaction id the user wants to spend.
   */
  bitcoinTxID: string

  /**
   * The Bitcoin network object.
   */
  network: bitcoin.networks.Network

  /**
   * The network name. Either mainnet or testnet.
   */
  networkName: string

  /**
   * The asset on Bitshares blockchain. Either BTS or TEST.
   */
  bitsharesAsset: string

  /**
   * The endpoint address of the Bitshares node to connect to.
   */
  bitsharesEndpoint: string

  /**
   * The interval in seconds the APIs get called.
   */
  checkAPIInterval: number
}

/**
 * Handler to create HTLCs on the respective blockchains to run an ACCS.
 *
 * @class ACCS
 */
export default class ACCS {
  /**
   * Parse user input to create config
   *
   * @param fields
   */
  public static async parseUserInput(fields: ACCSFields): Promise<ACCSConfig> {
    const config = {} as ACCSConfig

    if (fields.networkToTrade === "mainnet") {
      config.network = bitcoin.networks.bitcoin
      config.bitsharesAsset = "BTS"
      config.bitsharesEndpoint = "wss://api.dex.trading/"
    } else {
      config.network = bitcoin.networks.testnet
      config.bitsharesAsset = "TEST"
      config.bitsharesEndpoint = "wss://testnet.dex.trading/"
    }

    const websocket = await BitsharesAPI.getInstance(config.bitsharesEndpoint)

    config.networkName = fields.networkToTrade
    config.mode = fields.mode
    config.type = fields.currencyToGive
    config.priority = fields.priority
    config.bitsharesAccountID = await websocket.toAccountID(fields.bitsharesPrivateKey, fields.networkToTrade)
    config.bitsharesPrivateKey = fields.bitsharesPrivateKey
    config.counterpartyBitsharesAccountID = await websocket.getAccountID(fields.counterpartyBitsharesAccountName)

    if (config.type === "BTC") {
      config.amountBTSMini = Math.round(fields.amountToReceive * 10e4)
      config.amountSatoshi = Math.round(fields.amountToSend * 10e7)
    } else {
      config.amountBTSMini = Math.round(fields.amountToSend * 10e4)
      config.amountSatoshi = Math.round(fields.amountToReceive * 10e7)
    }

    const keyPairBTC = bitcoin.ECPair.fromWIF(fields.bitcoinPrivateKey, config.network)
    config.keyPairCompressedBTC = bitcoin.ECPair.fromPrivateKey(keyPairBTC.privateKey!, { compressed: true })

    config.counterpartyKeyPairCompressedBTC = bitcoin.ECPair.fromPublicKey(
      Buffer.from(fields.counterpartyBitcoinPublicKey, "hex"),
      {
        compressed: true,
      },
    )

    config.bitcoinTxID = fields.bitcoinTxID

    const timer = new Timer(6, fields.networkToTrade, BlockStream)

    config.timelockBTC = timer.toBTC() // number of blocks to wait
    config.timelockBTS = await timer.toBTS() // seconds to wait

    config.secret = fields.secret

    config.checkAPIInterval = 4 // This can be changed. It's a trade-off. Lower values might make swaping faster, but spam APIs.

    return config
  }

  /**
   * Handles ACCS for proposer who wants BTS for BTC.
   *
   * @memberof ACCS
   */
  public static async proposeBTSForBTC(config: ACCSConfig): Promise<void> {
    config.timelockBTS = Math.round(config.timelockBTS / 2)

    const htlcBTCProposer = new BitcoinHTLC(
      config.networkName,
      config.keyPairCompressedBTC,
      config.counterpartyKeyPairCompressedBTC,
      config.priority,
      BlockStream,
    )

    const refundHex = await htlcBTCProposer.create({
      transactionID: config.bitcoinTxID,
      amount: config.amountSatoshi,
      sequence: config.timelockBTC,
      hash: config.secret.hash,
    })

    console.log(`Successfully created HTLC on Bitcoin ${config.networkName}!`)
    console.log(
      `Looking for an HTLC for you on Bitshares ${config.networkName}. This can take up to ${
        config.timelockBTC
      } Bitcoin ${config.networkName} blocks (about ${Math.round(config.timelockBTS / 60)} min).`,
    )

    const htlcBTSProposer = new BitsharesHTLC(
      config.bitsharesEndpoint,
      config.counterpartyBitsharesAccountID,
      config.bitsharesAccountID,
    )

    let success = false

    const maxBlockHeight = htlcBTCProposer.getFundingTxBlockHeight()! + config.timelockBTC
    let currentBlockHeight = 0
    // If no HTLC found immediately, continue looking until timelock
    while (!success && currentBlockHeight < maxBlockHeight) {
      await htlcBTSProposer
        .redeem(config.amountBTSMini, config.bitsharesPrivateKey, config.secret)
        /* eslint-disable-next-line */
        .then((s) => {
          success = s
        })
        .catch((err: Error) => {}) // This error is intentional and expected to occur for most iterations

      currentBlockHeight = (await htlcBTCProposer.bitcoinAPI.getLastBlock()).height

      await new Promise((resolve) => setTimeout(resolve, config.checkAPIInterval * 1_000))
    }

    if (!success) {
      const refundTXId = await htlcBTCProposer.bitcoinAPI.pushTX(refundHex)
      throw new Error(
        `No HTLC found on Bitshares ${config.networkName}. Your HTLC was refunded with transaction ID ${refundTXId}.`,
      )
    }
    // TODO: Seperate this message when Bitshares API is ready
    console.log(`Found the HTLC for you on Bitshares ${config.networkName}! Redeeming the HTLC...`)
  }

  /**
   * Handles ACCS for proposer who wants BTC for BTS.
   *
   * @memberof ACCS
   */
  public static async proposeBTCForBTS(config: ACCSConfig): Promise<void> {
    config.timelockBTC = Math.round(config.timelockBTC / 2)

    // Create BTS HTLC
    const htlcBTSProposer = new BitsharesHTLC(
      config.bitsharesEndpoint,
      config.bitsharesAccountID,
      config.counterpartyBitsharesAccountID,
    )

    await htlcBTSProposer.create({
      amount: config.amountBTSMini,
      asset: config.bitsharesAsset,
      time: config.timelockBTS,
      hash: config.secret.hash,
      privateKey: config.bitsharesPrivateKey,
    })

    console.log(`Successfully created HTLC on Bitshares ${config.networkName}!`)
    console.log(
      `Looking for an HTLC for you on Bitcoin ${config.networkName}. This can take up to ${Math.round(
        config.timelockBTS / 60,
      )} min.`,
    )

    const htlcBTCProposer = new BitcoinHTLC(
      config.networkName,
      config.counterpartyKeyPairCompressedBTC,
      config.keyPairCompressedBTC,
      config.priority,
      BlockStream,
    )

    const p2wsh = htlcBTCProposer.getP2WSH(config.secret.hash, config.timelockBTC)

    let timeToWait = Math.round(config.timelockBTS / config.checkAPIInterval) // We only check API every X seconds

    let txID: string | null = null

    while (txID === null && timeToWait > 0) {
      await htlcBTCProposer.bitcoinAPI
        .getValueFromLastTransaction(p2wsh.address!)
        // eslint-disable-next-line
        .then((res) => {
          txID = res.txID
        })
        .catch((err: Error) => {}) // This error is intentional and expected to occur for most iterations

      await new Promise((resolve) => setTimeout(resolve, config.checkAPIInterval * 1_000))

      timeToWait--
    }

    if (txID === null) {
      throw new Error(`No HTLC found on Bitcoin ${config.networkName}. Your HTLC will be automatically refunded.`)
    }

    // redeem
    await htlcBTCProposer.redeem(p2wsh, config.amountSatoshi, config.secret)
  }

  /**
   * Handles ACCS for accepter who wants BTS for BTC.
   *
   * @memberof ACCS
   */
  public static async takeBTSForBTC(config: ACCSConfig): Promise<void> {
    const websocket = await BitsharesAPI.getInstance(config.bitsharesEndpoint)

    config.timelockBTC = Math.round(config.timelockBTC / 2)

    // Look for BTS HTLC and only continue if there is one
    const htlcBTSAccepter = new BitsharesHTLC(
      config.bitsharesEndpoint,
      config.counterpartyBitsharesAccountID,
      config.bitsharesAccountID,
    )

    // This can be changed, but 5 minutes waiting seem to be fine,
    // since mining on Bitshares is fast.
    // Must be a multiple of config.checkAPIInterval!
    let timeToWait = 300

    console.log(
      `Looking for an HTLC for you on Bitshares ${config.networkName}. This can take up to ${timeToWait / 60} min.`,
    )

    let id = ""

    while (!id && timeToWait > 0) {
      await websocket
        .getID(
          config.counterpartyBitsharesAccountID,
          config.bitsharesAccountID,
          config.amountBTSMini,
          config.secret.hash,
          config.timelockBTS,
        )
        /* eslint-disable-next-line */
        .then((res) => (id = res))
        .catch((err: Error) => {}) // This error is intentional and expected to occur for most iterations

      await new Promise((resolve) => setTimeout(resolve, config.checkAPIInterval * 1_000))

      timeToWait -= config.checkAPIInterval
    }

    // TODO: Improve user feedback, e. g. if looking fails due to wrong amount.
    if (!id) {
      throw new Error(`No HTLC found on Bitshares ${config.networkName}. Please contact proposer.`)
    }

    console.log(`Found the HTLC for you on Bitshares ${config.networkName}!`)

    const htlcBTCAccepter = new BitcoinHTLC(
      config.networkName,
      config.keyPairCompressedBTC,
      config.counterpartyKeyPairCompressedBTC,
      config.priority,
      BlockStream,
    )

    const refundHex = await htlcBTCAccepter.create({
      transactionID: config.bitcoinTxID,
      amount: config.amountSatoshi,
      sequence: config.timelockBTC,
      hash: config.secret.hash,
    })

    console.log("HTLC successfully created on Bitcoin. Waiting for counterparty to redeem it...")

    // Wait for Alice to redeem the BTC HTLC, then extract secret
    const p2wsh = htlcBTCAccepter.getP2WSH(config.secret.hash, config.timelockBTC)

    let preimageFromBlockchain: string | null = null
    const maxBlockHeight = htlcBTCAccepter.getFundingTxBlockHeight()! + config.timelockBTC
    let currentBlockHeight = 0

    while (preimageFromBlockchain === null && currentBlockHeight < maxBlockHeight) {
      currentBlockHeight = (await htlcBTCAccepter.bitcoinAPI.getLastBlock()).height

      await htlcBTCAccepter.bitcoinAPI
        .getPreimageFromLastTransaction(p2wsh.address!)
        // eslint-disable-next-line
        .then((preimage) => (preimageFromBlockchain = preimage))

      await new Promise((resolve) => setTimeout(resolve, config.checkAPIInterval * 1_000))
    }

    if (preimageFromBlockchain === null) {
      const refundTXId = await htlcBTCAccepter.bitcoinAPI.pushTX(refundHex)
      if (!refundTXId) {
        throw new Error(`Could not push refundHex to endpoint. Hex for refund transaction: ${refundHex}`)
      }
      throw new Error(
        `HTLC was not redeemed in time by the counterparty. Your HTLC was refunded with transaction ID ${refundTXId}.`,
      )
    }

    config.secret.preimage = preimageFromBlockchain

    console.log(
      `Your Bitcoin HTLC was redeemed by the counterparty using the secret "${config.secret.preimage}". Redeeming the Bitshares HTLC...`,
    )

    // Redeem BTS HTLC with secret

    const success = await htlcBTSAccepter.redeem(config.amountBTSMini, config.bitsharesPrivateKey, config.secret)

    if (!success) {
      throw new Error("Could not redeem Bitshares HTLC. Please try manually.")
    }
  }

  /**
   * Handles ACCS for accepter who wants BTC for BTS.
   *
   * @memberof ACCS
   */
  public static async takeBTCForBTS(config: ACCSConfig): Promise<void> {
    const websocket = await BitsharesAPI.getInstance(config.bitsharesEndpoint)

    config.timelockBTS = Math.round(config.timelockBTS / 2)
    // Look for BTC HTLC and only continue if there is one
    // Use p2wsh address and fetch txs
    const htlcBTCAccepter = new BitcoinHTLC(
      config.networkName,
      config.counterpartyKeyPairCompressedBTC,
      config.keyPairCompressedBTC,
      config.priority,
      BlockStream,
    )

    // This can be changed, but 30 minutes waiting seem to be fine,
    // since it might take up to 20 mins on Bitcoin testnet for the next block to get mined.
    // Must be a multiple of config.checkAPIInterval!
    let timeToWait = 1800

    console.log(
      `Looking for an HTLC for you on Bitcoin ${config.networkName}. This can take up to ${timeToWait / 60} min.`,
    )

    const p2wsh = htlcBTCAccepter.getP2WSH(config.secret.hash, config.timelockBTC)

    let txID: string | null = null
    let value: number | null = null

    while (txID === null && timeToWait > 0) {
      await htlcBTCAccepter.bitcoinAPI
        .getValueFromLastTransaction(p2wsh.address!)
        .then((res) => {
          /* eslint-disable-next-line */
          txID = res.txID
          /* eslint-disable-next-line */
          value = res.value
        })
        .catch((err: Error) => {}) // This error is intentional and expected to occur for most iterations

      await new Promise((resolve) => setTimeout(resolve, config.checkAPIInterval * 1_000))

      timeToWait -= config.checkAPIInterval
    }

    if (timeToWait === 0) {
      throw new Error(`No HTLC found on Bitcoin ${config.networkName}. Please contact proposer.`)
    }

    // Check if amount of proposer's HTLC is sufficient
    const fees = await htlcBTCAccepter.calculateFee()

    if (value! < config.amountSatoshi - fees.max) {
      throw new Error(`The amount of Satoshi sent (${value}) is not sufficient. Please contact proposer.`)
    }

    console.log(`Found the HTLC for you on Bitcoin ${config.networkName}!`)

    // Create BTS HTLC
    const htlcBTSAccepter = new BitsharesHTLC(
      config.bitsharesEndpoint,
      config.bitsharesAccountID,
      config.counterpartyBitsharesAccountID,
    )

    await htlcBTSAccepter.create({
      amount: config.amountBTSMini,
      asset: config.bitsharesAsset,
      time: config.timelockBTS,
      hash: config.secret.hash,
      privateKey: config.bitsharesPrivateKey,
    })

    console.log("HTLC successfully created on Bitshares. Waiting for counterparty to redeem it...")

    // Wait for Alice to redeem the BTS HTLC, then extract secret
    timeToWait = config.timelockBTS

    let preimage = ""
    while (!preimage && timeToWait > 0) {
      await websocket
        .getPreimageFromHTLC(
          config.bitsharesAccountID,
          config.counterpartyBitsharesAccountID,
          config.secret.hash.toString("hex"),
        )
        // eslint-disable-next-line
        .then((s: string) => (preimage = s))
        .catch((err: Error) => {}) // This error is intentional and expected to occur for most iterations

      // Wait three secondes, then try again
      await new Promise((resolve) => setTimeout(resolve, 1_000))

      timeToWait--
    }

    if (!preimage) {
      throw new Error("HTLC was not redeemed in time by the counterparty. Your HTLC will be automatically refunded.")
    }
    config.secret.preimage = preimage

    console.log(
      `Your Bitshares HTLC was redeemed by the counterparty using the secret "${config.secret.preimage}". Redeeming the Bitcoin HTLC...`,
    )

    // Redeem BTC HTLC
    await htlcBTCAccepter.redeem(p2wsh, config.amountSatoshi, config.secret)
  }

  /**
   * Entrypoint for web app and CLI. Calls respective parse and swap methods.
   *
   * @param fields - The raw user input object.
   * @memberof ACCS
   */
  public static async run(fields: ACCSFields): Promise<void> {
    const config = await ACCS.parseUserInput(fields)

    if (config.type === "BTC" && config.mode === "proposer") {
      await ACCS.proposeBTSForBTC(config)
    } else if (config.type === "BTS" && config.mode === "proposer") {
      await ACCS.proposeBTCForBTS(config)
    } else if (config.type === "BTC" && config.mode === "accepter") {
      await ACCS.takeBTSForBTC(config)
    } else if (config.type === "BTS" && config.mode === "accepter") {
      await ACCS.takeBTCForBTS(config)
    }
  }
}
