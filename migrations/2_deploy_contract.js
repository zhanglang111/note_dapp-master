var CarInfo = artifacts.require("./CarContract.sol");

module.exports = function(deployer) {
  deployer.deploy(CarInfo);
};
