pragma solidity ^0.5.0;

contract CarContract{
    string public name;//名字
    string public description;//事件描述
    uint public reward;//
    uint public waitTime;
    uint public longitude;
    uint public latitude;

    address public requester;//请求地址
    uint public state; // 1:ACTIVE 2:ABORT 3:COMPLETE

    mapping(bytes32 => string) dataStatus;


    function PublishTask(){

    }

    //修饰函数
    modifier onlyRequester() {
        require(msg.sender == requester);
        _;
    }

    modifier inState(uint _state) {
        require(state == _state);
        _;
    }



    event TaskInited(uint _reward, string _description, string _name,uint waitTime,uint longitude,uint latitude );

    //构造函数
    constructor(uint _reward, string _description, string _name,uint _waitTime,uint _longitude,uint _latitude )
    public
    payable
    {
        requester = msg.sender;
        reward = _reward;
        description = _description;
        state = 1; // ACTIVE
        name = _name;
        waitTime = _waitTime;
        longitude = _longitude;
        latitude = _latitude;

        emit TaskInited(_rewardUnit, _rewardNum, _taskDescrip, _name);
    }

    // abort task
    event Aborted();

    function abort()
    public
    onlyRequester
    inState(1)
    payable
    {
        state = 2; // ABORT
        requester.transfer(address(this).balance);//将还没使用完的币转移回来
        emit Aborted();
    }


}