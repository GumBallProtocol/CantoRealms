const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount/10**decimals;
const { inputToConfig } = require("@ethereum-waffle/compiler");
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { execPath } = require("process");

const AddressZero = '0x0000000000000000000000000000000000000000'
const MINIMUM_LIQUIDITY = "1000"
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
const April2026 = '1775068986';
const May2026 = '1776278586';
const oneWeek = 604800;
const oneday = 24*3600;
const twodays = 2*24*3600;
const spiritPerBlock = "10000000000000000000";
const startBlock = "1";
const startTime = Math.floor(Date.now() / 1000);

// users
let owner, admin, user1, user2, user3, artist, protocol;
let weth, USDC;
let gbtFactory, gnftFactory, xgbtFactory, factory;
let GBT, GNFT, XGBT, GBTFees;

describe("SystemTesting8", function () {
  
    before("Initial set up", async function () {
        console.log("Begin Initialization");

        // initialize users
        [owner, admin, user1, user2, user3, artist, protocol] = await ethers.getSigners();

        // initialize tokens
        // mints 1000 tokens to deployer
        const ETHContract = await ethers.getContractFactory("ERC20Mock");
        weth = await ETHContract.deploy("ETH", "ETH");
        USDC = await ETHContract.deploy("ETH", "ETH");
        await weth.deployed();
        await weth.mint(user1.address, oneThousand);
        await weth.mint(user2.address, oneThousand);
        await weth.mint(user3.address, oneThousand);
        console.log("- Tokens Initialized");

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

        await factory.deployGumBall('GBT1', 'GBT1', ['testuri', 'testURI'], oneHundred, oneHundred, weth.address, artist.address, 0, 50);
        let GumBallData = await factory.deployInfo(0);
        GBT = await ethers.getContractAt("contracts/GBTFactory.sol:GBT", GumBallData[0]);
        GNFT = await ethers.getContractAt("contracts/GNFTFactory.sol:GNFT", GumBallData[1]);
        XGBT = await ethers.getContractAt("contracts/XGBTFactory.sol:XGBT", GumBallData[2]);
        GBTFees = await ethers.getContractAt("contracts/GBTFactory.sol:GBTFees", await GBT.getFees());
        console.log("- GumBall Initialized");

        console.log("Initialization Complete");
        console.log("******************************************************");
    });

    it('User1 Buys GBT with 10 WETH w/out affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, ten);
        await GBT.connect(user1).buy(ten, 1, 1682282187, AddressZero);

    });

    it('User1 Buys GBT with 10 WETH w/ user3 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, ten);
        await GBT.connect(user1).buy(ten, 1, 1682282187, user3.address);

    });

    it('User1 Buys GBT with 10 WETH w/out affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, ten);
        await GBT.connect(user1).buy(ten, 1, 1682282187, AddressZero);

    });

    it('User1 Sells 10 GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, ten);
        await GBT.connect(user1).sell(ten, 1, 1682282187);

    });

    it('User1 Sells 10 GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, ten);
        await GBT.connect(user1).sell(ten, 1, 1682282187);

    });

    it('User1 Buys GBT with 20 WETH w/ user2 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, twenty);
        await GBT.connect(user1).buy(twenty, 1, 1682282187, user2.address);

    });

    it('User1 stakes 1 GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(XGBT.address, one);
        await XGBT.connect(user1).depositToken(one);

    });

    it('User2 calls treasury skim', async function () {
        console.log("******************************************************");

        await GBTFees.connect(user2).distributeFees();

    });

    it('User2 Buys GBT with 10 WETH w/out affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, ten);
        await GBT.connect(user2).buy(ten, 1, 1682282187, AddressZero);

    });

    it('User2 Buys GBT with 10 WETH w/ user3 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, ten);
        await GBT.connect(user2).buy(ten, 1, 1682282187, user3.address);

    });

    it('User2 Sells 10 GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GBT.address, ten);
        await GBT.connect(user2).sell(ten, 1, 1682282187);

    });

    it('Artist sets user3 as eligible affiliate', async function () {
        console.log("******************************************************");

        await expect(GBT.connect(user3).setAffiliate(user3.address, true)).to.be.reverted;
        await GBT.connect(artist).setAffiliate(user3.address, true);

    });

    it('User1 Buys GBT with 20 WETH w/ user2 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, twenty);
        await GBT.connect(user1).buy(twenty, 1, 1682282187, user2.address);

    });

    it('User1 Buys GBT with 20 WETH w/ user2 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, twenty);
        await GBT.connect(user1).buy(twenty, 1, 1682282187, user3.address);

    });

    it('User2 Buys GBT with 10 WETH w/ user3 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, ten);
        await GBT.connect(user2).buy(ten, 1, 1682282187, AddressZero);

    });

    it('User2 Buys GBT with 10 WETH w/ user3 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, ten);
        await GBT.connect(user2).buy(ten, 1, 1682282187, user3.address);

    });

    it('User2 Buys GBT with 10 WETH w/ user3 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, ten);
        await GBT.connect(user2).buy(ten, 1, 1682282187, user3.address);

    });

    it('User1 Sells 10 GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, ten);
        await GBT.connect(user1).sell(ten, 1, 1682282187);

    });

    it('User2 Sells 10 GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GBT.address, ten);
        await GBT.connect(user2).sell(ten, 1, 1682282187);

    });

    it('Artist removes user3 as eligible affiliate', async function () {
        console.log("******************************************************");

        await expect(GBT.connect(user3).setAffiliate(user3.address, false)).to.be.reverted;
        await GBT.connect(artist).setAffiliate(user3.address, false);

    });

    it('User1 Buys GBT with 20 WETH w/ user2 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, twenty);
        await GBT.connect(user1).buy(twenty, 1, 1682282187, user3.address);

    });

    it('User1 Sells 10 GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, ten);
        await GBT.connect(user1).sell(ten, 1, 1682282187);

    });

    it('User2 Buys GBT with 10 WETH w/ user3 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, ten);
        await GBT.connect(user2).buy(ten, 1, 1682282187, user3.address);

    });

    it('User1 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, await GBT.balanceOf(user1.address));
        await GBT.connect(user1).sell(await GBT.balanceOf(user1.address), 1, 1682282187);

    });

    it('User2 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GBT.address, await GBT.balanceOf(user2.address));
        await GBT.connect(user2).sell(await GBT.balanceOf(user2.address), 1, 1682282187);

    });

    it('User1 calls treasury skim', async function () {
        console.log("******************************************************");

        await GBTFees.connect(user1).distributeFees();

    });

    it('Forward 7 days', async function () {
        console.log("******************************************************");

        await network.provider.send('evm_increaseTime', [7*24*3600]); 
        await network.provider.send('evm_mine');

    });

    it('User1 claims rewards', async function () {
        console.log("******************************************************");

        await XGBT.connect(user1).getReward();

    });

    it('User1 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, await GBT.balanceOf(user1.address));
        await GBT.connect(user1).sell(await GBT.balanceOf(user1.address), 1, 1682282187);

    });

    it('User3 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user3).approve(GBT.address, await GBT.balanceOf(user3.address));
        await GBT.connect(user3).sell(await GBT.balanceOf(user3.address), 1, 1682282187);

    });

    it('User3 transfers all ETH to owner', async function () {
        console.log("******************************************************");

        await weth.connect(user3).transfer(owner.address, await weth.balanceOf(user3.address));

    });

    it('Artist sets user3 as eligible affiliate', async function () {
        console.log("******************************************************");

        await expect(GBT.connect(user3).setAffiliate(user3.address, true)).to.be.reverted;
        await GBT.connect(artist).setAffiliate(user3.address, true);

    });

    it('User2 Buys GBT with 10 WETH w/ user3 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, ten);
        await GBT.connect(user2).buy(ten, 1, 1682282187, AddressZero);

    });

    it('User1 Buys GBT with 20 WETH w/ user2 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, ten);
        await GBT.connect(user1).buy(ten, 1, 1682282187, AddressZero);

    });

    it('User1 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, await GBT.balanceOf(user1.address));
        await GBT.connect(user1).sell(await GBT.balanceOf(user1.address), 1, 1682282187);

    });

    it('User2 mints 5 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GNFT.address, five);
        await GNFT.connect(user2).swap(five);

    });

    it('User2 converts 5 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user2.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user2.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user2.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user2.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user2.address, 4);
        await GNFT.connect(user2).approve(GNFT.address, tokenID0);
        await GNFT.connect(user2).approve(GNFT.address, tokenID1);
        await GNFT.connect(user2).approve(GNFT.address, tokenID2);
        await GNFT.connect(user2).approve(GNFT.address, tokenID3);
        await GNFT.connect(user2).approve(GNFT.address, tokenID4);
        await GNFT.connect(user2).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4]);
    });

    it('User2 mints 5 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GNFT.address, five);
        await GNFT.connect(user2).swap(five);

    });

    it('User2 converts 5 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user2.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user2.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user2.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user2.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user2.address, 4);
        await GNFT.connect(user2).approve(GNFT.address, tokenID0);
        await GNFT.connect(user2).approve(GNFT.address, tokenID1);
        await GNFT.connect(user2).approve(GNFT.address, tokenID2);
        await GNFT.connect(user2).approve(GNFT.address, tokenID3);
        await GNFT.connect(user2).approve(GNFT.address, tokenID4);
        await GNFT.connect(user2).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4]);
    });

    it('User2 mints 5 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GNFT.address, five);
        await GNFT.connect(user2).swap(five);

    });

    it('User2 converts 5 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user2.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user2.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user2.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user2.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user2.address, 4);
        await GNFT.connect(user2).approve(GNFT.address, tokenID0);
        await GNFT.connect(user2).approve(GNFT.address, tokenID1);
        await GNFT.connect(user2).approve(GNFT.address, tokenID2);
        await GNFT.connect(user2).approve(GNFT.address, tokenID3);
        await GNFT.connect(user2).approve(GNFT.address, tokenID4);
        await GNFT.connect(user2).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4]);
    });

    it('User2 mints 5 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GNFT.address, five);
        await GNFT.connect(user2).swap(five);

    });

    it('User2 converts 5 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user2.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user2.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user2.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user2.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user2.address, 4);
        await GNFT.connect(user2).approve(GNFT.address, tokenID0);
        await GNFT.connect(user2).approve(GNFT.address, tokenID1);
        await GNFT.connect(user2).approve(GNFT.address, tokenID2);
        await GNFT.connect(user2).approve(GNFT.address, tokenID3);
        await GNFT.connect(user2).approve(GNFT.address, tokenID4);
        await GNFT.connect(user2).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4]);
    });

    it('User2 mints 2 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GNFT.address, two);
        await GNFT.connect(user2).swap(two);

    });

    it('User2 stakes 2 gNFT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user2.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user2.address, 1);
        await GNFT.connect(user2).approve(XGBT.address, tokenID0);
        await GNFT.connect(user2).approve(XGBT.address, tokenID1);
        await XGBT.connect(user2).depositNFT([tokenID0, tokenID1]);

    });

    it('User2 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GBT.address, await GBT.balanceOf(user2.address));
        await GBT.connect(user2).sell(await GBT.balanceOf(user2.address), 1, 1682282187);

    });

    it('User1 Buys GBT with 100 WETH', async function () {
        console.log("******************************************************");
        await weth.connect(user1).approve(GBT.address, oneHundred);
        await GBT.connect(user1).buy(oneHundred, 1, 1682282187, AddressZero);
    });

    it('User1 swaps for exact 3 NFT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, one)
        let tokenID0 = await GNFT.gumballs(0);
        await GNFT.connect(user1).swapForExact([tokenID0]);

    });

    it('User1 stakes 1 gNFT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user1.address, 0);
        await GNFT.connect(user1).approve(XGBT.address, tokenID0);
        await XGBT.connect(user1).depositNFT([tokenID0]);

    });

    it('User1 mints 20 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, twenty);
        await GNFT.connect(user1).swap(twenty);

    });

    it('User1 converts 20 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user1.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user1.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user1.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user1.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user1.address, 4);
        let tokenID5 = await GNFT.tokenOfOwnerByIndex(user1.address, 5);
        let tokenID6 = await GNFT.tokenOfOwnerByIndex(user1.address, 6);
        let tokenID7 = await GNFT.tokenOfOwnerByIndex(user1.address, 7);
        let tokenID8 = await GNFT.tokenOfOwnerByIndex(user1.address, 8);
        let tokenID9 = await GNFT.tokenOfOwnerByIndex(user1.address, 9);
        let tokenID10 = await GNFT.tokenOfOwnerByIndex(user1.address, 10);
        let tokenID11 = await GNFT.tokenOfOwnerByIndex(user1.address, 11);
        let tokenID12 = await GNFT.tokenOfOwnerByIndex(user1.address, 12);
        let tokenID13 = await GNFT.tokenOfOwnerByIndex(user1.address, 13);
        let tokenID14 = await GNFT.tokenOfOwnerByIndex(user1.address, 14);
        let tokenID15 = await GNFT.tokenOfOwnerByIndex(user1.address, 15);
        let tokenID16 = await GNFT.tokenOfOwnerByIndex(user1.address, 16);
        let tokenID17 = await GNFT.tokenOfOwnerByIndex(user1.address, 17);
        let tokenID18 = await GNFT.tokenOfOwnerByIndex(user1.address, 18);
        let tokenID19 = await GNFT.tokenOfOwnerByIndex(user1.address, 19);
        await GNFT.connect(user1).approve(GNFT.address, tokenID0);
        await GNFT.connect(user1).approve(GNFT.address, tokenID1);
        await GNFT.connect(user1).approve(GNFT.address, tokenID2);
        await GNFT.connect(user1).approve(GNFT.address, tokenID3);
        await GNFT.connect(user1).approve(GNFT.address, tokenID4);
        await GNFT.connect(user1).approve(GNFT.address, tokenID5);
        await GNFT.connect(user1).approve(GNFT.address, tokenID6);
        await GNFT.connect(user1).approve(GNFT.address, tokenID7);
        await GNFT.connect(user1).approve(GNFT.address, tokenID8);
        await GNFT.connect(user1).approve(GNFT.address, tokenID9);
        await GNFT.connect(user1).approve(GNFT.address, tokenID10);
        await GNFT.connect(user1).approve(GNFT.address, tokenID11);
        await GNFT.connect(user1).approve(GNFT.address, tokenID12);
        await GNFT.connect(user1).approve(GNFT.address, tokenID13);
        await GNFT.connect(user1).approve(GNFT.address, tokenID14);
        await GNFT.connect(user1).approve(GNFT.address, tokenID15);
        await GNFT.connect(user1).approve(GNFT.address, tokenID16);
        await GNFT.connect(user1).approve(GNFT.address, tokenID17);
        await GNFT.connect(user1).approve(GNFT.address, tokenID18);
        await GNFT.connect(user1).approve(GNFT.address, tokenID19);
        await GNFT.connect(user1).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9,
                                        tokenID10, tokenID11, tokenID12, tokenID13, tokenID14, tokenID15, tokenID16, tokenID17, tokenID18, tokenID19]);
    });

    it('User1 borrows max against position', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).borrowMax();

    });

    it('User2 borrows max against position', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).borrowMax();

    });

    it('User1 mints 20 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, twenty);
        await GNFT.connect(user1).swap(twenty);

    });

    it('User1 converts 20 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user1.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user1.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user1.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user1.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user1.address, 4);
        let tokenID5 = await GNFT.tokenOfOwnerByIndex(user1.address, 5);
        let tokenID6 = await GNFT.tokenOfOwnerByIndex(user1.address, 6);
        let tokenID7 = await GNFT.tokenOfOwnerByIndex(user1.address, 7);
        let tokenID8 = await GNFT.tokenOfOwnerByIndex(user1.address, 8);
        let tokenID9 = await GNFT.tokenOfOwnerByIndex(user1.address, 9);
        let tokenID10 = await GNFT.tokenOfOwnerByIndex(user1.address, 10);
        let tokenID11 = await GNFT.tokenOfOwnerByIndex(user1.address, 11);
        let tokenID12 = await GNFT.tokenOfOwnerByIndex(user1.address, 12);
        let tokenID13 = await GNFT.tokenOfOwnerByIndex(user1.address, 13);
        let tokenID14 = await GNFT.tokenOfOwnerByIndex(user1.address, 14);
        let tokenID15 = await GNFT.tokenOfOwnerByIndex(user1.address, 15);
        let tokenID16 = await GNFT.tokenOfOwnerByIndex(user1.address, 16);
        let tokenID17 = await GNFT.tokenOfOwnerByIndex(user1.address, 17);
        let tokenID18 = await GNFT.tokenOfOwnerByIndex(user1.address, 18);
        let tokenID19 = await GNFT.tokenOfOwnerByIndex(user1.address, 19);
        await GNFT.connect(user1).approve(GNFT.address, tokenID0);
        await GNFT.connect(user1).approve(GNFT.address, tokenID1);
        await GNFT.connect(user1).approve(GNFT.address, tokenID2);
        await GNFT.connect(user1).approve(GNFT.address, tokenID3);
        await GNFT.connect(user1).approve(GNFT.address, tokenID4);
        await GNFT.connect(user1).approve(GNFT.address, tokenID5);
        await GNFT.connect(user1).approve(GNFT.address, tokenID6);
        await GNFT.connect(user1).approve(GNFT.address, tokenID7);
        await GNFT.connect(user1).approve(GNFT.address, tokenID8);
        await GNFT.connect(user1).approve(GNFT.address, tokenID9);
        await GNFT.connect(user1).approve(GNFT.address, tokenID10);
        await GNFT.connect(user1).approve(GNFT.address, tokenID11);
        await GNFT.connect(user1).approve(GNFT.address, tokenID12);
        await GNFT.connect(user1).approve(GNFT.address, tokenID13);
        await GNFT.connect(user1).approve(GNFT.address, tokenID14);
        await GNFT.connect(user1).approve(GNFT.address, tokenID15);
        await GNFT.connect(user1).approve(GNFT.address, tokenID16);
        await GNFT.connect(user1).approve(GNFT.address, tokenID17);
        await GNFT.connect(user1).approve(GNFT.address, tokenID18);
        await GNFT.connect(user1).approve(GNFT.address, tokenID19);
        await GNFT.connect(user1).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9,
                                        tokenID10, tokenID11, tokenID12, tokenID13, tokenID14, tokenID15, tokenID16, tokenID17, tokenID18, tokenID19]);
    });

    it('User1 mints 20 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, twenty);
        await GNFT.connect(user1).swap(twenty);

    });

    it('User1 converts 20 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user1.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user1.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user1.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user1.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user1.address, 4);
        let tokenID5 = await GNFT.tokenOfOwnerByIndex(user1.address, 5);
        let tokenID6 = await GNFT.tokenOfOwnerByIndex(user1.address, 6);
        let tokenID7 = await GNFT.tokenOfOwnerByIndex(user1.address, 7);
        let tokenID8 = await GNFT.tokenOfOwnerByIndex(user1.address, 8);
        let tokenID9 = await GNFT.tokenOfOwnerByIndex(user1.address, 9);
        let tokenID10 = await GNFT.tokenOfOwnerByIndex(user1.address, 10);
        let tokenID11 = await GNFT.tokenOfOwnerByIndex(user1.address, 11);
        let tokenID12 = await GNFT.tokenOfOwnerByIndex(user1.address, 12);
        let tokenID13 = await GNFT.tokenOfOwnerByIndex(user1.address, 13);
        let tokenID14 = await GNFT.tokenOfOwnerByIndex(user1.address, 14);
        let tokenID15 = await GNFT.tokenOfOwnerByIndex(user1.address, 15);
        let tokenID16 = await GNFT.tokenOfOwnerByIndex(user1.address, 16);
        let tokenID17 = await GNFT.tokenOfOwnerByIndex(user1.address, 17);
        let tokenID18 = await GNFT.tokenOfOwnerByIndex(user1.address, 18);
        let tokenID19 = await GNFT.tokenOfOwnerByIndex(user1.address, 19);
        await GNFT.connect(user1).approve(GNFT.address, tokenID0);
        await GNFT.connect(user1).approve(GNFT.address, tokenID1);
        await GNFT.connect(user1).approve(GNFT.address, tokenID2);
        await GNFT.connect(user1).approve(GNFT.address, tokenID3);
        await GNFT.connect(user1).approve(GNFT.address, tokenID4);
        await GNFT.connect(user1).approve(GNFT.address, tokenID5);
        await GNFT.connect(user1).approve(GNFT.address, tokenID6);
        await GNFT.connect(user1).approve(GNFT.address, tokenID7);
        await GNFT.connect(user1).approve(GNFT.address, tokenID8);
        await GNFT.connect(user1).approve(GNFT.address, tokenID9);
        await GNFT.connect(user1).approve(GNFT.address, tokenID10);
        await GNFT.connect(user1).approve(GNFT.address, tokenID11);
        await GNFT.connect(user1).approve(GNFT.address, tokenID12);
        await GNFT.connect(user1).approve(GNFT.address, tokenID13);
        await GNFT.connect(user1).approve(GNFT.address, tokenID14);
        await GNFT.connect(user1).approve(GNFT.address, tokenID15);
        await GNFT.connect(user1).approve(GNFT.address, tokenID16);
        await GNFT.connect(user1).approve(GNFT.address, tokenID17);
        await GNFT.connect(user1).approve(GNFT.address, tokenID18);
        await GNFT.connect(user1).approve(GNFT.address, tokenID19);
        await GNFT.connect(user1).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9,
                                        tokenID10, tokenID11, tokenID12, tokenID13, tokenID14, tokenID15, tokenID16, tokenID17, tokenID18, tokenID19]);
    });

    it('User1 tries to mint 20 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, twenty);
        await expect(GNFT.connect(user1).swap(twenty)).to.be.revertedWith('Max Supply Minted');

    });

    it('User1 tries to mint 19 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, nineteen);
        await expect(GNFT.connect(user1).swap(nineteen)).to.be.revertedWith('Max Supply Minted');

    });

    it('User1 mints 18 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, eighteen);
        await GNFT.connect(user1).swap(eighteen);

    });

    it('User1 converts 18 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user1.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user1.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user1.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user1.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user1.address, 4);
        let tokenID5 = await GNFT.tokenOfOwnerByIndex(user1.address, 5);
        let tokenID6 = await GNFT.tokenOfOwnerByIndex(user1.address, 6);
        let tokenID7 = await GNFT.tokenOfOwnerByIndex(user1.address, 7);
        let tokenID8 = await GNFT.tokenOfOwnerByIndex(user1.address, 8);
        let tokenID9 = await GNFT.tokenOfOwnerByIndex(user1.address, 9);
        let tokenID10 = await GNFT.tokenOfOwnerByIndex(user1.address, 10);
        let tokenID11 = await GNFT.tokenOfOwnerByIndex(user1.address, 11);
        let tokenID12 = await GNFT.tokenOfOwnerByIndex(user1.address, 12);
        let tokenID13 = await GNFT.tokenOfOwnerByIndex(user1.address, 13);
        let tokenID14 = await GNFT.tokenOfOwnerByIndex(user1.address, 14);
        let tokenID15 = await GNFT.tokenOfOwnerByIndex(user1.address, 15);
        let tokenID16 = await GNFT.tokenOfOwnerByIndex(user1.address, 16);
        let tokenID17 = await GNFT.tokenOfOwnerByIndex(user1.address, 17);
        await GNFT.connect(user1).approve(GNFT.address, tokenID0);
        await GNFT.connect(user1).approve(GNFT.address, tokenID1);
        await GNFT.connect(user1).approve(GNFT.address, tokenID2);
        await GNFT.connect(user1).approve(GNFT.address, tokenID3);
        await GNFT.connect(user1).approve(GNFT.address, tokenID4);
        await GNFT.connect(user1).approve(GNFT.address, tokenID5);
        await GNFT.connect(user1).approve(GNFT.address, tokenID6);
        await GNFT.connect(user1).approve(GNFT.address, tokenID7);
        await GNFT.connect(user1).approve(GNFT.address, tokenID8);
        await GNFT.connect(user1).approve(GNFT.address, tokenID9);
        await GNFT.connect(user1).approve(GNFT.address, tokenID10);
        await GNFT.connect(user1).approve(GNFT.address, tokenID11);
        await GNFT.connect(user1).approve(GNFT.address, tokenID12);
        await GNFT.connect(user1).approve(GNFT.address, tokenID13);
        await GNFT.connect(user1).approve(GNFT.address, tokenID14);
        await GNFT.connect(user1).approve(GNFT.address, tokenID15);
        await GNFT.connect(user1).approve(GNFT.address, tokenID16);
        await GNFT.connect(user1).approve(GNFT.address, tokenID17);
        await GNFT.connect(user1).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9,
                                        tokenID10, tokenID11, tokenID12, tokenID13, tokenID14, tokenID15, tokenID16, tokenID17]);
    });

    it('User1 swaps for exact 3 NFT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, three)
        let tokenID0 = await GNFT.gumballs(0);
        let tokenID1 = await GNFT.gumballs(1);
        let tokenID2 = await GNFT.gumballs(2);
        await GNFT.connect(user1).swapForExact([tokenID0, tokenID1, tokenID2]);

    });

    it('User1 swaps for exact 3 NFT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, three)
        let tokenID0 = await GNFT.gumballs(0);
        let tokenID1 = await GNFT.gumballs(1);
        let tokenID2 = await GNFT.gumballs(2);
        await GNFT.connect(user1).swapForExact([tokenID0, tokenID1, tokenID2]);

    });

    it('User1 converts 6 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user1.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user1.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user1.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user1.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user1.address, 4);
        let tokenID5 = await GNFT.tokenOfOwnerByIndex(user1.address, 5);
        await GNFT.connect(user1).approve(GNFT.address, tokenID0);
        await GNFT.connect(user1).approve(GNFT.address, tokenID1);
        await GNFT.connect(user1).approve(GNFT.address, tokenID2);
        await GNFT.connect(user1).approve(GNFT.address, tokenID3);
        await GNFT.connect(user1).approve(GNFT.address, tokenID4);
        await GNFT.connect(user1).approve(GNFT.address, tokenID5);
        await GNFT.connect(user1).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5]);
    });
    
    it('User2 Buys GBT with 100 WETH w/ user3 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, oneHundred);
        await GBT.connect(user2).buy(oneHundred, 1, 1682282187, AddressZero);

    });

    it('User2 swaps for exact 10 NFT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GNFT.address, ten)
        let tokenID0 = await GNFT.gumballs(0);
        let tokenID1 = await GNFT.gumballs(1);
        let tokenID2 = await GNFT.gumballs(2);
        let tokenID3 = await GNFT.gumballs(3);
        let tokenID4 = await GNFT.gumballs(4);
        let tokenID5 = await GNFT.gumballs(5);
        let tokenID6 = await GNFT.gumballs(6);
        let tokenID7 = await GNFT.gumballs(7);
        let tokenID8 = await GNFT.gumballs(8);
        let tokenID9 = await GNFT.gumballs(9);
        await GNFT.connect(user2).swapForExact([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9]);

    });

    it('Owner calls treasury skim', async function () {
        console.log("******************************************************");

        await GBTFees.connect(owner).distributeFees();

    });

    it('User1 swaps for exact 10 NFT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, ten)
        let tokenID0 = await GNFT.gumballs(0);
        let tokenID1 = await GNFT.gumballs(1);
        let tokenID2 = await GNFT.gumballs(2);
        let tokenID3 = await GNFT.gumballs(3);
        let tokenID4 = await GNFT.gumballs(4);
        let tokenID5 = await GNFT.gumballs(5);
        let tokenID6 = await GNFT.gumballs(6);
        let tokenID7 = await GNFT.gumballs(7);
        let tokenID8 = await GNFT.gumballs(8);
        let tokenID9 = await GNFT.gumballs(9);
        await GNFT.connect(user1).swapForExact([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9]);

    });

    it('User1 swaps for exact 10 NFT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, ten)
        let tokenID0 = await GNFT.gumballs(0);
        let tokenID1 = await GNFT.gumballs(1);
        let tokenID2 = await GNFT.gumballs(2);
        let tokenID3 = await GNFT.gumballs(3);
        let tokenID4 = await GNFT.gumballs(4);
        let tokenID5 = await GNFT.gumballs(5);
        let tokenID6 = await GNFT.gumballs(6);
        let tokenID7 = await GNFT.gumballs(7);
        let tokenID8 = await GNFT.gumballs(8);
        let tokenID9 = await GNFT.gumballs(9);
        await GNFT.connect(user1).swapForExact([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9]);

    });

    it('User1 swaps for exact 10 NFT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GNFT.address, ten)
        let tokenID0 = await GNFT.gumballs(0);
        let tokenID1 = await GNFT.gumballs(1);
        let tokenID2 = await GNFT.gumballs(2);
        let tokenID3 = await GNFT.gumballs(3);
        let tokenID4 = await GNFT.gumballs(4);
        let tokenID5 = await GNFT.gumballs(5);
        let tokenID6 = await GNFT.gumballs(6);
        let tokenID7 = await GNFT.gumballs(7);
        let tokenID8 = await GNFT.gumballs(8);
        let tokenID9 = await GNFT.gumballs(9);
        await GNFT.connect(user1).swapForExact([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9]);

    });

    it('User2 Buys GBT with 100 WETH w/ user3 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, oneHundred);
        await GBT.connect(user2).buy(oneHundred, 1, 1682282187, AddressZero);

    });

    it('User2 swaps for exact 10 NFT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GNFT.address, ten)
        let tokenID0 = await GNFT.gumballs(0);
        let tokenID1 = await GNFT.gumballs(1);
        let tokenID2 = await GNFT.gumballs(2);
        let tokenID3 = await GNFT.gumballs(3);
        let tokenID4 = await GNFT.gumballs(4);
        let tokenID5 = await GNFT.gumballs(5);
        let tokenID6 = await GNFT.gumballs(6);
        let tokenID7 = await GNFT.gumballs(7);
        let tokenID8 = await GNFT.gumballs(8);
        let tokenID9 = await GNFT.gumballs(9);
        await GNFT.connect(user2).swapForExact([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9]);

    });

    it('User2 Buys GBT with 100 WETH w/ user3 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, oneHundred);
        await GBT.connect(user2).buy(oneHundred, 1, 1682282187, AddressZero);

    });

    it('User2 Buys GBT with 100 WETH w/ user3 affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, oneHundred);
        await GBT.connect(user2).buy(oneHundred, 1, 1682282187, AddressZero);

    });

    it('User2 swaps for exact 10 NFT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GNFT.address, ten)
        let tokenID0 = await GNFT.gumballs(0);
        let tokenID1 = await GNFT.gumballs(1);
        let tokenID2 = await GNFT.gumballs(2);
        let tokenID3 = await GNFT.gumballs(3);
        let tokenID4 = await GNFT.gumballs(4);
        let tokenID5 = await GNFT.gumballs(5);
        let tokenID6 = await GNFT.gumballs(6);
        let tokenID7 = await GNFT.gumballs(7);
        let tokenID8 = await GNFT.gumballs(8);
        let tokenID9 = await GNFT.gumballs(9);
        await GNFT.connect(user2).swapForExact([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9]);

    });
    
    it('User1 stakes 5 gNFT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user1.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user1.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user1.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user1.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user1.address, 4);
        await GNFT.connect(user1).approve(XGBT.address, tokenID0);
        await GNFT.connect(user1).approve(XGBT.address, tokenID1);
        await GNFT.connect(user1).approve(XGBT.address, tokenID2);
        await GNFT.connect(user1).approve(XGBT.address, tokenID3);
        await GNFT.connect(user1).approve(XGBT.address, tokenID4);
        await XGBT.connect(user1).depositNFT([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4]);

    });

    it('User1 stakes 5 gNFT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user1.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user1.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user1.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user1.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user1.address, 4);
        await GNFT.connect(user1).approve(XGBT.address, tokenID0);
        await GNFT.connect(user1).approve(XGBT.address, tokenID1);
        await GNFT.connect(user1).approve(XGBT.address, tokenID2);
        await GNFT.connect(user1).approve(XGBT.address, tokenID3);
        await GNFT.connect(user1).approve(XGBT.address, tokenID4);
        await XGBT.connect(user1).depositNFT([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4]);

    });

    it('User2 stakes 5 gNFT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user2.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user2.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user2.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user2.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user2.address, 4);
        await GNFT.connect(user2).approve(XGBT.address, tokenID0);
        await GNFT.connect(user2).approve(XGBT.address, tokenID1);
        await GNFT.connect(user2).approve(XGBT.address, tokenID2);
        await GNFT.connect(user2).approve(XGBT.address, tokenID3);
        await GNFT.connect(user2).approve(XGBT.address, tokenID4);
        await XGBT.connect(user2).depositNFT([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4]);

    });

    it('User2 stakes 5 gNFT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user2.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user2.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user2.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user2.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user2.address, 4);
        await GNFT.connect(user2).approve(XGBT.address, tokenID0);
        await GNFT.connect(user2).approve(XGBT.address, tokenID1);
        await GNFT.connect(user2).approve(XGBT.address, tokenID2);
        await GNFT.connect(user2).approve(XGBT.address, tokenID3);
        await GNFT.connect(user2).approve(XGBT.address, tokenID4);
        await XGBT.connect(user2).depositNFT([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4]);

    });

    it('User1 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, await GBT.balanceOf(user1.address));
        await GBT.connect(user1).sell(await GBT.balanceOf(user1.address), 1, 1682282187);

    });

    it('User2 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GBT.address, await GBT.balanceOf(user2.address));
        await GBT.connect(user2).sell(await GBT.balanceOf(user2.address), 1, 1682282187);

    });

    it('User3 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user3).approve(GBT.address, await GBT.balanceOf(user3.address));
        await GBT.connect(user3).sell(await GBT.balanceOf(user3.address), 1, 1682282187);

    });

    it('User3 transfers all ETH to owner', async function () {
        console.log("******************************************************");

        await weth.connect(user3).transfer(owner.address, await weth.balanceOf(user3.address));

    });

    it('Artist Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(artist).approve(GBT.address, await GBT.balanceOf(artist.address));
        await GBT.connect(artist).sell(await GBT.balanceOf(artist.address), 1, 1682282187);

    });

    it('Artist transfers all ETH to owner', async function () {
        console.log("******************************************************");

        await weth.connect(artist).transfer(owner.address, await weth.balanceOf(artist.address));

    });

    it('Protocol Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(protocol).approve(GBT.address, await GBT.balanceOf(protocol.address));
        await GBT.connect(protocol).sell(await GBT.balanceOf(protocol.address), 1, 1682282187);

    });

    it('Protocol transfers all ETH to owner', async function () {
        console.log("******************************************************");

        await weth.connect(protocol).transfer(owner.address, await weth.balanceOf(protocol.address));

    });

    it('Owner calls treasury skim', async function () {
        console.log("******************************************************");

        await expect(GBTFees.connect(owner).distributeFees()).to.be.reverted;

    });

    it('User1 converts 5 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user1.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user1.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user1.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user1.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user1.address, 4);
        await GNFT.connect(user1).approve(GNFT.address, tokenID0);
        await GNFT.connect(user1).approve(GNFT.address, tokenID1);
        await GNFT.connect(user1).approve(GNFT.address, tokenID2);
        await GNFT.connect(user1).approve(GNFT.address, tokenID3);
        await GNFT.connect(user1).approve(GNFT.address, tokenID4);
        await GNFT.connect(user1).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4]);
    });

    it('User2 converts 5 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user2.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user2.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user2.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user2.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user2.address, 4);
        await GNFT.connect(user2).approve(GNFT.address, tokenID0);
        await GNFT.connect(user2).approve(GNFT.address, tokenID1);
        await GNFT.connect(user2).approve(GNFT.address, tokenID2);
        await GNFT.connect(user2).approve(GNFT.address, tokenID3);
        await GNFT.connect(user2).approve(GNFT.address, tokenID4);
        await GNFT.connect(user2).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4]);
    });

    it('Forward 6 days', async function () {
        console.log("******************************************************");

        await network.provider.send('evm_increaseTime', [6*24*3600]); 
        await network.provider.send('evm_mine');

    });

    it('Owner calls treasury skim', async function () {
        console.log("******************************************************");

        await GBTFees.connect(owner).distributeFees();

    });

    it('Forward 7 days', async function () {
        console.log("******************************************************");

        await network.provider.send('evm_increaseTime', [7*24*3600]); 
        await network.provider.send('evm_mine');

    });

    it('User1 claims rewards', async function () {
        console.log("******************************************************");

        await XGBT.connect(user1).getReward();

    });

    it('User2 claims rewards', async function () {
        console.log("******************************************************");

        await XGBT.connect(user2).getReward();

    });

    it('User1 borrows max against position', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).borrowMax();

    });

    it('User2 borrows max against position', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).borrowMax();

    });

    it('User1 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, await GBT.balanceOf(user1.address));
        await GBT.connect(user1).sell(await GBT.balanceOf(user1.address), 1, 1682282187);

    });

    it('User2 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GBT.address, await GBT.balanceOf(user2.address));
        await GBT.connect(user2).sell(await GBT.balanceOf(user2.address), 1, 1682282187);

    });

    it('User2 Buys GBT with 100 WETH w/ no affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, oneHundred);
        await GBT.connect(user2).buy(oneHundred, 1, 1682282187, AddressZero);

    });

    it('User1 Buys GBT with 100 WETH w/ no affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, oneHundred);
        await GBT.connect(user1).buy(oneHundred, 1, 1682282187, AddressZero);

    });

    it('User1 repays 2 eth back', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, two);
        await GBT.connect(user1).repaySome(two);

    });

    it('User1 unstakes GBT', async function () {
        console.log("******************************************************");

        await XGBT.connect(user1).withdrawToken(await XGBT.balanceToken(user1.address));

    });

    it('User1 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, await GBT.balanceOf(user1.address));
        await GBT.connect(user1).sell(await GBT.balanceOf(user1.address), 1, 1682282187);

    });

    it('User1 repays max', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, twenty);
        await GBT.connect(user1).repayMax();

    });

    it('User1 unstakes NFT', async function () {
        console.log("******************************************************");

        let tokenID0 = await XGBT.balanceNFT(user1.address, 0);
        let tokenID1 = await XGBT.balanceNFT(user1.address, 1);
        let tokenID2 = await XGBT.balanceNFT(user1.address, 2);
        let tokenID3 = await XGBT.balanceNFT(user1.address, 3);
        let tokenID4 = await XGBT.balanceNFT(user1.address, 4);
        let tokenID5 = await XGBT.balanceNFT(user1.address, 5);
        let tokenID6 = await XGBT.balanceNFT(user1.address, 6);
        let tokenID7 = await XGBT.balanceNFT(user1.address, 7);
        let tokenID8 = await XGBT.balanceNFT(user1.address, 8);
        let tokenID9 = await XGBT.balanceNFT(user1.address, 9);
        let tokenID10 = await XGBT.balanceNFT(user1.address, 10);
        await XGBT.connect(user1).withdrawNFT([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9, tokenID10]);

    });

    it('User2 calls treasury skim', async function () {
        console.log("******************************************************");

        await GBTFees.connect(user2).distributeFees();

    });

    it('User1 converts 20 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user1.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user1.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user1.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user1.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user1.address, 4);
        let tokenID5 = await GNFT.tokenOfOwnerByIndex(user1.address, 5);
        let tokenID6 = await GNFT.tokenOfOwnerByIndex(user1.address, 6);
        let tokenID7 = await GNFT.tokenOfOwnerByIndex(user1.address, 7);
        let tokenID8 = await GNFT.tokenOfOwnerByIndex(user1.address, 8);
        let tokenID9 = await GNFT.tokenOfOwnerByIndex(user1.address, 9);
        let tokenID10 = await GNFT.tokenOfOwnerByIndex(user1.address, 10);
        let tokenID11 = await GNFT.tokenOfOwnerByIndex(user1.address, 11);
        let tokenID12 = await GNFT.tokenOfOwnerByIndex(user1.address, 12);
        let tokenID13 = await GNFT.tokenOfOwnerByIndex(user1.address, 13);
        let tokenID14 = await GNFT.tokenOfOwnerByIndex(user1.address, 14);
        let tokenID15 = await GNFT.tokenOfOwnerByIndex(user1.address, 15);
        let tokenID16 = await GNFT.tokenOfOwnerByIndex(user1.address, 16);
        let tokenID17 = await GNFT.tokenOfOwnerByIndex(user1.address, 17);
        let tokenID18 = await GNFT.tokenOfOwnerByIndex(user1.address, 18);
        let tokenID19 = await GNFT.tokenOfOwnerByIndex(user1.address, 19);
        await GNFT.connect(user1).approve(GNFT.address, tokenID0);
        await GNFT.connect(user1).approve(GNFT.address, tokenID1);
        await GNFT.connect(user1).approve(GNFT.address, tokenID2);
        await GNFT.connect(user1).approve(GNFT.address, tokenID3);
        await GNFT.connect(user1).approve(GNFT.address, tokenID4);
        await GNFT.connect(user1).approve(GNFT.address, tokenID5);
        await GNFT.connect(user1).approve(GNFT.address, tokenID6);
        await GNFT.connect(user1).approve(GNFT.address, tokenID7);
        await GNFT.connect(user1).approve(GNFT.address, tokenID8);
        await GNFT.connect(user1).approve(GNFT.address, tokenID9);
        await GNFT.connect(user1).approve(GNFT.address, tokenID10);
        await GNFT.connect(user1).approve(GNFT.address, tokenID11);
        await GNFT.connect(user1).approve(GNFT.address, tokenID12);
        await GNFT.connect(user1).approve(GNFT.address, tokenID13);
        await GNFT.connect(user1).approve(GNFT.address, tokenID14);
        await GNFT.connect(user1).approve(GNFT.address, tokenID15);
        await GNFT.connect(user1).approve(GNFT.address, tokenID16);
        await GNFT.connect(user1).approve(GNFT.address, tokenID17);
        await GNFT.connect(user1).approve(GNFT.address, tokenID18);
        await GNFT.connect(user1).approve(GNFT.address, tokenID19);
        await GNFT.connect(user1).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9,
                                        tokenID10, tokenID11, tokenID12, tokenID13, tokenID14, tokenID15, tokenID16, tokenID17, tokenID18, tokenID19]);
    });

    it('User1 converts 6 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user1.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user1.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user1.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user1.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user1.address, 4);
        let tokenID5 = await GNFT.tokenOfOwnerByIndex(user1.address, 5);
        await GNFT.connect(user1).approve(GNFT.address, tokenID0);
        await GNFT.connect(user1).approve(GNFT.address, tokenID1);
        await GNFT.connect(user1).approve(GNFT.address, tokenID2);
        await GNFT.connect(user1).approve(GNFT.address, tokenID3);
        await GNFT.connect(user1).approve(GNFT.address, tokenID4);
        await GNFT.connect(user1).approve(GNFT.address, tokenID5);
        await GNFT.connect(user1).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5]);
    });

    it('User1 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, await GBT.balanceOf(user1.address));
        await GBT.connect(user1).sell(await GBT.balanceOf(user1.address), 1, 1682282187);

    });

    it('User2 converts 15 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user2.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user2.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user2.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user2.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user2.address, 4);
        let tokenID5 = await GNFT.tokenOfOwnerByIndex(user2.address, 5);
        let tokenID6 = await GNFT.tokenOfOwnerByIndex(user2.address, 6);
        let tokenID7 = await GNFT.tokenOfOwnerByIndex(user2.address, 7);
        let tokenID8 = await GNFT.tokenOfOwnerByIndex(user2.address, 8);
        let tokenID9 = await GNFT.tokenOfOwnerByIndex(user2.address, 9);
        let tokenID10 = await GNFT.tokenOfOwnerByIndex(user2.address, 10);
        let tokenID11 = await GNFT.tokenOfOwnerByIndex(user2.address, 11);
        let tokenID12 = await GNFT.tokenOfOwnerByIndex(user2.address, 12);
        let tokenID13 = await GNFT.tokenOfOwnerByIndex(user2.address, 13);
        let tokenID14 = await GNFT.tokenOfOwnerByIndex(user2.address, 14);
        await GNFT.connect(user2).approve(GNFT.address, tokenID0);
        await GNFT.connect(user2).approve(GNFT.address, tokenID1);
        await GNFT.connect(user2).approve(GNFT.address, tokenID2);
        await GNFT.connect(user2).approve(GNFT.address, tokenID3);
        await GNFT.connect(user2).approve(GNFT.address, tokenID4);
        await GNFT.connect(user2).approve(GNFT.address, tokenID5);
        await GNFT.connect(user2).approve(GNFT.address, tokenID6);
        await GNFT.connect(user2).approve(GNFT.address, tokenID7);
        await GNFT.connect(user2).approve(GNFT.address, tokenID8);
        await GNFT.connect(user2).approve(GNFT.address, tokenID9);
        await GNFT.connect(user2).approve(GNFT.address, tokenID10);
        await GNFT.connect(user2).approve(GNFT.address, tokenID11);
        await GNFT.connect(user2).approve(GNFT.address, tokenID12);
        await GNFT.connect(user2).approve(GNFT.address, tokenID13);
        await GNFT.connect(user2).approve(GNFT.address, tokenID14);
        await GNFT.connect(user2).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9,
                                        tokenID10, tokenID11, tokenID12, tokenID13, tokenID14]);
    });

    it('User2 repays max', async function () {
        console.log("******************************************************");

        await weth.connect(user2).approve(GBT.address, twenty);
        await GBT.connect(user2).repayMax();

    });

    it('User2 unstakes NFT', async function () {
        console.log("******************************************************");

        let tokenID0 = await XGBT.balanceNFT(user2.address, 0);
        let tokenID1 = await XGBT.balanceNFT(user2.address, 1);
        let tokenID2 = await XGBT.balanceNFT(user2.address, 2);
        let tokenID3 = await XGBT.balanceNFT(user2.address, 3);
        let tokenID4 = await XGBT.balanceNFT(user2.address, 4);
        let tokenID5 = await XGBT.balanceNFT(user2.address, 5);
        let tokenID6 = await XGBT.balanceNFT(user2.address, 6);
        let tokenID7 = await XGBT.balanceNFT(user2.address, 7);
        let tokenID8 = await XGBT.balanceNFT(user2.address, 8);
        let tokenID9 = await XGBT.balanceNFT(user2.address, 9);
        let tokenID10 = await XGBT.balanceNFT(user2.address, 10);
        await XGBT.connect(user2).withdrawNFT([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9, tokenID10]);

    });

    it('User2 converts 11 NFT to GBT', async function () {
        console.log("******************************************************");

        let tokenID0 = await GNFT.tokenOfOwnerByIndex(user2.address, 0);
        let tokenID1 = await GNFT.tokenOfOwnerByIndex(user2.address, 1);
        let tokenID2 = await GNFT.tokenOfOwnerByIndex(user2.address, 2);
        let tokenID3 = await GNFT.tokenOfOwnerByIndex(user2.address, 3);
        let tokenID4 = await GNFT.tokenOfOwnerByIndex(user2.address, 4);
        let tokenID5 = await GNFT.tokenOfOwnerByIndex(user2.address, 5);
        let tokenID6 = await GNFT.tokenOfOwnerByIndex(user2.address, 6);
        let tokenID7 = await GNFT.tokenOfOwnerByIndex(user2.address, 7);
        let tokenID8 = await GNFT.tokenOfOwnerByIndex(user2.address, 8);
        let tokenID9 = await GNFT.tokenOfOwnerByIndex(user2.address, 9);
        let tokenID10 = await GNFT.tokenOfOwnerByIndex(user2.address, 10);
        await GNFT.connect(user2).approve(GNFT.address, tokenID0);
        await GNFT.connect(user2).approve(GNFT.address, tokenID1);
        await GNFT.connect(user2).approve(GNFT.address, tokenID2);
        await GNFT.connect(user2).approve(GNFT.address, tokenID3);
        await GNFT.connect(user2).approve(GNFT.address, tokenID4);
        await GNFT.connect(user2).approve(GNFT.address, tokenID5);
        await GNFT.connect(user2).approve(GNFT.address, tokenID6);
        await GNFT.connect(user2).approve(GNFT.address, tokenID7);
        await GNFT.connect(user2).approve(GNFT.address, tokenID8);
        await GNFT.connect(user2).approve(GNFT.address, tokenID9);
        await GNFT.connect(user2).approve(GNFT.address, tokenID10);
        await GNFT.connect(user2).redeem([tokenID0, tokenID1, tokenID2, tokenID3, tokenID4, tokenID5, tokenID6, tokenID7, tokenID8, tokenID9,
                                        tokenID10]);
    });

    it('User2 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GBT.address, await GBT.balanceOf(user2.address));
        await GBT.connect(user2).sell(await GBT.balanceOf(user2.address), 1, 1682282187);

    });

    it('Protocol Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(protocol).approve(GBT.address, await GBT.balanceOf(protocol.address));
        await GBT.connect(protocol).sell(await GBT.balanceOf(protocol.address), 1, 1682282187);

    });

    it('Artist Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(artist).approve(GBT.address, await GBT.balanceOf(artist.address));
        await GBT.connect(artist).sell(await GBT.balanceOf(artist.address), 1, 1682282187);

    });

    it('User3 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user3).approve(GBT.address, await GBT.balanceOf(user3.address));
        await GBT.connect(user3).sell(await GBT.balanceOf(user3.address), 1, 1682282187);

    });

    it('User1 Buys GBT with 100 WETH w/out affiliate link', async function () {
        console.log("******************************************************");

        await weth.connect(user1).approve(GBT.address, oneHundred);
        await GBT.connect(user1).buy(oneHundred, 1, 1682282187, AddressZero);

    });

    it('User1 Sells all GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user1).approve(GBT.address, await GBT.balanceOf(user1.address));
        await GBT.connect(user1).sell(await GBT.balanceOf(user1.address), 1, 1682282187);

    });

    it('Forward 5 days', async function () {
        console.log("******************************************************");

        await network.provider.send('evm_increaseTime', [5*24*3600]); 
        await network.provider.send('evm_mine');

    });

    it('User2 calls treasury skim', async function () {
        console.log("******************************************************");

        await GBTFees.connect(user2).distributeFees();

    });

    it('Forward 7 days', async function () {
        console.log("******************************************************");

        await network.provider.send('evm_increaseTime', [7*24*3600]); 
        await network.provider.send('evm_mine');

    });

    it('User2 claims rewards', async function () {
        console.log("******************************************************");

        await XGBT.connect(user2).getReward();

    });

    it('User2 tries to mint 1 NFT with GBT', async function () {
        console.log("******************************************************");

        await GBT.connect(user2).approve(GNFT.address, one);
        await expect(GNFT.connect(user2).swap(one)).to.be.revertedWith('Max Supply Minted');

    });

    it('System Status', async function () {
        console.log("******************************************************");

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

    });

})