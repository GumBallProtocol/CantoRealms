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
let WCANTO, NOTE, LP_CANTO_NOTE, cLP_CANTO_NOTE, gummiCLP;
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
        response = await axios.get(cLP_CANTO_NOTE_url);
        const cLP_CANTO_NOTE_abi = JSON.parse(response.data.result);
        cLP_CANTO_NOTE = new ethers.Contract(cLP_CANTO_NOTE_addr, cLP_CANTO_NOTE_abi, provider);
        timer(1000);
        console.log("- cLP-CANTO/NOTE Initialized");

        // Gummi CLP
        const GUMMI_CLP = await ethers.getContractFactory("CTokenPlugin");
        gummiCLP = await GUMMI_CLP.deploy("gummiCLP", "gummiCLP", cLP_CANTO_NOTE.address, [WCANTO.address], [WCANTO.address, NOTE.address]);
        await gummiCLP.deployed();
        console.log("- gummiCLP Deployed");

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

        await factory.deployGumBall('Cantoforniway', 'FORNI', ['testuri', 'testURI'], oneHundred, oneHundred, gummiCLP.address, artist.address, 0, 50);
        let GumBallData = await factory.deployInfo(0);
        FORNI = await ethers.getContractAt("contracts/GBTFactory.sol:GBT", GumBallData[0]);
        FORNI_NFT = await ethers.getContractAt("contracts/GNFTFactory.sol:GNFT", GumBallData[1]);
        XFORNI = await ethers.getContractAt("contracts/XGBTFactory.sol:XGBT", GumBallData[2]);
        FORNI_FEES = await ethers.getContractAt("contracts/GBTFactory.sol:GBTFees", await FORNI.getFees());
        await gummiCLP.connect(owner).setXGBT(XFORNI.address);
        await XFORNI.connect(artist).addReward(WCANTO.address);
        console.log("- Cantofoniway GumBall Initialized");

        console.log("Initialization Complete");
        console.log("******************************************************");
    });

    it("User1 trades 1000 CANTO for NOTE", async function () {
        console.log("******************************************************");
        await router.connect(user1).swapExactCANTOForTokens(1, [[WCANTO.address, NOTE.address, false]], user1.address, 1975818632, {value: oneThousand,});
    });

    it("User1 adds liquidity on LP-CANTO/NOTE", async function () {
        console.log("******************************************************");
        await NOTE.connect(user1).approve(router.address, oneThousand);
        await router.connect(user1).addLiquidityCANTO(NOTE.address, false, oneThousand, 1, 1, user1.address, 1975818632, {value: oneThousand,});
    });

    it("User1 deposits LP-CANTO/NOTE in lending market", async function () {
        console.log("******************************************************");
        await LP_CANTO_NOTE.connect(user1).approve(cLP_CANTO_NOTE.address, fiveHundred);
        await cLP_CANTO_NOTE.connect(user1).mint(fiveHundred);
    });

    it("User1 deposits cLP-CANTO/NOTE in CTokenPlugin", async function () {
        console.log("******************************************************");
        await cLP_CANTO_NOTE.connect(user1).approve(gummiCLP.address, fiveHundred);
        await gummiCLP.connect(user1).depositFor(user1.address, fiveHundred);
    });

    it('User1 Buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).approve(FORNI.address, ten);
        await FORNI.connect(user1).buy(ten, 1, 1682282187, AddressZero);
    });

    it('User1 Buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");

        await gummiCLP.connect(user1).approve(FORNI.address, ten);
        await FORNI.connect(user1).buy(ten, 1, 1682282187, AddressZero);
    });

    it('User1 converts 1 FORNI to 1 gNFT', async function () {
        console.log("******************************************************");

        await FORNI.connect(user1).approve(FORNI_NFT.address, one);
        await FORNI_NFT.connect(user1).swap(one);
    });

    it('User1 sells rest of FORNI', async function () {
        console.log("******************************************************");

        await FORNI.connect(user1).approve(FORNI.address, await FORNI.balanceOf(user1.address));
        await FORNI.connect(user1).sell(await FORNI.balanceOf(user1.address), 1, 1682282187);
    });

    it('User1 stakes 1 gNFT', async function () {
        console.log("******************************************************");

        let tokenID = await FORNI_NFT.tokenOfOwnerByIndex(user1.address, 0);
        await FORNI_NFT.connect(user1).approve(XFORNI.address, tokenID);
        await XFORNI.connect(user1).depositNFT([tokenID]);
    });

    it('User1 unstakes FORNI', async function () {
        console.log("******************************************************");

        await expect(XFORNI.connect(user1).withdrawToken(await XFORNI.balanceOf(user1.address))).to.be.revertedWith("Insufficient balance");
    });

    it('User1 unstakes wrong NFT', async function () {
        console.log("******************************************************");

        await expect(XFORNI.connect(user1).withdrawNFT([1])).to.be.revertedWith("!Found");
    });

    it("User2 trades 1000 CANTO for NOTE", async function () {
        console.log("******************************************************");
        await router.connect(user2).swapExactCANTOForTokens(1, [[WCANTO.address, NOTE.address, false]], user2.address, 1975818632, {value: oneThousand,});
    });

    it("User2 adds liquidity on LP-CANTO/NOTE", async function () {
        console.log("******************************************************");
        await NOTE.connect(user2).approve(router.address, oneThousand);
        await router.connect(user2).addLiquidityCANTO(NOTE.address, false, oneThousand, 1, 1, user2.address, 1975818632, {value: oneThousand,});
    });

    it("User2 deposits LP-CANTO/NOTE in lending market", async function () {
        console.log("******************************************************");
        await LP_CANTO_NOTE.connect(user2).approve(cLP_CANTO_NOTE.address, fiveHundred);
        await cLP_CANTO_NOTE.connect(user2).mint(fiveHundred);
    });

    it("User2 deposits cLP-CANTO/NOTE in CTokenPlugin", async function () {
        console.log("******************************************************");
        await cLP_CANTO_NOTE.connect(user2).approve(gummiCLP.address, fiveHundred);
        await gummiCLP.connect(user2).depositFor(user2.address, fiveHundred);
    });

    it('User2 Buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user2).approve(FORNI.address, ten);
        await FORNI.connect(user2).buy(ten, 1, 1682282187, AddressZero);
    });

    it('User2 converts 1 FORNI to 1 gNFT', async function () {
        console.log("******************************************************");
        await FORNI.connect(user2).approve(FORNI_NFT.address, one);
        await FORNI_NFT.connect(user2).swap(one);
    });

    it('User2 sells rest of FORNI', async function () {
        console.log("******************************************************");

        await FORNI.connect(user2).approve(FORNI.address, await FORNI.balanceOf(user2.address));
        await FORNI.connect(user2).sell(await FORNI.balanceOf(user2.address), 1, 1682282187);
    });

    it('User2 stakes 1 gNFT', async function () {
        console.log("******************************************************");

        let tokenID = await FORNI_NFT.tokenOfOwnerByIndex(user2.address, 0);
        await FORNI_NFT.connect(user2).approve(XFORNI.address, tokenID);
        await XFORNI.connect(user2).depositNFT([tokenID]);
    });

    it("User1 withdraws cLP-CANTO/NOTE in CTokenPlugin", async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).approve(gummiCLP.address, oneHundred);
        await gummiCLP.connect(user1).withdrawTo(user1.address, oneHundred);
    });

    it('User1 unstakes user2s NFT', async function () {
        console.log("******************************************************");
        await expect(XFORNI.connect(user1).withdrawNFT([1])).to.be.revertedWith("!Found");
    });

    it('User1 unstakes NFT', async function () {
        console.log("******************************************************");
        await XFORNI.connect(user1).withdrawNFT([0]);
    });

    it('User1 converts NFT to GBT', async function () {
        console.log("******************************************************");
        let tokenID = await FORNI_NFT.tokenOfOwnerByIndex(user1.address, 0);
        await FORNI_NFT.connect(user1).approve(FORNI_NFT.address, tokenID);
        await FORNI_NFT.connect(user1).redeem([0]);
    });

    it('User2 borrows max against position', async function () {
        console.log("******************************************************");
        await FORNI.connect(user2).borrowMax();
    });

    it('User2 withdraws NFT', async function () {
        console.log("******************************************************");
        await expect(XFORNI.connect(user2).withdrawToken(await XFORNI.balanceOf(user2.address))).to.be.revertedWith("Insufficient balance");
        await expect(XFORNI.connect(user2).withdrawNFT([1])).to.be.revertedWith("Borrow debt");
    });

    it("User2 withdraws cLP-CANTO/NOTE in CTokenPlugin", async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user2).approve(gummiCLP.address, oneHundred);
        await gummiCLP.connect(user2).withdrawTo(user2.address, oneHundred);
    });

    it('User2 Buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user2).approve(FORNI.address, ten);
        await FORNI.connect(user2).buy(ten, 1, 1682282187, AddressZero);
    });

    it('User2 stakes FORNI', async function () {
        console.log("******************************************************");
        await FORNI.connect(user2).approve(XFORNI.address, ten);
        await XFORNI.connect(user2).depositToken(await FORNI.balanceOf(user2.address));
    });

    it('User2 unstakes NFT', async function () {
        console.log("******************************************************");
        await XFORNI.connect(user2).withdrawNFT([1]);
    });

    it('User2 unstakes FORNI', async function () {
        console.log("******************************************************");
        await expect(XFORNI.connect(user2).withdrawToken(await XFORNI.balanceOf(user2.address))).to.be.revertedWith("Borrow debt");
        await XFORNI.connect(user2).withdrawToken((await XFORNI.balanceOf(user2.address)).sub(one));
    });

    it('User2 converts NFT to FORNI', async function () {
        console.log("******************************************************");

        let tokenID = await FORNI_NFT.tokenOfOwnerByIndex(user2.address, 0);
        await FORNI_NFT.connect(user2).approve(FORNI_NFT.address, tokenID);
        await FORNI_NFT.connect(user2).redeem([tokenID]);
    });

    it('User2 borrows max against position', async function () {
        console.log("******************************************************");
        await FORNI.connect(user2).borrowMax();
    });

    it('User2 calls treasury skim', async function () {
        console.log("******************************************************");
        await FORNI_FEES.connect(user2).distributeFees();
    });

    it('Forward 7 days', async function () {
        console.log("******************************************************");
        await network.provider.send('evm_increaseTime', [7*24*3600]); 
        await network.provider.send('evm_mine');
    });

    it('User2 claims rewards', async function () {
        console.log("******************************************************");
        await XFORNI.connect(user2).getReward();
    });

    it("User3 trades 1000 CANTO for NOTE", async function () {
        console.log("******************************************************");
        await router.connect(user3).swapExactCANTOForTokens(1, [[WCANTO.address, NOTE.address, false]], user3.address, 1975818632, {value: oneThousand,});
    });

    it("User3 adds liquidity on LP-CANTO/NOTE", async function () {
        console.log("******************************************************");
        await NOTE.connect(user3).approve(router.address, oneThousand);
        await router.connect(user3).addLiquidityCANTO(NOTE.address, false, oneThousand, 1, 1, user3.address, 1975818632, {value: oneThousand,});
    });

    it("User3 deposits LP-CANTO/NOTE in lending market", async function () {
        console.log("******************************************************");
        await LP_CANTO_NOTE.connect(user3).approve(cLP_CANTO_NOTE.address, fiveHundred);
        await cLP_CANTO_NOTE.connect(user3).mint(fiveHundred);
    });

    it("User3 deposits cLP-CANTO/NOTE in CTokenPlugin", async function () {
        console.log("******************************************************");
        await cLP_CANTO_NOTE.connect(user3).approve(gummiCLP.address, fiveHundred);
        await gummiCLP.connect(user3).depositFor(user3.address, fiveHundred);
    });

    it('User3 Buys FORNI with 100 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user3).approve(FORNI.address, oneHundred);
        await FORNI.connect(user3).buy(oneHundred, 1, 1682282187, AddressZero);
    });

    it('User3 converts 10 FORNI to NFT', async function () {
        console.log("******************************************************");
        await FORNI.connect(user3).approve(FORNI_NFT.address, ten);
        await FORNI_NFT.connect(user3).swap(ten);
    });

    it('User3 stakes 5 NFT', async function () {
        console.log("******************************************************");
        let tokenID1 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 0);
        let tokenID2 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 1);
        let tokenID3 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 2);
        let tokenID4 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 3);
        let tokenID5 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 4);
        await FORNI_NFT.connect(user3).approve(XFORNI.address, tokenID1);
        await FORNI_NFT.connect(user3).approve(XFORNI.address, tokenID2);
        await FORNI_NFT.connect(user3).approve(XFORNI.address, tokenID3);
        await FORNI_NFT.connect(user3).approve(XFORNI.address, tokenID4);
        await FORNI_NFT.connect(user3).approve(XFORNI.address, tokenID5);
        await XFORNI.connect(user3).depositNFT([tokenID1, tokenID2, tokenID3, tokenID4, tokenID5]);
    });

    it('User3 borrows some ETH against position', async function () {
        console.log("******************************************************");
        await FORNI.connect(user3).borrowSome(two);
    });

    it('User3 unstakes 3 NFT', async function () {
        console.log("******************************************************");
        let tokenID1 = await XFORNI.balanceNFT(user3.address, 0);
        let tokenID2 = await XFORNI.balanceNFT(user3.address, 1);
        let tokenID3 = await XFORNI.balanceNFT(user3.address, 2);
        await XFORNI.connect(user3).withdrawNFT([tokenID1, tokenID2, tokenID3]);
    });

    it('User3 redeems 8 NFT for FORNI', async function () {
        console.log("******************************************************");
        let tokenID1 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 0);
        let tokenID2 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 1);
        let tokenID3 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 2);
        let tokenID4 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 3);
        let tokenID5 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 4);
        let tokenID6 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 5);
        let tokenID7 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 6);
        let tokenID8 = await FORNI_NFT.tokenOfOwnerByIndex(user3.address, 7);
        await FORNI_NFT.connect(user3).approve(FORNI_NFT.address, tokenID1);
        await FORNI_NFT.connect(user3).approve(FORNI_NFT.address, tokenID2);
        await FORNI_NFT.connect(user3).approve(FORNI_NFT.address, tokenID3);
        await FORNI_NFT.connect(user3).approve(FORNI_NFT.address, tokenID4);
        await FORNI_NFT.connect(user3).approve(FORNI_NFT.address, tokenID5);
        await FORNI_NFT.connect(user3).approve(FORNI_NFT.address, tokenID6);
        await FORNI_NFT.connect(user3).approve(FORNI_NFT.address, tokenID7);
        await FORNI_NFT.connect(user3).approve(FORNI_NFT.address, tokenID8);
        await FORNI_NFT.connect(user3).redeem([tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8]);
    });

    it('User2 calls claim and distribute on gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user2).claimAndDistribute();
    });

    it('User2 and User3 borrows max against position', async function () {
        console.log("******************************************************");
        await FORNI.connect(user2).borrowMax();
        await FORNI.connect(user3).borrowMax();
    });

    it('User2 repays some gummiCLP back', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user2).approve(FORNI.address, one);
        await FORNI.connect(user2).repaySome(one);
    });

    it('User2 unstakes max FORNI', async function () {
        console.log("******************************************************");
        await XFORNI.connect(user2).withdrawToken((await XFORNI.balanceOf(user2.address)).sub(await FORNI.mustStayGBT(user2.address)));
    });

    it('User2 repays max', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user2).approve(FORNI.address, one);
        await FORNI.connect(user2).repayMax();
    });

    it('User2 unstakes all FORNI', async function () {
        console.log("******************************************************");
        await XFORNI.connect(user2).withdrawToken(await XFORNI.balanceOf(user2.address));
    });

    it('User2 stakes 2 FORNI', async function () {
        console.log("******************************************************");
        await FORNI.connect(user2).approve(XFORNI.address, two);
        await XFORNI.connect(user2).depositToken(two);
    });

    it('User1 Buys FORNI with 50 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).approve(FORNI.address, fifty);
        await FORNI.connect(user1).buy(fifty, 1, 1682282187, AddressZero);
    });

    it('User1 sells rest of FORNI except for two', async function () {
        console.log("******************************************************");
        await FORNI.connect(user1).approve(FORNI.address, await FORNI.balanceOf(user1.address));
        await FORNI.connect(user1).sell((await FORNI.balanceOf(user1.address)).sub(two), 1, 1682282187);
    });

    it('User1 calls treasury skim', async function () {
        console.log("******************************************************");
        await FORNI_FEES.connect(user2).distributeFees();
    });

    it('Forward 3 days', async function () {
        console.log("******************************************************");
        await network.provider.send('evm_increaseTime', [3*24*3600]); 
        await network.provider.send('evm_mine');
    });

    it('User1 stakes 2 FORNI', async function () {
        console.log("******************************************************");
        await FORNI.connect(user1).approve(XFORNI.address, two);
        await XFORNI.connect(user1).depositToken(two);
    });

    it('Forward 4 days', async function () {
        console.log("******************************************************");
        await network.provider.send('evm_increaseTime', [4*24*3600]); 
        await network.provider.send('evm_mine');
    });

    it('Users claim rewards', async function () {
        console.log("******************************************************");

        await XFORNI.connect(user1).getReward();
        await XFORNI.connect(user2).getReward();
        await XFORNI.connect(user3).getReward();

    });

    it('User1 Buys FORNI with 50 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).approve(FORNI.address, fifty);
        await FORNI.connect(user1).buy(fifty, 1, 1682282187, AddressZero);
    });

    it('User1 swaps for exact 3 NFT', async function () {
        console.log("******************************************************");
        await FORNI.connect(user1).approve(FORNI_NFT.address, three)
        let tokenID1 = await FORNI_NFT.gumballs(0);
        let tokenID2 = await FORNI_NFT.gumballs(1);
        let tokenID3 = await FORNI_NFT.gumballs(2);
        await FORNI_NFT.connect(user1).swapForExact([tokenID1, tokenID2, tokenID3]);
    });

    it('User1 sells rest of FORNI', async function () {
        console.log("******************************************************");
        await FORNI.connect(user1).approve(FORNI.address, await FORNI.balanceOf(user1.address));
        await FORNI.connect(user1).sell(await FORNI.balanceOf(user1.address), 1, 1682282187);
    });

    it('User1 calls treasury skim and claimAndDistribute', async function () {
        console.log("******************************************************");
        await FORNI_FEES.connect(user2).distributeFees();
        await gummiCLP.connect(user2).claimAndDistribute();
    });

    it('Forward 3 days', async function () {
        console.log("******************************************************");
        await network.provider.send('evm_increaseTime', [3*24*3600]); 
        await network.provider.send('evm_mine');
    });

    it('User1 Buys FORNI with 50 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).approve(FORNI.address, ten);
        await FORNI.connect(user1).buy(ten, 1, 1682282187, AddressZero);
    });

    it('User1 sells rest of FORNI', async function () {
        console.log("******************************************************");
        await FORNI.connect(user1).approve(FORNI.address, await FORNI.balanceOf(user1.address));
        await FORNI.connect(user1).sell(await FORNI.balanceOf(user1.address), 1, 1682282187);
    });

    it('User1 calls treasury skim', async function () {
        console.log("******************************************************");
        await FORNI_FEES.connect(user2).distributeFees();
        await gummiCLP.connect(user2).claimAndDistribute();
    });

    it('User1 Buys FORNI with 50 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).approve(FORNI.address, fifty);
        await FORNI.connect(user1).buy(fifty, 1, 1682282187, AddressZero);
    });

    it('User1 sells rest of FORNI', async function () {
        console.log("******************************************************");
        await FORNI.connect(user1).approve(FORNI.address, await FORNI.balanceOf(user1.address));
        await FORNI.connect(user1).sell(await FORNI.balanceOf(user1.address), 1, 1682282187);
    });

    it('User1 calls treasury skim', async function () {
        console.log("******************************************************");
        await FORNI_FEES.connect(user2).distributeFees();
        await gummiCLP.connect(user2).claimAndDistribute();
    });

    it('Forward 3 days', async function () {
        console.log("******************************************************");
        await network.provider.send('evm_increaseTime', [3*24*3600]); 
        await network.provider.send('evm_mine');
    });

    it('User1 claim rewards', async function () {
        console.log("******************************************************");
        await XFORNI.connect(user1).getReward();
    });

    it('Forward 4 days', async function () {
        console.log("******************************************************");
        await network.provider.send('evm_increaseTime', [3*24*3600]); 
        await network.provider.send('evm_mine');
    });

    it('Users claim rewards', async function () {
        console.log("******************************************************");
        await XFORNI.connect(user1).getReward();
        await XFORNI.connect(user2).getReward();
        await XFORNI.connect(user3).getReward();
    });

    it('User2 repays some gummiCLP back', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user2).approve(FORNI.address, oneHundred);
        await FORNI.connect(user2).repayMax();
    });

    it('User2 unstakes max FORNI', async function () {
        console.log("******************************************************");
        await XFORNI.connect(user2).withdrawToken((await XFORNI.balanceOf(user2.address)).sub(await FORNI.mustStayGBT(user2.address)));
    });

    it('User1 Buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).approve(FORNI.address, ten);
        await FORNI.connect(user1).buy(ten, 1, 1682282187, AddressZero);
    });

    it('Gumbar Coverage Testing', async function () {
        console.log("******************************************************");
        await XFORNI.stakingToken();
        await XFORNI.stakingNFT();
        await XFORNI.totalSupply();
        await XFORNI.balanceOf(user1.address);
        await XFORNI.lastTimeRewardApplicable(WCANTO.address);
        await XFORNI.rewardPerToken(WCANTO.address);
        await XFORNI.balanceOfNFT(user1.address);
    });

    it('Bonding Curve Coverage Testing', async function () {
        console.log("******************************************************");
        await FORNI.BASE_TOKEN();
        await FORNI.reserveVirtualBASE();
        await FORNI.reserveRealBASE();
        await FORNI.reserveGBT();
        await FORNI.initial_totalSupply();
        await FORNI.XGBT();
        await FORNI.artist();
        await FORNI.factory();
        await FORNI.borrowedTotalBASE();
        await FORNI.currentPrice();
        await FORNI.borrowCredit(user1.address);
        await FORNI_FEES.distributeReward();
        await FORNI.debt(user1.address);
        await FORNI.baseBal();
        await FORNI.gbtBal();
        await FORNI.initSupply();
        await FORNI.getFactory();
        await FORNI.floorPrice();
        await FORNI.borrowCredit(user2.address);
    });

    it('Artist sets new artist', async function () {
        console.log("******************************************************");
        await expect(FORNI.connect(owner).setArtist(owner.address)).to.be.revertedWith("!AUTH");
        await FORNI.connect(artist).setArtist(owner.address);
        await FORNI.connect(owner).setArtist(artist.address);
    });

    it('GNFT Coverage Testing', async function () {
        console.log("******************************************************");
        await FORNI_NFT.owner();
        await FORNI_NFT.tokenBal();
        await FORNI_NFT.nftBal();
        await FORNI_NFT.contractURI();
        await FORNI_NFT.currentPrice();
        await expect(FORNI_NFT.connect(owner).setBaseURI('testuri')).to.be.revertedWith("!AUTH");
        await FORNI_NFT.connect(artist).setBaseURI('testuri');
        await expect(FORNI_NFT.connect(owner).setContractURI('testuri')).to.be.revertedWith("!AUTH");
        await FORNI_NFT.connect(artist).setContractURI('testuri');
    });

    it('Factory Coverage Testing', async function () {
        console.log("******************************************************");
        await expect(factory.connect(user1).setTreasury(user1.address)).to.be.reverted;
        await factory.connect(owner).setTreasury(user1.address);
        await factory.connect(owner).setTreasury(protocol.address);
        await expect(factory.connect(user1).setGBTFactory(user1.address)).to.be.reverted;
        await factory.connect(owner).setGBTFactory(user1.address);
        await factory.connect(owner).setGBTFactory(gbtFactory.address);
        await expect(factory.connect(user1).setGNFTFactory(user1.address)).to.be.reverted;
        await factory.connect(owner).setGNFTFactory(user1.address);
        await factory.connect(owner).setGNFTFactory(gnftFactory.address);
        await expect(factory.connect(user1).setXGBTFactory(user1.address)).to.be.reverted;
        await factory.connect(owner).setXGBTFactory(user1.address);
        await factory.connect(owner).setXGBTFactory(xgbtFactory.address);
        await expect(factory.connect(user1).updateFactoryAllowlist(artist.address, true)).to.be.reverted;
        await factory.connect(owner).updateFactoryAllowlist(artist.address, true);
        await expect(factory.connect(user1).allowExisting(0, true)).to.be.reverted;
        await factory.connect(owner).allowExisting(0, true);
        await expect(factory.connect(user1).updateGumBallAllowlist(FORNI.address, [user1.address, user2.address], one)).to.be.reverted;
        await factory.connect(owner).updateGumBallAllowlist(FORNI.address, [user1.address, user2.address], one);
        await expect(factory.connect(user2).addReward(XFORNI.address, NOTE.address)).to.be.reverted;
        await factory.connect(owner).addReward(XFORNI.address, LP_CANTO_NOTE.address);
        await factory.totalDeployed();
    });

    it('CTokenPlugin Coverage Testing', async function () {
        console.log("******************************************************");
        console.log(await gummiCLP.connect(user1).getUnderlyingTokenName());
        console.log(await gummiCLP.connect(user1).getUnderlyingTokenSymbol());
        console.log(await gummiCLP.connect(user1).getUnderlyingTokenAddress());
        console.log(await gummiCLP.connect(user1).getComptroller());
        console.log(await gummiCLP.connect(user1).getXGBT());
        console.log(await gummiCLP.connect(user1).getTokensInUnderlying());
        console.log(await gummiCLP.connect(user1).getRewardTokens());

    });

    it('System Status', async function () {
        console.log("******************************************************");

        let reserveVirtualGCLP = await FORNI.reserveVirtualBASE();
        let reserveRealGCLP = await FORNI.reserveRealBASE();
        let balanceGCLP = await gummiCLP.balanceOf(FORNI.address);
        let balanceFORNI = await FORNI.balanceOf(FORNI.address);
        let reserveFORNI = await FORNI.reserveGBT()
        let totalSupplyFORNI = await FORNI.totalSupply();
        let borrowedTotalGCLP = await FORNI.borrowedTotalBASE();

        let gclpCLP = await cLP_CANTO_NOTE.connect(owner).balanceOf(gummiCLP.address);
        let earnedWCANTO = await gummiCLP.connect(owner).earned();
        let gummiCLPSupply = await gummiCLP.connect(owner).totalSupply();

        let gumbarFORNI = await XFORNI.totalSupply();
        let rFDFORNI = await XFORNI.getRewardForDuration(FORNI.address);
        let rFDGCLP = await XFORNI.getRewardForDuration(gummiCLP.address);
        let rFDWCANTO = await XFORNI.getRewardForDuration(WCANTO.address);

        let nftMaxSupply = await FORNI_NFT.maxSupply();
        let nftSupply = await FORNI_NFT.totalSupply();

        let feesFORNI = await FORNI.balanceOf(FORNI_FEES.address);
        let feesGCLP = await gummiCLP.balanceOf(FORNI_FEES.address);

        let artistFORNI = await FORNI.balanceOf(artist.address);
        let artistGCLP = await gummiCLP.balanceOf(artist.address);

        let protocolFORNI = await FORNI.balanceOf(protocol.address);
        let protocolGCLP = await gummiCLP.balanceOf(protocol.address);

        let user1WCANTO = await WCANTO.connect(user1).balanceOf(user1.address);
        let user1NOTE = await NOTE.connect(user1).balanceOf(user1.address);
        let user1LP = await LP_CANTO_NOTE.connect(user1).balanceOf(user1.address);
        let user1CLP = await cLP_CANTO_NOTE.connect(user1).balanceOf(user1.address);
        let user1GCLP = await gummiCLP.balanceOf(user1.address);
        let user1FORNI = await FORNI.balanceOf(user1.address);
        let user1GNFT = await FORNI_NFT.balanceOf(user1.address);
        let user1XFORNI = await XFORNI.balanceOf(user1.address);
        let user1EarnedFORNI = await XFORNI.earned(user1.address, FORNI.address);
        let user1EarnedGCLP = await XFORNI.earned(user1.address, gummiCLP.address);
        let user1EarnedWCANTO = await XFORNI.earned(user1.address, WCANTO.address);
        let user1BorrowedGCLP = await FORNI.borrowedBASE(user1.address);
        let user1MustStayFORNI = await FORNI.mustStayGBT(user1.address);

        let user2WCANTO = await WCANTO.connect(user2).balanceOf(user2.address);
        let user2NOTE = await NOTE.connect(user2).balanceOf(user2.address);
        let user2LP = await LP_CANTO_NOTE.connect(user2).balanceOf(user2.address);
        let user2CLP = await cLP_CANTO_NOTE.connect(user2).balanceOf(user2.address);
        let user2GCLP = await gummiCLP.balanceOf(user2.address);
        let user2FORNI = await FORNI.balanceOf(user2.address);
        let user2GNFT = await FORNI_NFT.balanceOf(user2.address);
        let user2XFORNI = await XFORNI.balanceOf(user2.address);
        let user2EarnedFORNI = await XFORNI.earned(user2.address, FORNI.address);
        let user2EarnedGCLP = await XFORNI.earned(user2.address, gummiCLP.address);
        let user2EarnedWCANTO = await XFORNI.earned(user2.address, WCANTO.address);
        let user2BorrowedGCLP = await FORNI.borrowedBASE(user2.address);
        let user2MustStayFORNI = await FORNI.mustStayGBT(user2.address);

        let user3WCANTO = await WCANTO.connect(user3).balanceOf(user3.address);
        let user3NOTE = await NOTE.connect(user3).balanceOf(user3.address);
        let user3LP = await LP_CANTO_NOTE.connect(user3).balanceOf(user3.address);
        let user3CLP = await cLP_CANTO_NOTE.connect(user3).balanceOf(user3.address);
        let user3GCLP = await gummiCLP.balanceOf(user3.address);
        let user3FORNI = await FORNI.balanceOf(user3.address);
        let user3GNFT = await FORNI_NFT.balanceOf(user3.address);
        let user3XFORNI = await XFORNI.balanceOf(user3.address);
        let user3EarnedFORNI = await XFORNI.earned(user3.address, FORNI.address);
        let user3EarnedGCLP = await XFORNI.earned(user3.address, gummiCLP.address);
        let user3EarnedWCANTO = await XFORNI.earned(user3.address, WCANTO.address);
        let user3BorrowedGCLP = await FORNI.borrowedBASE(user3.address);
        let user3MustStayFORNI = await FORNI.mustStayGBT(user3.address);

        console.log("BONDING CURVE RESERVES");
        console.log("FORNI Reserve", divDec(reserveFORNI));
        console.log("vGCLP Reserve", divDec(reserveVirtualGCLP));
        console.log("rGCLP Reserve", divDec(reserveRealGCLP));
        console.log("GCLP Borrowed", divDec(borrowedTotalGCLP));
        console.log("FORNI Balance", divDec(balanceFORNI));
        console.log("GCLP Balance", divDec(balanceGCLP));
        console.log("FORNI Total Supply", divDec(totalSupplyFORNI));
        console.log();

        console.log("GUMMI CLP");
        console.log('cLP-CANTO/NOTE', divDec(gclpCLP));
        console.log('WCANTO Earned', divDec(earnedWCANTO));
        console.log('gummiCLP Supply', divDec(gummiCLPSupply));
        console.log();

        console.log("GUMBAR");
        console.log("FORNI Staked", divDec(gumbarFORNI));
        console.log("FORNI reward for duration", divDec(rFDFORNI));
        console.log("GCLP reward for duration", divDec(rFDGCLP));
        console.log("WCANTO reward for duration", divDec(rFDWCANTO));
        console.log();

        console.log("Gumball Machine");
        console.log("NFT Max Supply", nftMaxSupply);
        console.log("NFT Supply", nftSupply);
        for (let i = 0; i < await FORNI_NFT.gumballsLength(); i++) {
            console.log("Gumball", i, " ", await FORNI_NFT.gumballs(i));
        }
        console.log();

        console.log("FEES BALANCES");
        console.log("FORNI", divDec(feesFORNI));
        console.log("GCLP", divDec(feesGCLP));
        console.log();

        console.log("ARTIST BALANCES");
        console.log("FORNI", divDec(artistFORNI));
        console.log("GCLP", divDec(artistGCLP));
        console.log();

        console.log("PROTOCOL BALANCES");
        console.log("FORNI", divDec(protocolFORNI));
        console.log("GCLP", divDec(protocolGCLP));
        console.log();

        console.log("USER1 BALANCES");
        console.log("WCANTO", divDec(user1WCANTO));
        console.log("NOTE", divDec(user1NOTE));
        console.log("LP", divDec(user1LP));
        console.log("CLP", divDec(user1CLP));
        console.log("GCLP", divDec(user1GCLP));
        console.log("FORNI", divDec(user1FORNI));
        console.log("GNFT", divDec(user1GNFT));
        console.log("Staked FORNI", divDec(user1XFORNI));
        console.log("Earned FORNI", divDec(user1EarnedFORNI));
        console.log("Earned GCLP", divDec(user1EarnedGCLP));
        console.log("Earned WCANTO", divDec(user1EarnedWCANTO));
        console.log("Borrowed GCLP", divDec(user1BorrowedGCLP));
        console.log("Must Stay FORNI", divDec(user1MustStayFORNI));
        console.log();

        console.log("USER2 BALANCES");
        console.log("WCANTO", divDec(user2WCANTO));
        console.log("NOTE", divDec(user2NOTE));
        console.log("LP", divDec(user2LP));
        console.log("CLP", divDec(user2CLP));
        console.log("GCLP", divDec(user2GCLP));
        console.log("FORNI", divDec(user2FORNI));
        console.log("GNFT", divDec(user2GNFT));
        console.log("Staked FORNI", divDec(user2XFORNI));
        console.log("Earned FORNI", divDec(user2EarnedFORNI));
        console.log("Earned GCLP", divDec(user2EarnedGCLP));
        console.log("Earned WCANTO", divDec(user2EarnedWCANTO));
        console.log("Borrowed GCLP", divDec(user2BorrowedGCLP));
        console.log("Must Stay FORNI", divDec(user2MustStayFORNI));
        console.log();

        console.log("USER3 BALANCES");
        console.log("WCANTO", divDec(user3WCANTO));
        console.log("NOTE", divDec(user3NOTE));
        console.log("LP", divDec(user3LP));
        console.log("CLP", divDec(user3CLP));
        console.log("GCLP", divDec(user3GCLP));
        console.log("FORNI", divDec(user3FORNI));
        console.log("GNFT", divDec(user3GNFT));
        console.log("Staked FORNI", divDec(user3XFORNI));
        console.log("Earned FORNI", divDec(user3EarnedFORNI));
        console.log("Earned GCLP", divDec(user3EarnedGCLP));
        console.log("Earned WCANTO", divDec(user3EarnedWCANTO));
        console.log("Borrowed GCLP", divDec(user3BorrowedGCLP));
        console.log("Must Stay FORNI", divDec(user3MustStayFORNI));
        console.log();

        // invariants
        await expect(reserveFORNI).to.be.equal(balanceFORNI);
        await expect(reserveRealGCLP.sub(borrowedTotalGCLP)).to.be.equal(balanceGCLP);
        await expect(gclpCLP).to.be.equal(gummiCLPSupply);

    });

})