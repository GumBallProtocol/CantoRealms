const { inputToConfig } = require("@ethereum-waffle/compiler");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { execPath } = require("process");
const axios = require('axios');

const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount/10**decimals;
function timer(t) {
    return new Promise((r) => setTimeout(r, t));
}
const provider = new ethers.providers.getDefaultProvider(
    "http://127.0.0.1:8545/"
);

const AddressZero = '0x0000000000000000000000000000000000000000'
const one = convert('1', 18);
const two = convert('2', 18);
const three = convert('3', 18);
const four = convert('4', 18);
const five = convert('5', 18);
const ten = convert('10', 18);
const eighteen = convert('18', 18)
const nineteen = convert('19', 18)
const twenty = convert('20', 18)
const fifty = convert('50', 18)
const oneHundred = convert('100', 18);
const twoHundred = convert('200', 18);
const fiveHundred = convert('500', 18);
const eightHundred = convert('800', 18);
const oneThousand = convert('1000', 18);
const oneWeek = 604800;
const oneday = 24*3600;
const twodays = 2*24*3600;

// WCANTO
const WCANTO_addr = "0x826551890Dc65655a0Aceca109aB11AbDbD7a07B";
const WCANTO_url = "https://evm.explorer.canto.io/api?module=contract&action=getabi&address=0x826551890Dc65655a0Aceca109aB11AbDbD7a07B";

// NOTE
const NOTE_addr = "0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503";
const NOTE_url = "https://evm.explorer.canto.io/api?module=contract&action=getabi&address=0x4e71A2E537B7f9D9413D3991D37958c0b5e1e503";

// LP NOTE/CANTO
const LP_CANTO_NOTE_addr = "0x1D20635535307208919f0b67c3B2065965A85aA9";
const LP_CANTO_NOTE_url = "https://evm.explorer.canto.io/api?module=contract&action=getabi&address=0x1D20635535307208919f0b67c3B2065965A85aA9";

// c-LP NOTE/CANTO
const cLP_CANTO_NOTE_addr = "0x3C96dCfd875253A37acB3D2B102b6f328349b16B";
const cLP_CANTO_NOTE_url = "https://evm.explorer.canto.io/api?module=contract&action=getabi&address=0x9937afffc735a523bb4b24ebf558fa382866ac0a";

// CantoDexRouter
const router_addr = "0xa252eEE9BDe830Ca4793F054B506587027825a8e";
const router_url = "https://evm.explorer.canto.io/api?module=contract&action=getabi&address=0xa252eEE9BDe830Ca4793F054B506587027825a8e";

let response;
let multisig, user1, user2, user3, artist, protocol;
let WCANTO, NOTE, LP_CANTO_NOTE, cLP_CANTO_NOTE;
let gbtFactory, gnftFactory, xgbtFactory, factory;
let FORNI, FORNI_NFT, XFORNI, FORNI_FEES;

