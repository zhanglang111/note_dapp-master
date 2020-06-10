var CarContract = artifacts.require("./CarContract.sol");

module.exports = function(deployer) {
    deployer.deploy(CarContract,100,"disc","name",30,21,23);
};