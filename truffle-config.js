var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "...";


module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // 可匹配任意网络
    }
  }
};
