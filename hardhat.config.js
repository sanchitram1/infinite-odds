require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    teatestnet: {
      url: `https://71947.rpc.thirdweb.com/${process.env.THIRDWEB_API_KEY}`,
      chainId: 71947,
    },
  },
};
