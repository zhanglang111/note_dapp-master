pragma solidity ^0.5.0;

contract CarContract {

    struct  CarInfo{
        string  name;
        string  description;
        uint  reward;
        uint  waitTime;
        uint  longitude;
        uint  latitude;
    }

    mapping(address => CarInfo[] ) public CarInfos;

    constructor() public {

    }

    event NewCarInfo();

    function addCarInfo(string memory _name,string memory _description,uint _reward,  uint _waitTime,uint _longitude,uint _latitude) public {
        //在列表中新增数据
        //这个地方应该新增
        CarInfo memory carInfo = CarInfo(_name,_description,_reward,_waitTime,_longitude,_latitude);  // 按定义的顺序依次指定值
        CarInfos[msg.sender].push(carInfo);
        emit NewCarInfo();
    }

    function getCarInfoLen(address own) public view returns (uint) {
        return CarInfos[own].length;
    }
}


