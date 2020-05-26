import * as bitcoin from "bitcoinjs-lib"
import { PrivateKey } from "bitsharesjs"
import { getBTCAddress, getBTSAddress } from "./address"

describe("BTC address generator", () => {
  const addressPair = getBTCAddress("bitcoin")
  const addressPair2 = getBTCAddress("testnet")
  const addressPair3 = getBTCAddress("regtest")

  it("should return an address with 1, n or m as first char", () => {
    expect(addressPair.address.startsWith("1")).toBe(true)
    expect(addressPair2.address.startsWith("m") || addressPair2.address.startsWith("n")).toBe(true)
    expect(addressPair3.address.startsWith("m") || addressPair3.address.startsWith("n")).toBe(true)
  })
  it("should be possible to calculate address with privateKey", () => {
    const keyPair = bitcoin.ECPair.fromWIF(addressPair.privateKey)
    const address = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network: bitcoin.networks.bitcoin }).address
    expect(address).toBe(addressPair.address)
  })
  it("should return an error with an invalid network", () => {
    expect(() => getBTCAddress("XYZ")).toThrow("Invalid network name. Choose bitcoin, testnet or regtest.")
  })
  it("should return an error if address is undefined", () => {
    jest.spyOn(bitcoin.payments, "p2pkh").mockImplementation((): bitcoin.payments.Payment => ({}))
    expect(() => getBTCAddress("testnet")).toThrow("Unknown error during address generation.")
  })
})

describe("BTS address generator", () => {
  const addressPair = getBTSAddress("bitshares")
  const addressPair2 = getBTSAddress("testnet")

  it("should return an address starting with the corresponding network prefix", () => {
    expect(addressPair.address.startsWith("BTS")).toBe(true)
    expect(addressPair2.address.startsWith("TEST")).toBe(true)
  })
  it("should be possible to calculate address with privateKey", () => {
    const privateKey = PrivateKey.fromWif(addressPair2.privateKey)
    const address = privateKey.toPublicKey().toAddressString()
    expect(address).toBe(addressPair2.address)
  })
  it("should return an error with an invalid network", () => {
    expect(() => getBTSAddress("XYZ")).toThrow("Invalid network name. Choose bitshares or testnet.")
  })
})