describe("SystemTesting0", function () {
  
    before("Initial set up", async function () {
        console.log("Begin Initialization");

        // initialize users
        [owner, user1, user2, user3, artist, protocol] = await ethers.getSigners();

        // WCANTO
        response = await axios.get(WCANTO_url);
        const WCANTO_abi = JSON.parse(response.data.result);
        WCANTO = new ethers.Contract(WCANTO_addr, WCANTO_abi, provider);
        timer(1000);
        console.log("- WCANTO Initialized");

        // NOTE
        NOTE = await ethers.getContractAt("ERC20Mock", NOTE_addr);
        console.log("- NOTE Initialized");

        // LP-CANTO/NOTE
        LP_CANTO_NOTE = await ethers.getContractAt("ERC20Mock", LP_CANTO_NOTE_addr);
        console.log("- LP-CANTO/NOTE Initialized");

        // cLP-CANTO/NOTE
        cLP_CANTO_NOTE = await ethers.getContractAt("ERC20Mock", cLP_CANTO_NOTE_addr);
        console.log("- cLP-CANTO/NOTE Initialized");

        // Router
        response = await axios.get(router_url);
        const router_abi = JSON.parse(response.data.result);
        router = new ethers.Contract(router_addr, router_abi, provider);
        timer(1000);
        console.log("- Router Initialized");

        const GBTFactory = await ethers.getContractFactory("GBTFactory");
        gbtFactory = await GBTFactory.deploy();
        await gbtFactory.deployed();
        console.log("- GBTFactory Initialized");

        const GNFTFactory = await ethers.getContractFactory("GNFTFactory");
        gnftFactory = await GNFTFactory.deploy();
        await gnftFactory.deployed();
        console.log("- GNFTFactory Initialized");

        const XGBTFactory = await ethers.getContractFactory("XGBTFactory");
        xgbtFactory = await XGBTFactory.deploy();
        await xgbtFactory.deployed();
        console.log("- XGBTFactory Initialized");

        const GumBallFactory = await ethers.getContractFactory("GumBallFactory");
        factory = await GumBallFactory.deploy(gbtFactory.address, gnftFactory.address, xgbtFactory.address, protocol.address);
        await factory.deployed();
        console.log("- GumBallFactory Initialized");

        await gbtFactory.connect(owner).setFactory(factory.address);
        await gnftFactory.connect(owner).setFactory(factory.address);
        await xgbtFactory.connect(owner).setFactory(factory.address);

        await factory.deployGumBall('Cantoforniway', 'FORNI', ['testuri', 'testURI'], oneHundred, oneHundred, cLP_CANTO_NOTE.address, artist.address, 0, 50);
        let GumBallData = await factory.deployInfo(0);
        FORNI = await ethers.getContractAt("contracts/GBTFactory.sol:GBT", GumBallData[0]);
        FORNI_NFT = await ethers.getContractAt("contracts/GNFTFactory.sol:GNFT", GumBallData[1]);
        XFORNI = await ethers.getContractAt("contracts/XGBTFactory.sol:XGBT", GumBallData[2]);
        FORNI_FEES = await ethers.getContractAt("contracts/GBTFactory.sol:GBTFees", await FORNI.getFees());
        console.log("- Cantofoniway GumBall Initialized");

        console.log("Initialization Complete");
        console.log("******************************************************");
    });

    it('System Status', async function () {
        console.log("******************************************************");
/*
        let reserveVirtualETH = await GBT.reserveVirtualBASE();
        let reserveRealETH = await GBT.reserveRealBASE();
        let balanceETH = await weth.balanceOf(GBT.address);
        let balanceGBT = await GBT.balanceOf(GBT.address);
        let reserveGBT = await GBT.reserveGBT()
        let totalSupplyGBT = await GBT.totalSupply();
        let borrowedTotalETH = await GBT.borrowedTotalBASE();

        let gumbarGBT = await XGBT.totalSupply();
        let rFDGBT = await XGBT.getRewardForDuration(GBT.address);
        let rFDETH = await XGBT.getRewardForDuration(weth.address);

        let nftMaxSupply = await GNFT.maxSupply();
        let nftSupply = await GNFT.totalSupply();

        let feesGBT = await GBT.balanceOf(GBTFees.address);
        let feesETH = await weth.balanceOf(GBTFees.address);

        let artistGBT = await GBT.balanceOf(artist.address);
        let artistETH = await weth.balanceOf(artist.address);

        let protocolGBT = await GBT.balanceOf(protocol.address);
        let protocolETH = await weth.balanceOf(protocol.address);

        let user1ETH = await weth.balanceOf(user1.address);
        let user1GBT = await GBT.balanceOf(user1.address);
        let user1GNFT = await GNFT.balanceOf(user1.address);
        let user1XGBT = await XGBT.balanceOf(user1.address);
        let user1EarnedGBT = await XGBT.earned(user1.address, GBT.address);
        let user1EarnedETH = await XGBT.earned(user1.address, weth.address);
        let user1BorrowedETH = await GBT.borrowedBASE(user1.address);
        let user1MustStayGBT = await GBT.mustStayGBT(user1.address);

        let user2ETH = await weth.balanceOf(user2.address);
        let user2GBT = await GBT.balanceOf(user2.address);
        let user2GNFT = await GNFT.balanceOf(user2.address);
        let user2XGBT = await XGBT.balanceOf(user2.address);
        let user2EarnedGBT = await XGBT.earned(user2.address, GBT.address);
        let user2EarnedETH = await XGBT.earned(user2.address, weth.address);
        let user2BorrowedETH = await GBT.borrowedBASE(user2.address);
        let user2MustStayGBT = await GBT.mustStayGBT(user2.address);

        let user3ETH = await weth.balanceOf(user3.address);
        let user3GBT = await GBT.balanceOf(user3.address);
        let user3GNFT = await GNFT.balanceOf(user3.address);
        let user3XGBT = await XGBT.balanceOf(user3.address);
        let user3EarnedGBT = await XGBT.earned(user3.address, GBT.address);
        let user3EarnedETH = await XGBT.earned(user3.address, weth.address);
        let user3BorrowedETH = await GBT.borrowedBASE(user3.address);
        let user3MustStayGBT = await GBT.mustStayGBT(user3.address);

        console.log("BONDING CURVE RESERVES");
        console.log("GBT Reserve", divDec(reserveGBT));
        console.log("vETH Reserve", divDec(reserveVirtualETH));
        console.log("rETH Reserve", divDec(reserveRealETH));
        console.log("ETH Borrowed", divDec(borrowedTotalETH));
        console.log("GBT Balance", divDec(balanceGBT));
        console.log("ETH Balance", divDec(balanceETH));
        console.log("GBT Total Supply", divDec(totalSupplyGBT));
        console.log();

        console.log("GUMBAR");
        console.log("GBT Staked", divDec(gumbarGBT));
        console.log("GBT reward for duration", divDec(rFDGBT));
        console.log("ETH reward for duration", divDec(rFDETH));
        console.log();

        console.log("Gumball Machine");
        console.log("NFT Max Supply", nftMaxSupply);
        console.log("NFT Supply", nftSupply);
        for (let i = 0; i < await GNFT.gumballsLength(); i++) {
            console.log("Gumball", i, " ", await GNFT.gumballs(i));
        }
        console.log();

        console.log("FEES BALANCES");
        console.log("GBT", divDec(feesGBT));
        console.log("ETH", divDec(feesETH));
        console.log();

        console.log("ARTIST BALANCES");
        console.log("GBT", divDec(artistGBT));
        console.log("ETH", divDec(artistETH));
        console.log();

        console.log("PROTOCOL BALANCES");
        console.log("GBT", divDec(protocolGBT));
        console.log("ETH", divDec(protocolETH));
        console.log();

        console.log("USER1 BALANCES");
        console.log("ETH", divDec(user1ETH));
        console.log("GBT", divDec(user1GBT));
        console.log("GNFT", divDec(user1GNFT));
        console.log("Staked GBT", divDec(user1XGBT));
        console.log("Earned GBT", divDec(user1EarnedGBT));
        console.log("Earned ETH", divDec(user1EarnedETH));
        console.log("Borrowed ETH", divDec(user1BorrowedETH));
        console.log("Must Stay GBT", divDec(user1MustStayGBT));
        console.log();

        console.log("USER2 BALANCES");
        console.log("ETH", divDec(user2ETH));
        console.log("GBT", divDec(user2GBT));
        console.log("GNFT", divDec(user2GNFT));
        console.log("Staked GBT", divDec(user2XGBT));
        console.log("Earned GBT", divDec(user2EarnedGBT));
        console.log("Earned ETH", divDec(user2EarnedETH));
        console.log("Borrowed ETH", divDec(user2BorrowedETH));
        console.log("Must Stay GBT", divDec(user2MustStayGBT));
        console.log();

        console.log("USER3 BALANCES");
        console.log("ETH", divDec(user3ETH));
        console.log("GBT", divDec(user3GBT));
        console.log("GNFT", divDec(user3GNFT));
        console.log("Staked GBT", divDec(user3XGBT));
        console.log("Earned GBT", divDec(user3EarnedGBT));
        console.log("Earned ETH", divDec(user3EarnedETH));
        console.log("Borrowed ETH", divDec(user3BorrowedETH));
        console.log("Must Stay GBT", divDec(user3MustStayGBT));
        console.log();

        // invariants
        await expect(reserveGBT).to.be.equal(balanceGBT);
        await expect(reserveRealETH.sub(borrowedTotalETH)).to.be.equal(balanceETH);
*/
    });

})