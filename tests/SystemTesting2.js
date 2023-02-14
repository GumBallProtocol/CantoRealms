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
let FORNI, FORNI_NFT, XFORNI, FORNI_FEES, poolMint;

describe("SystemTesting2", function () {
  
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

        await expect(factory.deployGumBall('Cantoforniway', 'FORNI', ['testuri', 'testURI'], oneHundred, oneHundred, gummiCLP.address, artist.address, 2*24*3600, 200)).to.be.revertedWith("Redemption fee too high");
        await factory.deployGumBall('Cantoforniway', 'FORNI', ['testuri', 'testURI'], oneHundred, oneHundred, gummiCLP.address, artist.address, 2*24*3600, 50);
        let GumBallData = await factory.deployInfo(0);
        FORNI = await ethers.getContractAt("contracts/GBTFactory.sol:GBT", GumBallData[0]);
        FORNI_NFT = await ethers.getContractAt("contracts/GNFTFactory.sol:GNFT", GumBallData[1]);
        XFORNI = await ethers.getContractAt("contracts/XGBTFactory.sol:XGBT", GumBallData[2]);
        FORNI_FEES = await ethers.getContractAt("contracts/GBTFactory.sol:GBTFees", await FORNI.getFees());
        await gummiCLP.connect(owner).setXGBT(XFORNI.address);
        await XFORNI.connect(artist).addReward(WCANTO.address);
        console.log("- Cantofoniway GumBall Initialized");

        const PoolMint = await ethers.getContractFactory("PoolMint");
        poolMint = await PoolMint.deploy(gummiCLP.address, FORNI.address, 24*3600);
        await poolMint.deployed();
        await factory.connect(owner).updateGumBallAllowlist(FORNI.address, [poolMint.address], oneHundred);
        console.log("- PoolMint Initialized");

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

    it("User1 transfer gummiCLP to user2 and user3", async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).transfer(user2.address, oneHundred);
        await gummiCLP.connect(user1).transfer(user3.address, oneHundred);
    });

    it('User1 tries to buy FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).approve(FORNI.address, ten);
        await expect(FORNI.connect(user1).buy(ten, 1, 1682282187, AddressZero)).to.be.revertedWith("Allowlist amount overflow");
    });

    it('User1 deposits into poolMint with 100 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).approve(poolMint.address, oneHundred);
        await poolMint.connect(user1).deposit(oneHundred);
    });

    it('User3 tries to buy FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user3).approve(FORNI.address, ten);
        await expect(FORNI.connect(user3).buy(ten, 1, 1682282187, AddressZero)).to.be.revertedWith("Allowlist amount overflow");
    });

    it('Artist adds user3 to allowlist for 10 FORNI', async function () {
        console.log("******************************************************");
        await FORNI.connect(artist).updateAllowlist([user3.address], ten);
    });

    it('User3 buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user3).approve(FORNI.address, ten);
        await FORNI.connect(user3).buy(ten, 1, 1682282187, AddressZero);
    });

    it('User3 buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user3).approve(FORNI.address, ten);
        await expect(FORNI.connect(user3).buy(ten, 1, 1682282187, AddressZero)).to.be.revertedWith("Allowlist amount overflow");
    });

    it('Artist adds user3 to allowlist for 10 FORNI', async function () {
        console.log("******************************************************");
        await FORNI.connect(artist).updateAllowlist([user3.address], ten);
    });

    it('User3 buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user3).approve(FORNI.address, ten);
        await FORNI.connect(user3).buy(ten, 1, 1682282187, AddressZero);
    });

    it('User3 buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user3).approve(FORNI.address, ten);
        await expect(FORNI.connect(user3).buy(ten, 1, 1682282187, AddressZero)).to.be.revertedWith("Allowlist amount overflow");
    });

    it('User2 deposits into poolMint with 50 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user2).approve(poolMint.address, fifty);
        await expect(poolMint.connect(user2).deposit(0)).to.be.revertedWith("Cannot deposit 0");
        await poolMint.connect(user2).deposit(fifty);
    });

    it('User1 tries to call endAndBuy on poolMint', async function () {
        console.log("******************************************************");
        await expect(poolMint.connect(user1).endAndBuy()).to.be.revertedWith("Pool still in progress");
    });

    it('User2 tries to claim GBT from poolMint', async function () {
        console.log("******************************************************");
        await expect(poolMint.connect(user2).claimFor(user2.address)).to.be.revertedWith("Pool still in progress");
    });

    it('Forward 1 days', async function () {
        console.log("******************************************************");
        await network.provider.send('evm_increaseTime', [24*3600]); 
        await network.provider.send('evm_mine');
    });

    it('User1 calls endAndBuy on poolMint', async function () {
        console.log("******************************************************");
        await poolMint.connect(user1).endAndBuy();
    });

    it('User2 tries to deposit into poolMint with 50 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user2).approve(poolMint.address, fifty);
        await expect(poolMint.connect(user2).deposit(fifty)).to.be.revertedWith("Pool has ended");
    });

    it('User1 tries to call endAndBuy on poolMint', async function () {
        console.log("******************************************************");
        await expect(poolMint.connect(user1).endAndBuy()).to.be.revertedWith("End and Buy already called");
    });

    it('User1 claims from poolMint', async function () {
        console.log("******************************************************");
        await poolMint.connect(user1).claimFor(user1.address);
    });

    it('User2 claims from poolMint', async function () {
        console.log("******************************************************");
        await poolMint.connect(user1).claimFor(user2.address);
    });

    it('User1 claims from poolMint', async function () {
        console.log("******************************************************");
        await expect(poolMint.connect(user1).claimFor(user1.address)).to.be.revertedWith("Account has already claimed");
        await expect(poolMint.connect(user1).claimFor(user2.address)).to.be.revertedWith("Account has already claimed");
    });

    it('User1 tries to buy FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).approve(FORNI.address, ten);
        await expect(FORNI.connect(user1).buy(ten, 1, 1682282187, AddressZero)).to.be.revertedWith("Allowlist amount overflow");
    });

    it('Forward 1 days', async function () {
        console.log("******************************************************");
        await network.provider.send('evm_increaseTime', [24*3600]); 
        await network.provider.send('evm_mine');
    });

    it('User1 buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user1).approve(FORNI.address, ten);
        await FORNI.connect(user1).buy(ten, 1, 1682282187, user1.address);
    });

    it('Owner sets user1 as an affiliate', async function () {
        console.log("******************************************************");
        await factory.connect(owner).updateGumBallAffiliate(FORNI.address, [user1.address], true);
    });

    it('User2 buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user2).approve(FORNI.address, ten);
        await FORNI.connect(user2).buy(ten, 1, 1682282187, user1.address);
    });

    it('User2 sell all FORNI', async function () {
        console.log("******************************************************");
        await FORNI.connect(user2).approve(FORNI.address, await FORNI.connect(user2).balanceOf(user2.address));
        await FORNI.connect(user2).sell(await FORNI.connect(user2).balanceOf(user2.address), 1, 0);
    });

    it('Artist removes user1 as an affiliate', async function () {
        console.log("******************************************************");
        await FORNI.connect(artist).setAffiliate([user1.address], false);
    });
    
    it('User2 buys FORNI with 10 gummiCLP', async function () {
        console.log("******************************************************");
        await gummiCLP.connect(user2).approve(FORNI.address, ten);
        await FORNI.connect(user2).buy(ten, 1, 0, user1.address);
    });

    it('Bonding Curve Coverage Testing', async function () {
        console.log("******************************************************");
        await expect(FORNI.connect(user1).buy(ten, 1, 100, AddressZero)).to.be.revertedWith("Expired");
        await expect(FORNI.connect(user1).buy(0, 1, 0, AddressZero)).to.be.revertedWith("Amount cannot be zero");
        await expect(FORNI.connect(user1).buy(ten, oneHundred, 0, AddressZero)).to.be.revertedWith("Less than Min");
        await expect(FORNI.connect(user1).sell(ten, 1, 100)).to.be.revertedWith("Expired");
        await expect(FORNI.connect(user1).sell(0, 1, 0)).to.be.revertedWith("Amount cannot be zero");
        await expect(FORNI.connect(user1).sell(ten, oneHundred, 0)).to.be.revertedWith("Less than Min");
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

        let poolGCLP = await gummiCLP.balanceOf(poolMint.address);
        let poolFORNIBal = await FORNI.balanceOf(poolMint.address);
        let poolFORNI = await poolMint.gbtTotal();
        let poolEnded = await poolMint.ended();
        let poolBaseTotal = await poolMint.baseTotal();
        let poolBaseUser1 = await poolMint.baseBalances(user1.address);
        let poolBaseUser2 = await poolMint.baseBalances(user2.address);
        let poolBaseUser3 = await poolMint.baseBalances(user3.address);

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

        console.log("PoolMint");
        console.log('gummiCLP', divDec(poolGCLP));
        console.log('Forni Balance', divDec(poolFORNIBal));
        console.log('FORNI', divDec(poolFORNI));
        console.log('ended', poolEnded);
        console.log('total gummiCLP Deposited', divDec(poolBaseTotal));
        console.log('user1 gummiCLP Deposited', divDec(poolBaseUser1));
        console.log('user2 gummiCLP Deposited', divDec(poolBaseUser2));
        console.log('user3 gummiCLP Deposited', divDec(poolBaseUser3));
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